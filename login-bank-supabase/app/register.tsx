import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Link, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Ionicons } from '@expo/vector-icons';

const registerSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Email inválido'),
  password: z.string(),
  terms: z.boolean().refine(val => val === true, 'Debes aceptar los términos'),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterScreen() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const { control, handleSubmit, watch, formState: { isValid } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: { terms: false, password: '' }
  });

  const passwordValue = watch('password') || '';

  const checks = {
    length: passwordValue.length >= 8,
    upper: /[A-Z]/.test(passwordValue),
    lower: /[a-z]/.test(passwordValue),
    number: /[0-9]/.test(passwordValue),
    symbol: /[!@#$%^&*(),.?":{}|<>]/.test(passwordValue),
  };
  
  const isPasswordValid = Object.values(checks).every(Boolean);

  async function onSubmit(data: RegisterForm) {
    if (!isPasswordValid) return;
    setLoading(true);
    const { error } = await supabase.auth.signUp({ 
      email: data.email, 
      password: data.password,
      options: { data: { name: data.name }, emailRedirectTo: 'ibanktp://confirm' }
    });
    setLoading(false);
    router.push({ pathname: '/confirm-email', params: { email: data.email } });
  }

  const isButtonDisabled = !isValid || !isPasswordValid || loading;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.headerBlue}>
        <View style={styles.headerTop}>
          <Link href="/" asChild>
            <TouchableOpacity>
              <Ionicons name="chevron-back" size={24} color="white" />
            </TouchableOpacity>
          </Link>
          <Text style={styles.headerTitle}>Sign up</Text>
          <View style={{ width: 24 }} />
        </View>
      </SafeAreaView>

      <View style={styles.formContainer}>
        <Text style={styles.title}>Welcome to us,</Text>
        <Text style={styles.subtitle}>Hello there, create New account</Text>

        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, value } }) => (
            <TextInput 
              style={styles.input}
              placeholder="Name"
              value={value}
              onChangeText={onChange}
              editable={!loading}
              placeholderTextColor="#A0A0A0"
            />
          )}
        />

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <TextInput 
              style={styles.input}
              placeholder="Email"
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

        <View style={styles.checklistContainer}>
          <CheckItem label="8+ caracteres" checked={checks.length} />
          <CheckItem label="Mayúscula" checked={checks.upper} />
          <CheckItem label="Minúscula" checked={checks.lower} />
          <CheckItem label="Número" checked={checks.number} />
          <CheckItem label="Símbolo" checked={checks.symbol} />
        </View>

        <Controller
          control={control}
          name="terms"
          render={({ field: { onChange, value } }) => (
            <TouchableOpacity style={styles.termsContainer} onPress={() => onChange(!value)} disabled={loading}>
              <View style={[styles.checkbox, value ? styles.checkboxChecked : null]}>
                {value ? <Ionicons name="checkmark" size={14} color="#FFF" /> : null}
              </View>
              <Text style={styles.termsText}>
                By creating an account you agree to our <Text style={styles.termsLink}>Terms and Conditions</Text>
              </Text>
            </TouchableOpacity>
          )}
        />

        <TouchableOpacity 
          style={[styles.button, isButtonDisabled ? styles.buttonDisabled : null]}
          onPress={handleSubmit(onSubmit)}
          disabled={isButtonDisabled}
        >
          {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Sign up</Text>}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Have an account?</Text>
          <View style={{width: 5}} />
          <Link href="/" asChild>
            <TouchableOpacity>
              <Text style={styles.footerLink}>Sign In</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </View>
  );
}

function CheckItem({ label, checked }: { label: string, checked: boolean }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 10, marginBottom: 5 }}>
      <Ionicons name={checked ? "checkmark-circle" : "ellipse-outline"} size={16} color={checked ? "#4CAF50" : "#A0A0A0"} />
      <Text style={{ marginLeft: 5, fontSize: 12, fontFamily: 'Poppins_400Regular', color: checked ? "#1A1A1A" : "#A0A0A0" }}>{label}</Text>
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
  subtitle: { fontSize: 14, fontFamily: 'Poppins_400Regular', color: '#888888', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#E8E8E8', borderRadius: 16, padding: 16, marginBottom: 15, fontSize: 14, fontFamily: 'Poppins_400Regular', color: '#1A1A1A', backgroundColor: '#FAFAFA' },
  passwordContainer: { flexDirection: 'row', borderWidth: 1, borderColor: '#E8E8E8', borderRadius: 16, marginBottom: 10, backgroundColor: '#FAFAFA', alignItems: 'center' },
  passwordInput: { flex: 1, padding: 16, fontSize: 14, fontFamily: 'Poppins_400Regular', color: '#1A1A1A' },
  eyeIcon: { padding: 15 },
  checklistContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 },
  termsContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 25, paddingRight: 20 },
  checkbox: { width: 20, height: 20, borderRadius: 4, borderWidth: 1, borderColor: '#E8E8E8', marginRight: 10, justifyContent: 'center', alignItems: 'center' },
  checkboxChecked: { backgroundColor: '#3629B7', borderColor: '#3629B7' },
  termsText: { fontSize: 13, fontFamily: 'Poppins_400Regular', color: '#888888', lineHeight: 20 },
  termsLink: { color: '#3629B7', fontFamily: 'Poppins_600SemiBold' },
  button: { backgroundColor: '#3629B7', padding: 18, borderRadius: 16, alignItems: 'center', shadowColor: '#3629B7', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  buttonDisabled: { opacity: 0.5, shadowOpacity: 0 },
  buttonText: { color: '#FFFFFF', fontFamily: 'Poppins_600SemiBold', fontSize: 16 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 'auto', paddingBottom: 20 },
  footerText: { color: '#888888', fontSize: 14, fontFamily: 'Poppins_400Regular' },
  footerLink: { color: '#3629B7', fontSize: 14, fontFamily: 'Poppins_600SemiBold' }
});
