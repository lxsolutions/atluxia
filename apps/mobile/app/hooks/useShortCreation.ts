import { useMutation } from '@tanstack/react-query';

interface UploadShortParams {
  videoUri: string;
  title?: string;
  description?: string;
}

export function useShortCreation() {
  const uploadMutation = useMutation({
    mutationFn: async ({ videoUri, title, description }: UploadShortParams) => {
      // Mock upload - replace with actual API call
      const formData = new FormData();
      
      // Create file object from URI
      const file = {
        uri: videoUri,
        type: 'video/mp4',
        name: 'short.mp4',
      } as any;
      
      formData.append('video', file);
      if (title) formData.append('title', title);
      if (description) formData.append('description', description);

      // Mock API response
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return {
        id: Math.random().toString(36).substr(2, 9),
        success: true,
      };
    },
    onSuccess: (data) => {
      console.log('Short uploaded successfully:', data.id);
      // Navigate back to shorts feed or show success message
    },
    onError: (error) => {
      console.error('Failed to upload short:', error);
    },
  });

  const uploadShort = async (videoUri: string, title?: string, description?: string) => {
    return uploadMutation.mutateAsync({ videoUri, title, description });
  };

  return {
    uploadShort,
    isLoading: uploadMutation.isPending,
    error: uploadMutation.error,
  };
}