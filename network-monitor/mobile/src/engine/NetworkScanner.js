import NetInfo from '@react-native-community/netinfo';
import * as Location from 'expo-location';
import { runPingTest } from './PingTester';
import { testDownload, testUpload } from './ThroughputTester';
import { useStore } from '../store/useStore';
import { saveMeasurement } from '../db/database';
// @ts-ignore
import QosMetricsModule from '../../modules/qos-metrics/src/QosMetricsModule';

const getCurrentPosition = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return { latitude: -34.6037, longitude: -58.3816 }; // Fallback obelisco
    }
    
    // Usamos getLastKnown primero porque en emuladores getCurrentPositionAsync puede colgarse infinitamente
    let location = await Location.getLastKnownPositionAsync({});
    if (!location) {
      // Intentar forzar con accuracy muy baja
      location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Lowest });
    }
    return location ? location.coords : { latitude: -34.6037, longitude: -58.3816 };
  } catch (e) {
    return { latitude: -34.6037, longitude: -58.3816 };
  }
};

export const runFullScan = async () => {
  const store = useStore.getState();
  store.setIsScanning(true);
  
  try {
    const coords = await getCurrentPosition();
    const netState = await NetInfo.fetch();
    
    let carrier = 'Desconocido';
    let rssi = -100;

    try {
      if (QosMetricsModule && QosMetricsModule.getTelephonyInfo) {
        const telephonyData = await QosMetricsModule.getTelephonyInfo();
        carrier = telephonyData.carrier || 'Desconocido';
        rssi = telephonyData.rssi || -100;
      }
    } catch (e) {
      console.log('Error reading Expo local module', e);
    }
    
    const pingResult = await runPingTest('8.8.8.8', 4);
    const download = await testDownload(2);
    const upload = await testUpload(1);
    
    const measurement = {
      timestamp: new Date().toISOString(),
      lat: coords.latitude,
      lng: coords.longitude,
      ping: pingResult ? pingResult.avg : 0,
      download: Number(download.toFixed(2)),
      upload: Number(upload.toFixed(2)),
      network_type: netState.type,
      carrier: carrier,
      rssi: rssi
    };
    
    await saveMeasurement(measurement);
    store.setLastMeasurement(measurement);
    await store.loadHistory();
    
  } catch (error) {
    console.error('Scan failed:', error);
  } finally {
    store.setIsScanning(false);
  }
};
