import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert, Platform, KeyboardAvoidingView } from 'react-native';
import { Stack, router } from 'expo-router';
import * as MailComposer from 'expo-mail-composer';
import * as FileSystem from 'expo-file-system/legacy';
import { saveEntry, updateEntryPublishState } from '../src/db/store';
import { createAndStoreEntry, publishEvent } from '../src/nostr/publish';
import PhotoPicker from '../src/components/PhotoPicker';
import { colors, typography, shadow, radius, spacing } from '../src/theme';

export default function NewEntry() {
  const [photos, setPhotos] = useState([]);
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);

  const getStandardizedPhotos = async () => {
    const permanentUris = [];
    for (const uri of photos) {
      const filename = uri.split('/').pop();
      const newPath = FileSystem.documentDirectory + filename;
      try {
        await FileSystem.copyAsync({ from: uri, to: newPath });
        permanentUris.push(Platform.OS === 'ios' ? newPath.replace('file://', '') : newPath);
      } catch {
        permanentUris.push(Platform.OS === 'ios' ? uri.replace('file://', '') : uri);
      }
    }
    return permanentUris;
  };

  const validateInput = () => {
    if (photos.length !== 4) {
      Alert.alert('Almost there', 'Choose exactly 4 photos for your week.');
      return false;
    }
    if (!content.trim()) {
      Alert.alert('One more thing', 'Add a few words about your week.');
      return false;
    }
    return true;
  };

  const handleSaveOnly = async () => {
    if (!validateInput()) return;
    setIsSaving(true);
    try {
      const cleanPhotos = await getStandardizedPhotos();
      await saveEntry(content, cleanPhotos);
      router.back();
    } catch {
      Alert.alert('Error', 'Failed to save your entry.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublishToNostr = async () => {
    if (!validateInput()) return;

    const confirmed = await new Promise(resolve =>
      Alert.alert(
        'Before you share',
        'Your photos will be stored on a public server (nostrmedia.com) and accessible to anyone with the link. Your caption is only sent to friends you have added.',
        [
          { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
          { text: 'Continue', onPress: () => resolve(true) },
        ]
      )
    );
    if (!confirmed) return;

    setIsSaving(true);
    setUploadProgress('Uploading photos…');
    try {
      const cleanPhotos = await getStandardizedPhotos();
      const { event, entryId } = await createAndStoreEntry({
        photoUris: cleanPhotos,
        caption: content,
        onProgress: (done, total) => setUploadProgress(`Uploading ${done} of ${total}…`),
      });
      setUploadProgress('Sharing with friends…');
      await publishEvent(event);
      await updateEntryPublishState(entryId, 'published', event.id);
      Alert.alert('Shared', 'Your week is with your friends.', [
        { text: 'Done', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('Could not publish', error.message ?? 'Entry saved locally.');
      router.back();
    } finally {
      setIsSaving(false);
      setUploadProgress(null);
    }
  };

  const handleShareByEmail = async () => {
    if (!validateInput()) return;
    setIsSaving(true);
    try {
      const cleanPhotos = await getStandardizedPhotos();
      await saveEntry(content, cleanPhotos);
      const isAvailable = await MailComposer.isAvailableAsync();
      if (isAvailable) {
        await MailComposer.composeAsync({
          subject: 'My week — BYE-META',
          body: content,
          attachments: cleanPhotos,
        });
      }
      router.back();
    } catch {
      router.back();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <Stack.Screen
          options={{
            title: '',
            headerStyle: { backgroundColor: colors.bg },
            headerShadowVisible: false,
            headerTintColor: colors.accent,
          }}
        />

        <View style={styles.intro}>
          <Text style={styles.introLabel}>week ending</Text>
          <Text style={styles.introDate}>
            {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
          </Text>
        </View>

        <PhotoPicker photos={photos} onPhotosChange={setPhotos} />

        <View style={styles.reflectionBlock}>
          <Text style={styles.reflectionLabel}>reflection</Text>
          <TextInput
            style={styles.textInput}
            multiline
            placeholder="What made this week yours…"
            placeholderTextColor={colors.textTertiary}
            value={content}
            onChangeText={setContent}
            textAlignVertical="top"
          />
        </View>

        {uploadProgress && (
          <Text style={styles.progressText}>{uploadProgress}</Text>
        )}

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.primaryButton, isSaving && styles.buttonDisabled]}
            onPress={handlePublishToNostr}
            disabled={isSaving}
          >
            <Text style={styles.primaryButtonText}>
              {isSaving ? uploadProgress ?? 'Working…' : 'Share with friends'}
            </Text>
          </TouchableOpacity>

          <View style={styles.secondaryRow}>
            <TouchableOpacity
              style={[styles.secondaryButton, isSaving && styles.buttonDisabled]}
              onPress={handleSaveOnly}
              disabled={isSaving}
            >
              <Text style={styles.secondaryButtonText}>Save only</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.secondaryButton, isSaving && styles.buttonDisabled]}
              onPress={handleShareByEmail}
              disabled={isSaving}
            >
              <Text style={styles.secondaryButtonText}>Send email</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  contentContainer: { padding: spacing.lg, paddingBottom: 60 },

  intro: { marginBottom: spacing.xl, marginTop: spacing.sm },
  introLabel: { ...typography.caption, color: colors.textTertiary, marginBottom: 4 },
  introDate: { ...typography.display, color: colors.textPrimary },

  reflectionBlock: { marginTop: spacing.xl },
  reflectionLabel: { ...typography.caption, color: colors.textTertiary, marginBottom: spacing.md },
  textInput: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 16,
    color: colors.textPrimary,
    minHeight: 140,
    lineHeight: 26,
    ...shadow.subtle,
  },

  progressText: { ...typography.bodySmall, color: colors.accent, textAlign: 'center', marginTop: spacing.md },

  actions: { marginTop: spacing.xl, gap: spacing.sm },
  primaryButton: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingVertical: 18,
    alignItems: 'center',
    ...shadow.card,
    shadowColor: colors.accent,
    shadowOpacity: 0.25,
  },
  primaryButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600', letterSpacing: 0.2 },
  secondaryRow: { flexDirection: 'row', gap: spacing.sm },
  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  secondaryButtonText: { color: colors.textSecondary, fontSize: 14, fontWeight: '500' },
  buttonDisabled: { opacity: 0.45 },
});
