import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const useResume = () => {
  const queryClient = useQueryClient();

  const uploadResume = useMutation({
    mutationFn: async ({ file, targetRole, experienceLevel }: {
      file: File;
      targetRole: string;
      experienceLevel: string;
    }) => {
      if (!isSupabaseConfigured) throw new Error('Supabase is not configured. Please update your .env file.');

      const formData = new FormData();
      formData.append('file', file);
      formData.append('targetRole', targetRole);
      formData.append('experienceLevel', experienceLevel);

      const { data, error } = await supabase.functions.invoke('resume-upload', {
        body: formData,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      toast.success('Resume uploaded successfully!');
    },
    onError: (error: Error) => {
      console.error('Resume upload error:', error);
      toast.error(error.message || 'Failed to upload resume');
    },
  });

  const analyzeResume = useMutation({
    mutationFn: async ({ resumeId, fileName, fileSize }: {
      resumeId: string;
      fileName: string;
      fileSize?: number;
    }) => {
      if (!isSupabaseConfigured) throw new Error('Supabase is not configured. Please update your .env file.');

      const { data, error } = await supabase.functions.invoke('analyze-resume', {
        body: { resumeId, fileName, fileSize },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      toast.success('Resume analyzed successfully!');
    },
    onError: (error: Error) => {
      console.error('Resume analysis error:', error);
      toast.error(error.message || 'Failed to analyze resume');
    },
  });

  const fetchResumes = useQuery({
    queryKey: ['resumes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: isSupabaseConfigured,
  });

  return {
    uploadResume,
    analyzeResume,
    resumes: fetchResumes.data,
    isLoadingResumes: fetchResumes.isLoading,
  };
};
