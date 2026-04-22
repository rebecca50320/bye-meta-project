import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { UserPlus } from 'lucide-react-native';
import { fetchFriendPosts } from '../../src/nostr/feed';
import { fetchProfile } from '../../src/nostr/social';
import { colors, typography, shadow, radius, spacing } from '../../src/theme';

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [profiles, setProfiles] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => { load(); }, [])
  );

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchFriendPosts();
      setPosts(data);
      data.forEach(async post => {
        const profile = await fetchProfile(post.pubkey).catch(() => null);
        if (profile) setProfiles(prev => ({ ...prev, [post.pubkey]: profile }));
      });
    } catch {}
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const renderPost = ({ item }) => {
    const profile = profiles[item.pubkey];
    const displayName = profile?.name ?? profile?.displayName ?? item.pubkey.slice(0, 10) + '…';
    const date = new Date(item.createdAt * 1000).toLocaleDateString(undefined, {
      weekday: 'long', month: 'long', day: 'numeric',
    });

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{displayName[0]?.toUpperCase() ?? '?'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.authorName}>{displayName}</Text>
            <Text style={styles.dateText}>{date}</Text>
          </View>
        </View>

        <View style={styles.imageGrid}>
          {item.photos.slice(0, 4).map((photo, idx) => (
            <Image key={idx} source={{ uri: photo.url }} style={styles.photo} />
          ))}
        </View>

        {!!item.caption && (
          <Text style={styles.caption}>{item.caption}</Text>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.accent} />
          <Text style={styles.loadingText}>fetching your friends' weeks…</Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={item => item.id}
          renderItem={renderPost}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
          }
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <Text style={styles.weekLabel}>this week</Text>
              <TouchableOpacity onPress={() => router.push('/friends')} style={styles.manageBtn}>
                <UserPlus size={17} color={colors.textTertiary} />
              </TouchableOpacity>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>quiet here</Text>
              <Text style={styles.emptySubtitle}>
                Absence of content is intentional.{'\n'}Check back at the end of the week.
              </Text>
              <TouchableOpacity style={styles.addFriendBtn} onPress={() => router.push('/friends')}>
                <Text style={styles.addFriendBtnText}>Add friends</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  list: { paddingHorizontal: spacing.md, paddingBottom: 60 },

  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  weekLabel: { ...typography.caption, color: colors.textTertiary },
  manageBtn: { padding: 4 },

  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  loadingText: { ...typography.bodySmall, color: colors.textTertiary },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    ...shadow.card,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, gap: spacing.sm },
  avatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.accentLight,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontWeight: '600', color: colors.accent, fontSize: 14 },
  authorName: { ...typography.body, fontWeight: '600', fontSize: 15 },
  dateText: { ...typography.caption, color: colors.textTertiary, marginTop: 1 },

  imageGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  photo: { width: '50%', aspectRatio: 1, backgroundColor: colors.border },

  caption: {
    ...typography.body, fontSize: 15,
    padding: spacing.md, paddingTop: spacing.sm,
    borderTopWidth: 1, borderTopColor: colors.borderLight,
  },

  emptyContainer: { alignItems: 'center', paddingTop: 80, paddingHorizontal: spacing.xl },
  emptyTitle: { ...typography.display, marginBottom: spacing.sm },
  emptySubtitle: { ...typography.bodySmall, textAlign: 'center', lineHeight: 24, marginBottom: spacing.lg },
  addFriendBtn: {
    borderWidth: 1, borderColor: colors.accent,
    borderRadius: radius.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
  },
  addFriendBtnText: { color: colors.accent, fontWeight: '600', fontSize: 14 },
});
