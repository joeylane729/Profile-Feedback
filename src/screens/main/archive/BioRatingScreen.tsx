/**
 * BioRatingScreen.tsx
 *
 * This screen allows users to rate and provide feedback on a user's bio and prompts.
 * - Users can rate the bio and each prompt on a scale.
 * - Users can provide written feedback for the bio and prompts.
 * - State and logic are managed locally for demonstration purposes.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RateStackParamList } from '../../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../config/theme';

const DUMMY_PROFILE = {
  bio: "Adventure seeker and coffee enthusiast. Looking for someone to share life's little moments with. Love hiking, photography, and trying new restaurants. Always up for a spontaneous road trip or a quiet night in with a good book.",
  prompts: [
    { id: '1', question: "I'm looking for", answer: "Someone who can make me laugh and isn't afraid to be themselves. A partner in crime for adventures big and small." },
    { id: '2', question: "My ideal first date", answer: "Coffee and a walk in the park, followed by a visit to a local art gallery or museum. I love learning new things and sharing experiences." },
    { id: '3', question: "My perfect weekend", answer: "Starting with a morning hike, followed by brunch at a new spot. Afternoon spent reading or working on a creative project, and ending with a movie night or game night with friends." },
  ],
};

type RatingItem = {
  id: string;
  type: 'bio' | 'prompt';
  content: string;
  question?: string;
};

const BioRatingScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RateStackParamList>>();
  const [currentItem, setCurrentItem] = useState(0);
  const [ratings, setRatings] = useState<{ [key: string]: number }>({});
  const [scaleAnim] = useState(new Animated.Value(1));

  const items: RatingItem[] = [
    { id: 'bio', type: 'bio', content: DUMMY_PROFILE.bio },
    ...DUMMY_PROFILE.prompts.map(prompt => ({
      id: prompt.id,
      type: 'prompt' as const,
      question: prompt.question,
      content: prompt.answer
    }))
  ];

  const handleBack = () => {
    if (currentItem > 0) {
      setCurrentItem(prev => prev - 1);
    } else {
      navigation.goBack();
    }
  };

  const handleRating = (rating: number) => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.02,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();

    setRatings(prev => ({
      ...prev,
      [items[currentItem].id]: rating
    }));

    if (currentItem < items.length - 1) {
      setCurrentItem(prev => prev + 1);
    }
  };

  const handleNextProfile = () => {
    navigation.navigate('RatePhotos');
  };

  const current = items[currentItem];
  const isLastItem = currentItem === items.length - 1;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>
            {current.type === 'bio' ? 'Rate the Bio' : `Rate: ${current.question}`}
          </Text>
          <View style={styles.backButton} />
        </View>

        <Text style={styles.subtitle}>{currentItem + 1} of {items.length}</Text>
        
        <View style={styles.contentContainer}>
          <Animated.View style={[styles.contentCard, { transform: [{ scale: scaleAnim }] }]}>
            <Text style={styles.content}>{current.content}</Text>
          </Animated.View>
          
          <View style={styles.ratingButtons}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(rating => (
              <TouchableOpacity
                key={rating}
                style={[
                  styles.ratingButton,
                  ratings[current.id] === rating && styles.selectedRating
                ]}
                onPress={() => handleRating(rating)}
              >
                <Text style={[
                  styles.ratingButtonText,
                  ratings[current.id] === rating && styles.selectedRatingText
                ]}>
                  {rating}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {isLastItem && ratings[current.id] && (
            <TouchableOpacity 
              style={styles.nextProfileButton}
              onPress={handleNextProfile}
            >
              <Text style={styles.nextProfileButtonText}>Next Profile</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
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
    marginBottom: 20,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  contentCard: {
    backgroundColor: '#f5f5f5',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
  },
  ratingButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
  },
  ratingButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedRating: {
    backgroundColor: '#007AFF',
  },
  ratingButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  selectedRatingText: {
    color: '#fff',
  },
  nextProfileButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  nextProfileButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BioRatingScreen; 