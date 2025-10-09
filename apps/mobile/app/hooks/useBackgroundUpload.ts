import { useState, useEffect, useCallback } from 'react';
import * as FileSystem from 'expo-file-system';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { useQueryClient } from '@tanstack/react-query';

const BACKGROUND_UPLOAD_TASK = 'background-upload-task';

interface UploadTask {
  id: string;
  fileUri: string;
  uploadUrl: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'failed';
  error?: string;
  createdAt: Date;
}

// Define the background task
TaskManager.defineTask(BACKGROUND_UPLOAD_TASK, async () => {
  try {
    // Get pending uploads from storage
    const uploadsJson = await FileSystem.readAsStringAsync(
      FileSystem.documentDirectory + 'pending-uploads.json'
    );
    const uploads: UploadTask[] = JSON.parse(uploadsJson);
    
    const pendingUploads = uploads.filter(upload => upload.status === 'pending');
    
    for (const upload of pendingUploads) {
      try {
        // Update status to uploading
        upload.status = 'uploading';
        await FileSystem.writeAsStringAsync(
          FileSystem.documentDirectory + 'pending-uploads.json',
          JSON.stringify(uploads)
        );
        
        // Perform the upload
        const uploadResult = await FileSystem.uploadAsync(upload.uploadUrl, upload.fileUri, {
          fieldName: 'file',
          httpMethod: 'POST',
          uploadType: FileSystem.FileSystemUploadType.MULTIPART,
        });
        
        if (uploadResult.status >= 200 && uploadResult.status < 300) {
          upload.status = 'completed';
          upload.progress = 100;
        } else {
          upload.status = 'failed';
          upload.error = `Upload failed with status ${uploadResult.status}`;
        }
      } catch (error) {
        upload.status = 'failed';
        upload.error = error instanceof Error ? error.message : 'Unknown error';
      }
      
      // Save updated uploads
      await FileSystem.writeAsStringAsync(
        FileSystem.documentDirectory + 'pending-uploads.json',
        JSON.stringify(uploads)
      );
    }
    
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export function useBackgroundUpload() {
  const [uploads, setUploads] = useState<UploadTask[]>([]);
  const [isBackgroundFetchRegistered, setIsBackgroundFetchRegistered] = useState(false);
  const queryClient = useQueryClient();

  // Load uploads from storage on mount
  useEffect(() => {
    loadUploads();
    registerBackgroundFetch();
  }, []);

  const loadUploads = async () => {
    try {
      const uploadsJson = await FileSystem.readAsStringAsync(
        FileSystem.documentDirectory + 'pending-uploads.json'
      );
      setUploads(JSON.parse(uploadsJson));
    } catch (error) {
      // File doesn't exist yet, initialize with empty array
      setUploads([]);
    }
  };

  const saveUploads = async (newUploads: UploadTask[]) => {
    await FileSystem.writeAsStringAsync(
      FileSystem.documentDirectory + 'pending-uploads.json',
      JSON.stringify(newUploads)
    );
    setUploads(newUploads);
  };

  const registerBackgroundFetch = async () => {
    try {
      await BackgroundFetch.registerTaskAsync(BACKGROUND_UPLOAD_TASK, {
        minimumInterval: 15 * 60, // 15 minutes
        stopOnTerminate: false,
        startOnBoot: true,
      });
      setIsBackgroundFetchRegistered(true);
    } catch (error) {
      console.log('Background fetch registration failed:', error);
    }
  };

  const addUpload = useCallback(async (fileUri: string, uploadUrl: string) => {
    const newUpload: UploadTask = {
      id: Date.now().toString(),
      fileUri,
      uploadUrl,
      progress: 0,
      status: 'pending',
      createdAt: new Date(),
    };

    const newUploads = [...uploads, newUpload];
    await saveUploads(newUploads);
    
    // Trigger background fetch immediately
    // Note: BackgroundFetch doesn't have performAsync, we'll rely on the scheduled task

    return newUpload.id;
  }, [uploads]);

  const removeUpload = useCallback(async (uploadId: string) => {
    const newUploads = uploads.filter(upload => upload.id !== uploadId);
    await saveUploads(newUploads);
  }, [uploads]);

  const retryUpload = useCallback(async (uploadId: string) => {
    const newUploads = uploads.map(upload => 
      upload.id === uploadId 
        ? { ...upload, status: 'pending' as const, error: undefined }
        : upload
    );
    await saveUploads(newUploads);
    
    // Trigger background fetch
    // Note: BackgroundFetch doesn't have performAsync, we'll rely on the scheduled task
  }, [uploads]);

  const clearCompletedUploads = useCallback(async () => {
    const newUploads = uploads.filter(upload => upload.status !== 'completed');
    await saveUploads(newUploads);
  }, [uploads]);

  return {
    uploads,
    addUpload,
    removeUpload,
    retryUpload,
    clearCompletedUploads,
    isBackgroundFetchRegistered,
  };
}