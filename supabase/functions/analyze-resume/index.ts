import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ResumeAnalysis {
  overall_score: number; // 0-100
  sections: {
    contact_info: SectionAnalysis;
    summary: SectionAnalysis;
    experience: SectionAnalysis;
    education: SectionAnalysis;
    skills: SectionAnalysis;
    formatting: SectionAnalysis;
  };
  parsed_data: {
    name: string | null;
    email: string | null;
    phone: string | null;
    location: string | null;
    linkedin: string | null;
    summary: string | null;
    experience: WorkExperience[];
    education: Education[];
    skills: string[];
    certifications: string[];
  };
  keyword_analysis: {
    matched_keywords: string[];
    missing_keywords: string[];
    keyword_density_score: number;
  };
  ats_compatibility: {
    score: number;
    issues: string[];
    suggestions: string[];
  };
  improvement_suggestions: Suggestion[];
}

interface SectionAnalysis {
  score: number;
  present: boolean;
  feedback: string;
  suggestions: string[];
}

interface WorkExperience {
  company: string;
  title: string;
  duration: string;
  highlights: string[];
}

interface Education {
  institution: string;
  degree: string;
  field: string;
  year: string;
}

interface Suggestion {
  category: string;
  priority: "high" | "medium" | "low";
  current: string;
  recommended: string;
}

/**
 * Extracts text from a PDF binary using a lightweight parser.
 * Handles both simple text streams and compressed (FlateDecode) streams.
 */
function extractTextFromPDF(pdfBytes: Uint8Array): string {
  const decoder = new TextDecoder("latin1");
  const raw = decoder.decode(pdfBytes);

  const textChunks: string[] = [];

  // Strategy 1: Extract text between BT/ET (Begin Text/End Text) operators
  const btEtRegex = /BT([\s\S]*?)ET/g;
  let match;

  while ((match = btEtRegex.exec(raw)) !== null) {
    const block = match[1];

    // Extract text from Tj operator (show text)
    const tjRegex = /\(([^)]*)\)\s*Tj/g;
    let tjMatch;
    while ((tjMatch = tjRegex.exec(block)) !== null) {
      textChunks.push(unescapePdfString(tjMatch[1]));
    }

    // Extract text from TJ operator (show text with positioning)
    const tjArrayRegex = /\[([\s\S]*?)\]\s*TJ/gi;
    let tjArrayMatch;
    while ((tjArrayMatch = tjArrayRegex.exec(block)) !== null) {
      const inner = tjArrayMatch[1];
      const strRegex = /\(([^)]*)\)/g;
      let strMatch;
      while ((strMatch = strRegex.exec(inner)) !== null) {
        textChunks.push(unescapePdfString(strMatch[1]));
      }
    }

    // Extract text from ' and " operators
    const quoteRegex = /\(([^)]*)\)\s*['"]/g;
    let quoteMatch;
    while ((quoteMatch = quoteRegex.exec(block)) !== null) {
      textChunks.push(unescapePdfString(quoteMatch[1]));
    }
  }

  // Strategy 2: If BT/ET extraction yields little, try stream extraction
  if (textChunks.join("").trim().length < 50) {
    // Look for readable text sequences in the binary
    const utf8 = new TextDecoder("utf-8", { fatal: false }).decode(pdfBytes);
    const readableRegex =
      /[\w\s@.+\-(),:;/]{20,}/g;
    let readableMatch;
    while ((readableMatch = readableRegex.exec(utf8)) !== null) {
      const text = readableMatch[0].trim();
      // Filter out PDF internal syntax
      if (
        !text.includes("/Type") &&
        !text.includes("/Font") &&
        !text.includes("obj") &&
        !text.includes("endobj") &&
        !text.includes("stream") &&
        !text.includes("/Length")
      ) {
        textChunks.push(text);
      }
    }
  }

  const result = textChunks
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  return result;
}

