import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RateStackParamList } from '../../navigation/types';

const DUMMY_PHOTOS = [
  { id: '1', uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=60' },
  { id: '2', uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=60' },
  { id: '3', uri: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=60' },
  { id: '4', uri: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop&q=60' },
  { id: '5', uri: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&auto=format&fit=crop&q=60' },
];

const DUMMY_PROFILE = {
  photos: DUMMY_PHOTOS,
  bio: "Adventure seeker and coffee enthusiast. Looking for someone to share life's little moments with. Love hiking, photography, and trying new restaurants. Always up for a spontaneous road trip or a quiet night in with a good book.",
  prompts: [
    { id: '1', question: "I'm looking for", answer: "Someone who can make me laugh and isn't afraid to be themselves. A partner in crime for adventures big and small." },
    { id: '2', question: "My ideal first date", answer: "Coffee and a walk in the park, followed by a visit to a local art gallery or museum. I love learning new things and sharing experiences." },
    { id: '3', question: "My perfect weekend", answer: "Starting with a morning hike, followed by brunch at a new spot. Afternoon spent reading or working on a creative project, and ending with a movie night or game night with friends." },
  ],
};

const RateScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RateStackParamList>>();
  const [currentPair, setCurrentPair] = useState(0);
  const [ratings, setRatings] = useState<{ [key: string]: number }>({});
  const [preferences, setPreferences] = useState<{ [key: string]: number }>({});
  const [isComplete, setIsComplete] = useState(false);

  const photoPairs: [number, number][] = [];
  for (let i = 0; i < DUMMY_PROFILE.photos.length; i++) {
    for (let j = i + 1; j < DUMMY_PROFILE.photos.length; j++) {
      photoPairs.push([i, j]);
    }
  }

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
      // All pairs have been rated
      const finalRatings = Object.entries(preferences).reduce((acc, [photoId, score]) => {
        // Normalize scores to 1-10 range
        const normalizedScore = Math.round(((score + photoPairs.length) / (photoPairs.length * 2)) * 9 + 1);
        return { ...acc, [photoId]: normalizedScore };
      }, {});
      setRatings(finalRatings);
      setIsComplete(true);
    }
  };

  const handleContinue = () => {
    navigation.navigate('RateBio');
  };

  const [photo1Index, photo2Index] = photoPairs[currentPair];
  const photo1 = DUMMY_PROFILE.photos[photo1Index];
  const photo2 = DUMMY_PROFILE.photos[photo2Index];

  if (isComplete) {
    return (
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
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Which photo do you prefer?</Text>
      <Text style={styles.subtitle}>{currentPair + 1} of {photoPairs.length}</Text>
      
      <View style={styles.photosContainer}>
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
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  photosContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  photoContainer: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
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
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RateScreen; 