import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, SafeAreaView, StatusBar, Platform,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

const PRIMARY = '#4F86C5';
const BG = '#F5F5F5';
const MOCK_ADDRESS = {
  name: 'Banu Elson',
  email: 'orders@banuelson.com',
  phone: '+49 179 111 1010',
  address: 'Leibnizstraße 16, Wohnheim 6, No: 8X',
  city: 'Clausthal-Zellerfeld, Germany',
};

function VisaLogo() {
  return (
    <View style={{ backgroundColor: '#1A1F71', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 3 }}>
      <Text style={{ color: '#fff', fontWeight: '900', fontStyle: 'italic', fontSize: 13, letterSpacing: -0.5 }}>VISA</Text>
    </View>
  );
}

function MastercardLogo() {
  return (
    <View style={{ width: 38, height: 24, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ position: 'absolute', left: 0, width: 24, height: 24, borderRadius: 12, backgroundColor: '#EB001B' }} />
      <View style={{ position: 'absolute', right: 0, width: 24, height: 24, borderRadius: 12, backgroundColor: '#F79E1B', opacity: 0.9 }} />
    </View>
  );
}

function OtherLogo() {
  return <MaterialIcons name="credit-card" size={24} color="#555" />;
}

const CARD_TYPES = [
  { key: 'visa',   label: 'Visa',       Logo: VisaLogo },
  { key: 'master', label: 'Mastercard', Logo: MastercardLogo },
  { key: 'other',  label: 'Otra',       Logo: OtherLogo },
];

