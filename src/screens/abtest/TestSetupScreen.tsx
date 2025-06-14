import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, Modal, TextInput, Platform, Keyboard, TouchableWithoutFeedback } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

// Mock profile data (for fallback)
const mockProfile = {
  photos: [
    { id: '1', uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800' },
    { id: '2', uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800' },
    { id: '3', uri: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800' },
  ],
  prompts: [
    { id: '1', question: "I'm looking for", answer: "Someone who can make me laugh and isn't afraid to be themselves." },
    { id: '2', question: "My ideal first date", answer: "Coffee and a walk in the park, followed by a visit to a local art gallery or museum." },
    { id: '3', question: "A fact about me", answer: "I once biked across the country!" },
  ],
};

export default function TestSetupScreen({ navigation, route }: any) {
  // Get the preselected photo or prompt id from params
  const preselectedPhotoId = route?.params?.preselectedPhoto;
  const preselectedPromptId = route?.params?.preselectedPrompt;
  
  // Find the selected item
  const selectedPhoto = mockProfile.photos.find(p => p.id === preselectedPhotoId);
  const selectedPrompt = mockProfile.prompts.find(p => p.id === preselectedPromptId);
  
  const [replacementUri, setReplacementUri] = useState<string | null>(null);
  const [replacementAnswer, setReplacementAnswer] = useState<string>('');
  const [replacementQuestion, setReplacementQuestion] = useState<string>('');
  const [isPicking, setIsPicking] = useState(false);
  const [placeholderPressed, setPlaceholderPressed] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const TEST_COST = 5;
  const userCredits = 7; // TODO: Replace with real value or context
  const [customQuestion, setCustomQuestion] = useState('');
  const [useCustomQuestion, setUseCustomQuestion] = useState(false);

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
    if (selectedPrompt && !replacementAnswer) return;
    if (selectedPrompt && !replacementQuestion) return;
    setShowConfirmModal(true);
    setErrorMsg('');
  };

  const handleConfirmTest = () => {
    if (userCredits < TEST_COST) {
      setErrorMsg('Not enough credits to start this test.');
      return;
    }
    setShowConfirmModal(false);
    // Navigate back to Profile screen with triggerTest parameter
    navigation.navigate('Main', { 
      screen: 'Profile', 
      params: { 
        triggerTest: true, 
        customQuestion,
        testType: selectedPhoto ? 'photo' : 'prompt',
        testId: selectedPhoto ? selectedPhoto.id : selectedPrompt?.id,
        replacement: selectedPhoto ? replacementUri : replacementAnswer,
        replacementQuestion: selectedPrompt ? replacementQuestion : undefined
      }
    });
  };

  if (!selectedPhoto && !selectedPrompt) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>No item selected.</Text>
      </View>
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
                  <Image source={{ uri: selectedPhoto.uri }} style={styles.photo} />
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
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalConfirmBtn} 
                onPress={handleConfirmTest}
              >
                <Text style={styles.modalConfirmText}>Confirm</Text>
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