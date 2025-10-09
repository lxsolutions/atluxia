import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';

interface TransparencyRecord {
  algorithm: string;
  features: Record<string, number>;
  weights: Record<string, number>;
  timestamp: string;
}

interface WhyThisDrawerProps {
  visible: boolean;
  onClose: () => void;
  transparencyRecord?: TransparencyRecord;
}

const algorithmLabels = {
  recency_follow: 'Recent & Following',
  diversity_dissent: 'Diverse & Dissenting',
  locality_first: 'Local First',
};

const featureLabels: Record<string, string> = {
  recency: 'Recency',
  creator_diversity: 'Creator Diversity',
  topic_variety: 'Topic Variety',
  follow_affinity: 'Follow Affinity',
  engagement: 'Engagement',
  locality: 'Locality Relevance',
};

export default function WhyThisDrawer({ visible, onClose, transparencyRecord }: WhyThisDrawerProps) {
  if (!visible || !transparencyRecord) return null;

  return (
    <View style={styles.overlay}>
      <TouchableOpacity style={styles.backdrop} onPress={onClose} />
      
      <View style={styles.drawer}>
        <View style={styles.header}>
          <Text style={styles.title}>Why this content?</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Algorithm</Text>
            <Text style={styles.sectionValue}>
              {algorithmLabels[transparencyRecord.algorithm as keyof typeof algorithmLabels] || transparencyRecord.algorithm}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Feature Scores</Text>
            {Object.entries(transparencyRecord.features).map(([feature, score]) => (
              <View key={feature} style={styles.featureRow}>
                <Text style={styles.featureLabel}>
                  {featureLabels[feature] || feature}
                </Text>
                <View style={styles.scoreBarContainer}>
                  <View 
                    style={[
                      styles.scoreBar, 
                      { width: `${score * 100}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.scoreText}>{score.toFixed(2)}</Text>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Algorithm Weights</Text>
            {Object.entries(transparencyRecord.weights).map(([weight, value]) => (
              <View key={weight} style={styles.weightRow}>
                <Text style={styles.weightLabel}>
                  {featureLabels[weight] || weight}
                </Text>
                <Text style={styles.weightValue}>{value.toFixed(2)}</Text>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Calculated At</Text>
            <Text style={styles.sectionValue}>
              {new Date(transparencyRecord.timestamp).toLocaleString()}
            </Text>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  sectionValue: {
    fontSize: 14,
    color: '#666',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureLabel: {
    width: 120,
    fontSize: 14,
    color: '#333',
  },
  scoreBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  scoreBar: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  scoreText: {
    width: 40,
    fontSize: 12,
    textAlign: 'right',
    color: '#666',
  },
  weightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  weightLabel: {
    fontSize: 14,
    color: '#333',
  },
  weightValue: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
});