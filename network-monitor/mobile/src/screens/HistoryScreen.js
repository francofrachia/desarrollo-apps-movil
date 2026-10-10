import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useStore } from '../store/useStore';

export default function HistoryScreen() {
  const { history } = useStore();

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.date}>{new Date(item.timestamp).toLocaleString()}</Text>
        <Text style={styles.rssi}>RSSI: {item.rssi} dBm</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.network}>{item.network_type} - {item.carrier}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.stats}>PING: {item.ping} ms</Text>
        <Text style={styles.stats}>DL: {item.download} / UL: {item.upload}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={history}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 15 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f9' },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10, elevation: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  date: { fontSize: 12, color: '#7f8c8d' },
  rssi: { fontSize: 13, fontWeight: 'bold', color: '#34495e' },
  network: { fontSize: 14, fontWeight: 'bold', color: '#2c3e50' },
  stats: { fontSize: 13, color: '#34495e' }
});
