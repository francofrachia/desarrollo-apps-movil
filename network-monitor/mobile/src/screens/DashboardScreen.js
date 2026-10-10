import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useStore } from '../store/useStore';
import { runFullScan } from '../engine/NetworkScanner';

export default function DashboardScreen() {
  const { isScanning, lastMeasurement } = useStore();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Network QoS Monitor</Text>
      
      <TouchableOpacity 
        style={[styles.button, isScanning && styles.buttonDisabled]} 
        onPress={runFullScan}
        disabled={isScanning}
      >
        {isScanning ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>INICIAR TEST</Text>
        )}
      </TouchableOpacity>

      {lastMeasurement && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Última Medición</Text>
          <View style={styles.row}><Text style={styles.label}>Operador:</Text><Text style={styles.value}>{lastMeasurement.carrier}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Tipo de Red:</Text><Text style={styles.value}>{lastMeasurement.network_type}</Text></View>
          <View style={styles.row}><Text style={styles.label}>RSSI:</Text><Text style={styles.value}>{lastMeasurement.rssi} dBm</Text></View>
          <View style={styles.row}><Text style={styles.label}>Ping (RTT):</Text><Text style={styles.value}>{lastMeasurement.ping} ms</Text></View>
          <View style={styles.row}><Text style={styles.label}>Descarga:</Text><Text style={styles.value}>{lastMeasurement.download} Mbps</Text></View>
          <View style={styles.row}><Text style={styles.label}>Subida:</Text><Text style={styles.value}>{lastMeasurement.upload} Mbps</Text></View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, alignItems: 'center', backgroundColor: '#f4f6f9' },
  title: { fontSize: 22, fontWeight: 'bold', marginVertical: 30, color: '#2c3e50' },
  button: { backgroundColor: '#008ae6', paddingVertical: 14, paddingHorizontal: 40, borderRadius: 25, elevation: 3 },
  buttonDisabled: { backgroundColor: '#7f8c8d' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  card: { marginTop: 40, width: '100%', backgroundColor: '#fff', padding: 20, borderRadius: 12, elevation: 2 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#34495e', borderBottomWidth: 1, borderBottomColor: '#ecf0f1', paddingBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 6 },
  label: { fontSize: 15, color: '#7f8c8d' },
  value: { fontSize: 15, fontWeight: 'bold', color: '#2c3e50' }
});
