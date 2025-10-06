import React, { useState, useRef } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Text } from 'react-native';
import { Video, AVPlaybackStatus, ResizeMode } from 'expo-av';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import { useShortsFeed } from '@/hooks/useShortsFeed';
import { useDeepLinking } from '@/hooks/useDeepLinking';
import AlgorithmPicker from '@/components/AlgorithmPicker';
import WhyThisDrawer from '@/components/WhyThisDrawer';
import { Ionicons } from '@expo/vector-icons';

const { height } = Dimensions.get('window');

export default function ShortsScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { shorts, algorithm, setAlgorithm, transparencyRecords } = useShortsFeed();
  const [showWhyThis, setShowWhyThis] = useState(false);
  const videoRef = useRef<Video>(null);
  const { shareContent } = useDeepLinking();

  const handleSwipe = (direction: 'up' | 'down') => {
    if (direction === 'up' && currentIndex < shorts.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (direction === 'down' && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const currentShort = shorts[currentIndex];

  const handleShare = async () => {
    if (currentShort) {
      const shareMessage = await shareContent('short', currentShort.id, currentShort.title);
      // In a real app, you would use expo-sharing here
      console.log('Share message:', shareMessage);
      // For now, we'll just log it
    }
  };

  const handleVideoStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      // Handle video status updates if needed
    }
  };

  if (!currentShort) {
    return (
      <View style={styles.container}>
        <AlgorithmPicker algorithm={algorithm} onAlgorithmChange={setAlgorithm} />
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No shorts available</Text>
        </View>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <AlgorithmPicker algorithm={algorithm} onAlgorithmChange={setAlgorithm} />
      
      <Swipeable
        onSwipeableWillOpen={(direction) => {
          if (direction === 'left' || direction === 'right') {
            // Handle horizontal swipe if needed
          }
        }}
      >
        <View style={styles.videoContainer}>
          <Video
            ref={videoRef}
            source={{ 
              uri: currentShort.videoUrl,
              overrideFileExtensionAndroid: 'm3u8' // Support HLS
            }}
            style={styles.video}
            resizeMode={ResizeMode.COVER}
            shouldPlay
            isLooping
            useNativeControls
            onPlaybackStatusUpdate={handleVideoStatusUpdate}
          />
          
          {/* Video overlay with metadata */}
          <View style={styles.overlay}>
            <View style={styles.metadata}>
              <Text style={styles.creatorName}>@{currentShort.creator.username}</Text>
              <Text style={styles.title}>{currentShort.title}</Text>
              {currentShort.description && (
                <Text style={styles.description}>{currentShort.description}</Text>
              )}
            </View>
            
            {/* Action buttons */}
            <View style={styles.actionButtons}>
              {/* Why this? button */}
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => setShowWhyThis(true)}
              >
                <Ionicons name="information-circle-outline" size={24} color="white" />
                <Text style={styles.actionButtonText}>Why this?</Text>
              </TouchableOpacity>
              
              {/* Share button */}
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={handleShare}
              >
                <Ionicons name="share-outline" size={24} color="white" />
                <Text style={styles.actionButtonText}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Swipeable>

      <WhyThisDrawer
        visible={showWhyThis}
        onClose={() => setShowWhyThis(false)}
        transparencyRecord={transparencyRecords[currentShort.id]}
      />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#fff',
    fontSize: 16,
  },
  videoContainer: {
    height: height - 100, // Account for header
  },
  video: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: 16,
  },
  metadata: {
    marginBottom: 20,
  },
  creatorName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.8,
  },
  actionButtons: {
    position: 'absolute',
    top: 50,
    right: 16,
    alignItems: 'center',
  },
  actionButton: {
    alignItems: 'center',
    marginBottom: 20,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
  },
});