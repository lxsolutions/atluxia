import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useTruthClaims } from '@/hooks/useTruthClaims';
import ClaimCard from '@/components/ClaimCard';

export default function TruthScreen() {
  const { claims, isLoading } = useTruthClaims();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading claims...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Truth Archive</Text>
      </View>
      
      <FlatList
        data={claims}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ClaimCard claim={item} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  list: {
    padding: 16,
  },
});