import { registerWebModule, NativeModule } from 'expo';

class QosMetricsModule extends NativeModule<{}> {}

export default registerWebModule(QosMetricsModule, 'QosMetricsModule');
