import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Stack, router } from 'expo-router';
import { importNsec } from '../src/nostr/identity';
import { getNDK } from '../src/nostr/ndk';
import { colors, typography, shadow, radius, spacing } from '../src/theme';

export default function ImportKey() {
  const [nsec, setNsec] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImport = async () => {
    if (!nsec.trim().startsWith('nsec1')) {
      Alert.alert('Invalid key', 'The key should start with nsec1…');
      return;
    }
    setLoading(true);
    try {
      const signer = await importNsec(nsec.trim());
      const ndk = getNDK();
      ndk.signer = signer;
      Alert.alert('Key imported', 'Your identity has been updated.', [
        { text: 'Done', onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert('Invalid key', 'Could not read the key. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'import key',
          headerStyle: { backgroundColor: colors.bg },
          headerTitleStyle: { ...typography.title },
          headerShadowVisible: false,
          headerTintColor: colors.accent,
          presentation: 'modal',
        }}
      />

      <Text style={styles.label}>Paste your nsec private key</Text>
      <TextInput
        style={styles.input}
        value={nsec}
        onChangeText={setNsec}
        placeholder="nsec1…"
        placeholderTextColor={colors.textTertiary}
        autoCapitalize="none"
        autoCorrect={false}
        secureTextEntry
      />
      <Text style={styles.warning}>
        This replaces your current key. Back up your existing nsec before continuing.
      </Text>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleImport}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? 'Importing…' : 'Import'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.md, paddingTop: spacing.xl },
  label: { ...typography.body, fontWeight: '600', marginBottom: spacing.sm },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    fontSize: 14,
    fontFamily: 'Courier',
    color: colors.textPrimary,
    minHeight: 90,
    marginBottom: spacing.sm,
    ...shadow.subtle,
  },
  warning: { ...typography.bodySmall, color: colors.warning, marginBottom: spacing.xl, lineHeight: 20 },
  button: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    ...shadow.card,
    shadowColor: colors.accent,
    shadowOpacity: 0.2,
  },
  buttonDisabled: { opacity: 0.45 },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
});
