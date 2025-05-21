/**
 * ProfileScreen.tsx
 *
 * This screen displays the user's profile, including photos, prompts, and bio.
 * - Users can view and manage their photos in a grid layout.
 * - Users can edit their bio and prompt answers.
 * - Users can add new photos from their device.
 *
 * State and logic are managed locally for demonstration purposes.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  Dimensions,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import { config } from '../../config';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { MainTabParamList } from '../../navigation/types';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const { width } = Dimensions.get('window');
const PHOTO_SIZE = (width - 48) / 3; // 3 photos per row with padding

// Dummy data - in a real app, this would come from your backend/state management
const INITIAL_DATA = {
  photos: [
    { id: '1', uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=60' },
    { id: '2', uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=60' },
    { id: '3', uri: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=60' },
    { id: '4', uri: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop&q=60' },
  ],
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
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();

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
        photos: [...prev.photos, newPhoto]
      }));
    }
  };

  const removePhoto = (photoId: string) => {
    Alert.alert(
      'Remove Photo',
      'Are you sure you want to remove this photo?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setData(prev => ({
              ...prev,
              photos: prev.photos.filter(photo => photo.id !== photoId)
            }));
          }
        }
      ]
    );
  };

  // Helper to group photos into columns of 2
  const groupPhotosInColumns = (photos: { id: string; uri: string }[]) => {
    const columns: { id: string; uri: string }[][] = [];
    for (let i = 0; i < photos.length; i += 2) {
      columns.push(photos.slice(i, i + 2));
    }
    return columns;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Photos</Text>
            <TouchableOpacity onPress={pickImage} style={styles.addButton}>
              <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={groupPhotosInColumns(data.photos)}
            renderItem={({ item: column }) => (
              <View style={styles.photoColumn}>
                {column.map(photo => (
                  <View key={photo.id} style={styles.photoContainer}>
                    <Image source={{ uri: photo.uri }} style={styles.photo} />
                    <TouchableOpacity 
                      style={styles.removeButton}
                      onPress={() => removePhoto(photo.id)}
                    >
                      <Ionicons name="close-circle" size={24} color="#ff3b30" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
            keyExtractor={(_, idx) => idx.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.photoGrid}
            style={{ maxHeight: PHOTO_SIZE * 2 + 24 }}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bio</Text>
          {editingBio ? (
            <TextInput
              style={styles.bioInput}
              value={data.bio}
              onChangeText={(text) => setData(prev => ({ ...prev, bio: text }))}
              multiline
              onBlur={() => setEditingBio(false)}
              autoFocus
            />
          ) : (
            <TouchableOpacity onPress={() => setEditingBio(true)} style={styles.clickableBox}>
              <Text style={styles.bioText}>{data.bio}</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Prompts</Text>
          {data.prompts.map((prompt) => (
            <View key={prompt.id} style={styles.promptContainer}>
              <Text style={styles.promptQuestion}>{prompt.question}</Text>
              {editingPrompt === prompt.id ? (
                <TextInput
                  style={styles.promptInput}
                  value={prompt.answer}
                  onChangeText={(text) => {
                    setData(prev => ({
                      ...prev,
                      prompts: prev.prompts.map(p =>
                        p.id === prompt.id ? { ...p, answer: text } : p
                      )
                    }));
                  }}
                  multiline
                  onBlur={() => setEditingPrompt(null)}
                  autoFocus
                />
              ) : (
                <TouchableOpacity onPress={() => setEditingPrompt(prompt.id)} style={styles.clickableBox}>
                  <Text style={styles.promptAnswer}>{prompt.answer}</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
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
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  addButton: {
    padding: 4,
  },
  photoGrid: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 0,
  },
  photoColumn: {
    flexDirection: 'column',
    marginHorizontal: 4,
  },
  photoContainer: {
    marginVertical: 4,
    marginHorizontal: 0,
    position: 'relative',
  },
  photo: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: 8,
    marginBottom: 4,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  bioInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
  },
  bioText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  promptContainer: {
    marginBottom: 16,
  },
  promptQuestion: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  promptInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
  },
  promptAnswer: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  clickableBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 4,
    marginTop: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
});

export default ProfileScreen; 