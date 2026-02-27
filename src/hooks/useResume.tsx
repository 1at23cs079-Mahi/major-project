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

      // Get the current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error('You must be logged in to upload a resume.');

      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'pdf';
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(fileName, file, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

      // Get the public URL for the uploaded file
      const { data: urlData } = supabase.storage
        .from('resumes')
        .getPublicUrl(fileName);

      // If bucket is private, use signed URL instead
      let fileUrl = urlData.publicUrl;
      if (!fileUrl || fileUrl.includes('undefined')) {
        const { data: signedUrlData, error: signedUrlError } = await supabase.storage
          .from('resumes')
          .createSignedUrl(fileName, 3600); // 1 hour expiry
        if (signedUrlError) throw new Error(`Failed to generate download URL: ${signedUrlError.message}`);
        fileUrl = signedUrlData.signedUrl;
      }

      // Create resume record in database
      const { data: resume, error: dbError } = await supabase
        .from('resumes')
        .insert({
          user_id: user.id,
          file_name: file.name,
          file_url: fileUrl,
          target_role: targetRole,
          experience_level: experienceLevel,
        })
        .select()
        .single();

      if (dbError) throw new Error(`Database error: ${dbError.message}`);

      // Trigger analysis via Edge Function
      const { error: analyzeError } = await supabase.functions.invoke('analyze-resume', {
        body: {
          resumeId: resume.id,
          fileUrl,
          targetRole,
          experienceLevel,
        },
      });

      if (analyzeError) {
        console.error('Analysis trigger error:', analyzeError);
        // Don't throw — the upload succeeded, analysis can be retried
        toast.error('Resume uploaded but analysis failed. You can retry analysis later.');
      }

      return resume;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      toast.success('Resume uploaded and analysis started!');
    },
    onError: (error: Error) => {
      console.error('Resume upload error:', error);
      toast.error(error.message || 'Failed to upload resume');
    },
  });

  const analyzeResume = useMutation({
    mutationFn: async ({ resumeId }: {
      resumeId: string;
    }) => {
      if (!isSupabaseConfigured) throw new Error('Supabase is not configured. Please update your .env file.');

      const { data, error } = await supabase.functions.invoke('analyze-resume', {
        body: { resumeId },
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
