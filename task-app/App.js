import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  Alert,
  LayoutAnimation,
  Platform,
  UIManager,
  KeyboardAvoidingView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Habilitar LayoutAnimation en Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const STORAGE_KEY = '@todo_tasks_v1';
const FILTERS = ['Todas', 'Activas', 'Completadas'];
const MAX_COUNT = 10;

// ─────────────────────────────────────────────────────────────
// Hook de estilos según el tema (reemplaza getStyles del bonus)
// ─────────────────────────────────────────────────────────────
function useThemeStyles(isDark) {
  return {
    bg:          isDark ? '#0f0f1a' : '#f0f0f7',
    card:        isDark ? '#1a1a2e' : '#ffffff',
    text:        isDark ? '#e0e0ff' : '#1a1a2e',
    subtext:     isDark ? '#7c7cff' : '#5050cc',
    border:      isDark ? '#2d2d5e' : '#d0d0e8',
    accent:      '#7c7cff',
    placeholder: isDark ? '#555'    : '#aaa',
    dimText:     isDark ? '#4a4a6a' : '#aaaacc',
    statusBar:   isDark ? 'light-content' : 'dark-content',
    tabBg:       isDark ? '#0f0f1a' : '#ffffff',
    tabBorder:   isDark ? '#2d2d5e' : '#d0d0e8',
  };
}

// ─────────────────────────────────────────────────────────────
// 01-A  Contador + Toggle de Tema
// ─────────────────────────────────────────────────────────────
function CounterScreen({ isDark, toggleTheme }) {
  const [count, setCount] = useState(0);
  const t = useThemeStyles(isDark);
  const atMax = count >= MAX_COUNT;

  const increment = () => { if (!atMax) setCount(c => c + 1); };
  const reset     = () => setCount(0);

  return (
    <View style={[styles.screen, { backgroundColor: t.bg }]}>
      <Text style={[styles.screenTitle, { color: t.text }]}>Contador</Text>

      {/* Tarjeta con el número */}
      <View style={[styles.counterCard, { backgroundColor: t.card, borderColor: t.border }]}>
        <Text style={[styles.counterNumber, { color: t.subtext }]}>{count}</Text>
        {atMax && (
          <View style={styles.maxBadge}>
            <Text style={styles.maxText}>¡Límite alcanzado! (máx. {MAX_COUNT})</Text>
          </View>
        )}
      </View>

      {/* Botones +1 y Reset con Pressable + feedback visual */}
      <View style={styles.btnRow}>
        <Pressable
          style={({ pressed }) => [
            styles.counterBtn,
            { backgroundColor: atMax ? t.border : t.accent },
            pressed && !atMax && styles.btnPressed,
          ]}
          onPress={increment}
          disabled={atMax}
          accessibilityLabel="Incrementar contador"
        >
          <Text style={styles.counterBtnText}>+1</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.counterBtn,
            { backgroundColor: '#e05555' },
            pressed && styles.btnPressed,
          ]}
          onPress={reset}
          accessibilityLabel="Reiniciar contador"
        >
          <Text style={styles.counterBtnText}>Reset</Text>
        </Pressable>
      </View>

      {/* Toggle de tema */}
      <Pressable
        style={({ pressed }) => [
          styles.themeBtn,
          { backgroundColor: t.card, borderColor: t.border },
          pressed && styles.btnPressed,
        ]}
        onPress={toggleTheme}
        accessibilityLabel="Alternar tema claro/oscuro"
      >
        <Text style={[styles.themeBtnText, { color: t.text }]}>
          {isDark ? '☀️  Cambiar a Tema Claro' : '🌙  Cambiar a Tema Oscuro'}
        </Text>
      </Pressable>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// 02-B  To-Do con FlatList + Persistencia
