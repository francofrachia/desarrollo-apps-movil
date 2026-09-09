import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Link, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Ionicons } from '@expo/vector-icons';

const forgotSchema = z.object({
  email: z.string().email('Email inválido'),
});

type ForgotForm = z.infer<typeof forgotSchema>;

export default function ForgotPasswordScreen() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const { control, handleSubmit, formState: { isValid } } = useForm<ForgotForm>({
    resolver: zodResolver(forgotSchema),
    mode: 'onChange',
  });

  async function onSubmit(data: ForgotForm) {
    setLoading(true);
    // PDF 6.4: Enviar mail apuntando al deep link de reseteo
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: 'ibanktp://reset-password',
    });
    
    setLoading(false);
    // PDF: Mostrar mensaje neutro siempre
    setSuccess(true);
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
          <Text style={styles.headerTitle}>Forgot Password</Text>
          <View style={{ width: 24 }} />
        </View>
      </SafeAreaView>

      <View style={styles.formContainer}>
        {success ? (
          <View style={{ alignItems: 'center', marginTop: 20 }}>
            <View style={styles.circle}>
              <Ionicons name="mail-unread-outline" size={50} color="#3629B7" />
            </View>
            <Text style={styles.title}>Revisá tu email</Text>
            <Text style={[styles.subtitle, {textAlign: 'center', marginTop: 10, lineHeight: 22}]}>
              Si el correo existe en nuestro sistema, te enviamos un enlace para restablecer tu contraseña.
            </Text>
            <TouchableOpacity style={[styles.button, { width: '100%', marginTop: 30 }]} onPress={() => router.replace('/')}>
              <Text style={styles.buttonText}>Volver al Login</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <Text style={styles.title}>Forgot password</Text>
            <Text style={styles.subtitle}>Enter your email to verify your account</Text>

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <TextInput 
                  style={styles.input}
                  placeholder="Email address"
                  value={value}
                  onChangeText={onChange}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  editable={!loading}
                  placeholderTextColor="#A0A0A0"
                />
              )}
            />
            
            <TouchableOpacity 
              style={[styles.button, (!isValid || loading) ? styles.buttonDisabled : null, { marginTop: 10 }]}
              onPress={handleSubmit(onSubmit)}
              disabled={!isValid || loading}
            >
              {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Send</Text>}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#3629B7' },
  headerBlue: { backgroundColor: '#3629B7', paddingTop: Platform.OS === 'android' ? 40 : 0, height: 160 },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 10 },
  headerTitle: { color: '#FFFFFF', fontSize: 18, fontFamily: 'Poppins_600SemiBold' },
  formContainer: { flex: 1, backgroundColor: '#FFFFFF', borderTopLeftRadius: 35, borderTopRightRadius: 35, padding: 30, marginTop: -40 },
  title: { fontSize: 24, fontFamily: 'Poppins_600SemiBold', color: '#1A1A1A', marginBottom: 5 },
  subtitle: { fontSize: 14, fontFamily: 'Poppins_400Regular', color: '#888888', marginBottom: 30 },
  circle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#F0F0FC', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#E8E8E8', borderRadius: 16, padding: 16, marginBottom: 15, fontSize: 14, fontFamily: 'Poppins_400Regular', color: '#1A1A1A', backgroundColor: '#FAFAFA' },
  button: { backgroundColor: '#3629B7', padding: 18, borderRadius: 16, alignItems: 'center', shadowColor: '#3629B7', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  buttonDisabled: { opacity: 0.5, shadowOpacity: 0 },
  buttonText: { color: '#FFFFFF', fontFamily: 'Poppins_600SemiBold', fontSize: 16 },
});
