import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Ionicons } from '@expo/vector-icons';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña no puede estar vacía'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { control, handleSubmit, formState: { isValid } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
  });

  async function onSubmit(data: LoginForm) {
    setLoading(true);
    setGlobalError('');
    const { error } = await supabase.auth.signInWithPassword({ email: data.email, password: data.password });
    if (error) setGlobalError('Email o contraseña incorrectos');
    setLoading(false);
  }

  const isButtonDisabled = !isValid || loading;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.headerBlue}>
        <View style={styles.headerTop}>
          <Ionicons name="chevron-back" size={24} color="white" />
          <Text style={styles.headerTitle}>Sign in</Text>
          <View style={{ width: 24 }} />
        </View>
      </SafeAreaView>

      <View style={styles.formContainer}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Hello there, sign in to continue</Text>

        <View style={styles.illustrationContainer}>
          <View style={styles.circle}>
            <Ionicons name="lock-closed-outline" size={40} color="#3629B7" />
          </View>
        </View>

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
        
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value } }) => (
            <View style={styles.passwordContainer}>
              <TextInput 
                style={styles.passwordInput}
                placeholder="Password"
                value={value}
                onChangeText={onChange}
                secureTextEntry={!showPassword}
                editable={!loading}
                placeholderTextColor="#A0A0A0"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#A0A0A0" />
              </TouchableOpacity>
            </View>
          )}
        />

        <View style={styles.forgotPasswordContainer}>
          <Link href="/forgot-password" asChild>
            <TouchableOpacity>
              <Text style={styles.forgotPasswordText}>Forgot your password?</Text>
            </TouchableOpacity>
          </Link>
        </View>

        {globalError ? <Text style={styles.error}>{globalError}</Text> : null}

        <TouchableOpacity 
          style={[styles.button, isButtonDisabled ? styles.buttonDisabled : null]}
          onPress={handleSubmit(onSubmit)}
          disabled={isButtonDisabled}
        >
          {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Sign in</Text>}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account?</Text>
          <View style={{width: 5}} />
          <Link href="/register" asChild>
            <TouchableOpacity>
              <Text style={styles.footerLink}>Sign Up</Text>
            </TouchableOpacity>
          </Link>
        </View>
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
  illustrationContainer: { alignItems: 'center', marginBottom: 30 },
  circle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#F0F0FC', justifyContent: 'center', alignItems: 'center' },
  input: { borderWidth: 1, borderColor: '#E8E8E8', borderRadius: 16, padding: 16, marginBottom: 15, fontSize: 14, fontFamily: 'Poppins_400Regular', color: '#1A1A1A', backgroundColor: '#FAFAFA' },
  passwordContainer: { flexDirection: 'row', borderWidth: 1, borderColor: '#E8E8E8', borderRadius: 16, marginBottom: 15, backgroundColor: '#FAFAFA', alignItems: 'center' },
  passwordInput: { flex: 1, padding: 16, fontSize: 14, fontFamily: 'Poppins_400Regular', color: '#1A1A1A' },
  eyeIcon: { padding: 15 },
  forgotPasswordContainer: { alignItems: 'flex-end', marginBottom: 25 },
  forgotPasswordText: { color: '#A0A0A0', fontSize: 13, fontFamily: 'Poppins_400Regular' },
  button: { backgroundColor: '#3629B7', padding: 18, borderRadius: 16, alignItems: 'center', shadowColor: '#3629B7', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  buttonDisabled: { opacity: 0.5, shadowOpacity: 0 },
  buttonText: { color: '#FFFFFF', fontFamily: 'Poppins_600SemiBold', fontSize: 16 },
  error: { color: '#E23B3B', marginBottom: 15, textAlign: 'center', fontFamily: 'Poppins_500Medium', fontSize: 14 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 'auto', paddingBottom: 20 },
  footerText: { color: '#888888', fontSize: 14, fontFamily: 'Poppins_400Regular' },
  footerLink: { color: '#3629B7', fontSize: 14, fontFamily: 'Poppins_600SemiBold' }
});
