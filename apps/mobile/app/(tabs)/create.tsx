import React, { useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import { Camera, CameraType } from 'expo-camera';
import { useShortCreation } from '@/hooks/useShortCreation';
import { useBackgroundUpload } from '@/hooks/useBackgroundUpload';
import { usePushNotifications } from '@/hooks/usePushNotifications';

export default function CreateScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraType, setCameraType] = useState(CameraType.back);
  const [isRecording, setIsRecording] = useState(false);
  const cameraRef = useRef<Camera>(null);
  const { uploadShort } = useShortCreation();
  const { addUpload } = useBackgroundUpload();
  const { sendLocalNotification } = usePushNotifications();

  React.useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleRecord = async () => {
    if (cameraRef.current && !isRecording) {
      setIsRecording(true);
      try {
        const video = await cameraRef.current.recordAsync({
          maxDuration: 90, // 90 seconds max for shorts
          quality: '720p' as any,
        });
        
        // Upload the recorded video with background support
        const uploadUrl = 'https://api.polyverse.social/media/upload';
        const uploadId = await addUpload(video.uri, uploadUrl);
        
        // Send notification
        await sendLocalNotification({
          title: 'Upload Started',
          body: 'Your short is being uploaded in the background',
          data: {
            type: 'upload_started',
            uploadId,
          },
        });
        
        Alert.alert(
          'Upload Started',
          'Your short is being uploaded in the background. You can continue using the app.',
          [{ text: 'OK' }]
        );
        
      } catch (error) {
        console.error('Recording failed:', error);
        Alert.alert('Upload Failed', 'Failed to start upload. Please try again.');
      } finally {
        setIsRecording(false);
      }
    }
  };

  const handleStop = () => {
    if (cameraRef.current && isRecording) {
      cameraRef.current.stopRecording();
      setIsRecording(false);
    }
  };

  if (hasPermission === null) {
    return <View style={styles.container}><Text>Requesting camera permission...</Text></View>;
  }
  
  if (hasPermission === false) {
    return <View style={styles.container}><Text>No access to camera</Text></View>;
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={styles.camera}
        type={cameraType}
        ratio="9:16" // Vertical aspect ratio for shorts
      />
      
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.recordButton}
          onPress={isRecording ? handleStop : handleRecord}
        >
          <View style={[styles.recordCircle, isRecording && styles.recording]} />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.flipButton}
          onPress={() => {
            setCameraType(
              cameraType === CameraType.back ? CameraType.front : CameraType.back
            );
          }}
        >
          <Text style={styles.flipText}>Flip</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  controls: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  recordCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ff0000',
  },
  recording: {
    borderRadius: 10,
    width: 40,
    height: 40,
  },
  flipButton: {
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
  },
  flipText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});