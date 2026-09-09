import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Platform, ActivityIndicator } from 'react-native';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function ConfirmEmailScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleResend() {
    if (!email) {
      alert('Email no disponible para reenviar.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: { emailRedirectTo: 'ibanktp://confirm' }
    });
    setLoading(false);
    
    alert('¡Correo reenviado! Por favor revisá tu bandeja de entrada o SPAM.');
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.headerBlue}>
        <View style={styles.headerTop}>
          <Link href="/" asChild>
            <TouchableOpacity>
              <Ionicons name="chevron-back" size={24} color="white" />
            </TouchableOpacity>
          </Link>
          <Text style={styles.headerTitle}>Verificación</Text>
          <View style={{ width: 24 }} />
        </View>
      </SafeAreaView>

      <View style={styles.formContainer}>
        <View style={styles.iconContainer}>
          <Ionicons name="mail-open-outline" size={60} color="#3629B7" />
        </View>
        
        <Text style={styles.title}>Revisá tu email</Text>
        <Text style={styles.subtitle}>
          Te enviamos un enlace de confirmación a <Text style={{fontFamily: 'Poppins_600SemiBold', color: '#3629B7'}}>{email || 'tu correo'}</Text>. Por favor, revisá tu bandeja de entrada para continuar.
        </Text>

        <TouchableOpacity 
          style={[styles.buttonOutline, loading ? { opacity: 0.7 } : null]}
          onPress={handleResend}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#3629B7" /> : <Text style={styles.buttonOutlineText}>Reenviar correo</Text>}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.button}
          onPress={() => router.replace('/')}
        >
          <Text style={styles.buttonText}>Volver al Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#3629B7' },
  headerBlue: { backgroundColor: '#3629B7', paddingTop: Platform.OS === 'android' ? 40 : 0, height: 160 },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 10 },
  headerTitle: { color: '#FFFFFF', fontSize: 18, fontFamily: 'Poppins_600SemiBold' },
  formContainer: { flex: 1, backgroundColor: '#FFFFFF', borderTopLeftRadius: 35, borderTopRightRadius: 35, padding: 30, marginTop: -40, alignItems: 'center' },
  iconContainer: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#F0F0FC', justifyContent: 'center', alignItems: 'center', marginBottom: 25, marginTop: 20 },
  title: { fontSize: 24, fontFamily: 'Poppins_600SemiBold', color: '#1A1A1A', marginBottom: 15 },
  subtitle: { fontSize: 14, fontFamily: 'Poppins_400Regular', color: '#888888', textAlign: 'center', lineHeight: 22, marginBottom: 40 },
  button: { backgroundColor: '#3629B7', padding: 18, borderRadius: 16, alignItems: 'center', width: '100%', shadowColor: '#3629B7', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  buttonText: { color: '#FFFFFF', fontFamily: 'Poppins_600SemiBold', fontSize: 16 },
  buttonOutline: { backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#3629B7', padding: 16, borderRadius: 16, alignItems: 'center', width: '100%', marginBottom: 15 },
  buttonOutlineText: { color: '#3629B7', fontFamily: 'Poppins_600SemiBold', fontSize: 16 }
});
