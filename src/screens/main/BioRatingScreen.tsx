import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RateStackParamList } from '../../navigation/types';
import { Ionicons } from '@expo/vector-icons';

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
  const [isComplete, setIsComplete] = useState(false);
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
    if (isComplete) {
      setIsComplete(false);
      setCurrentItem(items.length - 1);
    } else if (currentItem > 0) {
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
    } else {
      setIsComplete(true);
    }
  };

  const handleContinue = () => {
    navigation.navigate('RatePhotos');
  };

  if (isComplete) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Ionicons name="chevron-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.title}>Rating Complete!</Text>
            <View style={styles.backButton} />
          </View>

          <Text style={styles.subtitle}>Here are your ratings:</Text>
          
          <ScrollView style={styles.ratingsContainer}>
            {items.map(item => (
              <View key={item.id} style={styles.ratingItem}>
                <Text style={styles.ratingLabel}>
                  {item.type === 'bio' ? 'Bio' : item.question}
                </Text>
                <View style={styles.ratingValueContainer}>
                  <Text style={styles.ratingValue}>
                    {ratings[item.id] || 'Not rated'}/10
                  </Text>
                  <View style={styles.ratingBarContainer}>
                    <View 
                      style={[
                        styles.ratingBar,
                        { width: `${((ratings[item.id] || 0) / 10) * 100}%` }
                      ]} 
                    />
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
            <Text style={styles.continueButtonText}>Continue to Next Profile</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const current = items[currentItem];

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
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
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
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    marginTop: 20,
  },
  contentCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    color: '#333',
  },
  ratingButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  ratingButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedRating: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  ratingButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  selectedRatingText: {
    color: '#fff',
  },
  ratingsContainer: {
    flex: 1,
    width: '100%',
    padding: 10,
  },
  ratingItem: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  ratingValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  ratingValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    minWidth: 50,
  },
  ratingBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  ratingBar: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  continueButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BioRatingScreen; 