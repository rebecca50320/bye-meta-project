import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert, Platform, KeyboardAvoidingView } from 'react-native';
import { Stack, router } from 'expo-router';
import * as MailComposer from 'expo-mail-composer';
import * as FileSystem from 'expo-file-system/legacy';
import { saveEntry } from '../src/db/store';
import PhotoPicker from '../src/components/PhotoPicker';

export default function NewEntry() {
  const [photos, setPhotos] = useState([]);
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Helper to standardise the photo URIs for SQLite and make them permanent
  const getStandardizedPhotos = async () => {
    const permanentUris = [];
    
    for (const uri of photos) {
      // Create a unique filename in the permanent document directory
      const filename = uri.split('/').pop();
      const newPath = FileSystem.documentDirectory + filename;
      
      try {
        // Copy the image out of the volatile ImagePicker cache into permanent storage
        await FileSystem.copyAsync({
          from: uri,
          to: newPath
        });
        
        // Return the clean permanent path for iOS/SQLite
        permanentUris.push(Platform.OS === 'ios' ? newPath.replace('file://', '') : newPath);
      } catch (e) {
        console.error("File copy error:", e);
        // Fallback to the original URI if copy fails
        permanentUris.push(Platform.OS === 'ios' ? uri.replace('file://', '') : uri);
      }
    }
    
    return permanentUris;
  };

  const validateInput = () => {
    if (photos.length !== 4) {
      Alert.alert('Incomplete', 'Please select exactly 4 photos for your weekly highlight.');
      return false;
    }
    if (!content.trim()) {
      Alert.alert('Incomplete', 'Please add a caption or reflection.');
      return false;
    }
    return true;
  }

  const handleSaveOnly = async () => {
    if (!validateInput()) return;
    setIsSaving(true);
    
    try {
      const cleanPhotos = await getStandardizedPhotos();
      await saveEntry(content, cleanPhotos);
      router.back();
    } catch (error) {
      console.error("Local Save Error:", error);
      Alert.alert('Error', 'Failed to save your entry locally.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleShareAndSave = async () => {
    if (!validateInput()) return;
    setIsSaving(true);
    
    try {
      // 1. Save locally first
      const cleanPhotos = await getStandardizedPhotos();
      await saveEntry(content, cleanPhotos);

      // 2. Export / Share via Email
      const isAvailable = await MailComposer.isAvailableAsync();
      
      if (isAvailable) {
        await MailComposer.composeAsync({
          subject: `My Weekly Highlights - BYE-META`,
          body: `Here are my 4 highlights from the week:\n\n${content}`,
          attachments: cleanPhotos,
        });
      } else {
        Alert.alert('Email Unavailable', 'Mail services are not available on this device. Entry was saved locally.');
      }

      router.back();
    } catch (error) {
      console.error("Share Error:", error);
      Alert.alert('Error', 'Failed to share your entry.');
      router.back(); // Route back anyway if it saved but failed to share
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Stack.Screen options={{ title: 'Weekly Reflection' }} />
        
        <Text style={styles.headerText}>Capture your week</Text>
        <Text style={styles.subHeaderText}>Select 4 photos and write a quick reflection to share with close friends.</Text>

        <PhotoPicker photos={photos} onPhotosChange={setPhotos} />

        <Text style={styles.inputLabel}>Caption & Reflection</Text>
        <TextInput
          style={styles.textInput}
          multiline
          placeholder="What were the highlights of your week...?"
          placeholderTextColor="#A0AEC0"
          value={content}
          onChangeText={setContent}
          textAlignVertical="top"
        />

        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.secondaryButton, isSaving && styles.buttonDisabled]} 
            onPress={handleSaveOnly}
            disabled={isSaving}
          >
            <Text style={styles.secondaryButtonText}>
              {isSaving ? 'Saving...' : 'Save Only'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.primaryButton, isSaving && styles.buttonDisabled]} 
            onPress={handleShareAndSave}
            disabled={isSaving}
          >
            <Text style={styles.primaryButtonText}>
              {isSaving ? 'Saving...' : 'Save & Share'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 60,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A202C',
    marginBottom: 8,
  },
  subHeaderText: {
    fontSize: 16,
    color: '#4A5568',
    lineHeight: 24,
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    marginTop: 16,
  },
  textInput: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1A202C',
    minHeight: 150,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 32,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    opacity: 0.5,
  }
});
