-- Migration: Add resume parsing tables and storage bucket
-- Creates resumes table, resume_logs table, and storage bucket

-- =============================================================================
-- Table: resumes
-- Stores uploaded resumes and their analysis results
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  extracted_text TEXT,
  target_role TEXT DEFAULT 'Software Engineer',
  experience_level TEXT DEFAULT 'mid' CHECK (experience_level IN ('entry', 'mid', 'senior', 'lead', 'executive')),
  analysis_result JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for user lookups
CREATE INDEX IF NOT EXISTS idx_resumes_user_id
  ON public.resumes(user_id);

-- =============================================================================
-- Table: resume_logs
-- Audit trail for resume operations
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.resume_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_resume_logs_resume_id
  ON public.resume_logs(resume_id);

-- =============================================================================
-- Row Level Security (RLS)
-- =============================================================================
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own resumes
CREATE POLICY "Users can view own resumes"
  ON public.resumes FOR SELECT
  USING (user_id = auth.uid());

-- Users can insert their own resumes
CREATE POLICY "Users can upload resumes"
  ON public.resumes FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own resumes
CREATE POLICY "Users can update own resumes"
  ON public.resumes FOR UPDATE
  USING (user_id = auth.uid());

-- Users can delete their own resumes
CREATE POLICY "Users can delete own resumes"
  ON public.resumes FOR DELETE
  USING (user_id = auth.uid());

-- Resume logs: users can view logs for their own resumes
CREATE POLICY "Users can view own resume logs"
  ON public.resume_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.resumes
      WHERE resumes.id = resume_logs.resume_id
        AND resumes.user_id = auth.uid()
    )
  );

-- Resume logs: users can insert logs for their own resumes
CREATE POLICY "Users can create resume logs"
  ON public.resume_logs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.resumes
      WHERE resumes.id = resume_logs.resume_id
        AND resumes.user_id = auth.uid()
    )
  );

-- =============================================================================
-- Updated_at trigger
-- =============================================================================
CREATE OR REPLACE FUNCTION public.update_resume_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_resume_updated_at
  BEFORE UPDATE ON public.resumes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_resume_updated_at();

-- =============================================================================
-- Storage bucket for resume files
-- =============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'resumes',
  'resumes',
  false,
  10485760, -- 10MB max
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: Users can upload to their own folder
CREATE POLICY "Users can upload resume files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'resumes'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage RLS: Users can view their own files
CREATE POLICY "Users can view own resume files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'resumes'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage RLS: Users can delete their own files
CREATE POLICY "Users can delete own resume files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'resumes'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
