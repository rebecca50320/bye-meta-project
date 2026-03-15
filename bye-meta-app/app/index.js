import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { Stack, router, useFocusEffect } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { initDb, getEntries } from '../src/db/store';

export default function Home() {
  const [entries, setEntries] = useState([]);

  useFocusEffect(
    useCallback(() => {
      async function load() {
        await initDb();
        fetchEntries();
      }
      load();
    }, [])
  );

  const fetchEntries = async () => {
    const data = await getEntries();
    setEntries(data);
  };

  const renderEntry = ({ item }) => {
    const date = new Date(item.created_at).toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });

    return (
      <View style={styles.card}>
        <Text style={styles.dateText}>{date}</Text>
        <Text style={styles.entryText} numberOfLines={2}>{item.text_content}</Text>
        <View style={styles.imageGridPreview}>
          {item.photo_uris.slice(0, 4).map((uri, idx) => (
            <Image key={idx} source={{ uri }} style={styles.previewImage} />
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'My BYE-META' }} />
      <FlatList
        data={entries}
        keyExtractor={item => item.id.toString()}
        renderItem={renderEntry}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No entries yet.</Text>
            <Text style={styles.subText}>Tap + to log your weekly highlights.</Text>
          </View>
        }
      />
      
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => router.push('/new-entry')}
      >
        <Plus size={24} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100, // Space for FAB
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  subText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8A94A6',
    marginBottom: 8,
    textTransform: 'uppercase'
  },
  entryText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
    marginBottom: 12,
  },
  imageGridPreview: {
    flexDirection: 'row',
    gap: 8,
  },
  previewImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
  },
  fab: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    right: 24,
    bottom: 32,
    shadowColor: '#3B82F6',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 8,
  }
});
