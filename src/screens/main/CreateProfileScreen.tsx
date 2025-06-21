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
  TouchableWithoutFeedback,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { colors } from '../../config/theme';
import { createProfile } from '../../services/profile';
import { useAuth } from '../../context/AuthContext';

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
  onCancel?: () => void;
}

const INITIAL_DATA: ProfileData = {
  photos: [],
  bio: '',
  prompts: [],
};

const CreateProfileScreen: React.FC<CreateProfileScreenProps> = ({ onSave, onCancel }) => {
  const { token } = useAuth();
  const [data, setData] = useState(INITIAL_DATA);
  const [editingBio, setEditingBio] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<string | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const removePrompt = (promptId: string) => {
    Alert.alert(
      'Remove Prompt',
      'Are you sure you want to remove this prompt?',
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
              prompts: prev.prompts.filter(prompt => prompt.id !== promptId)
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

  const handleSave = async () => {
    if (!token) {
      setError('Authentication token is missing. Please log in again.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await createProfile(data, token);
      Alert.alert('Success', 'Profile created successfully!');
      if (onSave) onSave();
    } catch (e) {
      console.error('Error creating profile:', e);
      setError('An error occurred while creating the profile.');
    } finally {
      setIsLoading(false);
    }
  };

  const addPrompt = () => {
    const newPrompt = {
      id: Date.now().toString(),
      question: '',
      answer: '',
    };
    setData(prev => ({
      ...prev,
      prompts: [...prev.prompts, newPrompt]
    }));
    setEditingPrompt(newPrompt.id);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onCancel?.()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Create Profile</Text>
        <View style={styles.saveButton} />
      </View>
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
      >
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Photos</Text>
            <TouchableOpacity onPress={pickImage} style={styles.addButton}>
              <Ionicons name="add-circle-outline" size={24} color="#222" />
            </TouchableOpacity>
          </View>
          {data.photos.length < 1 && (
            <Text style={styles.photoRequirementText}>
              Add at least 3 photos to create your profile
            </Text>
          )}
          {data.photos.length === 0 ? (
            <TouchableOpacity onPress={pickImage} style={styles.emptyPhotosContainer}>
              <Ionicons name="add-circle-outline" size={32} color="#222" />
              <Text style={styles.emptyPhotosText}>Add photo</Text>
            </TouchableOpacity>
          ) : (
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
          )}
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
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Prompts</Text>
            <TouchableOpacity onPress={addPrompt} style={styles.addButton}>
              <Ionicons name="add-circle-outline" size={24} color="#222" />
            </TouchableOpacity>
          </View>
          {data.prompts.length === 0 ? (
            <TouchableOpacity onPress={addPrompt} style={styles.emptyPromptsContainer}>
              <Ionicons name="add-circle-outline" size={32} color="#222" />
              <Text style={styles.emptyPromptsText}>Add prompt</Text>
            </TouchableOpacity>
          ) : (
            data.prompts.map((prompt) => (
              <View key={prompt.id} style={styles.promptContainer}>
                {editingPrompt === prompt.id ? (
                  <View>
                    <View style={styles.editingPromptContainer}>
                      <TextInput
                        style={styles.promptQuestionInput}
                        value={prompt.question}
                        onChangeText={(text) => {
                          setData(prev => ({
                            ...prev,
                            prompts: prev.prompts.map(p =>
                              p.id === prompt.id ? { ...p, question: text } : p
                            )
                          }));
                        }}
                        placeholder="Question"
                        autoFocus
                      />
                      <TextInput
                        style={styles.promptAnswerInput}
                        value={prompt.answer}
                        onChangeText={(text) => {
                          setData(prev => ({
                            ...prev,
                            prompts: prev.prompts.map(p =>
                              p.id === prompt.id ? { ...p, answer: text } : p
                            )
                          }));
                        }}
                        placeholder="Answer"
                        multiline
                      />
                    </View>
                    <View style={styles.buttonRow}>
                      <TouchableOpacity 
                        style={styles.removePromptButton} 
                        onPress={() => {
                          // If both question and answer are empty, remove the prompt
                          if (!prompt.question.trim() && !prompt.answer.trim()) {
                            setData(prev => ({
                              ...prev,
                              prompts: prev.prompts.filter(p => p.id !== prompt.id)
                            }));
                          }
                          setEditingPrompt(null);
                        }}
                      >
                        <Text style={styles.removePromptButtonText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.doneButton} 
                        onPress={() => setEditingPrompt(null)}
                      >
                        <Text style={styles.doneButtonText}>Done</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <View style={styles.promptContainer}>
                    <TouchableOpacity onPress={() => setEditingPrompt(prompt.id)} style={styles.clickableBox}>
                      <Text style={styles.promptQuestion}>{prompt.question}</Text>
                      <Text style={[styles.promptAnswer, !prompt.answer && styles.placeholderText]}>
                        {prompt.answer || "Tap to add your answer..."}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.promptRemoveButton}
                      onPress={() => removePrompt(prompt.id)}
                    >
                      <Ionicons name="close-circle" size={24} color="#ff3b30" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))
          )}
        </View>
        <View style={styles.bottomContainer}>
          <TouchableOpacity 
            style={[
              styles.bottomSaveButton, 
              data.photos.length < 1 && styles.bottomSaveButtonDisabled
            ]} 
            onPress={handleSave}
            disabled={data.photos.length < 1}
          >
            <Text style={[
              styles.bottomSaveButtonText,
              data.photos.length < 1 && styles.bottomSaveButtonTextDisabled
            ]}>
              {isLoading ? <ActivityIndicator size="small" color="#fff" /> : 'Create Profile'}
            </Text>
          </TouchableOpacity>
          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}
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
  editingPromptContainer: {
    width: '100%',
  },
  editingPromptLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  emptyPromptsContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#f8f8f8',
  },
  emptyPromptsText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginTop: 8,
  },
  promptQuestionInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 8,
  },
  promptAnswerInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
  },
  doneButton: {
    alignSelf: 'flex-end',
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  removePromptButton: {
    padding: 8,
  },
  removePromptButtonText: {
    color: '#ff3b30',
    fontSize: 12,
    fontWeight: '500',
  },
  promptRemoveButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  emptyPhotosContainer: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#f8f8f8',
  },
  emptyPhotosText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
    marginTop: 4,
    textAlign: 'center',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#222',
    fontSize: 16,
    fontWeight: '500',
  },
  photoRequirementText: {
    color: '#999',
    marginBottom: 16,
  },
  bottomContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  bottomSaveButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: '#222',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  bottomSaveButtonDisabled: {
    backgroundColor: '#f5f5f5',
    shadowOpacity: 0,
    elevation: 0,
  },
  bottomSaveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  bottomSaveButtonTextDisabled: {
    color: '#999',
    fontWeight: '400',
  },
  errorText: {
    color: '#ff3b30',
    marginTop: 16,
    textAlign: 'center',
  },
});

export default CreateProfileScreen; 