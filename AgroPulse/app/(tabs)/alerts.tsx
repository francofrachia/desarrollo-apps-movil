import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { supabase } from '../../lib/supabase';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function AlertsScreen() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchAlerts = async () => {
      const { data } = await supabase
        .from('alerts')
        .select('*, plots(name)')
        .order('created_at', { ascending: false });
      if (data) setAlerts(data);
      setLoading(false);
    };
    fetchAlerts();
  }, []);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#2E7D32" /></View>;

  return (
    <View style={styles.container}>
      {alerts.length === 0 ? (
        <View style={styles.center}>
          <MaterialCommunityIcons name="bell-check" size={64} color="#4CAF50" />
          <Text style={styles.emptyText}>No hay alertas activas</Text>
        </View>
      ) : (
        <FlatList
          data={alerts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20 }}
          renderItem={({ item }) => {
            const isHigh = item.type === 'moisture_high';
            const iconColor = isHigh ? "#2196F3" : "#F44336";
            const message = item.payload?.message || 'Humedad crítica detectada';

            return (
              <TouchableOpacity style={styles.card} onPress={() => router.push(`/lot/${item.plot_id}`)}>
                <MaterialCommunityIcons name="alert-circle" size={30} color={iconColor} />
                <View style={{ marginLeft: 15, flex: 1 }}>
                  <Text style={styles.cardTitle}>Alerta en {item.plots?.name || 'Lote'}</Text>
                  <Text style={[styles.cardSubtitle, { color: iconColor }]}>{message}</Text>
                  <Text style={styles.date}>{new Date(item.created_at).toLocaleString()}</Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4F8' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { marginTop: 10, fontSize: 16, color: '#555', fontWeight: 'bold' },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 20, borderRadius: 12, marginBottom: 15, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 2 },
  cardSubtitle: { fontSize: 14, color: '#F44336', fontWeight: '500', marginBottom: 5 },
  date: { fontSize: 12, color: '#888' }
});
