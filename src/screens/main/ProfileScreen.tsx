import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  ActionSheetIOS,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import { config } from '../../config';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const ALBUM_SIZE = (width - 48) / 2; // 2 columns with padding

// Dummy data - in a real app, this would come from your backend/state management
const INITIAL_DATA = {
  photoCollections: [
    {
      id: '1',
      name: 'Travel Photos',
      coverPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=60',
      photoCount: 12,
      photos: [
        { id: '1', uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=60' },
        { id: '2', uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=60' },
      ]
    },
    {
      id: '2',
      name: 'Hiking Adventures',
      coverPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=60',
      photoCount: 8,
      photos: [
        { id: '3', uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=60' },
      ]
    }
  ],
  promptCollections: [
    {
      id: '1',
      name: 'Dating Profile',
      prompts: [
        {
          id: '1',
          question: "I'm looking for",
          answer: "Someone who's passionate about life, loves to travel, and isn't afraid to be silly sometimes."
        },
        {
          id: '2',
          question: "My ideal first date",
          answer: "A casual coffee or walk in the park, followed by dinner at a cozy restaurant."
        }
      ]
    },
    {
      id: '2',
      name: 'Professional Profile',
      prompts: [
        {
          id: '3',
          question: "My perfect weekend",
          answer: "Hiking in the morning, trying a new restaurant for lunch, and relaxing with a good book in the evening."
        }
      ]
    }
  ],
  bio: "Adventure seeker and coffee enthusiast. Love hiking, photography, and trying new restaurants. Looking for someone to share life's little moments with."
};

const ProfileScreen = () => {
  const { setIsAuthenticated, setToken, token } = useAuth();
  const [data, setData] = useState(INITIAL_DATA);
  const [editingBio, setEditingBio] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<string | null>(null);
  const [userData, setUserData] = useState<{ name: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activePhotoCollection, setActivePhotoCollection] = useState('1');
  const [activePromptCollection, setActivePromptCollection] = useState('1');
  const [editingCollectionName, setEditingCollectionName] = useState<string | null>(null);
  const [editingCollectionType, setEditingCollectionType] = useState<'photo' | 'prompt' | null>(null);

  useEffect(() => {
    if (token) {
      fetchUserData();
    }
  }, [token]);

  const fetchUserData = async () => {
    try {
      console.log('Fetching user data with token:', token);
      const url = `${config.api.baseUrl}${config.api.endpoints.auth.me}`;
      console.log('Using URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      const responseText = await response.text();
      console.log('Response text:', responseText);

      if (!response.ok) {
        throw new Error(`Failed to fetch user data: ${response.status} - ${responseText}`);
      }

      const data = JSON.parse(responseText);
      console.log('User data received:', data);
      setUserData(data);
    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert('Error', 'Failed to load user data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await setToken(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error during logout:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Sorry, we need camera roll permissions to make this work!');
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
      setData(prev => ({
        ...prev,
        photoCollections: prev.photoCollections.map(collection =>
          collection.id === activePhotoCollection
            ? { ...collection, photos: [...collection.photos, newPhoto] }
            : collection
        )
      }));
    }
  };

  const removePhoto = (photoId: string) => {
    setData(prev => ({
      ...prev,
      photoCollections: prev.photoCollections.map(collection =>
        collection.id === activePhotoCollection
          ? { ...collection, photos: collection.photos.filter(photo => photo.id !== photoId) }
          : collection
      )
    }));
  };

  const createNewPhotoCollection = () => {
    const newCollection = {
      id: Date.now().toString(),
      name: 'New Album',
      coverPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=60',
      photoCount: 0,
      photos: []
    };
    setData(prev => ({
      ...prev,
      photoCollections: [...prev.photoCollections, newCollection]
    }));
  };

  const createNewPromptCollection = () => {
    const newCollection = {
      id: Date.now().toString(),
      name: 'New Collection',
      prompts: []
    };
    setData(prev => ({
      ...prev,
      promptCollections: [...prev.promptCollections, newCollection]
    }));
    setActivePromptCollection(newCollection.id);
  };

  const renameCollection = (collectionId: string, newName: string, type: 'photo' | 'prompt') => {
    setData(prev => ({
      ...prev,
      [type === 'photo' ? 'photoCollections' : 'promptCollections']: prev[type === 'photo' ? 'photoCollections' : 'promptCollections'].map(collection =>
        collection.id === collectionId
          ? { ...collection, name: newName }
          : collection
      )
    }));
    setEditingCollectionName(null);
    setEditingCollectionType(null);
  };

  const deleteCollection = (collectionId: string, type: 'photo' | 'prompt') => {
    Alert.alert(
      'Delete Collection',
      'Are you sure you want to delete this collection?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setData(prev => ({
              ...prev,
              [type === 'photo' ? 'photoCollections' : 'promptCollections']: prev[type === 'photo' ? 'photoCollections' : 'promptCollections'].filter(c => c.id !== collectionId)
            }));
            // Set active collection to the first one if available
            const collections = type === 'photo' ? data.photoCollections : data.promptCollections;
            const remainingCollections = collections.filter(c => c.id !== collectionId);
            if (remainingCollections.length > 0) {
              if (type === 'photo') {
                setActivePhotoCollection(remainingCollections[0].id);
              } else {
                setActivePromptCollection(remainingCollections[0].id);
              }
            }
          }
        }
      ]
    );
  };

  const reorderCollections = (type: 'photo' | 'prompt', newCollections: any[]) => {
    setData(prev => ({
      ...prev,
      [type === 'photo' ? 'photoCollections' : 'promptCollections']: newCollections
    }));
  };

  const renderPhotoAlbum = (collection: typeof INITIAL_DATA.photoCollections[0]) => (
    <TouchableOpacity 
      key={collection.id}
      style={styles.albumContainer}
      onPress={() => setActivePhotoCollection(collection.id)}
    >
      <View style={styles.albumCover}>
        <Image 
          source={{ uri: collection.coverPhoto }} 
          style={styles.albumImage}
        />
        <View style={styles.albumOverlay}>
          <Text style={styles.albumCount}>{collection.photoCount} photos</Text>
        </View>
      </View>
      <View style={styles.albumInfo}>
        <Text style={styles.albumName}>{collection.name}</Text>
        <TouchableOpacity
          onPress={() => showCollectionMenu(collection.id, 'photo')}
          style={styles.albumMenuButton}
        >
          <Ionicons name="ellipsis-horizontal" size={20} color="#666" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const showCollectionMenu = (collectionId: string, type: 'photo' | 'prompt') => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Rename', 'Delete'],
          destructiveButtonIndex: 2,
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            setEditingCollectionName(collectionId);
            setEditingCollectionType(type);
          } else if (buttonIndex === 2) {
            deleteCollection(collectionId, type);
          }
        }
      );
    } else {
      Alert.alert(
        'Collection Options',
        'What would you like to do?',
        [
          {
            text: 'Rename',
            onPress: () => {
              setEditingCollectionName(collectionId);
              setEditingCollectionType(type);
            }
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => deleteCollection(collectionId, type)
          },
          {
            text: 'Cancel',
            style: 'cancel'
          }
        ]
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>
        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* User Info Section */}
          <View style={styles.userInfoHeader}>
            <Text style={styles.userName}>{userData?.name || 'Loading...'}</Text>
          </View>

          {/* Photo Collections Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Photo Albums</Text>
              <TouchableOpacity onPress={createNewPhotoCollection} style={styles.addButton}>
                <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.albumsGrid}>
              {data.photoCollections.map(renderPhotoAlbum)}
            </View>
          </View>

          {/* Prompt Collections Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Prompt Collections</Text>
              <TouchableOpacity onPress={createNewPromptCollection} style={styles.addButton}>
                <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
              </TouchableOpacity>
            </View>

            {data.promptCollections.map(collection => (
              <View key={collection.id} style={styles.promptCollection}>
                <View style={styles.promptCollectionHeader}>
                  <Text style={styles.promptCollectionName}>{collection.name}</Text>
                  <TouchableOpacity
                    onPress={() => showCollectionMenu(collection.id, 'prompt')}
                    style={styles.promptCollectionMenu}
                  >
                    <Ionicons name="ellipsis-horizontal" size={20} color="#666" />
                  </TouchableOpacity>
                </View>
                {collection.prompts.map(prompt => (
                  <View key={prompt.id} style={styles.promptContainer}>
                    <Text style={styles.promptQuestion}>{prompt.question}</Text>
                    {editingPrompt === prompt.id ? (
                      <TextInput
                        style={styles.promptInput}
                        multiline
                        value={prompt.answer}
                        onChangeText={(newAnswer) => {
                          setData(prev => ({
                            ...prev,
                            promptCollections: prev.promptCollections.map(c =>
                              c.id === collection.id
                                ? {
                                    ...c,
                                    prompts: c.prompts.map(p =>
                                      p.id === prompt.id ? { ...p, answer: newAnswer } : p
                                    )
                                  }
                                : c
                            )
                          }));
                        }}
                        placeholder="Your answer..."
                      />
                    ) : (
                      <Text style={styles.promptAnswer}>{prompt.answer}</Text>
                    )}
                    <TouchableOpacity
                      style={styles.editPromptButton}
                      onPress={() => setEditingPrompt(editingPrompt === prompt.id ? null : prompt.id)}
                    >
                      <Ionicons
                        name={editingPrompt === prompt.id ? "checkmark" : "pencil"}
                        size={24}
                        color="#007AFF"
                      />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  logoutButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  userInfoHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  addButton: {
    padding: 4,
  },
  albumsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  albumContainer: {
    width: ALBUM_SIZE,
    marginBottom: 16,
  },
  albumCover: {
    width: ALBUM_SIZE,
    height: ALBUM_SIZE,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  albumImage: {
    width: '100%',
    height: '100%',
  },
  albumOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
  },
  albumCount: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  albumInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  albumName: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  albumMenuButton: {
    padding: 4,
  },
  promptCollection: {
    marginBottom: 24,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
  },
  promptCollectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  promptCollectionName: {
    fontSize: 18,
    fontWeight: '600',
  },
  promptCollectionMenu: {
    padding: 4,
  },
  promptContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  promptQuestion: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  promptAnswer: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  promptInput: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    padding: 12,
    minHeight: 60,
    textAlignVertical: 'top',
    backgroundColor: 'white',
  },
  editPromptButton: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
});

export default ProfileScreen; 