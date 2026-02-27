import { useEffect, useRef, useCallback, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';
import type { Detection } from './useObjectDetection';

interface UseVisionProctorOptions {
  interviewId: string | null;
  isProctoring: boolean;
  isLookingAway: boolean;
  captureScreenshot: () => string | null;
  /** YOLO watchdog detections - if objects are detected, triggers VLM analysis */
  objectDetections?: Detection[];
}

interface VisionAnalysisResult {
  violation: boolean;
  reason: string;
  confidence: number;
}

/**
 * Smart VLM triggering hook that connects the client-side CV proctoring
 * (MediaPipe) to the backend Vision LLM Edge Function.
 *
 * Triggers:
 * 1. When `isLookingAway` is true for more than 5 consecutive seconds.
 * 2. On a randomized interval (every 3-5 minutes) as a spot check.
 * 3. When YOLO watchdog detects suspicious objects (phones, books, extra people).
 *
 * Guards against overlapping API calls using a ref.
 */
export const useVisionProctor = ({
  interviewId,
  isProctoring,
  isLookingAway,
  captureScreenshot,
  objectDetections = [],
}: UseVisionProctorOptions) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [lastVisionResult, setLastVisionResult] = useState<VisionAnalysisResult | null>(null);

  const isAnalyzingRef = useRef(false);
  const sessionIdRef = useRef<string | null>(null);
  const lookingAwayStartRef = useRef<number | null>(null);
  const lookingAwayCheckRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const spotCheckTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep ref in sync with state so cleanup always has the latest value
  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  // Create a proctoring session when proctoring starts
  useEffect(() => {
    if (!isProctoring || !interviewId || !isSupabaseConfigured) {
      setSessionId(null);
      return;
    }

    let cancelled = false;

    const createSession = async () => {
      try {
        const { data, error } = await supabase
          .from('proctoring_sessions')
          .insert({ interview_id: interviewId, status: 'active' })
          .select('id')
          .maybeSingle();

        if (!cancelled && data && !error) {
          setSessionId(data.id);
        }
      } catch (err) {
        console.error('Failed to create proctoring session:', err);
      }
    };

    createSession();

    return () => {
      cancelled = true;
      // Mark session as completed on cleanup (use ref for latest value)
      const currentSessionId = sessionIdRef.current;
      if (currentSessionId) {
        supabase
          .from('proctoring_sessions')
          .update({ status: 'completed', end_time: new Date().toISOString() })
          .eq('id', currentSessionId)
          .then(() => {});
      }
    };
  }, [isProctoring, interviewId]);

  /**
   * Core function: capture a screenshot and invoke the vision-proctor Edge Function.
   */
  const analyzeFrame = useCallback(
    async (triggerReason: string) => {
      if (isAnalyzingRef.current || !isProctoring || !interviewId || !isSupabaseConfigured) {
        return;
      }

      const imageBase64 = captureScreenshot();
      if (!imageBase64) return;

      isAnalyzingRef.current = true;

      try {
        const { data, error } = await supabase.functions.invoke('vision-proctor', {
          body: {
            interviewId,
            sessionId,
            image_base64: imageBase64,
            triggerReason,
          },
        });

        if (!error && data?.data) {
          setLastVisionResult(data.data);
        }
      } catch (err) {
        console.error('Vision proctor invocation failed:', err);
      } finally {
        isAnalyzingRef.current = false;
      }
    },
    [isProctoring, interviewId, sessionId, captureScreenshot]
  );

  // Trigger 1: Looking away for more than 5 consecutive seconds
  useEffect(() => {
    if (!isProctoring || !interviewId) return;

    if (isLookingAway) {
      if (!lookingAwayStartRef.current) {
        lookingAwayStartRef.current = Date.now();
      }

      lookingAwayCheckRef.current = setInterval(() => {
        if (
          lookingAwayStartRef.current &&
          Date.now() - lookingAwayStartRef.current >= 5000
        ) {
          analyzeFrame('sustained_looking_away');
          lookingAwayStartRef.current = Date.now(); // Reset to avoid rapid repeat triggers
        }
      }, 1000);
    } else {
      lookingAwayStartRef.current = null;
      if (lookingAwayCheckRef.current) {
        clearInterval(lookingAwayCheckRef.current);
        lookingAwayCheckRef.current = null;
      }
    }

    return () => {
      if (lookingAwayCheckRef.current) {
        clearInterval(lookingAwayCheckRef.current);
        lookingAwayCheckRef.current = null;
      }
    };
  }, [isLookingAway, isProctoring, interviewId, analyzeFrame]);

  // Trigger 2: Random spot check every 3-5 minutes
  useEffect(() => {
    if (!isProctoring || !interviewId) return;

    const scheduleSpotCheck = () => {
      // Random interval between 3 and 5 minutes (180,000 - 300,000 ms)
      const intervalMs = 180_000 + Math.random() * 120_000;

      spotCheckTimerRef.current = setTimeout(() => {
        analyzeFrame('random_spot_check');
        scheduleSpotCheck(); // Schedule next spot check
      }, intervalMs);
    };

    scheduleSpotCheck();

    return () => {
      if (spotCheckTimerRef.current) {
        clearTimeout(spotCheckTimerRef.current);
        spotCheckTimerRef.current = null;
      }
    };
  }, [isProctoring, interviewId, analyzeFrame]);

  // Trigger 3: YOLO watchdog detects suspicious objects
  const lastYoloTriggerRef = useRef<number>(0);
  useEffect(() => {
    if (!isProctoring || !interviewId || objectDetections.length === 0) return;

    // Debounce: don't trigger more than once every 10 seconds for YOLO detections
    const now = Date.now();
    if (now - lastYoloTriggerRef.current < 10_000) return;

    // High-confidence suspicious objects trigger VLM analysis
    const suspiciousObjects = objectDetections.filter(
      d => d.confidence >= 0.6 && ['mobile_phone', 'book', 'notes', 'earphone', 'extra_person', 'secondary_screen'].includes(d.class)
    );

    if (suspiciousObjects.length > 0) {
      lastYoloTriggerRef.current = now;
      const objectNames = suspiciousObjects.map(d => `${d.class}(${Math.round(d.confidence * 100)}%)`).join(', ');
      analyzeFrame(`yolo_watchdog: ${objectNames}`);
    }
  }, [objectDetections, isProctoring, interviewId, analyzeFrame]);

  return {
    sessionId,
    lastVisionResult,
    analyzeFrame,
  };
};
