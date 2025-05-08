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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';

// API URL configuration
const API_URL = Platform.select({
  ios: 'http://192.168.1.249:3000',
  android: 'http://192.168.1.249:3000',
  default: 'http://localhost:3000',
});

// Dummy data - in a real app, this would come from your backend/state management
const INITIAL_PROFILE = {
  photos: [
    { id: '1', uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=60' },
    { id: '2', uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=60' },
  ],
  bio: "Adventure seeker and coffee enthusiast. Love hiking, photography, and trying new restaurants. Looking for someone to share life's little moments with.",
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
    },
    {
      id: '3',
      question: "My perfect weekend",
      answer: "Hiking in the morning, trying a new restaurant for lunch, and relaxing with a good book in the evening."
    }
  ]
};

const ProfileScreen = () => {
  const { setIsAuthenticated, setToken, token } = useAuth();
  const [profile, setProfile] = useState(INITIAL_PROFILE);
  const [editingBio, setEditingBio] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<string | null>(null);
  const [userData, setUserData] = useState<{ name: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const data = await response.json();
      setUserData(data);
    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert('Error', 'Failed to load user data');
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
      setProfile(prev => ({
        ...prev,
        photos: [...prev.photos, newPhoto],
      }));
    }
  };

  const removePhoto = (photoId: string) => {
    setProfile(prev => ({
      ...prev,
      photos: prev.photos.filter(photo => photo.id !== photoId),
    }));
  };

  const updateBio = (newBio: string) => {
    setProfile(prev => ({
      ...prev,
      bio: newBio,
    }));
    setEditingBio(false);
  };

  const updatePrompt = (promptId: string, newAnswer: string) => {
    setProfile(prev => ({
      ...prev,
      prompts: prev.prompts.map(prompt =>
        prompt.id === promptId ? { ...prompt, answer: newAnswer } : prompt
      ),
    }));
    setEditingPrompt(null);
  };

  return (
    <ScrollView style={styles.container}>
      {/* User Info Section */}
      <View style={styles.section}>
        <Text style={styles.userName}>{userData?.name || 'Loading...'}</Text>
      </View>

      {/* Photos Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Photos</Text>
        <View style={styles.photosContainer}>
          {profile.photos.map((photo) => (
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
          {profile.photos.length < 6 && (
            <TouchableOpacity style={styles.addPhotoButton} onPress={pickImage}>
              <Ionicons name="add" size={40} color="#007AFF" />
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.photoLimitText}>
          {profile.photos.length}/6 photos
        </Text>
      </View>

      {/* Bio Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Bio</Text>
          <TouchableOpacity onPress={() => setEditingBio(!editingBio)}>
            <Ionicons
              name={editingBio ? "checkmark" : "pencil"}
              size={24}
              color="#007AFF"
            />
          </TouchableOpacity>
        </View>
        {editingBio ? (
          <TextInput
            style={styles.bioInput}
            multiline
            value={profile.bio}
            onChangeText={updateBio}
            placeholder="Tell us about yourself..."
          />
        ) : (
          <Text style={styles.bioText}>{profile.bio}</Text>
        )}
      </View>

      {/* Prompts Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Prompts</Text>
        {profile.prompts.map((prompt) => (
          <View key={prompt.id} style={styles.promptContainer}>
            <Text style={styles.promptQuestion}>{prompt.question}</Text>
            {editingPrompt === prompt.id ? (
              <TextInput
                style={styles.promptInput}
                multiline
                value={prompt.answer}
                onChangeText={(text) => updatePrompt(prompt.id, text)}
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
                size={20}
                color="#007AFF"
              />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Logout Button */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  photosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  photoContainer: {
    width: '31%',
    aspectRatio: 1,
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  addPhotoButton: {
    width: '31%',
    aspectRatio: 1,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoLimitText: {
    color: '#666',
    fontSize: 14,
    marginTop: 8,
  },
  bioInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  bioText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  promptContainer: {
    marginBottom: 20,
    position: 'relative',
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
    textAlignVertical: 'top',
  },
  promptAnswer: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  editPromptButton: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#000',
  },
});

export default ProfileScreen; 