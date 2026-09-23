import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import MapView, { Polygon } from 'react-native-maps';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';

export default function MapScreen() {
  const [plots, setPlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const initialRegion = {
    latitude: -31.3915,
    longitude: -58.0150,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  };

  useEffect(() => {
    fetchPlots();
    // Polling para que el mapa se actualice solo en tiempo real durante el video
    const interval = setInterval(fetchPlots, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchPlots = async () => {
    const { data, error } = await supabase.from('plots_view').select('*');
    if (data) {
      // Traer estaciones y las últimas lecturas para calcular el color
      const { data: stations } = await supabase.from('stations').select('id, plot_id');
      const { data: readings } = await supabase.from('readings').select('station_id, moisture_pct').order('measured_at', { ascending: false }).limit(20);

      const formattedPlots = data.map(plot => {
        let coords = [];
        if (plot.geojson && plot.geojson.coordinates) {
          const rawCoords = plot.geojson.coordinates[0]; 
          coords = rawCoords.map((c: any[]) => ({ latitude: c[1], longitude: c[0] }));
        }

        // Determinar el color buscando la última lectura de este lote
        let currentMoisture = 30; // Valor por defecto
        if (stations && readings) {
          const station = stations.find(s => s.plot_id === plot.id);
          if (station) {
            const reading = readings.find(r => r.station_id === station.id);
            if (reading) currentMoisture = reading.moisture_pct;
          }
        }

        let fillColor = 'rgba(76, 175, 80, 0.4)'; // Verde (Óptimo)
        let strokeColor = 'rgba(76, 175, 80, 1)';
        
        if (currentMoisture < plot.threshold_min) {
          fillColor = 'rgba(244, 67, 54, 0.4)'; // Rojo (Seco)
          strokeColor = 'rgba(244, 67, 54, 1)';
        } else if (currentMoisture > plot.threshold_max) {
          fillColor = 'rgba(33, 150, 243, 0.4)'; // Azul (Inundado)
          strokeColor = 'rgba(33, 150, 243, 1)';
        }

        return {
          ...plot,
          coordinates: coords,
          color: fillColor, 
          stroke: strokeColor
        };
      });
      setPlots(formattedPlots);
    }
    setLoading(false);
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#2E7D32" /></View>;

  return (
    <View style={styles.container}>
      <MapView style={styles.map} initialRegion={initialRegion} mapType="hybrid">
        {plots.map((plot) => (
          <Polygon
            key={plot.id}
            coordinates={plot.coordinates}
            fillColor={plot.color}
            strokeColor={plot.stroke}
            strokeWidth={2}
            tappable
            onPress={() => router.push(`/lot/${plot.id}`)}
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: '100%', height: '100%' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});
