import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainTabParamList } from '../../navigation/types';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

type Props = NativeStackScreenProps<MainTabParamList, 'AlbumDetail'>;

const AlbumDetailScreen = ({ route, navigation }: Props) => {
  const { album } = route.params;
  const [photos, setPhotos] = useState(album.photos);

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
});

export default AlbumDetailScreen; 