// ─────────────────────────────────────────────────────────────
function TodoScreen({ isDark }) {
  const t = useThemeStyles(isDark);
  const [tasks, setTasks]           = useState([]);
  const [inputText, setInputText]   = useState('');
  const [filter, setFilter]         = useState('Todas');
  const [editingId, setEditingId]   = useState(null);
  const [editingText, setEditingText] = useState('');
  const lastTapRef = useRef({});

  // Cargar tareas persistidas al iniciar
  useEffect(() => { loadTasks(); }, []);

  // Guardar automáticamente cada vez que cambian las tareas
  useEffect(() => { saveTasks(tasks); }, [tasks]);

  const loadTasks = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) setTasks(JSON.parse(stored));
    } catch (e) { console.error('Error al cargar:', e); }
  };

  const saveTasks = async (data) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) { console.error('Error al guardar:', e); }
  };

  // Agregar tarea (rechaza texto vacío)
  const addTask = () => {
    const text = inputText.trim();
    if (!text) return;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setTasks(prev => [
      { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, text, completed: false },
      ...prev,
    ]);
    setInputText('');
  };

  // Tap simple → toggle completada/activa
  const toggleTask = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setTasks(prev => prev.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  // Long press → Alert de confirmación → eliminar
  const deleteTask = (id) => {
    Alert.alert(
      'Eliminar tarea',
      '¿Querés eliminar esta tarea?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setTasks(prev => prev.filter(task => task.id !== id));
          },
        },
      ]
    );
  };

  // Doble tap → activar edición inline
  const handleTap = (item) => {
    const now  = Date.now();
    const last = lastTapRef.current[item.id] || 0;
    if (now - last < 300) {
      setEditingId(item.id);
      setEditingText(item.text);
    } else {
      toggleTask(item.id);
    }
    lastTapRef.current[item.id] = now;
  };

  // Confirmar edición inline
  const saveEdit = () => {
    const text = editingText.trim();
    if (text) {
      setTasks(prev => prev.map(task =>
        task.id === editingId ? { ...task, text } : task
      ));
    }
    setEditingId(null);
  };

  // Filtrado sin perder el estado global de las tareas
  const filteredTasks = tasks.filter(task => {
    if (filter === 'Activas')     return !task.completed;
    if (filter === 'Completadas') return task.completed;
    return true;
  });

  const completedCount = tasks.filter(task => task.completed).length;

  const renderTask = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.taskItem,
        { backgroundColor: t.card, borderColor: t.border },
        item.completed && { opacity: 0.55 },
      ]}
      onPress={() => editingId !== item.id && handleTap(item)}
      onLongPress={() => deleteTask(item.id)}
      delayLongPress={600}
      activeOpacity={0.75}
    >
      {/* Checkbox */}
      <View style={[
        styles.circle,
        { borderColor: t.accent },
        item.completed && { backgroundColor: t.accent },
      ]}>
        {item.completed && <Text style={styles.check}>✓</Text>}
      </View>

      {/* Texto o input de edición */}
      {editingId === item.id ? (
        <TextInput
          style={[styles.editInput, { color: t.text, borderBottomColor: t.accent }]}
          value={editingText}
          onChangeText={setEditingText}
          onBlur={saveEdit}
          onSubmitEditing={saveEdit}
          autoFocus
        />
      ) : (
        <Text
          style={[
            styles.taskText,
            { color: t.text },
            item.completed && { textDecorationLine: 'line-through', color: t.dimText },
          ]}
          numberOfLines={2}
        >
          {item.text}
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: t.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header con contador */}
      <View style={styles.todoHeader}>
        <Text style={[styles.screenTitle, { color: t.text }]}>📝 Mis Tareas</Text>
        <View style={[styles.badge, { backgroundColor: t.card, borderColor: t.border }]}>
          <Text style={[styles.badgeText, { color: t.subtext }]}>
            {completedCount}/{tasks.length}
          </Text>
        </View>
      </View>

      {/* Input para agregar */}
      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, { backgroundColor: t.card, color: t.text, borderColor: t.border }]}
          placeholder="Agregar nueva tarea..."
          placeholderTextColor={t.placeholder}
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={addTask}
          returnKeyType="done"
        />
        <Pressable
          style={({ pressed }) => [
            styles.addBtn,
            { backgroundColor: t.accent },
            pressed && styles.btnPressed,
          ]}
          onPress={addTask}
        >
          <Text style={styles.addBtnText}>+</Text>
        </Pressable>
      </View>

      {/* Filtros */}
      <View style={styles.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filterBtn,
              { backgroundColor: t.card, borderColor: t.border },
              filter === f && { backgroundColor: t.accent, borderColor: t.accent },
            ]}
            onPress={() => setFilter(f)}
          >
            <Text style={[
              styles.filterText,
              { color: filter === f ? '#fff' : t.placeholder },
            ]}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Lista con keyExtractor estable */}
      <FlatList
        data={filteredTasks}
        keyExtractor={item => item.id}
        renderItem={renderTask}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🎉</Text>
            <Text style={[styles.emptyText, { color: t.dimText }]}>
              {filter === 'Todas'
                ? 'No hay tareas todavía'
                : `No hay tareas ${filter.toLowerCase()}`}
            </Text>
          </View>
        }
      />

      <View style={styles.hint}>
        <Text style={[styles.hintText, { color: t.dimText }]}>
          Tap → completar · Doble tap → editar · Mantener → eliminar
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

