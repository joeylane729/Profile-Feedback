import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, Modal, TextInput, Platform, Keyboard, TouchableWithoutFeedback } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { getProfile } from '../../services/profile';
import { testService, CreateTestWithReplacementData } from '../../services/test';
import { useAuth } from '../../context/AuthContext';
import { jwtDecode } from 'jwt-decode';
import { config } from '../../config';

export default function TestSetupScreen({ navigation, route }: any) {
  // Get the preselected photo or prompt id from params
  const preselectedPhotoId = route?.params?.preselectedPhoto;
  const preselectedPromptId = route?.params?.preselectedPrompt;
  const { token } = useAuth();
  
  console.log('=== TEST SETUP SCREEN RENDER ===');
  console.log('route.params:', route?.params);
  console.log('preselectedPhotoId:', preselectedPhotoId);
  console.log('preselectedPromptId:', preselectedPromptId);
  console.log('token exists:', !!token);
  
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [replacementUri, setReplacementUri] = useState<string | null>(null);
  const [replacementAnswer, setReplacementAnswer] = useState<string>('');
  const [replacementQuestion, setReplacementQuestion] = useState<string>('');
  const [isPicking, setIsPicking] = useState(false);
  const [placeholderPressed, setPlaceholderPressed] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isCreatingTest, setIsCreatingTest] = useState(false);
  const TEST_COST = 5;
  const [customQuestion, setCustomQuestion] = useState('');
  const [useCustomQuestion, setUseCustomQuestion] = useState(false);
  const [userCredits, setUserCredits] = useState<number>(0);
  let userId: string | null = null;
  if (token) {
    try {
      const decoded: any = jwtDecode(token.replace('Bearer ', ''));
      userId = decoded.userId?.toString();
      console.log('Decoded userId:', userId);
    } catch (e) {
      console.error('Error decoding token:', e);
      userId = null;
    }
  }

  useEffect(() => {
    console.log('=== TEST SETUP SCREEN USE EFFECT ===');
    console.log('userId:', userId);
    console.log('token:', token);
    loadProfile();
    loadUserCredits();
  }, []);

  const loadProfile = async () => {
    console.log('=== LOADING PROFILE ===');
    try {
      setLoading(true);
      if (!userId) {
        console.error('User ID not found in token');
        throw new Error('User ID not found in token');
      }
      console.log('Calling getProfile with userId:', userId);
      const profileData = await getProfile(userId, token!);
      console.log('Profile data received:', profileData);
      console.log('Profile data.profile:', profileData.profile);
      
      // The /api/profile/:userId endpoint returns the profile directly, not wrapped in a profile property
      // So we need to handle both cases
      const actualProfile = profileData.profile || profileData;
      console.log('Actual profile to use:', actualProfile);
      setProfile(actualProfile);
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const loadUserCredits = async () => {
    try {
      if (!userId) {
        console.error('User ID not found in token');
        return;
      }
      console.log('Fetching user credits for userId:', userId);
      const response = await fetch(`${config.api.baseUrl}/api/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const userData = await response.json();
        console.log('User data received for credits:', userData);
        setUserCredits(userData.credits || 0);
      } else {
        console.error('Failed to fetch user credits');
      }
    } catch (error) {
      console.error('Error fetching user credits:', error);
    }
  };

  // Find the selected item from real profile data
  console.log('TestSetupScreen - preselectedPhotoId:', preselectedPhotoId);
  console.log('TestSetupScreen - profile:', profile);
  console.log('TestSetupScreen - profile.Photos:', profile?.Photos);
  console.log('TestSetupScreen - profile.photos:', profile?.photos);
  console.log('TestSetupScreen - profile.Prompts:', profile?.Prompts);
  console.log('TestSetupScreen - profile.prompts:', profile?.prompts);
  
  const selectedPhoto = profile?.Photos?.find((p: any) => p.id.toString() === preselectedPhotoId?.toString());
  const selectedPrompt = profile?.Prompts?.find((p: any) => p.id.toString() === preselectedPromptId?.toString());
  
  console.log('TestSetupScreen - selectedPhoto:', selectedPhoto);
  console.log('TestSetupScreen - selectedPrompt:', selectedPrompt);
  
  if (selectedPhoto) {
    console.log('Selected photo details:', {
      id: selectedPhoto.id,
      url: selectedPhoto.url,
      profile_id: selectedPhoto.profile_id,
      order_index: selectedPhoto.order_index
    });
  }

  const pickReplacementPhoto = async () => {
    setIsPicking(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setReplacementUri(result.assets[0].uri);
      }
    } catch (e) {
      Alert.alert('Error', 'Could not pick photo.');
    } finally {
      setIsPicking(false);
    }
  };

  const handleReadyToTest = () => {
    if (selectedPhoto && !replacementUri) return;
    if (selectedPrompt && (!replacementAnswer || !replacementQuestion)) return;
    setShowConfirmModal(true);
    setErrorMsg('');
  };

  const handleConfirmTest = async () => {
    // Check if user has enough credits
    if (userCredits < TEST_COST) {
      setErrorMsg('Not enough credits to start this test.');
      return;
    }

    setIsCreatingTest(true);
    try {
      const testData: CreateTestWithReplacementData = {
        itemType: selectedPhoto ? 'photo' : 'prompt',
        originalItemId: selectedPhoto ? selectedPhoto.id : selectedPrompt.id,
        customQuestion: useCustomQuestion ? customQuestion : undefined,
      };

      if (selectedPhoto) {
        // For photo test, we need to convert the URI to a file
        const response = await fetch(replacementUri!);
        const blob = await response.blob();
        const file = new File([blob], 'replacement-photo.jpg', { 
          type: 'image/jpeg',
          lastModified: Date.now()
        });
        testData.replacementPhoto = file;
      } else {
        // For prompt test
        testData.replacementQuestion = replacementQuestion;
        testData.replacementAnswer = replacementAnswer;
      }

      const result = await testService.createTestWithReplacement(testData);
      
      setShowConfirmModal(false);
      
      // Navigate back to Profile screen and trigger the test status with the actual test ID
      navigation.navigate('Main', {
        screen: 'Profile',
        params: { triggerTest: true, testId: result.id }
      });
    } catch (error: any) {
      console.error('Error creating test:', error);
      setErrorMsg(error.message || 'Failed to create test');
    } finally {
      setIsCreatingTest(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.header}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!selectedPhoto && !selectedPrompt) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.header}>No item selected.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {selectedPhoto ? 'Test a Photo Change' : 'Test a Prompt Change'}
        </Text>
        <View style={styles.backButton} />
      </View>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAwareScrollView
          contentContainerStyle={styles.scrollContainer}
          enableOnAndroid={true}
          extraScrollHeight={24}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            {selectedPhoto ? (
              <>
                <Text style={styles.label}>Current Photo</Text>
                <View style={styles.photoWrapper}>
                  <Image source={{ uri: `${config.api.baseUrl}${selectedPhoto.url}` }} style={styles.photo} />
                </View>
                <Text style={styles.label}>Replacement Photo</Text>
                {replacementUri ? (
                  <View style={styles.photoWrapper}>
                    <Image source={{ uri: replacementUri }} style={styles.photo} />
                  </View>
                ) : (
                  <View style={styles.photoWrapper}>
                    <TouchableOpacity
                      style={styles.placeholderCardMatched}
                      onPress={pickReplacementPhoto}
                      disabled={isPicking}
                      activeOpacity={0.85}
                    >
                      <View style={styles.placeholderContentModern}>
                        <Text style={styles.placeholderTextModern}>Add Replacement Photo</Text>
                      </View>
                      <View style={styles.plusCircleBtnTopRight} pointerEvents="none">
                        <MaterialCommunityIcons name="plus" size={20} color="#fff" />
                      </View>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            ) : (
              <>
                <Text style={styles.label}>Current Prompt</Text>
                <View style={styles.promptWrapper}>
                  <Text style={styles.promptQuestion}>{selectedPrompt?.question}</Text>
                  <Text style={styles.promptAnswer}>{selectedPrompt?.answer}</Text>
                </View>
                <Text style={styles.label}>New Prompt</Text>
                <View style={styles.promptWrapper}>
                  <TextInput
                    style={[styles.promptInput, styles.promptQuestionInput]}
                    placeholder="Enter your new prompt question"
                    value={replacementQuestion}
                    onChangeText={setReplacementQuestion}
                    multiline
                    numberOfLines={2}
                    textAlignVertical="top"
                  />
                  <TextInput
                    style={[styles.promptInput, styles.promptAnswerInput]}
                    placeholder="Enter your new answer"
                    value={replacementAnswer}
                    onChangeText={setReplacementAnswer}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                </View>
              </>
            )}
            <View style={styles.customQuestionContainer}>
              <View style={styles.customQuestionHeader}>
                <Text style={styles.customQuestionLabel}>Custom Question</Text>
                <TouchableOpacity
                  style={[styles.toggleButton, useCustomQuestion && styles.toggleButtonActive]}
                  onPress={() => setUseCustomQuestion(!useCustomQuestion)}
                >
                  <View style={[styles.toggleCircle, useCustomQuestion && styles.toggleCircleActive]} />
                </TouchableOpacity>
              </View>
              {useCustomQuestion && (
                <TextInput
                  style={styles.questionInput}
                  placeholder={selectedPhoto ? "Which photo do you like better?" : "Which answer do you like better?"}
                  placeholderTextColor="#999"
                  value={customQuestion}
                  onChangeText={setCustomQuestion}
                  multiline
                  numberOfLines={2}
                  textAlignVertical="top"
                />
              )}
            </View>
            <TouchableOpacity 
              style={[
                styles.startButton,
                ((selectedPhoto && !replacementUri) || (selectedPrompt && (!replacementAnswer || !replacementQuestion))) && styles.startButtonDisabled
              ]}
              onPress={handleReadyToTest}
              disabled={(selectedPhoto && !replacementUri) || (selectedPrompt && (!replacementAnswer || !replacementQuestion))}
            >
              <Text style={styles.startButtonText}>Start Test</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAwareScrollView>
      </TouchableWithoutFeedback>
      <Modal visible={showConfirmModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Start Test?</Text>
            <Text style={styles.modalText}>This test costs <Text style={{fontWeight:'bold'}}>{TEST_COST} credits</Text>.</Text>
            <Text style={styles.modalText}>You have <Text style={{fontWeight:'bold'}}>{userCredits} credits</Text>.</Text>
            {errorMsg ? <Text style={styles.modalError}>{errorMsg}</Text> : null}
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalCancelBtn} 
                onPress={() => setShowConfirmModal(false)}
                disabled={isCreatingTest}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalConfirmBtn, isCreatingTest && styles.startButtonDisabled]} 
                onPress={handleConfirmTest}
                disabled={isCreatingTest}
              >
                <Text style={styles.modalConfirmText}>
                  {isCreatingTest ? 'Creating...' : 'Confirm'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: { 
    flex: 1, 
    backgroundColor: '#fff', 
    alignItems: 'center', 
    justifyContent: 'flex-start', 
    padding: 24 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { 
    fontSize: 16, 
    fontWeight: '600', 
    marginTop: 18, 
    marginBottom: 8,
    alignSelf: 'flex-start'
  },
  photoWrapper: {
    marginTop: 18,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photo: { 
    width: 180, 
    height: 180, 
    borderRadius: 12, 
    borderWidth: 2, 
    borderColor: '#eee' 
  },
  promptWrapper: {
    width: '100%',
    marginTop: 8,
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  promptQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  promptAnswer: {
    fontSize: 15,
    color: '#666',
    lineHeight: 20,
  },
  promptInput: {
    fontSize: 15,
    color: '#333',
    lineHeight: 20,
    textAlignVertical: 'top',
    padding: 0,
  },
  promptQuestionInput: {
    minHeight: 24,
    marginBottom: 8,
    fontWeight: '600',
  },
  promptAnswerInput: {
    minHeight: 24,
  },
  placeholderCardMatched: {
    width: 180,
    height: 180,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#222',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  plusCircleBtnTopRight: {
    position: 'absolute',
    top: -16,
    right: -16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.10,
    shadowRadius: 2,
    elevation: 1,
    zIndex: 10,
  },
  placeholderContentModern: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  placeholderTextModern: {
    color: '#000',
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 12,
    letterSpacing: 0.1,
  },
  questionInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    backgroundColor: '#fff',
    marginTop: 8,
  },
  startButton: {
    backgroundColor: '#222',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
    width: '100%',
  },
  startButtonDisabled: {
    backgroundColor: '#ccc',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  modalText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  modalError: {
    color: '#dc2626',
    fontSize: 14,
    marginTop: 8,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
  },
  modalCancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  modalCancelText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
  },
  modalConfirmBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#222',
  },
  modalConfirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  customQuestionContainer: {
    width: '100%',
    marginTop: 24,
  },
  customQuestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  customQuestionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  toggleButton: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e5e5e5',
    padding: 2,
  },
  toggleButtonActive: {
    backgroundColor: '#222',
  },
  toggleCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  toggleCircleActive: {
    transform: [{ translateX: 20 }],
  },
}); 