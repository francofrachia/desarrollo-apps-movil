import { useLocalSearchParams, Stack } from 'expo-router';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { useEffect, useState } from 'react';

const screenWidth = Dimensions.get("window").width;

export default function LotDetailScreen() {
  const { id } = useLocalSearchParams();
  const [plot, setPlot] = useState<any>(null);
  const [valve, setValve] = useState<any>(null);
  const [readings, setReadings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadData();
    
    // Polling A prueba de balas para refrescar la válvula
    const interval = setInterval(async () => {
      const { data: v } = await supabase.from('valves').select('*').eq('plot_id', id).limit(1).single();
      if (v) {
        setValve(prev => {
          // Si el estado físico de la base de datos es distinto al de la pantalla, actualizar pantalla
          if (!prev || v.status !== prev.status) return v;
          return prev;
        });
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [id]);

  const loadData = async () => {
    // 1. Traer datos del lote
    const { data: plotData } = await supabase.from('plots').select('*').eq('id', id).single();
    setPlot(plotData);

    // 2. Traer la válvula del lote
    const { data: valveData } = await supabase.from('valves').select('*').eq('plot_id', id).limit(1).single();
    setValve(valveData);

    // 3. Traer la estación y sus últimas lecturas
    const { data: stationData } = await supabase.from('stations').select('id').eq('plot_id', id).limit(1).single();
    if (stationData) {
      const { data: readingsData } = await supabase.from('readings')
        .select('*')
        .eq('station_id', stationData.id)
        .order('measured_at', { ascending: false })
        .limit(6);
      if (readingsData) setReadings(readingsData.reverse());
    }
    setLoading(false);
  };

  const handleIrrigation = async (action: 'open' | 'close') => {
    if (!valve) return;
    setSending(true);
    const { data: userData } = await supabase.auth.getUser();
    
    // Generar un UUID estándar para la idempotencia
    const generateUUID = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8); return v.toString(16); });
    const requestId = generateUUID();

    const { error } = await supabase.from('irrigation_commands').insert({
      valve_id: valve.id,
      requested_by: userData.user?.id,
      action: action,
      status: 'pending',
      client_request_id: requestId
    });

    if (error) {
      Alert.alert('Error', 'No se pudo enviar el comando: ' + error.message);
    } else {
      Alert.alert('Comando Enviado', 'La válvula física se está procesando...');
    }
    setSending(false);
  };

  if (loading || !plot) return <View style={styles.center}><ActivityIndicator size="large" color="#2E7D32" /></View>;

  // Preparar datos del gráfico
  const chartLabels = readings.length > 0 ? readings.map(r => new Date(r.measured_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})) : ['Sin datos'];
  const chartValues = readings.length > 0 ? readings.map(r => r.moisture_pct) : [0];
  const currentMoisture = readings.length > 0 ? readings[readings.length - 1].moisture_pct : 0;
  
  const isDry = currentMoisture < plot.threshold_min;
  const isWet = currentMoisture > plot.threshold_max;
  let statusText = 'Óptimo';
  let statusColor = '#4CAF50';
  if (isDry) { statusText = 'Seco (Requiere riego)'; statusColor = '#F44336'; }
  if (isWet) { statusText = 'Exceso de humedad'; statusColor = '#2196F3'; }

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: 'Detalle de Lote' }} />
      
      <View style={styles.header}>
        <View style={[styles.statusIndicator, { backgroundColor: statusColor }]} />
        <View>
          <Text style={styles.lotName}>{plot.name}</Text>
          <Text style={[styles.lotStatus, { color: statusColor }]}>Estado: {statusText}</Text>
          <Text style={styles.lastReading}>Humedad actual: {currentMoisture.toFixed(1)}%</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Humedad Reciente</Text>
      <View style={styles.chartContainer}>
        <LineChart
          data={{
            labels: chartLabels,
            datasets: [{ data: chartValues, strokeWidth: 2 }]
          }}
          width={screenWidth - 40}
          height={220}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(46, 125, 50, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: { borderRadius: 16 },
          }}
          bezier
          style={{ marginVertical: 8, borderRadius: 16 }}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Umbrales de Humedad</Text>
        <Text>Mínimo: {plot.threshold_min}% | Máximo: {plot.threshold_max}%</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Control de Riego ({valve?.name})</Text>
        <Text style={styles.valveStatus}>Estado físico: {valve?.status === 'open' ? 'ABIERTA' : 'CERRADA'}</Text>
        
        {valve?.status !== 'open' ? (
          <TouchableOpacity 
            style={[styles.primaryButton, { opacity: sending ? 0.7 : 1 }]} 
            onPress={() => handleIrrigation('open')}
            disabled={sending}
          >
            <MaterialCommunityIcons name="water" size={20} color="white" />
            <Text style={styles.buttonText}>Abrir Válvula (Regar)</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.primaryButton, { backgroundColor: '#D32F2F', opacity: sending ? 0.7 : 1 }]} 
            onPress={() => handleIrrigation('close')}
            disabled={sending}
          >
            <MaterialCommunityIcons name="close" size={20} color="white" />
            <Text style={styles.buttonText}>Cerrar Válvula</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4F8', padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, backgroundColor: 'white', padding: 15, borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
  statusIndicator: { width: 24, height: 24, borderRadius: 12, marginRight: 15 },
  lotName: { fontSize: 20, fontWeight: 'bold' },
  lotStatus: { fontSize: 16, fontWeight: '500' },
  lastReading: { fontSize: 12, color: '#757575', marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 10, color: '#333' },
  chartContainer: { alignItems: 'center', marginBottom: 20 },
  card: { backgroundColor: 'white', padding: 15, borderRadius: 12, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
  cardTitle: { fontSize: 16, fontWeight: '600', marginBottom: 10 },
  valveStatus: { marginBottom: 15, fontSize: 16, color: '#2E7D32', fontWeight: 'bold' },
  primaryButton: { backgroundColor: '#2E7D32', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 8 },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16, marginLeft: 8 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});
