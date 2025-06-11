import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

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
  // Get the preselected photo id from params
  const preselectedPhotoId = route?.params?.preselectedPhoto;
  // Find the photo object
  const selectedPhoto = mockProfile.photos.find(p => p.id === preselectedPhotoId);
  const [replacementUri, setReplacementUri] = useState<string | null>(null);
  const [isPicking, setIsPicking] = useState(false);
  const [placeholderPressed, setPlaceholderPressed] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const TEST_COST = 5;
  const userCredits = 7; // TODO: Replace with real value or context

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
    if (!replacementUri) return;
    setShowConfirmModal(true);
    setErrorMsg('');
  };

  const handleConfirmTest = () => {
    if (userCredits < TEST_COST) {
      setErrorMsg('Not enough credits to start this test.');
      return;
    }
    setShowConfirmModal(false);
    // Instead of calling onTestComplete directly, navigate to ProfileScreen with a param
    navigation.navigate('Main', { screen: 'Profile', params: { triggerTest: true } });
  };

  if (!selectedPhoto) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>No photo selected.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.header}>Test a Photo Change</Text>
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
        {replacementUri && (
          <TouchableOpacity style={styles.continueBtn} onPress={handleReadyToTest}>
            <Text style={styles.continueText}>Ready to Test</Text>
          </TouchableOpacity>
        )}
      </View>
      {/* Confirmation Modal */}
      <Modal visible={showConfirmModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Start Test?</Text>
            <Text style={styles.modalText}>This test costs <Text style={{fontWeight:'bold'}}>{TEST_COST} credits</Text>.</Text>
            <Text style={styles.modalText}>You have <Text style={{fontWeight:'bold'}}>{userCredits} credits</Text>.</Text>
            {errorMsg ? <Text style={styles.modalError}>{errorMsg}</Text> : null}
            <View style={{ flexDirection: 'row', marginTop: 18, gap: 12 }}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowConfirmModal(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirmBtn} onPress={handleConfirmTest}>
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
  container: { flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'flex-start', padding: 24 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 24, marginTop: 12 },
  label: { fontSize: 16, fontWeight: '600', marginTop: 18, marginBottom: 8 },
  photoWrapper: {
    marginTop: 18,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photo: { width: 180, height: 180, borderRadius: 12, borderWidth: 2, borderColor: '#eee' },
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
  addBtn: { backgroundColor: '#2563eb', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 12, width: 200 },
  addBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  continueBtn: { backgroundColor: '#10b981', borderRadius: 8, padding: 16, alignItems: 'center', marginTop: 32, width: 200 },
  continueText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 28,
    minWidth: 260,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 3,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
    color: '#111',
  },
  modalText: {
    fontSize: 16,
    color: '#222',
    marginBottom: 2,
    textAlign: 'center',
  },
  modalError: {
    color: '#b91c1c',
    fontWeight: '600',
    marginTop: 8,
    fontSize: 15,
    textAlign: 'center',
  },
  modalCancelBtn: {
    backgroundColor: '#eee',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 22,
    marginRight: 4,
  },
  modalCancelText: {
    color: '#222',
    fontWeight: '600',
    fontSize: 16,
  },
  modalConfirmBtn: {
    backgroundColor: '#000',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 22,
    marginLeft: 4,
  },
  modalConfirmText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
}); 