// ─────────────────────────────────────────────────────────────
// App raíz — maneja el tema global y la navegación entre tabs
// ─────────────────────────────────────────────────────────────
export default function App() {
  const [isDark, setIsDark]       = useState(true);
  const [activeTab, setActiveTab] = useState('counter');
  const t = useThemeStyles(isDark);

  const toggleTheme = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsDark(d => !d);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: t.bg }]}>
      <StatusBar barStyle={t.statusBar} backgroundColor={t.bg} />

      {/* Pantalla activa */}
      <View style={{ flex: 1 }}>
        {activeTab === 'counter'
          ? <CounterScreen isDark={isDark} toggleTheme={toggleTheme} />
          : <TodoScreen isDark={isDark} />
        }
      </View>

      {/* Tab bar inferior sin dependencias externas */}
      <View style={[styles.tabBar, { backgroundColor: t.tabBg, borderTopColor: t.tabBorder }]}>
        {[
          { key: 'counter', icon: '🔢', label: 'Contador' },
          { key: 'todo',    icon: '📝', label: 'Tareas'   },
        ].map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={styles.tab}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text style={[
              styles.tabLabel,
              { color: activeTab === tab.key ? t.accent : t.placeholder },
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────
// Estilos globales
// ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe:        { flex: 1 },
  screen:      { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  screenTitle: { fontSize: 26, fontWeight: '800', letterSpacing: 0.5 },

  // — Contador —
  counterCard: {
    borderRadius: 24, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: 48, marginBottom: 28, marginTop: 16,
  },
  counterNumber: { fontSize: 96, fontWeight: '800', lineHeight: 110 },
  maxBadge: {
    backgroundColor: '#e05555', borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 6, marginTop: 8,
  },
  maxText:        { color: '#fff', fontWeight: '700', fontSize: 13 },
  btnRow:         { flexDirection: 'row', gap: 12, marginBottom: 14 },
  counterBtn:     { flex: 1, paddingVertical: 18, borderRadius: 16, alignItems: 'center' },
  counterBtnText: { color: '#fff', fontSize: 20, fontWeight: '700' },
  btnPressed:     { opacity: 0.72, transform: [{ scale: 0.96 }] },
  themeBtn:       { paddingVertical: 16, borderRadius: 16, alignItems: 'center', borderWidth: 1 },
  themeBtnText:   { fontSize: 16, fontWeight: '600' },

  // — To-Do —
  todoHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  badge:       { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1 },
  badgeText:   { fontWeight: '700', fontSize: 14 },
  inputRow:    { flexDirection: 'row', marginBottom: 16, gap: 10 },
  input:       { flex: 1, borderRadius: 16, paddingHorizontal: 18, paddingVertical: 14, fontSize: 15, borderWidth: 1 },
  addBtn:      { borderRadius: 16, width: 52, alignItems: 'center', justifyContent: 'center' },
  addBtnText:  { fontSize: 30, color: '#fff', fontWeight: '300', lineHeight: 36 },
  filterRow:   { flexDirection: 'row', marginBottom: 18, gap: 8 },
  filterBtn:   { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center', borderWidth: 1 },
  filterText:  { fontWeight: '600', fontSize: 13 },
  taskItem:    { flexDirection: 'row', alignItems: 'center', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 16, marginBottom: 10, borderWidth: 1, gap: 14 },
  circle:      { width: 26, height: 26, borderRadius: 13, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  check:       { color: '#fff', fontSize: 13, fontWeight: '800' },
  taskText:    { flex: 1, fontSize: 15, lineHeight: 21 },
  editInput:   { flex: 1, fontSize: 15, borderBottomWidth: 1.5, paddingVertical: 2 },
  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyIcon:   { fontSize: 48, marginBottom: 12 },
  emptyText:   { fontSize: 15, fontWeight: '500' },
  hint:        { paddingVertical: 12, alignItems: 'center' },
  hintText:    { fontSize: 11, textAlign: 'center' },

  // — Tab bar —
  tabBar:  { flexDirection: 'row', borderTopWidth: 1, paddingBottom: Platform.OS === 'ios' ? 20 : 8, paddingTop: 8 },
  tab:     { flex: 1, alignItems: 'center', paddingVertical: 4 },
  tabIcon: { fontSize: 22, marginBottom: 2 },
  tabLabel:{ fontSize: 12, fontWeight: '600' },
});