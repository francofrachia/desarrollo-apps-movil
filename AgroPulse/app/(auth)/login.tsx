import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function LoginScreen() {
  const [email, setEmail] = useState('productor@agropulse.test');
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) Alert.alert('Error', error.message);
    else router.replace('/(tabs)');
    setLoading(false);
  };

  const handleSignUp = async () => {
    if (!email || !password) return Alert.alert('Error', 'Completá los campos');
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email, password });
    
    if (error) {
      Alert.alert('Error al registrarse', error.message);
    } else {
      // Si la confirmación de email está desactivada, Supabase te loguea directo
      if (data.session) {
        router.replace('/(tabs)');
      } else {
        // En caso de que pida confirmar (aunque lo desactivaste) hacemos que intente entrar igual
        handleLogin(); 
      }
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="sprout" size={80} color="#2E7D32" />
        <Text style={styles.title}>AgroPulse</Text>
        <Text style={styles.subtitle}>Agricultura de Precisión IoT</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Correo electrónico</Text>
        <TextInput 
          style={styles.input} 
          value={email} 
          onChangeText={setEmail} 
          autoCapitalize="none" 
          keyboardType="email-address" 
        />
        
        <Text style={styles.label}>Contraseña</Text>
        <TextInput 
          style={styles.input} 
          value={password} 
          onChangeText={setPassword} 
          secureTextEntry 
        />

        {loading ? (
          <ActivityIndicator size="large" color="#2E7D32" style={{ marginTop: 20 }} />
        ) : (
          <>
            <TouchableOpacity style={styles.primaryButton} onPress={handleLogin}>
              <Text style={styles.buttonText}>Iniciar Sesión</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={handleSignUp}>
              <Text style={styles.secondaryButtonText}>Crear nueva cuenta</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4F8', padding: 20, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 50 },
  title: { fontSize: 36, fontWeight: 'bold', color: '#2E7D32', marginTop: 10 },
  subtitle: { fontSize: 16, color: '#666', marginTop: 5 },
  form: { backgroundColor: 'white', padding: 25, borderRadius: 16, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  input: { backgroundColor: '#F9F9F9', borderWidth: 1, borderColor: '#E0E0E0', padding: 15, borderRadius: 10, marginBottom: 20, fontSize: 16 },
  primaryButton: { backgroundColor: '#2E7D32', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  secondaryButton: { backgroundColor: 'transparent', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10, borderWidth: 1, borderColor: '#2E7D32' },
  secondaryButtonText: { color: '#2E7D32', fontWeight: 'bold', fontSize: 16 }
});