export default function SecurePaymentScreen({ route, navigation }) {
  const { products, total } = route.params;
  const [cardType, setCardType] = useState('visa');
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [cvv, setCvv] = useState('');
  const [rememberCard, setRememberCard] = useState(false);
  const [reviewExpanded, setReviewExpanded] = useState(false);

  const itemCount = products.reduce((s, p) => s + p.qty, 0);
  const subtotal  = products.reduce((s, p) => s + p.price * p.qty, 0);

  const formatCard = (text) => {
    const d = text.replace(/\D/g, '').slice(0, 16);
    return (d.match(/.{1,4}/g) || []).join(' ');
  };

  const SelectedLogo = CARD_TYPES.find(c => c.key === cardType)?.Logo || OtherLogo;

  const handlePayNow = () => {
    const orderNumber = 'BE' + Math.floor(10000 + Math.random() * 90000);
    navigation.navigate('Confirmation', { products, total, orderNumber });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={26} color={PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Secure Payment</Text>
        <View style={styles.secureBadge}>
          <MaterialIcons name="security" size={13} color="#4CAF50" />
          <Text style={styles.secureBadgeText}>SECURE</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>

        {/* SHIPPING */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Shipping</Text>
          <TouchableOpacity><Text style={styles.sectionLink}>Add / Edit</Text></TouchableOpacity>
        </View>
        <View style={styles.card}>
          <View style={styles.addressRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.addrName}>{MOCK_ADDRESS.name}</Text>
              <Text style={styles.addrDetail}>{MOCK_ADDRESS.email}</Text>
              <Text style={styles.addrDetail}>{MOCK_ADDRESS.phone}</Text>
              <Text style={styles.addrDetail}>{MOCK_ADDRESS.address}</Text>
              <Text style={styles.addrDetail}>{MOCK_ADDRESS.city}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CCC" />
          </View>
          <TouchableOpacity style={styles.checkRow}>
            <View style={[styles.checkBox, { backgroundColor: PRIMARY, borderColor: PRIMARY }]}>
              <Ionicons name="checkmark" size={13} color="#fff" />
            </View>
            <Text style={styles.checkLabel}>Billing and delivery addresses are same.</Text>
          </TouchableOpacity>
        </View>

        {/* PAYMENT */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Payment</Text>
          <TouchableOpacity><Text style={styles.sectionLink}>Add / Edit</Text></TouchableOpacity>
        </View>
        <View style={styles.card}>
          {/* Card type selector — REQUERIMIENTO */}
          <Text style={styles.cardTypeLabel}>Card Type</Text>
          <View style={styles.cardTypeRow}>
            {CARD_TYPES.map(({ key, label, Logo }) => (
              <TouchableOpacity
                key={key}
                style={[styles.cardTypeBtn, cardType === key && styles.cardTypeBtnActive]}
                onPress={() => setCardType(key)}
              >
                <Logo />
                <Text style={[styles.cardTypeBtnText, cardType === key && { color: PRIMARY }]}>
                  {label}
                </Text>
                {cardType === key && (
                  <View style={styles.cardTypeCheck}>
                    <Ionicons name="checkmark-circle" size={15} color={PRIMARY} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Card form header */}
          <View style={styles.cardFormHeader}>
            <MaterialIcons name="credit-card" size={20} color="#888" />
            <Text style={styles.cardFormTitle}>Add Credit / Debit Card</Text>
          </View>

          {/* Card Holder */}
          <TextInput
            style={styles.input}
            placeholder="Card Holder's Name"
            placeholderTextColor="#C0C0C0"
            value={cardHolder}
            onChangeText={setCardHolder}
            autoCapitalize="words"
          />

          {/* Card Number + Logo */}
          <View style={styles.cardNumRow}>
            <TextInput
              style={[styles.input, { flex: 1, marginBottom: 0 }]}
              placeholder="Card Number"
              placeholderTextColor="#C0C0C0"
              value={cardNumber}
              onChangeText={t => setCardNumber(formatCard(t))}
              keyboardType="numeric"
              maxLength={19}
            />
            <View style={styles.cardLogoBox}><SelectedLogo /></View>
          </View>

          {/* Expire Date */}
          <Text style={styles.expireLabel}>Expire Date</Text>
          <View style={styles.expireRow}>
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="Month"
              placeholderTextColor="#C0C0C0"
              value={month}
              onChangeText={setMonth}
              keyboardType="numeric"
              maxLength={2}
            />
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="Year"
              placeholderTextColor="#C0C0C0"
              value={year}
              onChangeText={setYear}
              keyboardType="numeric"
              maxLength={2}
            />
          </View>

          {/* Security Code */}
          <View style={styles.cvvRow}>
            <TextInput
              style={[styles.input, { flex: 1, marginBottom: 0 }]}
              placeholder="Security Code"
              placeholderTextColor="#C0C0C0"
              value={cvv}
              onChangeText={setCvv}
              keyboardType="numeric"
              maxLength={4}
              secureTextEntry
            />
            <TouchableOpacity style={{ padding: 4 }}>
              <Ionicons name="information-circle-outline" size={22} color={PRIMARY} />
            </TouchableOpacity>
          </View>

          {/* Remember card */}
          <TouchableOpacity
            style={[styles.checkRow, { marginTop: 10 }]}
            onPress={() => setRememberCard(!rememberCard)}
          >
            <View style={[styles.checkBox, rememberCard && { backgroundColor: PRIMARY, borderColor: PRIMARY }]}>
              {rememberCard && <Ionicons name="checkmark" size={13} color="#fff" />}
            </View>
            <Text style={styles.checkLabel}>Remember my card for next purchases.</Text>
          </TouchableOpacity>
        </View>

        {/* ITEMS SUMMARY */}
        <View style={styles.itemsRow}>
          <Text style={styles.itemsCount}>{itemCount} items</Text>
          <View style={styles.deliveryChip}>
            <MaterialIcons name="local-shipping" size={13} color="#888" />
            <Text style={styles.deliveryChipText}>Arrives by April 3 to April 9th</Text>
          </View>
        </View>

        {/* ORDER REVIEW (expandible) */}
        <TouchableOpacity
          style={styles.reviewHeader}
          onPress={() => setReviewExpanded(!reviewExpanded)}
        >
          <Text style={styles.reviewTitle}>Order Review</Text>
          <Ionicons name={reviewExpanded ? 'chevron-up' : 'chevron-down'} size={20} color="#555" />
        </TouchableOpacity>

        {reviewExpanded && (
          <View style={styles.reviewContent}>
            {products.map(p => (
              <View key={p.id} style={styles.reviewItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.reviewItemName}>{p.name}</Text>
                  <Text style={styles.reviewItemDetail}>Color: {p.selectedColor}</Text>
                  <Text style={styles.reviewItemDetail}>Size: {p.selectedSize}</Text>
                  <Text style={styles.reviewItemDetail}>Qty: {p.qty}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  {p.originalPrice && (
                    <Text style={styles.reviewOriginal}>${p.originalPrice.toFixed(2)}</Text>
                  )}
                  <Text style={styles.reviewPrice}>${p.price.toFixed(2)}</Text>
                </View>
              </View>
            ))}
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryVal}>${subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping</Text>
              <Text style={styles.summaryVal}>$0.00</Text>
            </View>
          </View>
        )}

        <Text style={styles.footerNote}>
          This is the final step, after you touching Pay Now button, the payment will be transaction
        </Text>
        <View style={{ height: 110 }} />
      </ScrollView>

      {/* Bottom */}
      <View style={styles.bottomBar}>
        <View style={styles.totalRow}>
          <Ionicons name="chevron-up" size={16} color="#888" />
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
        </View>
        <TouchableOpacity style={styles.payBtn} onPress={handlePayNow}>
          <Text style={styles.payBtnText}>Pay Now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  backBtn: { padding: 4 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
  secureBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#F0FFF4', borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 4,
  },
  secureBadgeText: { fontSize: 10, fontWeight: '800', color: '#4CAF50' },
  scroll: { flex: 1, backgroundColor: BG },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16 },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 8,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1A1A1A' },
  sectionLink: { fontSize: 13, color: PRIMARY, fontWeight: '500' },
  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  addressRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  addrName: { fontSize: 14, fontWeight: '700', color: '#1A1A1A', marginBottom: 3 },
  addrDetail: { fontSize: 12, color: '#666', lineHeight: 18 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  checkBox: {
    width: 20, height: 20, borderRadius: 4,
    borderWidth: 1.5, borderColor: '#DDD',
    alignItems: 'center', justifyContent: 'center',
  },
  checkLabel: { fontSize: 12, color: '#555', flex: 1 },
  // Card type
  cardTypeLabel: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 10 },
  cardTypeRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  cardTypeBtn: {
    flex: 1, alignItems: 'center', paddingVertical: 12,
    borderRadius: 10, borderWidth: 1.5, borderColor: '#E0E0E0',
    backgroundColor: '#F8F8F8', gap: 6, position: 'relative',
  },
  cardTypeBtnActive: { borderColor: PRIMARY, backgroundColor: '#EEF4FF' },
  cardTypeBtnText: { fontSize: 11, color: '#888', fontWeight: '600' },
  cardTypeCheck: { position: 'absolute', top: 4, right: 4 },
  // Form
  cardFormHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginBottom: 12, paddingBottom: 10,
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  cardFormTitle: { fontSize: 14, fontWeight: '600', color: '#333' },
  input: {
    borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: '#1A1A1A', marginBottom: 10, backgroundColor: '#FAFAFA',
  },
  cardNumRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  cardLogoBox: { width: 50, alignItems: 'center', justifyContent: 'center' },
  expireLabel: { fontSize: 12, color: '#888', fontWeight: '500', marginBottom: 8 },
  expireRow: { flexDirection: 'row', gap: 10 },
  halfInput: { flex: 1 },
  cvvRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  // Items summary
  itemsRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 10, marginBottom: 4,
  },
  itemsCount: { fontSize: 13, color: '#888', fontWeight: '500' },
  deliveryChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#FFF9E6', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6,
  },
  deliveryChipText: { fontSize: 11, color: '#666' },
  // Order review
  reviewHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 14, marginBottom: 2,
  },
  reviewTitle: { fontSize: 14, fontWeight: '700', color: '#1A1A1A' },
  reviewContent: {
    backgroundColor: '#fff', borderRadius: 10,
    paddingHorizontal: 14, paddingBottom: 12, marginBottom: 12,
  },
  reviewItem: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F5F5F5',
  },
  reviewItemName: { fontSize: 13, fontWeight: '700', color: '#1A1A1A', marginBottom: 2 },
  reviewItemDetail: { fontSize: 12, color: '#888' },
  reviewOriginal: { fontSize: 12, color: '#AAA', textDecorationLine: 'line-through' },
  reviewPrice: { fontSize: 14, fontWeight: '700', color: '#1A1A1A' },
  summaryDivider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 10 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  summaryLabel: { fontSize: 13, color: '#888' },
  summaryVal: { fontSize: 13, fontWeight: '600', color: '#1A1A1A' },
  // Footer
  footerNote: { fontSize: 11, color: '#BBB', textAlign: 'center', paddingHorizontal: 20, marginTop: 12 },
  // Bottom bar
  bottomBar: {
    backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#F0F0F0',
    paddingHorizontal: 20, paddingTop: 14,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
  },
  totalRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  totalLabel: { flex: 1, fontSize: 14, color: '#555', fontWeight: '500' },
  totalValue: { fontSize: 24, fontWeight: '800', color: '#1A1A1A' },
  payBtn: { backgroundColor: PRIMARY, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  payBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
