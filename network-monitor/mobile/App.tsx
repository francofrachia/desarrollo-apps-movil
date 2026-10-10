import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import DashboardScreen from './src/screens/DashboardScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import MapScreen from './src/screens/MapScreen';
import { createTable } from './src/db/database';
import { useStore } from './src/store/useStore';

const Tab = createBottomTabNavigator();

export default function App() {
  const loadHistory = useStore(state => state.loadHistory);

  useEffect(() => {
    const init = async () => {
      await createTable();
      await loadHistory();
    };
    init();
  }, []);

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === 'Dashboard') iconName = focused ? 'speedometer' : 'speedometer-outline';
            else if (route.name === 'Historial') iconName = focused ? 'list' : 'list-outline';
            else if (route.name === 'Mapa') iconName = focused ? 'map' : 'map-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#008ae6',
          tabBarInactiveTintColor: 'gray',
        })}
      >
        <Tab.Screen name="Dashboard" component={DashboardScreen} />
        <Tab.Screen name="Historial" component={HistoryScreen} />
        <Tab.Screen name="Mapa" component={MapScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
