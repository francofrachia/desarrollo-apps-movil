import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { useStore } from '../store/useStore';

export default function MapScreen() {
  const { history } = useStore();

  const heatmapPoints = history
    .filter(item => item.lat && item.lng)
    .map(item => ({
      lat: item.lat,
      lng: item.lng,
      intensity: item.download > 10 ? 1.0 : (item.download > 2 ? 0.5 : 0.2)
    }));

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <script src="https://unpkg.com/leaflet.heat@0.2.0/dist/leaflet-heat.js"></script>
      <style>
        body { padding: 0; margin: 0; background-color: #f4f6f9; }
        #map { width: 100vw; height: 100vh; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        const data = ${JSON.stringify(heatmapPoints)};
        
        // Obelisco por defecto si no hay datos, si hay usamos el ultimo
        const centerLat = data.length > 0 ? data[0].lat : -34.6037;
        const centerLng = data.length > 0 ? data[0].lng : -58.3816;
        
        const map = L.map('map').setView([centerLat, centerLng], 14);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap'
        }).addTo(map);

        if (data.length > 0) {
          const heatData = data.map(p => [p.lat, p.lng, p.intensity]);
          const heat = L.heatLayer(heatData, {
            radius: 35, 
            blur: 20, 
            maxZoom: 17,
            gradient: {0.4: 'blue', 0.6: 'cyan', 0.7: 'lime', 0.8: 'yellow', 1.0: 'red'}
          }).addTo(map);
        }
      </script>
    </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <WebView 
        source={{ html: htmlContent }} 
        style={styles.map} 
        javaScriptEnabled={true}
        domStorageEnabled={true}
      />
      {heatmapPoints.length === 0 && (
        <View style={styles.overlay}>
          <Text style={styles.overlayText}>No hay datos con ubicación para el Heatmap.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: '100%', height: '100%' },
  overlay: {
    position: 'absolute',
    top: 50,
    alignSelf: 'center',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    elevation: 4
  },
  overlayText: { fontWeight: 'bold', color: '#333' }
});
