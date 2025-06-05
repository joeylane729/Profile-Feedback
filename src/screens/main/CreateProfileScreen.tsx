import React, { useState } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { colors } from '../../config/theme';

const { width } = Dimensions.get('window');
const PHOTO_SIZE = (width - 48) / 3;

interface Photo {
  id: string;
  uri: string;
}

interface Prompt {
  id: string;
  question: string;
  answer: string;
}

interface ProfileData {
  photos: Photo[];
  bio: string;
  prompts: Prompt[];
}

interface CreateProfileScreenProps {
  onSave?: () => void;
}

const INITIAL_DATA: ProfileData = {
  photos: [],
  bio: '',
  prompts: [
    { id: '1', question: "I'm looking for", answer: '' },
    { id: '2', question: "My ideal first date", answer: '' },
    { id: '3', question: "A fact about me", answer: '' },
  ],
};

const CreateProfileScreen: React.FC<CreateProfileScreenProps> = ({ onSave }) => {
  const [data, setData] = useState(INITIAL_DATA);
  const [editingBio, setEditingBio] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<string | null>(null);

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

  const handleSave = () => {
    // TODO: Implement profile creation logic
    Alert.alert('Success', 'Profile created successfully!');
    if (onSave) onSave();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Create Profile</Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Photos</Text>
            <TouchableOpacity onPress={pickImage} style={styles.addButton}>
              <Ionicons name="add-circle-outline" size={24} color="#222" />
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
              placeholder="Write a short bio about yourself..."
            />
          ) : (
            <TouchableOpacity onPress={() => setEditingBio(true)} style={styles.clickableBox}>
              <Text style={[styles.bioText, !data.bio && styles.placeholderText]}>
                {data.bio || "Write a short bio about yourself..."}
              </Text>
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
                  placeholder={`Answer: ${prompt.question}`}
                />
              ) : (
                <TouchableOpacity onPress={() => setEditingPrompt(prompt.id)} style={styles.clickableBox}>
                  <Text style={[styles.promptAnswer, !prompt.answer && styles.placeholderText]}>
                    {prompt.answer || `Answer: ${prompt.question}`}
                  </Text>
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
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  saveButton: {
    padding: 8,
  },
  saveButtonText: {
    color: '#222',
    fontSize: 16,
    fontWeight: '500',
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
  placeholderText: {
    color: '#999',
  },
});

export default CreateProfileScreen; 