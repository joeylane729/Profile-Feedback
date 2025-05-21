import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const PHOTO_SIZE = width - 48;

const DUMMY_PROFILE = {
  photos: [
    { id: '1', uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=60' },
    { id: '2', uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=60' },
  ],
  prompts: [
    { id: '1', question: "I'm looking for", answer: "Someone who can make me laugh and isn't afraid to be themselves." },
    { id: '2', question: "My ideal first date", answer: "Coffee and a walk in the park, followed by a visit to a local art gallery or museum." },
  ],
  age: 28,
  location: 'San Francisco, CA',
  job: 'Product Designer',
  school: 'Stanford University',
};

const DiscoverScreen = () => {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.card} showsVerticalScrollIndicator={false}>
        {/* Photos */}
        {DUMMY_PROFILE.photos.map(photo => (
          <Image key={photo.id} source={{ uri: photo.uri }} style={styles.photo} />
        ))}
        {/* Key Info */}
        <View style={styles.infoSection}>
          <Text style={styles.infoText}>Age: {DUMMY_PROFILE.age}</Text>
          <Text style={styles.infoText}>Location: {DUMMY_PROFILE.location}</Text>
          <Text style={styles.infoText}>Job: {DUMMY_PROFILE.job}</Text>
          <Text style={styles.infoText}>School: {DUMMY_PROFILE.school}</Text>
        </View>
        {/* Prompts */}
        <View style={styles.promptsSection}>
          {DUMMY_PROFILE.prompts.map(prompt => (
            <View key={prompt.id} style={styles.promptBox}>
              <Text style={styles.promptQuestion}>{prompt.question}</Text>
              <Text style={styles.promptAnswer}>{prompt.answer}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
      {/* Like/Dislike Buttons */}
      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="close" size={36} color="#ff3b30" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="heart" size={36} color="#4cd964" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  card: {
    padding: 24,
    alignItems: 'center',
    paddingBottom: 120,
  },
  photo: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: 16,
    marginBottom: 16,
    backgroundColor: '#eee',
  },
  infoSection: {
    marginBottom: 24,
    alignSelf: 'stretch',
  },
  infoText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  promptsSection: {
    alignSelf: 'stretch',
  },
  promptBox: {
    backgroundColor: '#f7f7f7',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
  },
  promptQuestion: {
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 6,
    color: '#222',
  },
  promptAnswer: {
    fontSize: 16,
    color: '#333',
  },
  actionBar: {
    position: 'absolute',
    bottom: 32,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  actionButton: {
    backgroundColor: '#fff',
    borderRadius: 32,
    padding: 18,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
});

export default DiscoverScreen; 