import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { User } from 'lucide-react-native';
import { initDb, getEntries } from '../../src/db/store';
import { colors, typography, shadow, radius, spacing } from '../../src/theme';

export default function Home() {
  const [entries, setEntries] = useState([]);

  useFocusEffect(
    useCallback(() => {
      async function load() {
        await initDb();
        const data = await getEntries();
        setEntries(data);
      }
      load();
    }, [])
  );

  const renderEntry = ({ item }) => {
    const date = new Date(item.created_at).toLocaleDateString(undefined, {
      weekday: 'long', month: 'long', day: 'numeric',
    });
    const isPublished = item.publish_state === 'published';

    return (
      <View style={styles.card}>
        <View style={styles.cardMeta}>
          <Text style={styles.dateText}>{date}</Text>
          {isPublished && (
            <View style={styles.publishedBadge}>
              <Text style={styles.publishedBadgeText}>shared</Text>
            </View>
          )}
        </View>
        <Text style={styles.entryText} numberOfLines={3}>{item.text_content}</Text>
        {item.photo_uris?.length > 0 && (
          <View style={styles.photoStrip}>
            {item.photo_uris.slice(0, 4).map((uri, idx) => (
              <Image key={idx} source={{ uri }} style={styles.photo} />
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={entries}
        keyExtractor={item => item.id.toString()}
        renderItem={renderEntry}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <Text style={styles.weekLabel}>this week</Text>
            <TouchableOpacity onPress={() => router.push('/profile')} style={styles.profileBtn}>
              <User size={18} color={colors.textTertiary} />
            </TouchableOpacity>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>your week awaits</Text>
            <Text style={styles.emptySubtitle}>Tap + to capture your four moments.</Text>
          </View>
        }
      />

      <TouchableOpacity style={styles.fab} onPress={() => router.push('/new-entry')}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  list: { paddingHorizontal: spacing.md, paddingBottom: 100, paddingTop: spacing.sm },

  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  weekLabel: { ...typography.caption, color: colors.textTertiary },
  profileBtn: { padding: 4 },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadow.card,
  },
  cardMeta: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: spacing.sm,
  },
  dateText: { ...typography.caption, color: colors.textTertiary },
  publishedBadge: {
    backgroundColor: colors.sageLight, borderRadius: 20,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  publishedBadgeText: { fontSize: 10, fontWeight: '600', color: colors.sage, letterSpacing: 0.5 },
  entryText: { ...typography.body, marginBottom: spacing.md },
  photoStrip: { flexDirection: 'row', gap: 6 },
  photo: { flex: 1, aspectRatio: 1, borderRadius: radius.sm, backgroundColor: colors.border },

  emptyContainer: { alignItems: 'center', paddingTop: 80, paddingHorizontal: spacing.xl },
  emptyTitle: { ...typography.display, marginBottom: spacing.sm, textAlign: 'center' },
  emptySubtitle: { ...typography.bodySmall, textAlign: 'center', lineHeight: 24 },

  fab: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.accent,
    alignItems: 'center', justifyContent: 'center',
    ...shadow.card,
    shadowOpacity: 0.18,
  },
  fabText: { fontSize: 26, color: '#FFF', lineHeight: 30, marginTop: -2 },
});
