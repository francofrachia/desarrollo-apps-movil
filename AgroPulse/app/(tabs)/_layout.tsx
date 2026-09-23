import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#2E7D32', headerShown: true, headerStyle: { backgroundColor: '#2E7D32' }, headerTintColor: '#fff' }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Mapa',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="map" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="lots"
        options={{
          title: 'Lotes',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="view-grid" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: 'Alertas',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="bell" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Cuenta',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="account" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
