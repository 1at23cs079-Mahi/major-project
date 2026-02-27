-- Migration: Add proctoring tables for AI Vision proctoring system
-- Creates proctoring_sessions and proctoring_flags tables

-- =============================================================================
-- Table: proctoring_sessions
-- Links proctoring data to an interview session
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.proctoring_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id UUID NOT NULL REFERENCES public.interviews(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'terminated')),
  start_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookup by interview_id
CREATE INDEX IF NOT EXISTS idx_proctoring_sessions_interview_id
  ON public.proctoring_sessions(interview_id);

-- =============================================================================
-- Table: proctoring_flags
-- Logs individual cheating/violation events detected by CV or Vision LLM
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.proctoring_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.proctoring_sessions(id) ON DELETE CASCADE,
  flag_type TEXT NOT NULL CHECK (flag_type IN (
    'NO_FACE',
    'MULTIPLE_FACES',
    'LOOKING_AWAY',
    'TAB_SWITCH',
    'UNAUTHORIZED_OBJECT',
    'SECONDARY_MONITOR',
    'PHONE_DETECTED',
    'ANOTHER_PERSON',
    'BACKGROUND_NOISE',
    'FULLSCREEN_EXIT',
    'WEBCAM_DISCONNECT',
    'CONTEXT_MENU_ATTEMPT',
    'OTHER'
  )),
  confidence_score FLOAT DEFAULT 0.0 CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),
  screenshot_url TEXT,
  source TEXT NOT NULL DEFAULT 'client' CHECK (source IN ('client', 'vision_llm', 'audio_diarization', 'lockdown')),
  details JSONB,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast lookup by session_id
CREATE INDEX IF NOT EXISTS idx_proctoring_flags_session_id
  ON public.proctoring_flags(session_id);

-- Index for filtering by flag_type
CREATE INDEX IF NOT EXISTS idx_proctoring_flags_type
  ON public.proctoring_flags(flag_type);

-- =============================================================================
-- Row Level Security (RLS)
-- =============================================================================

-- Enable RLS on both tables
ALTER TABLE public.proctoring_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proctoring_flags ENABLE ROW LEVEL SECURITY;

-- proctoring_sessions: Users can read their own sessions (via interview ownership)
CREATE POLICY "Users can view own proctoring sessions"
  ON public.proctoring_sessions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.interviews
      WHERE interviews.id = proctoring_sessions.interview_id
        AND interviews.user_id = auth.uid()
    )
  );

-- proctoring_sessions: Users can insert sessions for their own interviews
CREATE POLICY "Users can create proctoring sessions for own interviews"
  ON public.proctoring_sessions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.interviews
      WHERE interviews.id = proctoring_sessions.interview_id
        AND interviews.user_id = auth.uid()
    )
  );

-- proctoring_sessions: Users can update their own sessions (e.g., set end_time)
CREATE POLICY "Users can update own proctoring sessions"
  ON public.proctoring_sessions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.interviews
      WHERE interviews.id = proctoring_sessions.interview_id
        AND interviews.user_id = auth.uid()
    )
  );

-- proctoring_flags: Users can view flags for their own sessions
CREATE POLICY "Users can view own proctoring flags"
  ON public.proctoring_flags
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.proctoring_sessions ps
      JOIN public.interviews i ON i.id = ps.interview_id
      WHERE ps.id = proctoring_flags.session_id
        AND i.user_id = auth.uid()
    )
  );

-- proctoring_flags: Users can insert flags for their own sessions
CREATE POLICY "Users can create proctoring flags for own sessions"
  ON public.proctoring_flags
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.proctoring_sessions ps
      JOIN public.interviews i ON i.id = ps.interview_id
      WHERE ps.id = proctoring_flags.session_id
        AND i.user_id = auth.uid()
    )
  );

-- Service role bypass: Edge Functions using service_role key bypass RLS automatically
-- No additional policy needed for service role inserts from the vision-proctor function

-- =============================================================================
-- Updated_at trigger for proctoring_sessions
-- =============================================================================
CREATE OR REPLACE FUNCTION public.update_proctoring_session_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_proctoring_session_updated_at
  BEFORE UPDATE ON public.proctoring_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_proctoring_session_updated_at();
