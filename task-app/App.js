import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
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

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [inputText, setInputText] = useState('');
  const [filter, setFilter] = useState('Todas');
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const lastTapRef = useRef({});

  // Cargar tareas al iniciar
  useEffect(() => {
    loadTasks();
  }, []);

  // Guardar tareas cada vez que cambian
  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  const loadTasks = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) setTasks(JSON.parse(stored));
    } catch (e) {
      console.error('Error al cargar tareas:', e);
    }
  };

  const saveTasks = async (data) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Error al guardar tareas:', e);
    }
  };

  // Agregar tarea (no acepta texto vacío)
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

  // Tap simple → toggle completada
  const toggleTask = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setTasks(prev =>
      prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
    );
  };

  // Long press → confirmar y eliminar
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
            setTasks(prev => prev.filter(t => t.id !== id));
          },
        },
      ]
    );
  };

  // Doble tap → edición inline
  const handleTap = (item) => {
    const now = Date.now();
    const last = lastTapRef.current[item.id] || 0;
    if (now - last < 300) {
      setEditingId(item.id);
      setEditingText(item.text);
    } else {
      toggleTask(item.id);
    }
    lastTapRef.current[item.id] = now;
  };

  // Guardar edición inline
  const saveEdit = () => {
    const text = editingText.trim();
    if (text) {
      setTasks(prev => prev.map(t => t.id === editingId ? { ...t, text } : t));
    }
    setEditingId(null);
  };

  // Filtrado sin perder el estado global
  const filteredTasks = tasks.filter(t => {
    if (filter === 'Activas') return !t.completed;
    if (filter === 'Completadas') return t.completed;
    return true;
  });

  const completedCount = tasks.filter(t => t.completed).length;

  const renderTask = ({ item }) => (
    <TouchableOpacity
      style={[styles.taskItem, item.completed && styles.taskDone]}
      onPress={() => editingId !== item.id && handleTap(item)}
      onLongPress={() => deleteTask(item.id)}
      delayLongPress={600}
      activeOpacity={0.75}
    >
      <View style={[styles.circle, item.completed && styles.circleDone]}>
        {item.completed && <Text style={styles.check}>✓</Text>}
      </View>

      {editingId === item.id ? (
        <TextInput
          style={styles.editInput}
          value={editingText}
          onChangeText={setEditingText}
          onBlur={saveEdit}
          onSubmitEditing={saveEdit}
          autoFocus
        />
      ) : (
        <Text
          style={[styles.taskText, item.completed && styles.taskTextDone]}
          numberOfLines={2}
        >
          {item.text}
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#0f0f1a" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>📝 Mis Tareas</Text>
          <View style={styles.counterBadge}>
            <Text style={styles.counterText}>{completedCount}/{tasks.length}</Text>
          </View>
        </View>

        {/* Input para agregar */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Agregar nueva tarea..."
            placeholderTextColor="#555"
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={addTask}
            returnKeyType="done"
          />
          <TouchableOpacity style={styles.addBtn} onPress={addTask} activeOpacity={0.8}>
            <Text style={styles.addBtnText}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Filtros */}
        <View style={styles.filterRow}>
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
              onPress={() => setFilter(f)}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Lista de tareas */}
        <FlatList
          data={filteredTasks}
          keyExtractor={item => item.id}
          renderItem={renderTask}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🎉</Text>
              <Text style={styles.emptyText}>
                {filter === 'Todas' ? 'No hay tareas todavía' : `No hay tareas ${filter.toLowerCase()}`}
              </Text>
            </View>
          }
        />

        {/* Hint instrucciones */}
        <View style={styles.hint}>
          <Text style={styles.hintText}>
            Tap → completar · Doble tap → editar · Mantener → eliminar
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#e8e8ff',
    letterSpacing: 0.5,
  },
  counterBadge: {
    backgroundColor: '#7c7cff22',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#7c7cff55',
  },
  counterText: {
    color: '#7c7cff',
    fontWeight: '700',
    fontSize: 14,
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 14,
    color: '#fff',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#2d2d5e',
  },
  addBtn: {
    backgroundColor: '#7c7cff',
    borderRadius: 16,
    width: 52,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7c7cff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  addBtnText: {
    fontSize: 30,
    color: '#fff',
    fontWeight: '300',
    lineHeight: 36,
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: 18,
    gap: 8,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderWidth: 1,
    borderColor: '#2d2d5e',
  },
  filterBtnActive: {
    backgroundColor: '#7c7cff',
    borderColor: '#7c7cff',
    shadowColor: '#7c7cff',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  filterText: {
    color: '#555',
    fontWeight: '600',
    fontSize: 13,
  },
  filterTextActive: {
    color: '#fff',
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#2d2d5e',
    gap: 14,
  },
  taskDone: {
    opacity: 0.6,
    borderColor: '#1f1f3e',
  },
  circle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#7c7cff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleDone: {
    backgroundColor: '#7c7cff',
    borderColor: '#7c7cff',
  },
  check: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
  taskText: {
    flex: 1,
    color: '#e0e0ff',
    fontSize: 15,
    lineHeight: 21,
  },
  taskTextDone: {
    textDecorationLine: 'line-through',
    color: '#4a4a6a',
  },
  editInput: {
    flex: 1,
    color: '#e0e0ff',
    fontSize: 15,
    borderBottomWidth: 1.5,
    borderBottomColor: '#7c7cff',
    paddingVertical: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    color: '#3a3a5e',
    fontSize: 15,
    fontWeight: '500',
  },
  hint: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  hintText: {
    color: '#333355',
    fontSize: 11,
    textAlign: 'center',
  },
});