import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { fetchList, pubkeysFromList, addFollowing, removeFollowing, sendSubscriptionRequest, fetchProfile } from '../src/nostr/social';
import { colors, typography, shadow, radius, spacing } from '../src/theme';

export default function Friends() {
  const [following, setFollowing] = useState([]);
  const [profiles, setProfiles] = useState({});
  const [npubInput, setNpubInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => { loadFollowing(); }, []);

  const loadFollowing = async () => {
    setLoading(true);
    try {
      const list = await fetchList(30001);
      const pubkeys = pubkeysFromList(list);
      setFollowing(pubkeys);
      pubkeys.forEach(async pk => {
        const profile = await fetchProfile(pk).catch(() => null);
        if (profile) setProfiles(prev => ({ ...prev, [pk]: profile }));
      });
    } catch {}
    setLoading(false);
  };

  const handleAddFriend = async () => {
    const input = npubInput.trim();
    if (!input.startsWith('npub1')) {
      Alert.alert('Invalid key', 'Paste a valid npub1… key.');
      return;
    }
    setAdding(true);
    try {
      const { getNDK } = await import('../src/nostr/ndk');
      const ndk = getNDK();
      const user = ndk.getUser({ npub: input });
      await addFollowing(user.pubkey);
      await sendSubscriptionRequest(user.pubkey);
      setNpubInput('');
      loadFollowing();
    } catch (e) {
      Alert.alert('Could not add', e.message ?? 'Please check the key and try again.');
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = (pubkey) => {
    Alert.alert('Remove friend', 'Stop following this person?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive',
        onPress: async () => {
          await removeFollowing(pubkey).catch(() => {});
          setFollowing(prev => prev.filter(pk => pk !== pubkey));
        },
      },
    ]);
  };

  const renderFriend = ({ item: pubkey }) => {
    const profile = profiles[pubkey];
    const displayName = profile?.name ?? profile?.displayName ?? pubkey.slice(0, 14) + '…';
    return (
      <View style={styles.friendRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{displayName[0]?.toUpperCase() ?? '?'}</Text>
        </View>
        <Text style={styles.friendName} numberOfLines={1}>{displayName}</Text>
        <TouchableOpacity onPress={() => handleRemove(pubkey)}>
          <Text style={styles.removeText}>remove</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'friends',
          headerStyle: { backgroundColor: colors.bg },
          headerTitleStyle: { ...typography.title },
          headerShadowVisible: false,
          headerTintColor: colors.accent,
        }}
      />

      <View style={styles.addSection}>
        <Text style={styles.addLabel}>add a friend</Text>
        <View style={styles.addRow}>
          <TextInput
            style={styles.input}
            placeholder="npub1…"
            placeholderTextColor={colors.textTertiary}
            value={npubInput}
            onChangeText={setNpubInput}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity
            style={[styles.addButton, adding && styles.buttonDisabled]}
            onPress={handleAddFriend}
            disabled={adding}
          >
            {adding
              ? <ActivityIndicator color="#FFF" size="small" />
              : <Text style={styles.addButtonText}>Add</Text>
            }
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.accent} />
      ) : (
        <FlatList
          data={following}
          keyExtractor={item => item}
          renderItem={renderFriend}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            following.length > 0
              ? <Text style={styles.sectionLabel}>following</Text>
              : null
          }
          ListEmptyComponent={
            <Text style={styles.empty}>No friends yet.{'\n'}Share your npub with someone you trust.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },

  addSection: { padding: spacing.md, paddingBottom: 0 },
  addLabel: { ...typography.caption, color: colors.textTertiary, marginBottom: spacing.sm },
  addRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.textPrimary,
    ...shadow.subtle,
  },
  addButton: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 60,
  },
  addButtonText: { color: '#FFF', fontWeight: '600', fontSize: 14 },
  buttonDisabled: { opacity: 0.45 },

  sectionLabel: { ...typography.caption, color: colors.textTertiary, marginBottom: spacing.sm },
  list: { paddingHorizontal: spacing.md, paddingBottom: 40 },
  empty: { ...typography.bodySmall, color: colors.textTertiary, textAlign: 'center', marginTop: 48, lineHeight: 24 },

  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.sm,
    ...shadow.subtle,
  },
  avatar: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: colors.accentLight,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontWeight: '600', color: colors.accent },
  friendName: { flex: 1, ...typography.body, fontSize: 15 },
  removeText: { ...typography.bodySmall, color: colors.textTertiary, fontSize: 13 },
});
