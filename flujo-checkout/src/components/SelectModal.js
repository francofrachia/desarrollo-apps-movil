import React from 'react';
import {
  Modal, View, Text, TouchableOpacity,
  StyleSheet, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLOR_HEX } from '../data/products';

const PRIMARY = '#4F86C5';

export default function SelectModal({
  visible, type, title, options, selectedValue, onSelect, onClose
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#888" />
            </TouchableOpacity>
          </View>

          {type === 'color' ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.colorRow}>
                {options.map(option => {
                  const isSelected = option === selectedValue;
                  const hex = COLOR_HEX[option] || '#888';
                  return (
                    <TouchableOpacity
                      key={option}
                      onPress={() => { onSelect(option); onClose(); }}
                      style={styles.colorOption}
                    >
                      <View style={[
                        styles.colorCircle,
                        { backgroundColor: hex },
                        isSelected && { borderColor: PRIMARY, borderWidth: 3 },
                      ]}>
                        {isSelected && (
                          <Ionicons
                            name="checkmark"
                            size={18}
                            color={hex === '#F0F0F0' ? '#333' : '#fff'}
                          />
                        )}
                      </View>
                      <Text style={[
                        styles.colorLabel,
                        isSelected && { color: PRIMARY, fontWeight: '700' },
                      ]}>
                        {option}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          ) : (
            <View style={styles.sizeGrid}>
              {options.map(option => {
                const isSelected = option === selectedValue;
                return (
                  <TouchableOpacity
                    key={option}
                    onPress={() => { onSelect(option); onClose(); }}
                    style={[
                      styles.sizeChip,
                      isSelected && styles.sizeChipSelected,
                    ]}
                  >
                    <Text style={[
                      styles.sizeText,
                      isSelected && styles.sizeTextSelected,
                    ]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
  colorRow: {
    flexDirection: 'row',
    gap: 20,
    paddingBottom: 8,
    paddingHorizontal: 4,
  },
  colorOption: { alignItems: 'center', gap: 8 },
  colorCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  colorLabel: { fontSize: 12, color: '#666', fontWeight: '500' },
  sizeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingBottom: 8,
  },
  sizeChip: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    backgroundColor: '#F8F8F8',
    minWidth: 72,
    alignItems: 'center',
  },
  sizeChipSelected: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },
  sizeText: { fontSize: 14, fontWeight: '600', color: '#333' },
  sizeTextSelected: { color: '#fff' },
  cancelBtn: {
    marginTop: 20,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
  },
  cancelText: { fontSize: 15, color: '#555', fontWeight: '500' },
});
