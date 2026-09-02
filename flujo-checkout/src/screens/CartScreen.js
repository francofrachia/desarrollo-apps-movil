import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image,
  StyleSheet, SafeAreaView, StatusBar, Alert, Platform,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { INITIAL_PRODUCTS } from '../data/products';
import SelectModal from '../components/SelectModal';

const PRIMARY = '#4F86C5';
const BG = '#F5F5F5';

export default function CartScreen({ navigation }) {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [modal, setModal] = useState({
    visible: false, type: null, productId: null,
    options: [], selectedValue: null, title: '',
  });

  const openModal = (type, product) => {
    setModal({
      visible: true,
      type,
      productId: product.id,
      options: type === 'color' ? product.colors : product.sizes,
      selectedValue: type === 'color' ? product.selectedColor : product.selectedSize,
      title: type === 'color' ? 'Select Color' : 'Select Size',
    });
  };

  const handleSelect = (value) => {
    setProducts(prev => prev.map(p => {
      if (p.id !== modal.productId) return p;
      return {
        ...p,
        selectedColor: modal.type === 'color' ? value : p.selectedColor,
        selectedSize: modal.type === 'size' ? value : p.selectedSize,
      };
    }));
  };

  const changeQty = (id, delta) => {
    setProducts(prev =>
      prev
        .map(p => p.id === id ? { ...p, qty: p.qty + delta } : p)
        .filter(p => p.qty > 0)
    );
  };

  const removeProduct = (id) => {
    Alert.alert(
      'Remove item',
      'Are you sure you want to remove this item from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => setProducts(prev => prev.filter(p => p.id !== id)),
        },
      ]
    );
  };

  const total = products.reduce((sum, p) => sum + p.price * p.qty, 0);
  const itemCount = products.reduce((sum, p) => sum + p.qty, 0);

  const renderProduct = (product) => (
    <View key={product.id} style={styles.productCard}>
      {/* Name + Price */}
      <View style={styles.productHeader}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productSubtitle}>{product.subtitle}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          {product.originalPrice && (
            <Text style={styles.originalPrice}>${product.originalPrice.toFixed(2)}</Text>
          )}
          <Text style={styles.price}>${product.price.toFixed(2)}</Text>
        </View>
      </View>

      {/* Image + Selectors */}
      <View style={styles.productBody}>
        <Image
          source={product.image}
          style={styles.productImage}
          resizeMode="cover"
        />

        <View style={styles.selectors}>
          {/* Color */}
          <TouchableOpacity
            style={styles.selectorRow}
            onPress={() => openModal('color', product)}
          >
            <Text style={styles.selectorLabel}>Color</Text>
            <View style={styles.selectorValue}>
              <Text style={styles.selectorValueText}>{product.selectedColor}</Text>
              <Ionicons name="chevron-down" size={14} color="#888" />
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Size */}
          <TouchableOpacity
            style={styles.selectorRow}
            onPress={() => openModal('size', product)}
          >
            <Text style={styles.selectorLabel}>Size</Text>
            <View style={styles.selectorValue}>
              <Text style={styles.selectorValueText}>{product.selectedSize}</Text>
              <Ionicons name="chevron-down" size={14} color="#888" />
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Qty */}
          <View style={styles.selectorRow}>
            <Text style={styles.selectorLabel}>Qty</Text>
            <View style={styles.qtyControls}>
              <TouchableOpacity
                style={styles.trashBtn}
                onPress={() =>
                  product.qty === 1
                    ? removeProduct(product.id)
                    : changeQty(product.id, -1)
                }
              >
                <MaterialIcons
                  name={product.qty === 1 ? 'delete' : 'remove'}
                  size={18}
                  color="#E23B3B"
                />
              </TouchableOpacity>
              <Text style={styles.qtyText}>{product.qty}</Text>
              <TouchableOpacity
                style={styles.plusBtn}
                onPress={() => changeQty(product.id, 1)}
              >
                <Ionicons name="add" size={20} color={PRIMARY} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Shopping Cart</Text>
        <Text style={styles.headerSubtitle}>
          {itemCount} {itemCount === 1 ? 'item' : 'items'} · Total ${total.toFixed(2)}
        </Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Delivery banner */}
        <View style={styles.deliveryBanner}>
          <MaterialIcons name="local-shipping" size={20} color="#999" />
          <Text style={styles.deliveryText}>Arrives by April 3 to April 9th</Text>
        </View>

        {/* Products */}
        {products.length === 0 ? (
          <View style={styles.emptyCart}>
            <MaterialIcons name="shopping-cart" size={72} color="#DDD" />
            <Text style={styles.emptyText}>Your cart is empty</Text>
          </View>
        ) : (
          products.map(renderProduct)
        )}

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* Bottom bar */}
      <View style={styles.bottomBar}>
        <View style={styles.totalRow}>
          <Ionicons name="chevron-up" size={16} color="#888" />
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
        </View>
        <TouchableOpacity
          style={[styles.checkoutBtn, products.length === 0 && styles.disabledBtn]}
          onPress={() =>
            products.length > 0 &&
            navigation.navigate('SecurePayment', { products, total })
          }
          disabled={products.length === 0}
        >
          <Text style={styles.checkoutBtnText}>Checkout</Text>
        </TouchableOpacity>
      </View>

      <SelectModal
        visible={modal.visible}
        type={modal.type}
        title={modal.title}
        options={modal.options}
        selectedValue={modal.selectedValue}
        onSelect={handleSelect}
        onClose={() => setModal(prev => ({ ...prev, visible: false }))}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#1A1A1A' },
  headerSubtitle: { fontSize: 13, color: '#888', marginTop: 2 },
  scroll: { flex: 1, backgroundColor: BG },
  scrollContent: { paddingHorizontal: 16, paddingTop: 14 },
  deliveryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 14,
    gap: 10,
  },
  deliveryText: { fontSize: 13, color: '#666', fontWeight: '500' },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  productName: { fontSize: 15, fontWeight: '700', color: '#1A1A1A' },
  productSubtitle: { fontSize: 12, color: '#888', marginTop: 2 },
  originalPrice: {
    fontSize: 12,
    color: '#888',
    textDecorationLine: 'line-through',
  },
  price: { fontSize: 16, fontWeight: '800', color: '#1A1A1A' },
  productBody: { flexDirection: 'row', gap: 12 },
  productImage: {
    width: 115,
    height: 110,
    borderRadius: 10,
    backgroundColor: '#F0F0F0',
  },
  selectors: { flex: 1, justifyContent: 'space-around' },
  selectorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  selectorLabel: { fontSize: 13, color: '#888', fontWeight: '500' },
  selectorValue: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  selectorValueText: { fontSize: 13, color: '#1A1A1A', fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#F2F2F2' },
  qtyControls: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  trashBtn: {
    width: 30, height: 30, borderRadius: 8,
    backgroundColor: '#FFF0F0',
    alignItems: 'center', justifyContent: 'center',
  },
  qtyText: {
    fontSize: 15, fontWeight: '700', color: '#1A1A1A',
    minWidth: 18, textAlign: 'center',
  },
  plusBtn: {
    width: 30, height: 30, borderRadius: 8,
    backgroundColor: '#EEF4FF',
    alignItems: 'center', justifyContent: 'center',
  },
  emptyCart: { alignItems: 'center', paddingTop: 80, gap: 16 },
  emptyText: { fontSize: 16, color: '#AAA', fontWeight: '500' },
  bottomBar: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  totalLabel: { flex: 1, fontSize: 14, color: '#555', fontWeight: '500' },
  totalValue: { fontSize: 24, fontWeight: '800', color: '#1A1A1A' },
  checkoutBtn: {
    backgroundColor: PRIMARY,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  disabledBtn: { backgroundColor: '#CCC' },
  checkoutBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
