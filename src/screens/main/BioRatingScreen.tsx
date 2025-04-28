import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainTabParamList } from '../../navigation/types';

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
  const navigation = useNavigation<NativeStackNavigationProp<MainTabParamList>>();
  const [currentItem, setCurrentItem] = useState(0);
  const [ratings, setRatings] = useState<{ [key: string]: number }>({});
  const [isComplete, setIsComplete] = useState(false);

  const items: RatingItem[] = [
    { id: 'bio', type: 'bio', content: DUMMY_PROFILE.bio },
    ...DUMMY_PROFILE.prompts.map(prompt => ({
      id: prompt.id,
      type: 'prompt' as const,
      question: prompt.question,
      content: prompt.answer
    }))
  ];

  const handleRating = (rating: number) => {
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
    navigation.navigate('Feedback');
  };

  if (isComplete) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Rating Complete!</Text>
        <Text style={styles.subtitle}>Here are your ratings:</Text>
        
        <ScrollView style={styles.ratingsContainer}>
          {items.map(item => (
            <View key={item.id} style={styles.ratingItem}>
              <Text style={styles.ratingLabel}>
                {item.type === 'bio' ? 'Bio' : item.question}
              </Text>
              <Text style={styles.ratingValue}>
                Rating: {ratings[item.id] || 'Not rated'}/10
              </Text>
            </View>
          ))}
        </ScrollView>

        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Continue to Feedback</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const current = items[currentItem];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {current.type === 'bio' ? 'Rate the Bio' : `Rate: ${current.question}`}
      </Text>
      <Text style={styles.subtitle}>{currentItem + 1} of {items.length}</Text>
      
      <View style={styles.contentContainer}>
        <Text style={styles.content}>{current.content}</Text>
        
        <View style={styles.ratingButtons}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(rating => (
            <TouchableOpacity
              key={rating}
              style={styles.ratingButton}
              onPress={() => handleRating(rating)}
            >
              <Text style={styles.ratingButtonText}>{rating}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

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
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 32,
    textAlign: 'center',
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
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  ratingsContainer: {
    flex: 1,
    width: '100%',
    padding: 10,
  },
  ratingItem: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  ratingValue: {
    fontSize: 14,
    color: '#666',
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

export default BioRatingScreen; 