function unescapePdfString(s: string): string {
  return s
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\\\/g, "\\")
    .replace(/\\([()])/g, "$1");
}

/**
 * Call OpenAI-compatible API for resume analysis.
 */
async function analyzeWithLLM(
  text: string,
  targetRole: string,
  experienceLevel: string
): Promise<ResumeAnalysis> {
  const openaiKey = Deno.env.get("OPENAI_API_KEY");
  const customEndpoint = Deno.env.get("RESUME_LLM_ENDPOINT");
  const customKey = Deno.env.get("RESUME_LLM_API_KEY");

  const apiUrl = customEndpoint || "https://api.openai.com/v1/chat/completions";
  const apiKey = customKey || openaiKey;

  if (!apiKey) {
    throw new Error(
      "No LLM API key configured. Set OPENAI_API_KEY or RESUME_LLM_API_KEY."
    );
  }

  const systemPrompt = `You are an expert resume analyst and ATS (Applicant Tracking System) specialist.
Analyze the provided resume text and return a detailed JSON analysis.

The candidate is targeting a "${targetRole}" role at "${experienceLevel}" experience level.

Return ONLY valid JSON matching this exact schema (no markdown, no backticks):
{
  "overall_score": <number 0-100>,
  "sections": {
    "contact_info": { "score": <0-100>, "present": <bool>, "feedback": "<string>", "suggestions": ["..."] },
    "summary": { "score": <0-100>, "present": <bool>, "feedback": "<string>", "suggestions": ["..."] },
    "experience": { "score": <0-100>, "present": <bool>, "feedback": "<string>", "suggestions": ["..."] },
    "education": { "score": <0-100>, "present": <bool>, "feedback": "<string>", "suggestions": ["..."] },
    "skills": { "score": <0-100>, "present": <bool>, "feedback": "<string>", "suggestions": ["..."] },
    "formatting": { "score": <0-100>, "present": <bool>, "feedback": "<string>", "suggestions": ["..."] }
  },
  "parsed_data": {
    "name": "<string or null>",
    "email": "<string or null>",
    "phone": "<string or null>",
    "location": "<string or null>",
    "linkedin": "<string or null>",
    "summary": "<string or null>",
    "experience": [{ "company": "", "title": "", "duration": "", "highlights": ["..."] }],
    "education": [{ "institution": "", "degree": "", "field": "", "year": "" }],
    "skills": ["..."],
    "certifications": ["..."]
  },
  "keyword_analysis": {
    "matched_keywords": ["..."],
    "missing_keywords": ["..."],
    "keyword_density_score": <0-100>
  },
  "ats_compatibility": {
    "score": <0-100>,
    "issues": ["..."],
    "suggestions": ["..."]
  },
  "improvement_suggestions": [
    { "category": "<string>", "priority": "high|medium|low", "current": "<what exists>", "recommended": "<what to change>" }
  ]
}

Scoring guidelines:
- Contact info: penalize missing email/phone/LinkedIn
- Summary: should be concise, tailored to target role, include measurable achievements
- Experience: look for STAR method, quantified results, relevant keywords, action verbs
- Education: relevant degrees, certifications, continuing education
- Skills: match against common requirements for the target role
- Formatting: consistency, readability, appropriate length (1-2 pages)
- ATS: check for parseable format, standard section headers, no tables/columns/images/headers-footers
- Keywords: compare against industry-standard keywords for the target role and experience level`;

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: Deno.env.get("RESUME_LLM_MODEL") || "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Analyze this resume:\n\n${text.slice(0, 12000)}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 4000,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`LLM API error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("Empty response from LLM");
  }

  return JSON.parse(content) as ResumeAnalysis;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json();
    const { resumeId, fileUrl, targetRole, experienceLevel } = body;

    if (!resumeId) {
      return new Response(JSON.stringify({ error: "resumeId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update status to processing
    await supabase
      .from("resumes")
      .update({ analysis_result: { status: "processing" } })
      .eq("id", resumeId);

    // Log the analysis start
    await supabase.from("resume_logs").insert({
      resume_id: resumeId,
      action: "analysis_started",
      details: { targetRole, experienceLevel },
    });

    // Download the PDF from storage
    let pdfUrl = fileUrl;
    if (!pdfUrl) {
      // Fetch from DB if not provided
      const { data: resume } = await supabase
        .from("resumes")
        .select("file_url")
        .eq("id", resumeId)
        .single();
      pdfUrl = resume?.file_url;
    }

    if (!pdfUrl) {
      throw new Error("No file URL found for resume");
    }

    // Download the file
    const fileResponse = await fetch(pdfUrl);
    if (!fileResponse.ok) {
      throw new Error(`Failed to download resume: ${fileResponse.status}`);
    }

    const fileBytes = new Uint8Array(await fileResponse.arrayBuffer());
    const fileName = pdfUrl.split("/").pop()?.toLowerCase() || "";

    // Extract text based on file type
    let extractedText: string;

    if (fileName.endsWith(".pdf")) {
      extractedText = extractTextFromPDF(fileBytes);
    } else if (
      fileName.endsWith(".txt") ||
      fileName.endsWith(".md")
    ) {
      extractedText = new TextDecoder("utf-8").decode(fileBytes);
    } else if (
      fileName.endsWith(".doc") ||
      fileName.endsWith(".docx")
    ) {
      // For .docx, extract text from the XML content
      // .docx is a ZIP containing XML files
      extractedText = extractTextFromDocx(fileBytes);
    } else {
      // Try UTF-8 decode as fallback
      extractedText = new TextDecoder("utf-8", { fatal: false }).decode(
        fileBytes
      );
    }

    if (!extractedText || extractedText.trim().length < 20) {
      throw new Error(
        "Could not extract meaningful text from the resume. The file may be image-based (scanned). Please upload a text-based PDF."
      );
    }

    // Save extracted text
    await supabase
      .from("resumes")
      .update({ extracted_text: extractedText })
      .eq("id", resumeId);

    // Run LLM analysis
    const role = targetRole || "Software Engineer";
    const level = experienceLevel || "mid";
    const analysis = await analyzeWithLLM(extractedText, role, level);

    // Save analysis result
    await supabase
      .from("resumes")
      .update({
        analysis_result: analysis,
        updated_at: new Date().toISOString(),
      })
      .eq("id", resumeId);

    // Log success
    await supabase.from("resume_logs").insert({
      resume_id: resumeId,
      action: "analysis_completed",
      details: { overall_score: analysis.overall_score },
    });

    return new Response(JSON.stringify({ success: true, analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Resume analysis error:", error);

    const message =
      error instanceof Error ? error.message : "Analysis failed";

    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

/**
 * Basic .docx text extraction.
 * A .docx file is a ZIP archive containing XML files.
 * The main content is in word/document.xml.
 * This extracts text by finding XML text nodes.
 */
function extractTextFromDocx(bytes: Uint8Array): string {
  const decoder = new TextDecoder("utf-8", { fatal: false });
  const raw = decoder.decode(bytes);

  // Look for word/document.xml content within the ZIP
  // Find XML text content between <w:t> tags
  const textParts: string[] = [];
  const wtRegex = /<w:t[^>]*>([^<]*)<\/w:t>/g;
  let match;

  while ((match = wtRegex.exec(raw)) !== null) {
    textParts.push(match[1]);
  }

  if (textParts.length === 0) {
    // Fallback: extract any readable text sequences
    const readableRegex = /[\w\s@.+\-(),:;/]{15,}/g;
    let readableMatch;
    while ((readableMatch = readableRegex.exec(raw)) !== null) {
      const text = readableMatch[0].trim();
      if (!text.includes("Content_Types") && !text.includes("rels/")) {
        textParts.push(text);
      }
    }
  }

  return textParts.join(" ").replace(/\s+/g, " ").trim();
}
