import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Claim {
  id: string;
  title: string;
  summary: string;
  confidence: number;
  evidenceCount: number;
  counterclaimCount: number;
  createdAt: string;
  updatedAt: string;
}

interface ClaimCardProps {
  claim: Claim;
  onPress?: () => void;
}

export default function ClaimCard({ claim, onPress }: ClaimCardProps) {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return '#4CAF50';
    if (confidence >= 0.6) return '#FF9800';
    return '#F44336';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'High Confidence';
    if (confidence >= 0.6) return 'Medium Confidence';
    return 'Low Confidence';
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={2}>
          {claim.title}
        </Text>
        <View style={[
          styles.confidenceBadge,
          { backgroundColor: getConfidenceColor(claim.confidence) }
        ]}>
          <Text style={styles.confidenceText}>
            {getConfidenceLabel(claim.confidence)}
          </Text>
        </View>
      </View>

      <Text style={styles.summary} numberOfLines={3}>
        {claim.summary}
      </Text>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{claim.evidenceCount}</Text>
          <Text style={styles.statLabel}>Evidence</Text>
        </View>
        
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{claim.counterclaimCount}</Text>
          <Text style={styles.statLabel}>Counterclaims</Text>
        </View>
        
        <View style={styles.stat}>
          <Text style={styles.statNumber}>
            {(claim.confidence * 100).toFixed(0)}%
          </Text>
          <Text style={styles.statLabel}>Confidence</Text>
        </View>
      </View>

      <Text style={styles.updatedAt}>
        Updated {new Date(claim.updatedAt).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
    lineHeight: 20,
  },
  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  confidenceText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  summary: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
    marginBottom: 12,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  updatedAt: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
  },
});