import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { supabase } from '../../lib/supabase';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function AccountScreen() {
  const [email, setEmail] = useState('');
  const [orgName, setOrgName] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email || '');
        // Traer la organización
        const { data: member } = await supabase
          .from('memberships')
          .select('organizations(name)')
          .eq('user_id', user.id)
          .single();
        if (member && member.organizations) {
          setOrgName(member.organizations.name);
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#2E7D32" /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <MaterialCommunityIcons name="account" size={50} color="white" />
        </View>
        <Text style={styles.email}>{email}</Text>
        <Text style={styles.orgName}>{orgName || 'Sin organización'}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>Productor Autorizado</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <MaterialCommunityIcons name="logout" size={20} color="#F44336" />
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4F8', padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { alignItems: 'center', backgroundColor: 'white', padding: 30, borderRadius: 16, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 3, marginBottom: 30 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#2E7D32', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  email: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  orgName: { fontSize: 16, color: '#666', marginBottom: 15 },
  roleBadge: { backgroundColor: '#E8F5E9', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  roleText: { color: '#2E7D32', fontWeight: 'bold', fontSize: 12 },
  logoutBtn: { flexDirection: 'row', backgroundColor: 'white', padding: 15, borderRadius: 12, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 2 },
  logoutText: { color: '#F44336', fontWeight: 'bold', fontSize: 16, marginLeft: 8 }
});
