import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';

export default function LotsScreen() {
  const [plots, setPlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchLots = async () => {
      const { data } = await supabase.from('plots').select('*');
      if (data) setPlots(data);
      setLoading(false);
    };
    fetchLots();
  }, []);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#2E7D32" /></View>;

  return (
    <View style={styles.container}>
      <FlatList
        data={plots}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => router.push(`/lot/${item.id}`)}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardSubtitle}>Cultivo: {item.crop}</Text>
            <Text style={styles.cardSubtitle}>Humedad óptima: {item.threshold_min}% - {item.threshold_max}%</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4F8' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: 'white', padding: 20, borderRadius: 12, marginBottom: 15, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#2E7D32', marginBottom: 5 },
  cardSubtitle: { fontSize: 14, color: '#666', marginBottom: 2 }
});
