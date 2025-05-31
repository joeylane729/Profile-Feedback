/**
 * RateScreen.tsx
 *
 * This screen allows users to rate and compare pairs of photos, provide feedback, and view results.
 * - Users are shown two photos at a time and asked which they prefer.
 * - After all pairs are rated, users can provide positive and constructive feedback on selected photos.
 * - Results are displayed at the end.
 *
 * State and logic are managed locally for demo purposes.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, SafeAreaView, ScrollView, Modal, Animated, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RateStackParamList } from '../../navigation/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../config/theme';

// Dummy photo data for demonstration
const DUMMY_PHOTOS = [
  { id: '1', uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=60' },
  { id: '2', uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=60' },
  { id: '3', uri: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=60' },
  { id: '4', uri: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop&q=60' },
  { id: '5', uri: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&auto=format&fit=crop&q=60' },
];

// Dummy profile with photos and prompts
const DUMMY_PROFILE = {
  photos: DUMMY_PHOTOS,
  bio: "Adventure seeker and coffee enthusiast. Looking for someone to share life's little moments with. Love hiking, photography, and trying new restaurants. Always up for a spontaneous road trip or a quiet night in with a good book.",
  prompts: [
    { id: '1', question: "I'm looking for", answer: "Someone who can make me laugh and isn't afraid to be themselves. A partner in crime for adventures big and small." },
    { id: '2', question: "My ideal first date", answer: "Coffee and a walk in the park, followed by a visit to a local art gallery or museum. I love learning new things and sharing experiences." },
    { id: '3', question: "My perfect weekend", answer: "Starting with a morning hike, followed by brunch at a new spot. Afternoon spent reading or working on a creative project, and ending with a movie night or game night with friends." },
  ],
};

// Feedback options for users to select
const FEEDBACK_OPTIONS = {
  positive: [
    "Great composition and framing",
    "Perfect lighting and exposure",
    "Natural and engaging expression",
    "Background complements the subject",
    "Professional quality photo"
  ],
  constructive: [
    "Could use better lighting",
    "Background is distracting",
    "Subject is too centered",
    "Image quality could be better",
    "Expression feels forced"
  ]
};

/**
 * Main RateScreen component
 * Handles photo pairwise comparison, feedback, and results.
 */
const RateScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RateStackParamList>>();
  // State for current photo pair index
  const [currentPair, setCurrentPair] = useState(0);
  // State for photo ratings (final scores)
  const [ratings, setRatings] = useState<{ [key: string]: number }>({});
  // State for user preferences during pairwise comparison
  const [preferences, setPreferences] = useState<{ [key: string]: number }>({});
  // State for completion and feedback flow
  const [isComplete, setIsComplete] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'positive' | 'constructive'>('positive');
  // State for feedback selection
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [photoFeedback, setPhotoFeedback] = useState<{ [key: string]: string[] }>({});
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<string | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const insets = useSafeAreaInsets();

  // Generate all unique photo pairs for comparison
  const photoPairs: [number, number][] = [];
  for (let i = 0; i < DUMMY_PROFILE.photos.length; i++) {
    for (let j = i + 1; j < DUMMY_PROFILE.photos.length; j++) {
      photoPairs.push([i, j]);
    }
  }

  /**
   * Handle user preference for a photo in a pair
   * @param preferredIndex 0 for first photo, 1 for second photo
   */
  const handlePreference = (preferredIndex: number) => {
    const [photo1Index, photo2Index] = photoPairs[currentPair];
    const preferredPhoto = preferredIndex === 0 ? photo1Index : photo2Index;
    const otherPhoto = preferredIndex === 0 ? photo2Index : photo1Index;

    setPreferences(prev => ({
      ...prev,
      [preferredPhoto]: (prev[preferredPhoto] || 0) + 1,
      [otherPhoto]: (prev[otherPhoto] || 0) - 1,
    }));

    if (currentPair < photoPairs.length - 1) {
      setCurrentPair(prev => prev + 1);
    } else {
      // All pairs have been rated, calculate final ratings
      const finalRatings = Object.entries(preferences).reduce((acc, [photoId, score]) => {
        // Normalize scores to 1-10 range
        const normalizedScore = Math.round(((score + photoPairs.length) / (photoPairs.length * 2)) * 9 + 1);
        return { ...acc, [photoId]: normalizedScore };
      }, {});
      setRatings(finalRatings);
      setIsComplete(true);
      setShowFeedback(true);
    }
  };

  /**
   * Handle selecting a photo for feedback
   */
  const handlePhotoSelect = (photoId: string) => {
    setSelectedPhotoIndex(photoId);
    setShowFeedbackModal(true);
  };

  /**
   * Handle selecting feedback options for a photo
   */
  const handleFeedbackSelect = (photoId: string, feedback: string) => {
    setPhotoFeedback(prev => {
      const currentFeedback = prev[photoId] || [];
      if (currentFeedback.includes(feedback)) {
        return {
          ...prev,
          [photoId]: currentFeedback.filter(f => f !== feedback)
        };
      }
      return {
        ...prev,
        [photoId]: [...currentFeedback, feedback]
      };
    });
  };

  /**
   * Handle closing the feedback modal
   */
  const handleModalClose = () => {
    setShowFeedbackModal(false);
    setSelectedPhotoIndex(null);
  };

  /**
   * Handle finishing feedback selection for a photo
   */
  const handleDone = () => {
    if (selectedPhotoIndex) {
      const hasFeedback = photoFeedback[selectedPhotoIndex]?.length > 0;
      if (hasFeedback && !selectedPhotos.includes(selectedPhotoIndex)) {
        setSelectedPhotos(prev => [...prev, selectedPhotoIndex]);
      } else if (!hasFeedback && selectedPhotos.includes(selectedPhotoIndex)) {
        setSelectedPhotos(prev => prev.filter(id => id !== selectedPhotoIndex));
      }
    }
    handleModalClose();
  };

  /**
   * Handle going back in the flow
   */
  const handleBack = () => {
    if (showFeedback) {
      setShowFeedback(false);
      setIsComplete(false);
    } else if (currentPair > 0) {
      setCurrentPair(prev => prev - 1);
    } else {
      navigation.goBack();
    }
  };

  /**
   * Handle continuing to the next feedback type or screen
   */
  const handleContinue = () => {
    if (selectedPhotos.length < 2) {
      Alert.alert(`Please select 2 photos to provide ${feedbackType} feedback on`);
      return;
    }
    
    const incompletePhotos = selectedPhotos.filter(photoId => 
      !photoFeedback[photoId] || photoFeedback[photoId].length === 0
    );
    
    if (incompletePhotos.length > 0) {
      Alert.alert('Please provide feedback for all selected photos');
      return;
    }

    if (feedbackType === 'positive') {
      setFeedbackType('constructive');
      setSelectedPhotos([]);
      setPhotoFeedback({});
    } else {
      navigation.navigate('RateBio');
    }
  };

  // Get the current photo pair to display
  const [photo1Index, photo2Index] = photoPairs[currentPair];
  const photo1 = DUMMY_PROFILE.photos[photo1Index];
  const photo2 = DUMMY_PROFILE.photos[photo2Index];

  if (showFeedback) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Ionicons name="chevron-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.title}>
              {feedbackType === 'positive' ? 'Positive Feedback' : 'Constructive Feedback'}
            </Text>
            <View style={styles.backButton} />
          </View>

          <Text style={styles.subtitle}>
            Select 2 photos to provide {feedbackType} feedback on
          </Text>
          
          <ScrollView style={styles.feedbackContainer}>
            <View style={styles.gridContainer}>
              {DUMMY_PROFILE.photos.map((photo, index) => (
                <View key={photo.id} style={styles.photoFeedbackItem}>
                  <TouchableOpacity 
                    style={[
                      styles.photoSelectButton,
                      selectedPhotos.includes(index.toString()) && styles.selectedPhoto
                    ]}
                    onPress={() => handlePhotoSelect(index.toString())}
                  >
                    <Image
                      source={{ uri: photo.uri }}
                      style={styles.feedbackPhoto}
                    />
                    <View style={styles.photoOverlay}>
                      <Ionicons 
                        name={selectedPhotos.includes(index.toString()) ? "checkmark-circle" : "add-circle-outline"} 
                        size={24} 
                        color="#fff" 
                      />
                    </View>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </ScrollView>

          <Modal
            visible={showFeedbackModal}
            transparent={true}
            animationType="none"
            onRequestClose={handleModalClose}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    Select {feedbackType} feedback for this photo:
                  </Text>
                  <TouchableOpacity onPress={handleModalClose} style={styles.closeButton}>
                    <Ionicons name="close" size={24} color="#333" />
                  </TouchableOpacity>
                </View>
                
                <ScrollView style={styles.modalOptions}>
                  {FEEDBACK_OPTIONS[feedbackType].map((option, i) => (
                    <TouchableOpacity
                      key={i}
                      style={[
                        styles.feedbackOption,
                        selectedPhotoIndex && photoFeedback[selectedPhotoIndex]?.includes(option) && styles.selectedFeedback
                      ]}
                      onPress={() => selectedPhotoIndex && handleFeedbackSelect(selectedPhotoIndex, option)}
                    >
                      <Text style={styles.feedbackOptionText}>{option}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <TouchableOpacity 
                  style={styles.doneButton}
                  onPress={handleDone}
                >
                  <Text style={styles.doneButtonText}>Done</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          <TouchableOpacity 
            style={[
              styles.continueButton,
              selectedPhotos.length < 2 && styles.continueButtonDisabled
            ]} 
            onPress={handleContinue}
            disabled={selectedPhotos.length < 2}
          >
            <Text style={[
              styles.continueButtonText,
              selectedPhotos.length < 2 && styles.continueButtonTextDisabled
            ]}>
              Continue
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (isComplete) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.title}>Photo Ratings Complete!</Text>
          <Text style={styles.subtitle}>You've rated all the photos. Here are the results:</Text>
          
          <View style={styles.ratingsContainer}>
            {Object.entries(ratings).map(([photoId, rating]) => (
              <View key={photoId} style={styles.ratingItem}>
                <Image
                  source={{ uri: DUMMY_PROFILE.photos[parseInt(photoId)].uri }}
                  style={styles.ratingPhoto}
                />
                <Text style={styles.ratingText}>Rating: {rating}/10</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          {currentPair > 0 && (
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Ionicons name="chevron-back" size={24} color="#333" />
            </TouchableOpacity>
          )}
          {currentPair === 0 && <View style={styles.backButton} />}
          <Text style={styles.title}>Which photo do you prefer?</Text>
          <View style={styles.backButton} />
        </View>

        <Text style={styles.subtitle}>{currentPair + 1} of {photoPairs.length}</Text>
        
        <View style={[styles.photosContainer, { paddingBottom: insets.bottom + 32 }]}>
          <TouchableOpacity 
            style={styles.photoContainer}
            onPress={() => handlePreference(0)}
          >
            <Image
              source={{ uri: photo1.uri }}
              style={styles.photo}
            />
            <View style={styles.photoOverlay}>
              <Text style={styles.photoLabel}>Tap to choose</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.photoContainer}
            onPress={() => handlePreference(1)}
          >
            <Image
              source={{ uri: photo2.uri }}
              style={styles.photo}
            />
            <View style={styles.photoOverlay}>
              <Text style={styles.photoLabel}>Tap to choose</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const { width } = Dimensions.get('window');

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
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  photosContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 80,
    marginTop: 16,
  },
  photoContainer: {
    width: '80%',
    aspectRatio: 1.1,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 12,
  },
  photo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 12,
  },
  photoLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  ratingsContainer: {
    flex: 1,
    width: '100%',
    padding: 10,
  },
  ratingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 10,
  },
  ratingPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
  },
  continueButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  continueButtonDisabled: {
    backgroundColor: '#ccc',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  continueButtonTextDisabled: {
    color: '#666',
  },
  feedbackContainer: {
    flex: 1,
    width: '100%',
    padding: 10,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  photoFeedbackItem: {
    width: '48%',
    marginBottom: 20,
  },
  photoSelectButton: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  selectedPhoto: {
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  feedbackPhoto: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  feedbackOptions: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  feedbackOption: {
    padding: 10,
    marginBottom: 5,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedFeedback: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  feedbackOptionText: {
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  closeButton: {
    padding: 5,
  },
  modalOptions: {
    maxHeight: '60%',
  },
  doneButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RateScreen; 