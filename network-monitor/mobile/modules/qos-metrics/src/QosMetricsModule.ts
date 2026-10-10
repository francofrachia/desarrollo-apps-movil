import { NativeModule, requireNativeModule } from 'expo';

declare class QosMetricsModule extends NativeModule {
  getTelephonyInfo(): Promise<{ carrier: string; rssi: number }>;
}

export default requireNativeModule<QosMetricsModule>('QosMetrics');
