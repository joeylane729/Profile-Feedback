import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainTabParamList } from '../../navigation/types';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

type Props = NativeStackScreenProps<MainTabParamList, 'AlbumDetail'>;

const AlbumDetailScreen = ({ route, navigation }: Props) => {
  const { album, isActive: isActiveProp, setActiveReviewedCollectionId } = route.params;
  const [photos, setPhotos] = useState(album.photos);
  const [isActive, setIsActive] = useState(isActiveProp);
  const [pendingActive, setPendingActive] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    setIsActive(isActiveProp);
    setPendingActive(false);
  }, [isActiveProp]);

  const handleAddPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Camera roll permissions are needed to add photos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) {
      const newPhoto = {
        id: Date.now().toString(),
        uri: result.assets[0].uri,
      };
      setPhotos((prev: { id: string; uri: string }[]) => [...prev, newPhoto]);
    }
  };

  const handleRemovePhoto = (photoId: string) => {
    setPhotos((prev: { id: string; uri: string }[]) => prev.filter((photo: { id: string; uri: string }) => photo.id !== photoId));
  };

  const handleSetActive = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmActive = () => {
    setActiveReviewedCollectionId(album.id);
    setIsActive(true);
    setShowConfirmModal(false);
  };

  const handleCancelActive = () => {
    setShowConfirmModal(false);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.title}>{album.name}</Text>
          <TouchableOpacity style={styles.addButton} onPress={handleAddPhoto}>
            <Ionicons name="add-circle-outline" size={28} color="#007AFF" />
          </TouchableOpacity>
        </View>
        {!isActive && (
          <TouchableOpacity
            style={[styles.setActiveButton]}
            onPress={handleSetActive}
          >
            <Text style={styles.setActiveText}>Set as Active for Review</Text>
          </TouchableOpacity>
        )}
        {isActive && (
          <View style={styles.activeStatusBadge}>
            <Ionicons name="checkmark-circle" size={18} color="#34C759" />
            <Text style={styles.activeStatusText}>Currently being reviewed</Text>
          </View>
        )}
        <FlatList
          data={photos}
          keyExtractor={item => item.id}
          numColumns={3}
          contentContainerStyle={styles.grid}
          renderItem={({ item }) => (
            <View style={styles.photoContainer}>
              <Image source={{ uri: item.uri }} style={styles.photo} />
              <TouchableOpacity style={styles.removeButton} onPress={() => handleRemovePhoto(item.id)}>
                <Ionicons name="close-circle" size={22} color="#ff3b30" />
              </TouchableOpacity>
            </View>
          )}
        />
        <Modal
          visible={showConfirmModal}
          transparent
          animationType="fade"
          onRequestClose={handleCancelActive}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Set as Active for Review?</Text>
              <Text style={styles.modalMessage}>Are you sure you want to set this collection as active for review?</Text>
              <View style={styles.modalButtonRow}>
                <TouchableOpacity style={styles.modalCancelButton} onPress={handleCancelActive}>
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalConfirmButton} onPress={handleConfirmActive}>
                  <Text style={styles.modalConfirmText}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: { padding: 4 },
  title: { fontSize: 20, fontWeight: 'bold', flex: 1, textAlign: 'center' },
  addButton: { padding: 4 },
  grid: { padding: 8 },
  photoContainer: { margin: 4, position: 'relative' },
  photo: { width: 100, height: 100, borderRadius: 12 },
  removeButton: { position: 'absolute', top: 2, right: 2 },
  setActiveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#e6f0fb',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginVertical: 12,
  },
  setActiveText: {
    color: '#007AFF',
    fontWeight: '600',
    fontSize: 16,
  },
  activeStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#e6fbe9',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginVertical: 12,
  },
  activeStatusText: {
    color: '#34C759',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 16,
  },
  pendingActiveRowBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#fff',
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: '#eee',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 16,
  },
  setActiveButtonSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  setActiveTextSelected: {
    color: 'white',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 16,
    color: '#333',
    marginBottom: 24,
    textAlign: 'center',
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 16,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: '#eee',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 16,
  },
  modalConfirmButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  modalConfirmText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default AlbumDetailScreen; 