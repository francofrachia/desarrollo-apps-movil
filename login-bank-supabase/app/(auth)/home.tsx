import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Platform, ScrollView } from 'react-native';
import { supabase } from '../../lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.headerBlue}>
        <View style={styles.headerTop}>
          <View style={styles.profileSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>FI</Text>
            </View>
            <View>
              <Text style={styles.greeting}>Hola de nuevo,</Text>
              <Text style={styles.userName}>Franco Ismael</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => supabase.auth.signOut()} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={26} color="white" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Saldo disponible</Text>
          <Text style={styles.balanceAmount}>$ 124.500,00</Text>
          <View style={styles.cardActions}>
            <TouchableOpacity style={styles.actionBtn}>
              <Ionicons name="send" size={20} color="#3629B7" />
              <Text style={styles.actionText}>Transferir</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn}>
              <Ionicons name="qr-code" size={20} color="#3629B7" />
              <Text style={styles.actionText}>Pagar QR</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* BOTON TEMPORAL PARA GRABAR EL VIDEO */}
        <TouchableOpacity 
          style={styles.testButton} 
          onPress={() => router.push('/reset-password')}
        >
          <Ionicons name="videocam-outline" size={20} color="#FFF" />
          <Text style={styles.testButtonText}>Simular link: Cambiar Clave</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Movimientos recientes</Text>
        
        <View style={styles.transaction}>
          <View style={styles.txIconContainer}>
            <Ionicons name="cart" size={20} color="#3629B7" />
          </View>
          <View style={styles.txDetails}>
            <Text style={styles.txTitle}>Supermercado</Text>
            <Text style={styles.txDate}>Hoy, 10:45 AM</Text>
          </View>
          <Text style={styles.txAmount}>-$ 15.200</Text>
        </View>

        <View style={styles.transaction}>
          <View style={[styles.txIconContainer, {backgroundColor: '#E8F5E9'}]}>
            <Ionicons name="arrow-down" size={20} color="#4CAF50" />
          </View>
          <View style={styles.txDetails}>
            <Text style={styles.txTitle}>Transferencia recibida</Text>
            <Text style={styles.txDate}>Ayer, 15:30 PM</Text>
          </View>
          <Text style={[styles.txAmount, {color: '#4CAF50'}]}>+$ 50.000</Text>
        </View>

        <View style={styles.transaction}>
          <View style={styles.txIconContainer}>
            <Ionicons name="fast-food" size={20} color="#3629B7" />
          </View>
          <View style={styles.txDetails}>
            <Text style={styles.txTitle}>Restaurante</Text>
            <Text style={styles.txDate}>Ayer, 21:15 PM</Text>
          </View>
          <Text style={styles.txAmount}>-$ 18.500</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  headerBlue: { backgroundColor: '#3629B7', paddingTop: Platform.OS === 'android' ? 40 : 0, height: 180, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 25, marginTop: 15 },
  profileSection: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { color: '#3629B7', fontSize: 16, fontFamily: 'Poppins_600SemiBold' },
  greeting: { color: '#D0Cdf5', fontSize: 13, fontFamily: 'Poppins_400Regular' },
  userName: { color: '#FFFFFF', fontSize: 16, fontFamily: 'Poppins_600SemiBold' },
  logoutBtn: { padding: 5 },
  contentContainer: { flex: 1, paddingHorizontal: 20, marginTop: -40 },
  balanceCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 25, shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 5, marginBottom: 25 },
  balanceLabel: { color: '#888888', fontSize: 14, fontFamily: 'Poppins_400Regular', marginBottom: 5 },
  balanceAmount: { color: '#1A1A1A', fontSize: 32, fontFamily: 'Poppins_600SemiBold', marginBottom: 20 },
  cardActions: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 20 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  actionText: { color: '#3629B7', fontSize: 14, fontFamily: 'Poppins_600SemiBold', marginLeft: 8 },
  testButton: { backgroundColor: '#E23B3B', flexDirection: 'row', padding: 15, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 25 },
  testButtonText: { color: '#FFFFFF', fontFamily: 'Poppins_600SemiBold', fontSize: 14, marginLeft: 8 },
  sectionTitle: { fontSize: 18, fontFamily: 'Poppins_600SemiBold', color: '#1A1A1A', marginBottom: 15 },
  transaction: { backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 5, elevation: 2 },
  txIconContainer: { width: 45, height: 45, borderRadius: 12, backgroundColor: '#F0F0FC', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  txDetails: { flex: 1 },
  txTitle: { fontSize: 15, fontFamily: 'Poppins_600SemiBold', color: '#1A1A1A' },
  txDate: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: '#888888' },
  txAmount: { fontSize: 15, fontFamily: 'Poppins_600SemiBold', color: '#1A1A1A' }
});
