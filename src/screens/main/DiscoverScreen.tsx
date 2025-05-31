import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, FlatList, ScrollView, Animated, PanResponder, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { colors } from '../../config/theme';

const { width, height } = Dimensions.get('window');
const PHOTO_CAROUSEL_HEIGHT = height;
const PHOTO_CAROUSEL_WIDTH = width;
const PHOTO_SIZE = width;

const DUMMY_PROFILES = [
  {
    name: 'Samantha',
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
    name: 'Alex',
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
    name: 'Taylor',
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

const LIKE_OPTIONS = [
  { label: 'Not at all', value: 1 },
  { label: 'Maybe', value: 2 },
  { label: 'Probably', value: 3 },
  { label: 'Definitely', value: 4 },
];

const DiscoverScreen = () => {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const [profileIndex, setProfileIndex] = useState(0);
  const [activePhoto, setActivePhoto] = useState(0);
  const [isProfileExpanded, setIsProfileExpanded] = useState(false);
  const [hasSeenLastPhoto, setHasSeenLastPhoto] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const expandAnimation = useRef(new Animated.Value(0)).current;
  const pan = useRef(new Animated.Value(0)).current;
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const activePhotoAnim = useRef(new Animated.Value(0)).current;
  const profileOpacity = useRef(new Animated.Value(1)).current;

  const profile = DUMMY_PROFILES[profileIndex];

  const goToPhoto = (index: number) => {
    if (index >= 0 && index < profile.photos.length) {
      flatListRef.current?.scrollToIndex({ index, animated: true });
      setActivePhoto(index);
      // Animate active dot
      Animated.spring(activePhotoAnim, {
        toValue: index,
        useNativeDriver: false,
        tension: 40,
        friction: 7,
      }).start();
      
      // If we've seen the last photo, keep progress at 100%
      if (hasSeenLastPhoto) {
        progressAnimation.setValue(1);
      } else {
        // Otherwise, animate progress normally
        Animated.timing(progressAnimation, {
          toValue: index / (profile.photos.length - 1),
          duration: 200,
          useNativeDriver: false,
        }).start();
      }

      // If we reach the last photo, enable the profile button
      if (index === profile.photos.length - 1) {
        setHasSeenLastPhoto(true);
      }
    }
  };

  // Update activePhotoAnim on scroll as well
  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / PHOTO_CAROUSEL_WIDTH);
    setActivePhoto(index);
    Animated.spring(activePhotoAnim, {
      toValue: index,
      useNativeDriver: false,
      tension: 40,
      friction: 7,
    }).start();
  };

  const handleOptionSelect = () => {
    // Fade out
    Animated.timing(profileOpacity, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setProfileIndex((prev) => (prev + 1) % DUMMY_PROFILES.length);
      setActivePhoto(0);
      setIsProfileExpanded(false);
      setHasSeenLastPhoto(false);
      expandAnimation.setValue(0);
      pan.setValue(0);
      progressAnimation.setValue(0);
      activePhotoAnim.setValue(0);
      flatListRef.current?.scrollToIndex({ index: 0, animated: false });
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
      // Fade in
      Animated.timing(profileOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to downward gestures on the top bar
        return gestureState.dy > 0;
      },
      onPanResponderGrant: () => {
        // Disable scrolling when starting to drag
        scrollViewRef.current?.setNativeProps({ scrollEnabled: false });
      },
      onPanResponderMove: (_, gestureState) => {
        // Only allow downward movement
        if (gestureState.dy > 0) {
          pan.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        // Re-enable scrolling
        scrollViewRef.current?.setNativeProps({ scrollEnabled: true });
        
        // If dragged down more than 50 units, hide the profile
        if (gestureState.dy > 50) {
          // Animate to full height
          Animated.timing(expandAnimation, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            // After animation completes, reset pan and update state
            pan.setValue(0);
            setIsProfileExpanded(false);
          });
        } else {
          // Spring back to original position
          Animated.spring(pan, {
            toValue: 0,
            useNativeDriver: true,
            tension: 40,
            friction: 7,
          }).start();
        }
      },
      onPanResponderTerminate: () => {
        // Re-enable scrolling if gesture is terminated
        scrollViewRef.current?.setNativeProps({ scrollEnabled: true });
      },
    })
  ).current;

  const toggleProfile = () => {
    const toValue = isProfileExpanded ? 0 : 1;
    Animated.timing(expandAnimation, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setIsProfileExpanded(!isProfileExpanded);
  };

  const getProgressWidth = () => {
    return ((activePhoto + 1) / profile.photos.length) * 100;
  };

  if (!profile) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}> 
          <Text style={{ fontSize: 20, color: '#888' }}>No more profiles</Text>
        </View>
      </SafeAreaView>
    );
  }

  const translateY = Animated.add(
    pan,
    expandAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [height, height * 0.2],
    })
  );

  return (
    <>
      <SafeAreaView style={styles.safeArea}>
        <Animated.View style={[styles.container, { opacity: profileOpacity }]}>
          {/* Profile Name and Age */}
          <View style={{ alignItems: 'center', marginTop: 36, marginBottom: 0, flexDirection: 'row', justifyContent: 'center' }}>
            <Text style={{ fontSize: 26, fontWeight: 'bold', color: '#222' }}>{profile.name}</Text>
            <Text style={{ fontSize: 24, color: '#222', marginLeft: 10, fontWeight: 'normal' }}>{profile.age}</Text>
          </View>
          {/* Profile Location */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 8, marginTop: 6 }}>
            <Ionicons name="location-outline" size={18} color="#666" style={{ marginRight: 4 }} />
            <Text style={{ fontSize: 16, color: '#666' }}>{profile.location}</Text>
          </View>
          {/* Photo Carousel */}
          <View style={styles.photoContainer}>
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
              onScroll={handleScroll}
              scrollEventThrottle={16}
            />
            {/* Tap zones for previous/next photo */}
            <TouchableOpacity
              style={[styles.photoTapZone, { left: 0 }]}
              onPress={() => goToPhoto(activePhoto - 1)}
              activeOpacity={0.1}
            />
            <TouchableOpacity
              style={[styles.photoTapZone, { right: 0 }]}
              onPress={() => goToPhoto(activePhoto + 1)}
              activeOpacity={0.1}
            />
          </View>
          {/* Dots Indicator */}
          <View style={styles.dotsContainerStacked}>
            {profile.photos.map((_: any, idx: number) => {
              const scale = activePhotoAnim.interpolate({
                inputRange: [idx - 1, idx, idx + 1],
                outputRange: [1, 1.5, 1],
                extrapolate: 'clamp',
              });
              const backgroundColor = activePhotoAnim.interpolate({
                inputRange: [idx - 1, idx, idx + 1],
                outputRange: [
                  'rgba(0,0,0,0.3)',
                  '#333',
                  'rgba(0,0,0,0.3)'
                ],
                extrapolate: 'clamp',
              });
              return (
                <Animated.View
                  key={idx}
                  style={[
                    styles.dot,
                    {
                      transform: [{ scale }],
                      backgroundColor,
                    },
                  ]}
                />
              );
            })}
          </View>
          {/* View Profile Button with Progress */}
          <TouchableOpacity 
            style={styles.viewProfileButtonStacked}
            onPress={hasSeenLastPhoto ? toggleProfile : undefined}
            disabled={!hasSeenLastPhoto}
          >
            <View style={styles.viewProfileButtonBackground}>
              <Animated.View 
                style={[
                  styles.viewProfileButtonProgress,
                  {
                    width: progressAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                    backgroundColor: progressAnimation.interpolate({
                      inputRange: [0, 0.99, 1],
                      outputRange: ['#999', '#999', '#666']
                    })
                  }
                ]} 
              />
            </View>
            <View style={styles.viewProfileButtonContent}>
              <Text style={styles.viewProfileText}>
                View Details
              </Text>
              <View style={styles.chevronRight}>
                <Ionicons 
                  name={isProfileExpanded ? 'chevron-down' : 'chevron-up'} 
                  size={24} 
                  color="#fff" 
                />
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>

      {/* Expandable Profile Section - Now outside SafeAreaView */}
      <Animated.View 
        style={[
          styles.expandableProfile, 
          { 
            bottom: 0,
            transform: [{ translateY }],
            height: height * 0.8
          }
        ]}
      >
        {/* Hide Profile Button with PanResponder */}
        <View {...panResponder.panHandlers}>
          <TouchableOpacity 
            style={styles.hideProfileButton}
            onPress={toggleProfile}
          >
            <View style={styles.hideProfileBar} />
          </TouchableOpacity>
        </View>
        <ScrollView
          ref={scrollViewRef}
          style={styles.profileScroll}
          contentContainerStyle={[
            styles.profileContent,
            { paddingBottom: insets.bottom + tabBarHeight + 40 }
          ]}
          showsVerticalScrollIndicator={false}
          scrollEnabled={isProfileExpanded}
          bounces={false}
        >
          {/* Key Info */}
          <View style={styles.infoSection}>
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
          {/* Like Likelihood Question */}
          <View style={styles.likelihoodSection}>
            <Text style={styles.likelihoodQuestion}>How likely are you to like this person?</Text>
            <View style={styles.likelihoodOptions}>
              {LIKE_OPTIONS.map(option => (
                <TouchableOpacity
                  key={option.value}
                  style={styles.likelihoodButton}
                  onPress={handleOptionSelect}
                >
                  <Text style={styles.likelihoodButtonText}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </Animated.View>
    </>
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
  photoContainer: {
    flex: 1,
    position: 'relative',
  },
  carousel: {
    flex: 1,
  },
  carouselContent: {
    alignItems: 'center',
  },
  photoWrapper: {
    width: PHOTO_CAROUSEL_WIDTH,
    height: PHOTO_CAROUSEL_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photo: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    resizeMode: 'cover',
  },
  photoTapZone: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: PHOTO_CAROUSEL_WIDTH / 2,
    zIndex: 2,
  },
  dotsContainer: {
    // ... remove absolute positioning ...
  },
  dotsContainerStacked: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#fff',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  viewProfileButton: {
    display: 'none', // hide old style
  },
  viewProfileButtonStacked: {
    height: 48,
    marginHorizontal: 90,
    marginTop: 8,
    marginBottom: 24,
    overflow: 'hidden',
    borderRadius: 24,
    backgroundColor: 'transparent',
  },
  viewProfileButtonBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  viewProfileButtonProgress: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: '#666',
  },
  viewProfileButtonContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    position: 'relative',
  },
  viewProfileText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  chevronRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
  },
  expandableProfile: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    zIndex: 10,
  },
  hideProfileButton: {
    width: '100%',
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  hideProfileBar: {
    width: 40,
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
  },
  profileScroll: {
    flex: 1,
  },
  profileContent: {
    paddingTop: 16,
    paddingHorizontal: 24,
  },
  infoSection: {
    marginBottom: 0,
    paddingHorizontal: 32,
  },
  infoText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  promptsSection: {
    paddingBottom: 24,
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
  likelihoodSection: {
    marginTop: 32,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  likelihoodQuestion: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#222',
    textAlign: 'center',
  },
  likelihoodOptions: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  likelihoodButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    margin: 6,
  },
  likelihoodButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
});

export default DiscoverScreen; 