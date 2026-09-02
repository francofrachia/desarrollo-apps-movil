import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, StatusBar,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

const PRIMARY = '#4F86C5';
const MOCK_ADDRESS = {
  name: 'Banu Elson',
  email: 'orders@banuelson.com',
  phone: '+49 179 111 1010',
  address: 'Leibnizstraße 16, Wohnheim 6, No: 8X',
  city: 'Clausthal-Zellerfeld, Germany',
};

function AddressCard() {
  return (
    <View style={styles.addrCard}>
      <Text style={styles.addrName}>{MOCK_ADDRESS.name}</Text>
      <Text style={styles.addrDetail}>{MOCK_ADDRESS.email}</Text>
      <Text style={styles.addrDetail}>{MOCK_ADDRESS.phone}</Text>
      <Text style={styles.addrDetail}>{MOCK_ADDRESS.address}</Text>
      <Text style={styles.addrDetail}>{MOCK_ADDRESS.city}</Text>
    </View>
  );
}

export default function ConfirmationScreen({ route, navigation }) {
  const { products, total, orderNumber } = route.params;
  const itemCount = products.reduce((s, p) => s + p.qty, 0);

  const now = new Date();
  const timePlaced = `${now.toLocaleDateString('de-DE')} ${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')} CEST`;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Cart')} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={26} color={PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Confirmation</Text>
        <View style={{ width: 34 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>

        {/* Thank you */}
        <View style={styles.thankCard}>
          <View style={styles.checkCircle}>
            <Ionicons name="checkmark" size={40} color="#fff" />
          </View>
          <Text style={styles.thankTitle}>Thank you!</Text>
          <Text style={styles.orderNum}>Your order #{orderNumber} has been placed.</Text>
          <Text style={styles.emailNote}>
            We sent an email to {MOCK_ADDRESS.email}{`\n`}with your order confirmation and bill.
          </Text>
          <Text style={styles.timePlaced}>Time placed: {timePlaced}</Text>
        </View>

        {/* Shipping */}
        <Text style={styles.sectionTitle}>Shipping</Text>
        <AddressCard />

        {/* Billing */}
        <Text style={styles.sectionTitle}>Billing</Text>
        <AddressCard />

        {/* Order Items */}
        <Text style={styles.sectionTitle}>Order Items</Text>
        <View style={styles.deliveryBanner}>
          <MaterialIcons name="local-shipping" size={16} color="#888" />
          <Text style={styles.deliveryText}>Arrives by April 3 to April 9th</Text>
        </View>

        {products.map(p => (
          <View key={p.id} style={styles.orderItem}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemName}>{p.name}</Text>
              <Text style={styles.itemDetail}>Color: {p.selectedColor}</Text>
              <Text style={styles.itemDetail}>Size: {p.selectedSize}</Text>
              <Text style={styles.itemDetail}>Qty: {p.qty}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              {p.originalPrice && (
                <Text style={styles.itemOriginal}>
                  ${(p.originalPrice * p.qty).toFixed(2)}
                </Text>
              )}
              <Text style={styles.itemPrice}>${(p.price * p.qty).toFixed(2)}</Text>
            </View>
          </View>
        ))}

        {/* Order Summary */}
        <Text style={[styles.sectionTitle, { marginTop: 8 }]}>Order Summary</Text>
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryVal}>${total.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping</Text>
            <Text style={styles.summaryVal}>$0.00</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalVal}>${total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Back to Shopping */}
        <TouchableOpacity
          style={styles.backBtn2}
          onPress={() => navigation.navigate('Cart')}
        >
          <Text style={styles.backBtn2Text}>Back to Shopping</Text>
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F5F5' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: '#F5F5F5',
  },
  backBtn: { padding: 4 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
  scroll: { flex: 1 },
  scrollContent: { padding: 16 },
  // Thank you card
  thankCard: {
    backgroundColor: '#fff', borderRadius: 14, padding: 24,
    alignItems: 'center', marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  checkCircle: {
    width: 76, height: 76, borderRadius: 38,
    backgroundColor: '#4CAF50',
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  thankTitle: { fontSize: 22, fontWeight: '800', color: '#1A1A1A', marginBottom: 8 },
  orderNum: { fontSize: 14, color: '#444', textAlign: 'center', marginBottom: 10 },
  emailNote: { fontSize: 12, color: '#888', textAlign: 'center', lineHeight: 18, marginBottom: 8 },
  timePlaced: { fontSize: 12, color: '#888' },
  // Address
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1A1A1A', marginBottom: 8, marginTop: 4 },
  addrCard: {
    backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
  },
  addrName: { fontSize: 14, fontWeight: '700', color: '#1A1A1A', marginBottom: 4 },
  addrDetail: { fontSize: 12, color: '#666', lineHeight: 18 },
  // Delivery
  deliveryBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#FFF9E6', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 8, marginBottom: 10,
  },
  deliveryText: { fontSize: 12, color: '#666' },
  // Order items
  orderItem: {
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: 10,
    padding: 12, marginBottom: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 2, elevation: 1,
  },
  itemName: { fontSize: 13, fontWeight: '700', color: '#1A1A1A', marginBottom: 2 },
  itemDetail: { fontSize: 12, color: '#888' },
  itemOriginal: { fontSize: 12, color: '#AAA', textDecorationLine: 'line-through' },
  itemPrice: { fontSize: 14, fontWeight: '700', color: '#1A1A1A' },
  // Summary
  summaryCard: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 20,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { fontSize: 13, color: '#888' },
  summaryVal: { fontSize: 13, color: '#1A1A1A', fontWeight: '500' },
  totalRow: {
    borderTopWidth: 1, borderTopColor: '#F0F0F0',
    marginTop: 4, paddingTop: 12, marginBottom: 0,
  },
  totalLabel: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
  totalVal: { fontSize: 20, fontWeight: '800', color: '#1A1A1A' },
  // Back button
  backBtn2: {
    borderWidth: 1.5, borderColor: PRIMARY, borderRadius: 14,
    paddingVertical: 15, alignItems: 'center',
  },
  backBtn2Text: { color: PRIMARY, fontSize: 15, fontWeight: '700' },
});
