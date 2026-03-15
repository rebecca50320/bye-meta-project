import { View, StyleSheet, TouchableOpacity, Text, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'lucide-react-native';

export default function PhotoPicker({ photos, onPhotosChange }) {
  const pickImages = async () => {
    // Request permission first
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'We need access to your photos to allow you to select your 4 highlights.'
      );
      return;
    }

    const maxSelection = 4 - photos.length;
    
    if (maxSelection <= 0) {
      Alert.alert('Limit Reached', 'You can only select exactly 4 photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: maxSelection,
      quality: 0.8,
    });

    if (!result.canceled) {
      const selectedUris = result.assets.map(asset => asset.uri);
      const newPhotos = [...photos, ...selectedUris].slice(0, 4);
      onPhotosChange(newPhotos);
    }
  };

  const removePhoto = (index) => {
    const newPhotos = [...photos];
    newPhotos.splice(index, 1);
    onPhotosChange(newPhotos);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your 4 Highlights</Text>
      
      <View style={styles.grid}>
        {/* Render selected photos */}
        {photos.map((uri, index) => (
          <TouchableOpacity key={`${uri}-${index}`} style={styles.imageContainer} onPress={() => removePhoto(index)}>
            <Image source={{ uri }} style={styles.image} />
            <View style={styles.removeOverlay}>
              <Text style={styles.removeText}>✕</Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Render add buttons for remaining slots */}
        {Array.from({ length: 4 - photos.length }).map((_, index) => (
          <TouchableOpacity key={`empty-${index}`} style={styles.emptySlot} onPress={pickImages}>
            <Camera color="#8A94A6" size={24} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  imageContainer: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 8,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  removeOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptySlot: {
    width: '48%',
    aspectRatio: 1,
    backgroundColor: '#F0F4F8',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  }
});
