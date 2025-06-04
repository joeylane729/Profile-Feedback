import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, FlatList, ScrollView, Animated, PanResponder, NativeSyntheticEvent, NativeScrollEvent, TouchableWithoutFeedback, InteractionManager, ViewStyle } from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
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
    age: 28,
    location: 'San Francisco, CA',
    job: 'Product Designer',
    school: 'Stanford University',
    height: `5'7"`,
    gender: 'Female',
    languages: 'English, Spanish',
    religion: 'Agnostic',
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
  },
  {
    name: 'Alex',
    age: 31,
    location: 'New York, NY',
    job: 'Software Engineer',
    school: 'NYU',
    height: `6'0"`,
    gender: 'Male',
    languages: 'English, French',
    religion: 'None',
    photos: [
      { id: '1', uri: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=800&auto=format&fit=crop&q=60' },
      { id: '2', uri: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3fd9?w=800&auto=format&fit=crop&q=60' },
      { id: '3', uri: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=800&auto=format&fit=crop&q=60' },
    ],
    prompts: [
      { id: '1', question: "A fact about me", answer: "I once biked across the country." },
      { id: '2', question: "Favorite food", answer: "Sushi and tacos!" },
    ],
  },
  {
    name: 'Taylor',
    age: 26,
    location: 'Austin, TX',
    job: 'Photographer',
    school: 'UT Austin',
    height: `5'9"`,
    gender: 'Non-binary',
    languages: 'English',
    religion: 'Spiritual',
    photos: [
      { id: '1', uri: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=800&auto=format&fit=crop&q=60' },
      { id: '2', uri: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3fd9?w=800&auto=format&fit=crop&q=60' },
    ],
    prompts: [
      { id: '1', question: "My weekend plans", answer: "Hiking and brunch with friends." },
      { id: '2', question: "Best travel story", answer: "Got lost in Tokyo and found the best ramen shop." },
    ],
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
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [photoFeedback, setPhotoFeedback] = useState<{[key: string]: 'keep' | 'remove' | 'neutral'}>({});
  const [activeFeedback, setActiveFeedback] = useState<'keep' | 'remove' | 'neutral' | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const expandAnimation = useRef(new Animated.Value(0)).current;
  const pan = useRef(new Animated.Value(0)).current;
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const activePhotoAnim = useRef(new Animated.Value(0)).current;
  const profileOpacity = useRef(new Animated.Value(1)).current;
  const backButtonOpacity = useRef(new Animated.Value(0)).current;
  const buttonOpacity = useRef(new Animated.Value(1)).current;
  const removeButtonAnim = useRef(new Animated.Value(0)).current;
  const neutralButtonAnim = useRef(new Animated.Value(0)).current;
  const keepButtonAnim = useRef(new Animated.Value(0)).current;

  const profile = DUMMY_PROFILES[profileIndex];

  const getSelectedButtonStyle = (type: 'remove' | 'neutral' | 'keep') => {
    const currentPhotoId = profile.photos[activePhoto]?.id;
    const isSelected = activeFeedback === type;
    
    switch (type) {
      case 'remove':
        return {
          backgroundColor: isSelected ? 'rgba(239, 68, 68, 0.08)' : '#fff',
          borderColor: isSelected ? '#ef4444' : '#FCA5A5',
        };
      case 'neutral':
        return {
          backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.08)' : '#fff',
          borderColor: isSelected ? '#2563eb' : '#BFDBFE',
        };
      case 'keep':
        return {
          backgroundColor: isSelected ? 'rgba(16, 185, 129, 0.08)' : '#fff',
          borderColor: isSelected ? '#10b981' : '#6EE7B7',
        };
      default:
        return {};
    }
  };

  const handlePhotoFeedback = (photoId: string, feedback: 'keep' | 'remove' | 'neutral') => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setActiveFeedback(feedback);
    const nextPhotoFeedback = { ...photoFeedback, [photoId]: feedback };
    setPhotoFeedback(nextPhotoFeedback);

    // Show selected state for a moment before transitioning
    setTimeout(() => {
      if (activePhoto === profile.photos.length - 1) {
        setHasSeenLastPhoto(true);
        animateProgress((profile.photos.filter(p => nextPhotoFeedback[p.id]).length) / profile.photos.length);
        // Don't clear activeFeedback for the last photo
        setTimeout(() => {
          setIsTransitioning(false);
        }, 220);
      } else {
        InteractionManager.runAfterInteractions(() => {
          goToPhoto(activePhoto + 1);
          animateProgress((profile.photos.filter(p => nextPhotoFeedback[p.id]).length) / profile.photos.length);
          setTimeout(() => {
            setIsTransitioning(false);
            setActiveFeedback(null);
          }, 220);
        });
      }
    }, 300); // Show selected state for 300ms before transitioning
  };

  const goToPhoto = (index: number) => {
    if (index >= 0 && index < profile.photos.length) {
      flatListRef.current?.scrollToIndex({ index, animated: true });
      setActivePhoto(index);
      // Set active feedback based on the photo's feedback
      const photoId = profile.photos[index].id;
      if (photoFeedback[photoId]) {
        setActiveFeedback(photoFeedback[photoId]);
      }
      // Animate active dot
      Animated.spring(activePhotoAnim, {
        toValue: index,
        useNativeDriver: false,
        tension: 40,
        friction: 7,
      }).start();
    }
  };

  // Update activePhotoAnim on scroll as well
  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / PHOTO_CAROUSEL_WIDTH);
    setActivePhoto(index);
    // Set active feedback based on the photo's feedback
    const photoId = profile.photos[index].id;
    if (photoFeedback[photoId]) {
      setActiveFeedback(photoFeedback[photoId]);
    }
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
      setPhotoFeedback({}); // Reset photo feedback
      setActiveFeedback(null); // Reset active feedback
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
    if (!isProfileExpanded) {
      Animated.timing(expandAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      setIsProfileExpanded(true);
    } else {
      handleCloseProfile();
    }
  };

  // Animate popup down before closing
  const handleCloseProfile = () => {
    Animated.timing(expandAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsProfileExpanded(false);
      pan.setValue(0);
    });
  };

  // Progress: total number of photos with feedback
  const ratedCount = profile.photos.filter(p => photoFeedback[p.id]).length;
  const progress = ratedCount / profile.photos.length;

  // Animated progress value
  const progressAnim = useRef(new Animated.Value(0)).current;
  // We'll animate progress after the photo transitions
  const animateProgress = (toValue: number) => {
    Animated.timing(progressAnim, {
      toValue,
      duration: 350,
      useNativeDriver: false,
    }).start();
  };

  useEffect(() => {
    Animated.timing(backButtonOpacity, {
      toValue: activePhoto > 0 ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [activePhoto]);

  // Sync progressAnim with initial progress on mount and when profile changes
  useEffect(() => {
    animateProgress(progress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileIndex]);

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
          {/* Back Button Above Photo */}
          <Animated.View
            style={[styles.backButtonAbovePhoto, { opacity: backButtonOpacity }]}
            pointerEvents={activePhoto > 0 ? 'auto' : 'none'}
          >
            <TouchableOpacity 
              style={{ borderRadius: 14, padding: 2 }}
              onPress={() => goToPhoto(activePhoto - 1)}
            >
              <MaterialCommunityIcons name="arrow-u-left-top" size={24} color="#222" />
            </TouchableOpacity>
          </Animated.View>
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
              renderItem={({ item, index }) => (
                <View style={styles.photoWrapper}>
                  <Image source={{ uri: item.uri }} style={styles.photo} />
                </View>
              )}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              scrollEnabled={false}
            />
          </View>
          {/* Photo Feedback Buttons */}
          <View style={styles.photoFeedbackOverlay}>
            <View style={styles.photoFeedbackButtons}>
              <Animated.View style={[
                styles.photoFeedbackButton,
                styles.neutralOutlineButton,
                styles.removeButton,
                getSelectedButtonStyle('remove')
              ]}>
                <TouchableOpacity 
                  style={styles.photoFeedbackButtonContent}
                  onPress={() => handlePhotoFeedback(profile.photos[activePhoto].id, 'remove')}
                  activeOpacity={0.7}
                  disabled={isTransitioning}
                >
                  <MaterialCommunityIcons 
                    name="swap-horizontal" 
                    size={20} 
                    color={activeFeedback === 'remove' ? '#ef4444' : '#222'} 
                    style={{ marginRight: 4 }} 
                  />
                  <Text style={[
                    styles.photoFeedbackButtonText,
                    activeFeedback === 'remove' && { color: '#ef4444' }
                  ]}>Remove</Text>
                </TouchableOpacity>
              </Animated.View>

              <Animated.View style={[
                styles.photoFeedbackButton,
                styles.neutralOutlineButton,
                styles.neutralButton,
                getSelectedButtonStyle('neutral')
              ]}>
                <TouchableOpacity 
                  style={styles.photoFeedbackButtonContent}
                  onPress={() => handlePhotoFeedback(profile.photos[activePhoto].id, 'neutral')}
                  activeOpacity={0.7}
                  disabled={isTransitioning}
                >
                  <MaterialCommunityIcons 
                    name="circle-outline" 
                    size={20} 
                    color={activeFeedback === 'neutral' ? '#2563eb' : '#222'} 
                    style={{ marginRight: 4 }} 
                  />
                  <Text style={[
                    styles.photoFeedbackButtonText,
                    activeFeedback === 'neutral' && { color: '#2563eb' }
                  ]}>Neutral</Text>
                </TouchableOpacity>
              </Animated.View>

              <Animated.View style={[
                styles.photoFeedbackButton,
                styles.neutralOutlineButton,
                styles.keepButton,
                getSelectedButtonStyle('keep')
              ]}>
                <TouchableOpacity 
                  style={styles.photoFeedbackButtonContent}
                  onPress={() => handlePhotoFeedback(profile.photos[activePhoto].id, 'keep')}
                  activeOpacity={0.7}
                  disabled={isTransitioning}
                >
                  <MaterialCommunityIcons 
                    name="check" 
                    size={20} 
                    color={activeFeedback === 'keep' ? '#10b981' : '#222'} 
                    style={{ marginRight: 4 }} 
                  />
                  <Text style={[
                    styles.photoFeedbackButtonText,
                    activeFeedback === 'keep' && { color: '#10b981' }
                  ]}>Keep</Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </View>
          {/* View Profile Button with Progress */}
          <TouchableOpacity 
            style={styles.viewProfileButtonStacked}
            onPress={progress === 1 ? toggleProfile : undefined}
            disabled={progress !== 1}
          >
            <View style={styles.viewProfileButtonBackground}>
              <Animated.View 
                style={[
                  styles.viewProfileButtonProgress,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                    backgroundColor: progress === 1 ? '#666' : '#999',
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

      {/* Expandable Profile Section with Overlay */}
      {isProfileExpanded && (
        <View style={styles.popupOverlay}>
          <TouchableWithoutFeedback onPress={handleCloseProfile}>
            <View style={styles.popupOverlayBg} />
          </TouchableWithoutFeedback>
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
                onPress={handleCloseProfile}
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
              {/* About Me Section */}
              <View style={styles.sectionCard}>
                <Text style={styles.infoHeader}>About Me</Text>
                <View style={styles.aboutMeItemRow}><Ionicons name="briefcase-outline" size={18} color="#888" style={styles.aboutMeIcon} /><Text style={styles.infoText}>{profile.job}</Text></View>
                <View style={styles.aboutMeItemRow}><Ionicons name="school-outline" size={18} color="#888" style={styles.aboutMeIcon} /><Text style={styles.infoText}>{profile.school}</Text></View>
                <View style={styles.aboutMeItemRow}><Ionicons name="body-outline" size={18} color="#888" style={styles.aboutMeIcon} /><Text style={styles.infoText}>{profile.height}</Text></View>
                <View style={styles.aboutMeItemRow}><Ionicons name="male-female-outline" size={18} color="#888" style={styles.aboutMeIcon} /><Text style={styles.infoText}>{profile.gender}</Text></View>
                <View style={styles.aboutMeItemRow}><Ionicons name="language-outline" size={18} color="#888" style={styles.aboutMeIcon} /><Text style={styles.infoText}>{profile.languages}</Text></View>
                <View style={styles.aboutMeItemRow}><Ionicons name="book-outline" size={18} color="#888" style={styles.aboutMeIcon} /><Text style={styles.infoText}>{profile.religion}</Text></View>
              </View>
              <View style={styles.fullWidthDivider} />

              {/* Prompt Responses as a Single Section */}
              <View style={styles.promptsContainer}>
                {profile.prompts.map((prompt: any) => (
                  <View key={prompt.id} style={styles.promptBox}>
                    <Text style={styles.promptQuestion}>{prompt.question}</Text>
                    <Text style={styles.promptAnswer}>{prompt.answer}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.fullWidthDivider} />

              {/* Likelihood Section */}
              <View style={styles.likelihoodSectionCard}>
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
        </View>
      )}
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
    height: 400,
    position: 'relative',
    marginTop: 24,
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
    width: '100%',
    height: 400,
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
    zIndex: 21,
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
  infoHeader: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  infoText: {
    fontSize: 16,
    color: '#444',
    marginBottom: 4,
  },
  promptsSection: {
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  promptsContainer: {
  },
  promptBox: {
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  promptQuestion: {
    fontSize: 15,
    marginBottom: 4,
    color: '#222',
  },
  promptAnswer: {
    fontSize: 20,
    color: '#000',
    lineHeight: 28,
    fontWeight: '500',
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
  aboutMeCard: {
    backgroundColor: '#F5F6FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  promptsSectionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  promptsHeader: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  promptBoxInSection: {
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  likelihoodSectionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  aboutMeItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  aboutMeIcon: {
    marginRight: 10,
    width: 22,
    textAlign: 'center',
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 24,
    borderRadius: 1,
  },
  fullWidthDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 24,
    marginHorizontal: -24,
  },
  popupOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 200,
  },
  popupOverlayBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.12)',
  },
  photoFeedbackOverlay: {
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 16,
  },
  photoFeedbackButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginTop: 0,
  },
  photoFeedbackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 24,
    width: 100,
    height: 40,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 4,
    elevation: 2,
  },
  neutralOutlineButton: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB', // very light gray
  },
  removeButton: {
    borderColor: '#FCA5A5', // subtle red border
  },
  neutralButton: {
    borderColor: '#BFDBFE', // subtle blue border
  },
  keepButton: {
    borderColor: '#6EE7B7', // subtle green border
  },
  selectedRemoveButton: {
    borderColor: '#FDEAD7', // very light orange
  },
  selectedNeutralButton: {
    borderColor: '#E0E7FF', // very light blue
  },
  selectedKeepButton: {
    borderColor: '#D1FAE5', // very light green
  },
  selectedRemoveText: {
    color: '#F97316',
  },
  selectedNeutralText: {
    color: '#2563EB',
  },
  selectedKeepText: {
    color: '#059669',
  },
  photoFeedbackButtonText: {
    color: '#222',
    fontSize: 15,
    fontWeight: '400',
    letterSpacing: 0.3,
    fontFamily: 'System',
    textTransform: 'capitalize',
  },
  backButtonAbovePhoto: {
    position: 'absolute',
    left: 20,
    top: 80, // adjust as needed to sit just above the photo
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 2,
    zIndex: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 6,
  },
  photoFeedbackButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
});

export default DiscoverScreen; 