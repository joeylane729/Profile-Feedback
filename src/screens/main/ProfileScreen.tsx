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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import { config } from '../../config';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';

// Dummy data - in a real app, this would come from your backend/state management
const INITIAL_DATA = {
  photoCollections: [
    {
      id: '1',
      name: 'Travel Photos',
      photos: [
        { id: '1', uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=60' },
        { id: '2', uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=60' },
      ]
    },
    {
      id: '2',
      name: 'Hiking Adventures',
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

interface Collection {
  id: string;
  name: string;
  type: 'photo' | 'prompt';
  photos?: { id: string; uri: string; }[];
  prompts?: { id: string; question: string; answer: string; }[];
}

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
      name: 'New Collection',
      photos: []
    };
    setData(prev => ({
      ...prev,
      photoCollections: [...prev.photoCollections, newCollection]
    }));
    setActivePhotoCollection(newCollection.id);
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

  const reorderCollections = (type: 'photo' | 'prompt', newCollections: Collection[]) => {
    setData(prev => ({
      ...prev,
      [type === 'photo' ? 'photoCollections' : 'promptCollections']: newCollections.map(({ type, ...rest }) => rest)
    }));
  };

  const renderCollectionItem = ({ item, drag, isActive }: RenderItemParams<Collection> & { type: 'photo' | 'prompt' }) => (
    <View style={[
      styles.collectionTabContainer,
      isActive && styles.draggingCollection
    ]}>
      <TouchableOpacity
        style={[
          styles.collectionTab,
          (item.type === 'photo' ? activePhotoCollection : activePromptCollection) === item.id && styles.activeCollectionTab
        ]}
        onPress={() => item.type === 'photo' ? setActivePhotoCollection(item.id) : setActivePromptCollection(item.id)}
      >
        {editingCollectionName === item.id && editingCollectionType === item.type ? (
          <TextInput
            style={styles.collectionNameInput}
            value={item.name}
            onChangeText={(text) => renameCollection(item.id, text, item.type)}
            onBlur={() => {
              setEditingCollectionName(null);
              setEditingCollectionType(null);
            }}
            autoFocus
          />
        ) : (
          <Text style={[
            styles.collectionTabText,
            (item.type === 'photo' ? activePhotoCollection : activePromptCollection) === item.id && styles.activeCollectionTabText
          ]}>
            {item.name}
          </Text>
        )}
      </TouchableOpacity>
      <View style={styles.collectionActions}>
        <TouchableOpacity
          onPress={() => showCollectionMenu(item.id, item.type)}
          style={styles.menuButton}
        >
          <Ionicons name="ellipsis-horizontal" size={20} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity
          onLongPress={drag}
          style={styles.dragHandle}
        >
          <Ionicons name="reorder-three" size={24} color="#666" />
        </TouchableOpacity>
      </View>
    </View>
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

  const activePhotoCollectionData = data.photoCollections.find(c => c.id === activePhotoCollection);
  const activePromptCollectionData = data.promptCollections.find(c => c.id === activePromptCollection);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
      <ScrollView style={styles.scrollView}>
        {/* User Info Section */}
        <View style={styles.userInfoHeader}>
          <Text style={styles.userName}>{userData?.name || 'Loading...'}</Text>
        </View>

        {/* Photo Collections Section */}
        <View style={styles.section}>
          <View style={styles.collectionHeader}>
            <Text style={styles.sectionTitle}>Photo Collections</Text>
            <TouchableOpacity onPress={createNewPhotoCollection} style={styles.addButton}>
              <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
            </TouchableOpacity>
          </View>
          
          {/* Collection Selector */}
          <DraggableFlatList
            data={data.photoCollections.map(c => ({ ...c, type: 'photo' as const }))}
            renderItem={(props) => renderCollectionItem({ ...props, type: 'photo' })}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            onDragEnd={({ data }) => reorderCollections('photo', data)}
            style={styles.collectionSelector}
          />

          {/* Photos Grid */}
          <View style={styles.photosContainer}>
            {activePhotoCollectionData?.photos?.map((photo) => (
              <View key={photo.id} style={styles.photoContainer}>
                <Image source={{ uri: photo.uri }} style={styles.photo} />
                <TouchableOpacity
                  style={styles.removePhotoButton}
                  onPress={() => removePhoto(photo.id)}
                >
                  <Ionicons name="close-circle" size={24} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            ))}
            {(activePhotoCollectionData?.photos?.length ?? 0) < 6 && (
              <TouchableOpacity style={styles.addPhotoButton} onPress={pickImage}>
                <Ionicons name="add" size={40} color="#007AFF" />
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.photoLimitText}>
            {activePhotoCollectionData?.photos?.length ?? 0}/6 photos
          </Text>
        </View>

        {/* Prompt Collections Section */}
        <View style={styles.section}>
          <View style={styles.collectionHeader}>
            <Text style={styles.sectionTitle}>Prompt Collections</Text>
            <TouchableOpacity onPress={createNewPromptCollection} style={styles.addButton}>
              <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
            </TouchableOpacity>
          </View>

          {/* Collection Selector */}
          <DraggableFlatList
            data={data.promptCollections.map(c => ({ ...c, type: 'prompt' as const }))}
            renderItem={(props) => renderCollectionItem({ ...props, type: 'prompt' })}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            onDragEnd={({ data }) => reorderCollections('prompt', data)}
            style={styles.collectionSelector}
          />

          {/* Prompts */}
          {activePromptCollectionData?.prompts.map((prompt) => (
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
                      promptCollections: prev.promptCollections.map(collection =>
                        collection.id === activePromptCollection
                          ? {
                              ...collection,
                              prompts: collection.prompts.map(p =>
                                p.id === prompt.id ? { ...p, answer: newAnswer } : p
                              )
                            }
                          : collection
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
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  safeArea: {
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  userInfoHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  logoutButton: {
    padding: 8,
  },
  menuButton: {
    padding: 4,
    marginRight: 4,
  },
  scrollView: {
    flex: 1,
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
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  collectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  collectionSelector: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  collectionTabContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
    backgroundColor: '#F8F8F8',
    borderRadius: 20,
    padding: 4,
  },
  collectionTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  activeCollectionTab: {
    backgroundColor: '#007AFF',
  },
  collectionTabText: {
    color: '#333',
    fontSize: 16,
  },
  activeCollectionTabText: {
    color: '#FFF',
  },
  collectionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 4,
  },
  collectionActionButton: {
    padding: 4,
  },
  collectionNameInput: {
    color: '#333',
    fontSize: 16,
    padding: 0,
    minWidth: 100,
  },
  reorderButtons: {
    flexDirection: 'column',
    marginLeft: 4,
  },
  reorderButton: {
    padding: 2,
  },
  reorderButtonDisabled: {
    opacity: 0.5,
  },
  photosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  photoContainer: {
    width: '30%',
    aspectRatio: 1,
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  addPhotoButton: {
    width: '30%',
    aspectRatio: 1,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoLimitText: {
    color: '#666',
    marginTop: 8,
    fontSize: 14,
  },
  promptContainer: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
  },
  promptQuestion: {
    fontSize: 16,
    fontWeight: 'bold',
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
  addButton: {
    padding: 4,
  },
  draggingCollection: {
    opacity: 0.8,
    transform: [{ scale: 1.05 }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dragHandle: {
    padding: 4,
    marginLeft: 4,
  },
});

export default ProfileScreen; 