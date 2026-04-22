import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Share } from 'react-native';
import { Stack, router } from 'expo-router';
import { useNDKCurrentUser } from '@nostr-dev-kit/ndk-mobile';
import { exportNsec, deleteIdentity } from '../src/nostr/identity';
import { getAllEntriesForExport } from '../src/db/store';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { colors, typography, shadow, radius, spacing } from '../src/theme';

export default function Profile() {
  const currentUser = useNDKCurrentUser();
  const [npub, setNpub] = useState('');

  useEffect(() => {
    if (currentUser?.npub) setNpub(currentUser.npub);
  }, [currentUser]);

  const handleExportKey = async () => {
    Alert.alert(
      'Export private key',
      'Your nsec is your identity. Anyone with it can act as you. Keep it private.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Show key',
          style: 'destructive',
          onPress: async () => {
            const nsec = await exportNsec();
            Alert.alert('Your nsec', nsec, [
              { text: 'Copy', onPress: () => Share.share({ message: nsec }) },
              { text: 'Close' },
            ]);
          },
        },
      ]
    );
  };

  const handleExportArchive = async () => {
    try {
      const entries = await getAllEntriesForExport();
      const json = JSON.stringify(entries, null, 2);
      const path = FileSystem.documentDirectory + 'byemeta-export.json';
      await FileSystem.writeAsStringAsync(path, json, { encoding: FileSystem.EncodingType.UTF8 });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(path, { mimeType: 'application/json' });
      } else {
        Alert.alert('Exported', `Saved to:\n${path}`);
      }
    } catch {
      Alert.alert('Error', 'Could not export archive.');
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete local identity',
      'This wipes your key from this device. Back up your nsec first or it is gone forever.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteIdentity();
            Alert.alert('Done', 'Identity removed. Restart to generate a new key.');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Stack.Screen
        options={{
          title: 'profile',
          headerStyle: { backgroundColor: colors.bg },
          headerTitleStyle: { ...typography.title },
          headerShadowVisible: false,
          headerTintColor: colors.accent,
        }}
      />

      <View style={styles.idCard}>
        <Text style={styles.idLabel}>your nostr identity</Text>
        <Text style={styles.idValue} selectable>{npub || 'Initialising…'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>connections</Text>
        <ActionRow label="Manage friends" onPress={() => router.push('/friends')} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>your data</Text>
        <ActionRow label="Export diary archive" onPress={handleExportArchive} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>identity</Text>
        <ActionRow label="Import existing key" onPress={() => router.push('/import-key')} />
        <ActionRow label="Export private key" onPress={handleExportKey} tint={colors.warning} />
        <ActionRow label="Delete local identity" onPress={handleDeleteAccount} tint={colors.danger} />
      </View>
    </ScrollView>
  );
}

function ActionRow({ label, onPress, tint }) {
  return (
    <TouchableOpacity style={styles.actionRow} onPress={onPress} activeOpacity={0.6}>
      <Text style={[styles.actionLabel, tint && { color: tint }]}>{label}</Text>
      <Text style={styles.actionChevron}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.md, paddingBottom: 60 },

  idCard: {
    backgroundColor: colors.accentLight,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.xl,
    marginTop: spacing.sm,
  },
  idLabel: { ...typography.caption, color: colors.accent, marginBottom: spacing.sm },
  idValue: { ...typography.mono, color: colors.textPrimary, lineHeight: 22 },

  section: { marginBottom: spacing.lg },
  sectionLabel: { ...typography.caption, color: colors.textTertiary, marginBottom: spacing.sm, marginLeft: 4 },

  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 16,
    marginBottom: 2,
    ...shadow.subtle,
  },
  actionLabel: { flex: 1, ...typography.body, fontSize: 15 },
  actionChevron: { fontSize: 20, color: colors.textTertiary, lineHeight: 24 },
});
