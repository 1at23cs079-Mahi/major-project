// supabase/functions/vision-proctor/index.ts
// Supabase Edge Function: Vision LLM Proctor
// Accepts a webcam frame, sends it to a Vision LLM (OpenAI GPT-4o / Gemini),
// and logs any violations to the proctoring_flags table.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.96.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VisionProctorRequest {
  interviewId: string;
  sessionId: string;
  image_base64: string;
  triggerReason: string;
}

interface VLMResponse {
  violation: boolean;
  reason: string;
  confidence: number;
  flag_type?: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    const customVlmEndpoint = Deno.env.get('CUSTOM_VLM_ENDPOINT'); // e.g. https://your-vllm-server.com/v1
    const customVlmApiKey = Deno.env.get('CUSTOM_VLM_API_KEY');

    // Create Supabase client with service role for DB writes
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const { interviewId, sessionId, image_base64, triggerReason }: VisionProctorRequest =
      await req.json();

    if (!interviewId || !image_base64) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Missing interviewId or image_base64' },
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Call Vision LLM API - prefers custom VLM endpoint, falls back to OpenAI GPT-4o
    const vlmResult = await analyzeWithVisionLLM(
      image_base64,
      triggerReason,
      openaiApiKey,
      customVlmEndpoint,
      customVlmApiKey
    );

    // If violation detected, insert into proctoring_flags
    if (vlmResult.violation && sessionId) {
      const flagType = mapReasonToFlagType(vlmResult.reason, vlmResult.flag_type);

      const { error: insertError } = await supabase
        .from('proctoring_flags')
        .insert({
          session_id: sessionId,
          flag_type: flagType,
          confidence_score: Math.min(1.0, Math.max(0.0, vlmResult.confidence)),
          source: 'vision_llm',
          details: {
            reason: vlmResult.reason,
            trigger: triggerReason,
            analyzed_at: new Date().toISOString(),
          },
        });

      if (insertError) {
        console.error('Failed to insert proctoring flag:', insertError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          violation: vlmResult.violation,
          reason: vlmResult.reason,
          confidence: vlmResult.confidence,
        },
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Vision proctor error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to analyze frame' },
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * Send the webcam frame to a Vision LLM for analysis.
 * Priority: Custom VLM endpoint (self-hosted Qwen-VL/LLaVA) > OpenAI GPT-4o > Mock.
 */
async function analyzeWithVisionLLM(
  imageBase64: string,
  triggerReason: string,
  openaiApiKey?: string,
  customEndpoint?: string,
  customApiKey?: string,
): Promise<VLMResponse> {
  const systemPrompt =
    'You are an AI proctor monitoring a candidate taking an exam. ' +
    'Analyze this webcam frame. Is the candidate holding a phone, reading from notes, ' +
    'or is there another person in the frame? ' +
    'Output JSON with { "violation": boolean, "reason": string, "confidence": number, "flag_type": string }. ' +
    'flag_type must be one of: PHONE_DETECTED, UNAUTHORIZED_OBJECT, ANOTHER_PERSON, SECONDARY_MONITOR, OTHER. ' +
    'confidence is a float between 0 and 1. If no violation, set violation to false and reason to "No violation detected".';

  // Try custom VLM endpoint first (self-hosted fine-tuned model via vLLM/TGI)
  if (customEndpoint) {
    try {
      return await callVisionApi(
        `${customEndpoint}/chat/completions`,
        customApiKey || '',
        systemPrompt,
        imageBase64,
        triggerReason,
        'custom-vlm'
      );
    } catch (error) {
      console.error('Custom VLM failed, falling back to OpenAI:', error);
    }
  }

  // Fall back to OpenAI GPT-4o
  if (openaiApiKey) {
    try {
      return await callVisionApi(
        'https://api.openai.com/v1/chat/completions',
        openaiApiKey,
        systemPrompt,
        imageBase64,
        triggerReason,
        'gpt-4o'
      );
    } catch (error) {
      console.error('OpenAI VLM failed:', error);
    }
  }

  // No API configured - return mock
  console.warn('No VLM API configured, returning mock response');
  return {
    violation: false,
    reason: 'No violation detected (mock response - no VLM API configured)',
    confidence: 0.0,
  };
}

/**
 * Generic Vision API call supporting OpenAI-compatible endpoints
 * (works with GPT-4o, vLLM, TGI, and most OpenAI-compatible servers).
 */
async function callVisionApi(
  url: string,
  apiKey: string,
  systemPrompt: string,
  imageBase64: string,
  triggerReason: string,
  model: string,
): Promise<VLMResponse> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Trigger reason: ${triggerReason}. Analyze this webcam frame for exam violations.`,
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`,
                detail: 'low',
              },
            },
          ],
        },
      ],
      max_tokens: 300,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`VLM API error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    return { violation: false, reason: 'Empty VLM response', confidence: 0.0 };
  }

  const parsed: VLMResponse = JSON.parse(content);
  return {
    violation: parsed.violation ?? false,
    reason: parsed.reason ?? 'Unknown',
    confidence: parsed.confidence ?? 0.0,
    flag_type: parsed.flag_type,
  };
}

/**
 * Map the VLM reason string to a valid flag_type enum value.
 */
function mapReasonToFlagType(reason: string, flagType?: string): string {
  if (flagType && ['PHONE_DETECTED', 'UNAUTHORIZED_OBJECT', 'ANOTHER_PERSON', 'SECONDARY_MONITOR', 'OTHER'].includes(flagType)) {
    return flagType;
  }

  const lowerReason = reason.toLowerCase();
  if (lowerReason.includes('phone')) return 'PHONE_DETECTED';
  if (lowerReason.includes('person') || lowerReason.includes('face')) return 'ANOTHER_PERSON';
  if (lowerReason.includes('monitor') || lowerReason.includes('screen')) return 'SECONDARY_MONITOR';
  if (lowerReason.includes('note') || lowerReason.includes('book') || lowerReason.includes('paper')) return 'UNAUTHORIZED_OBJECT';
  return 'OTHER';
}
