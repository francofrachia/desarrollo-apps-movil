import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, SafeAreaView, Platform } from 'react-native';
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Ionicons } from '@expo/vector-icons';

const resetSchema = z.object({
  password: z.string(),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

type ResetForm = z.infer<typeof resetSchema>;

export default function ResetPasswordScreen() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  const { control, handleSubmit, watch, formState: { isValid } } = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
    mode: 'onChange',
    defaultValues: { password: '', confirmPassword: '' }
  });

  const passwordValue = watch('password') || '';
  const confirmValue = watch('confirmPassword') || '';

  const checks = {
    length: passwordValue.length >= 8,
    upper: /[A-Z]/.test(passwordValue),
    lower: /[a-z]/.test(passwordValue),
    number: /[0-9]/.test(passwordValue),
    symbol: /[!@#$%^&*(),.?":{}|<>]/.test(passwordValue),
  };
  
  const isPasswordValid = Object.values(checks).every(Boolean);

  async function onSubmit(data: ResetForm) {
    if (!isPasswordValid || !isValid) return;
    setLoading(true);
    
    const { error } = await supabase.auth.updateUser({ 
      password: data.password
    });

    setLoading(false);
    if (!error) {
      alert('¡Contraseña actualizada con éxito!');
      router.replace('/');
    } else {
      alert('Error al actualizar la contraseña');
    }
  }

  const isButtonDisabled = !isPasswordValid || !isValid || loading;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.headerBlue}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.replace('/')}>
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Change password</Text>
          <View style={{ width: 24 }} />
        </View>
      </SafeAreaView>

      <View style={styles.formContainer}>
        <Text style={styles.title}>Change Password</Text>
        <Text style={styles.subtitle}>Enter a new strong password below</Text>

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value } }) => (
            <View style={styles.passwordContainer}>
              <TextInput 
                style={styles.passwordInput}
                placeholder="New Password"
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
          name="confirmPassword"
          render={({ field: { onChange, value }, formState }) => (
            <View style={[styles.passwordContainer, { borderColor: formState.errors?.confirmPassword ? '#E23B3B' : (confirmValue.length > 0 && isValid ? '#4CAF50' : '#E8E8E8') }]}>
              <TextInput 
                style={styles.passwordInput}
                placeholder="Confirm Password"
                value={value}
                onChangeText={onChange}
                secureTextEntry={!showConfirm}
                editable={!loading}
                placeholderTextColor="#A0A0A0"
              />
              <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeIcon}>
                <Ionicons name={showConfirm ? "eye-off-outline" : "eye-outline"} size={20} color="#A0A0A0" />
              </TouchableOpacity>
            </View>
          )}
        />

        <TouchableOpacity 
          style={[styles.button, isButtonDisabled ? styles.buttonDisabled : null, { marginTop: 20 }]}
          onPress={handleSubmit(onSubmit)}
          disabled={isButtonDisabled}
        >
          {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Confirm</Text>}
        </TouchableOpacity>
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
  passwordContainer: { flexDirection: 'row', borderWidth: 1, borderColor: '#E8E8E8', borderRadius: 16, marginBottom: 5, backgroundColor: '#FAFAFA', alignItems: 'center' },
  passwordInput: { flex: 1, padding: 16, fontSize: 14, fontFamily: 'Poppins_400Regular', color: '#1A1A1A' },
  eyeIcon: { padding: 15 },
  checklistContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 },
  button: { backgroundColor: '#3629B7', padding: 18, borderRadius: 16, alignItems: 'center', shadowColor: '#3629B7', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  buttonDisabled: { opacity: 0.5, shadowOpacity: 0 },
  buttonText: { color: '#FFFFFF', fontFamily: 'Poppins_600SemiBold', fontSize: 16 }
});
