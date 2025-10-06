import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

type Algorithm = 'recency_follow' | 'diversity_dissent' | 'locality_first';

interface AlgorithmPickerProps {
  algorithm: Algorithm;
  onAlgorithmChange: (algorithm: Algorithm) => void;
}

const algorithmLabels = {
  recency_follow: 'Recent & Following',
  diversity_dissent: 'Diverse & Dissenting',
  locality_first: 'Local First',
};

const algorithmDescriptions = {
  recency_follow: 'Prioritizes recent content from creators you follow',
  diversity_dissent: 'Emphasizes diverse perspectives and dissenting views',
  locality_first: 'Focuses on content relevant to your location',
};

export default function AlgorithmPicker({ algorithm, onAlgorithmChange }: AlgorithmPickerProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Algorithm</Text>
      <View style={styles.algorithmList}>
        {(Object.keys(algorithmLabels) as Algorithm[]).map((algo) => (
          <TouchableOpacity
            key={algo}
            style={[
              styles.algorithmButton,
              algorithm === algo && styles.algorithmButtonActive,
            ]}
            onPress={() => onAlgorithmChange(algo)}
          >
            <Text style={[
              styles.algorithmText,
              algorithm === algo && styles.algorithmTextActive,
            ]}>
              {algorithmLabels[algo]}
            </Text>
            <Text style={styles.algorithmDescription}>
              {algorithmDescriptions[algo]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  algorithmList: {
    gap: 8,
  },
  algorithmButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  algorithmButtonActive: {
    borderColor: '#007AFF',
    backgroundColor: '#e6f2ff',
  },
  algorithmText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  algorithmTextActive: {
    color: '#007AFF',
  },
  algorithmDescription: {
    fontSize: 14,
    color: '#666',
  },
});