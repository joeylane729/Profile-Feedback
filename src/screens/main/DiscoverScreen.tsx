import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Swiper from 'react-native-deck-swiper';

const { width } = Dimensions.get('window');
const PHOTO_CAROUSEL_HEIGHT = Math.round(width * 0.7);
const PHOTO_CAROUSEL_WIDTH = width;
const PHOTO_SIZE = Math.round(width * 0.7);

const DUMMY_PROFILES = [
  {
    photos: [
      { id: '1', uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=60' },
      { id: '2', uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=60' },
      { id: '3', uri: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=60' },
      { id: '4', uri: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop&q=60' },
      { id: '5', uri: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&auto=format&fit=crop&q=60' },
    ],
    prompts: [
      { id: '1', question: "I'm looking for", answer: "Someone who can make me laugh and isn't afraid to be themselves." },
      { id: '2', question: "My ideal first date", answer: "Coffee and a walk in the park, followed by a visit to a local art gallery or museum." },
    ],
    age: 28,
    location: 'San Francisco, CA',
    job: 'Product Designer',
    school: 'Stanford University',
  },
  {
    photos: [
      { id: '1', uri: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=800&auto=format&fit=crop&q=60' },
      { id: '2', uri: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3fd9?w=800&auto=format&fit=crop&q=60' },
      { id: '3', uri: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=800&auto=format&fit=crop&q=60' },
    ],
    prompts: [
      { id: '1', question: "A fact about me", answer: "I once biked across the country." },
      { id: '2', question: "Favorite food", answer: "Sushi and tacos!" },
    ],
    age: 31,
    location: 'New York, NY',
    job: 'Software Engineer',
    school: 'NYU',
  },
  {
    photos: [
      { id: '1', uri: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=800&auto=format&fit=crop&q=60' },
      { id: '2', uri: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3fd9?w=800&auto=format&fit=crop&q=60' },
    ],
    prompts: [
      { id: '1', question: "My weekend plans", answer: "Hiking and brunch with friends." },
      { id: '2', question: "Best travel story", answer: "Got lost in Tokyo and found the best ramen shop." },
    ],
    age: 26,
    location: 'Austin, TX',
    job: 'Photographer',
    school: 'UT Austin',
  },
];

const DiscoverCard = ({ profile, insets }: { profile: any; insets: any }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  return (
    <View style={[styles.card, { paddingTop: insets.top }]}> 
      {/* Photo Carousel */}
      <FlatList
        ref={flatListRef}
        data={profile.photos}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        style={styles.carousel}
        contentContainerStyle={styles.carouselContent}
        renderItem={({ item }) => (
          <View style={styles.photoWrapper}>
            <Image source={{ uri: item.uri }} style={styles.photo} />
          </View>
        )}
        onScroll={e => {
          const index = Math.round(e.nativeEvent.contentOffset.x / PHOTO_CAROUSEL_WIDTH);
          setActiveIndex(index);
        }}
        scrollEventThrottle={16}
      />
      {/* Dots Indicator */}
      <View style={styles.dotsContainer}>
        {profile.photos.map((_: any, idx: number) => (
          <View key={idx} style={[styles.dot, activeIndex === idx && styles.activeDot]} />
        ))}
      </View>
      {/* Key Info */}
      <View style={styles.infoSection}>
        <Text style={styles.infoText}>Age: {profile.age}</Text>
        <Text style={styles.infoText}>Location: {profile.location}</Text>
        <Text style={styles.infoText}>Job: {profile.job}</Text>
        <Text style={styles.infoText}>School: {profile.school}</Text>
      </View>
      {/* Prompts */}
      <View style={styles.promptsSection}>
        {profile.prompts.map((prompt: any) => (
          <View key={prompt.id} style={styles.promptBox}>
            <Text style={styles.promptQuestion}>{prompt.question}</Text>
            <Text style={styles.promptAnswer}>{prompt.answer}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const DiscoverScreen = () => {
  const insets = useSafeAreaInsets();
  const swiperRef = useRef<any>(null);

  const handleLike = () => {
    swiperRef.current?.swipeRight();
  };
  const handleDislike = () => {
    swiperRef.current?.swipeLeft();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Swiper
          ref={swiperRef}
          cards={DUMMY_PROFILES}
          renderCard={profile => <DiscoverCard profile={profile} insets={insets} />}
          cardIndex={0}
          backgroundColor="transparent"
          stackSize={2}
          stackSeparation={15}
          showSecondCard
          animateCardOpacity
          disableTopSwipe
          disableBottomSwipe
          verticalSwipe={false}
          onSwipedAll={() => {}}
          containerStyle={{ flex: 1, marginBottom: 0 }}
          cardVerticalMargin={0}
        />
        {/* Like/Dislike Buttons */}
        <View style={styles.actionBar}>
          <TouchableOpacity style={styles.actionButton} onPress={handleDislike}>
            <Ionicons name="close" size={36} color="#ff3b30" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
            <Ionicons name="heart" size={36} color="#4cd964" />
          </TouchableOpacity>
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
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  card: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingBottom: 140,
    paddingHorizontal: 0,
    marginHorizontal: 0,
    marginVertical: 0,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  carousel: {
    maxHeight: PHOTO_CAROUSEL_HEIGHT,
    marginTop: 0,
  },
  carouselContent: {
    alignItems: 'center',
    paddingHorizontal: 0,
  },
  photoWrapper: {
    width: PHOTO_CAROUSEL_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photo: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: 24,
    backgroundColor: '#eee',
    resizeMode: 'cover',
    marginBottom: 8,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#bbb',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#007AFF',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  infoSection: {
    marginBottom: 16,
    alignSelf: 'stretch',
    paddingHorizontal: 32,
  },
  infoText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  promptsSection: {
    paddingBottom: 24,
    alignSelf: 'stretch',
    paddingHorizontal: 24,
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
    bottom: 8,
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