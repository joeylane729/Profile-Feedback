import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, FlatList, ScrollView, Animated, PanResponder, NativeSyntheticEvent, NativeScrollEvent, TouchableWithoutFeedback, InteractionManager, ViewStyle, Modal, TextInput, Keyboard, Platform, findNodeHandle, UIManager, KeyboardAvoidingView } from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { colors } from '../../config/theme';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { getRandomProfile, DiscoverProfile } from '../../services/profile';
import { useAuth } from '../../context/AuthContext';

const { width, height } = Dimensions.get('window');
const PHOTO_CAROUSEL_HEIGHT = height;
const PHOTO_CAROUSEL_WIDTH = width;
const PHOTO_SIZE = width;

const LIKE_OPTIONS = [
  { label: 'Not at all', value: 1 },
  { label: 'Maybe', value: 2 },
  { label: 'Probably', value: 3 },
  { label: 'Definitely', value: 4 },
];

const REQUIRED_CREDITS = 10;

const DiscoverScreen = () => {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const { token } = useAuth();
  const [currentProfile, setCurrentProfile] = useState<DiscoverProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activePhoto, setActivePhoto] = useState(0);
  const [isProfileExpanded, setIsProfileExpanded] = useState(false);
  const [hasSeenLastPhoto, setHasSeenLastPhoto] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [photoFeedback, setPhotoFeedback] = useState<{[key: string]: 'keep' | 'remove' | 'neutral'}>({});
  const [activeFeedback, setActiveFeedback] = useState<'keep' | 'remove' | 'neutral' | null>(null);
  const [promptFeedback, setPromptFeedback] = useState<{[key: string]: 'keep' | 'remove' | 'neutral'}>({});
  const [activePromptFeedback, setActivePromptFeedback] = useState<{[key: string]: 'keep' | 'remove' | 'neutral' | null}>({});
  const [selected, setSelected] = useState<null | 'left' | 'right'>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({
    gender: ['all'],
    age: [],
  });
  const [ageRange, setAgeRange] = useState([18, 35]);
  const animOpacity = useRef(new Animated.Value(1)).current;
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
  const [questionTextHeight, setQuestionTextHeight] = useState(40); // default guess
  const [credits, setCredits] = useState(7); // mock value, replace with real data as needed
  const [vibeAnswer, setVibeAnswer] = useState<string>('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const keyboardAwareScrollViewRef = useRef<KeyboardAwareScrollView>(null);
  const vibeTextInputRef = useRef<TextInput>(null);
  const vibeTextInputWrapperRef = useRef<View>(null);

  // Fetch a random profile
  const fetchRandomProfile = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      setError(null);
      const profile = await getRandomProfile(token);
      console.log('=== DISCOVER SCREEN: Fetched random profile ===');
      console.log('Profile:', profile.name);
      console.log('Photos:', profile.photos.length);
      console.log('Prompts:', profile.prompts.length);
      console.log('Full profile data:', JSON.stringify(profile, null, 2));
      setCurrentProfile(profile);
    } catch (err) {
      console.error('=== DISCOVER SCREEN: Error fetching profile ===', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  // Load initial profile
  useEffect(() => {
    fetchRandomProfile();
  }, [token]);

  // Progress: total number of photos with feedback
  const ratedCount = currentProfile ? currentProfile.photos.filter(p => photoFeedback[p.id]).length : 0;
  const progress = currentProfile && currentProfile.photos.length > 0 ? ratedCount / currentProfile.photos.length : 0;

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

  const getSelectedButtonStyle = (type: 'remove' | 'neutral' | 'keep') => {
    const currentPhotoId = currentProfile?.photos?.[activePhoto]?.id;
    const isSelected = activeFeedback === type;
    
    switch (type) {
      case 'remove':
        return {
          backgroundColor: isSelected ? 'rgba(239, 68, 68, 0.08)' : '#fff',
          borderColor: isSelected ? '#ef4444' : '#FCA5A5',
        };
      case 'neutral':
        return {
          backgroundColor: isSelected ? 'rgba(75, 85, 99, 0.08)' : '#fff',
          borderColor: isSelected ? '#4B5563' : '#9CA3AF',
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
    if (isTransitioning || !currentProfile) return;
    setIsTransitioning(true);
    setActiveFeedback(feedback);
    const nextPhotoFeedback = { ...photoFeedback, [photoId]: feedback };
    setPhotoFeedback(nextPhotoFeedback);

    // Show selected state for a moment before transitioning
    setTimeout(() => {
      if (activePhoto === currentProfile.photos.length - 1) {
        setHasSeenLastPhoto(true);
        animateProgress((currentProfile.photos.filter(p => nextPhotoFeedback[p.id]).length) / currentProfile.photos.length);
        // Don't clear activeFeedback for the last photo
        setTimeout(() => {
          setIsTransitioning(false);
        }, 220);
      } else {
        InteractionManager.runAfterInteractions(() => {
          goToPhoto(activePhoto + 1);
          animateProgress((currentProfile.photos.filter(p => nextPhotoFeedback[p.id]).length) / currentProfile.photos.length);
          setTimeout(() => {
            setIsTransitioning(false);
            setActiveFeedback(null);
          }, 220);
        });
      }
    }, 300); // Show selected state for 300ms before transitioning
  };

  const goToPhoto = (index: number) => {
    if (index >= 0 && index < (currentProfile?.photos?.length || 0)) {
      flatListRef.current?.scrollToIndex({ index, animated: true });
      setActivePhoto(index);
      // Set active feedback based on the photo's feedback
      const photoId = currentProfile?.photos?.[index]?.id;
      if (photoId && photoFeedback[photoId]) {
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
    const photoId = currentProfile?.photos?.[index]?.id;
    if (photoId && photoFeedback[photoId]) {
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
      // Increment credits first
      setCredits(prev => prev + 1);
      
      fetchRandomProfile();
      setActivePhoto(0);
      setIsProfileExpanded(false);
      setHasSeenLastPhoto(false);
      setPhotoFeedback({}); // Reset photo feedback
      setActiveFeedback(null); // Reset active feedback
      setPromptFeedback({}); // Reset prompt feedback
      setActivePromptFeedback({}); // Reset active prompt feedback
      setVibeAnswer(''); // Reset vibe answer
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

  const handlePromptFeedback = (promptId: string, feedback: 'keep' | 'remove' | 'neutral') => {
    setActivePromptFeedback(prev => ({ ...prev, [promptId]: feedback }));
    setPromptFeedback(prev => ({ ...prev, [promptId]: feedback }));
  };

  const getPromptButtonStyle = (promptId: string, type: 'remove' | 'neutral' | 'keep') => {
    const isSelected = activePromptFeedback[promptId] === type;
    
    switch (type) {
      case 'remove':
        return {
          backgroundColor: isSelected ? 'rgba(239, 68, 68, 0.08)' : '#fff',
          borderColor: isSelected ? '#ef4444' : '#FCA5A5',
        };
      case 'neutral':
        return {
          backgroundColor: isSelected ? 'rgba(75, 85, 99, 0.08)' : '#fff',
          borderColor: isSelected ? '#4B5563' : '#9CA3AF',
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
  }, [currentProfile]);

  // Add this helper function to check if all prompts have feedback
  const areAllPromptsRated = () => {
    return currentProfile?.prompts.every(prompt => promptFeedback[prompt.id]);
  };

  // Add this helper function to check if vibe question is answered
  const isVibeQuestionAnswered = () => {
    return vibeAnswer.trim().length > 0;
  };

  // Check if all required questions are answered
  const areAllQuestionsAnswered = () => {
    return areAllPromptsRated() && isVibeQuestionAnswered();
  };

  // Reset animOpacity and selected when profileIndex changes
  useEffect(() => {
    animOpacity.setValue(1);
    Animated.timing(profileOpacity, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
    setIsProfileExpanded(false);
    setActivePhoto(0);
    setSelected(null);
  }, [currentProfile]);

  // Credits progress header (copied from ProfileScreen)
  const renderHeader = () => {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Discover</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16 }}>
            <FontAwesome5 name="coins" size={18} color="#444" style={{ marginRight: 4 }} />
            <Text style={{ fontSize: 15, fontWeight: '400', marginLeft: 4, color: '#222' }}>{credits}</Text>
          </View>
          <TouchableOpacity 
            onPress={() => setShowFilterModal(true)}
          >
            <Ionicons name="filter" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const handleFilterSelect = (sectionId: string, optionId: string) => {
    setSelectedFilters(prev => {
      const currentSelections = prev[sectionId] || [];
      
      if (sectionId === 'gender') {
        if (optionId === 'all') {
          // If 'all' is selected, only keep 'all'
          return { ...prev, [sectionId]: ['all'] };
        } else {
          // If selecting individual options
          let newSelections = currentSelections.includes(optionId)
            ? currentSelections.filter(id => id !== optionId)
            : [...currentSelections.filter(id => id !== 'all'), optionId];
          
          // If this would be the third selection, switch to 'all' only
          if (newSelections.length === 3) {
            return { ...prev, [sectionId]: ['all'] };
          }
          
          // If 'all' was selected, start fresh with just this option
          if (currentSelections.includes('all')) {
            return { ...prev, [sectionId]: [optionId] };
          }
          
          // If no options are selected, default to 'all'
          if (newSelections.length === 0) {
            return { ...prev, [sectionId]: ['all'] };
          }
          
          return { ...prev, [sectionId]: newSelections };
        }
      }
      
      return prev;
    });
  };

  const handleAgeRangeChange = (values: number[]) => {
    const [min, max] = values;
    // Ensure minimum range of 5 years
    if (max - min < 5) {
      if (min === ageRange[0]) {
        setAgeRange([min, min + 5]);
      } else {
        setAgeRange([max - 5, max]);
      }
    } else {
      setAgeRange([min, max]);
    }
  };

  const renderFilterModal = () => (
    <Modal
      visible={showFilterModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowFilterModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.filterModal}>
          <View style={styles.filterHeader}>
            <Text style={styles.filterTitle}>Filters</Text>
            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          {/* Gender Filter */}
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Gender</Text>
            <View style={styles.filterOptions}>
              {[
                { id: 'all', label: 'All' },
                { id: 'men', label: 'Men' },
                { id: 'women', label: 'Women' },
                { id: 'non-binary', label: 'Non-binary' },
              ].map(option => {
                const isSelected = selectedFilters.gender?.includes(option.id);
                return (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.filterOption,
                      isSelected && styles.filterOptionActive
                    ]}
                    onPress={() => handleFilterSelect('gender', option.id)}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      isSelected && styles.filterOptionTextActive
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Age Range Filter */}
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Age Range</Text>
            <View style={styles.sliderContainer}>
              <MultiSlider
                values={ageRange}
                sliderLength={280}
                onValuesChange={handleAgeRangeChange}
                min={18}
                max={65}
                step={1}
                allowOverlap={false}
                snapped
                minMarkerOverlapDistance={35}
                selectedStyle={{
                  backgroundColor: '#222',
                }}
                unselectedStyle={{
                  backgroundColor: '#ddd',
                }}
                containerStyle={{
                  height: 40,
                }}
                trackStyle={{
                  height: 4,
                  backgroundColor: '#ddd',
                }}
                customMarker={(e) => (
                  <View style={[styles.markerContainer, { transform: [{ translateY: -12 }] }]}>
                    <Text style={styles.markerValue}>{e.currentValue}</Text>
                    <View style={styles.marker} />
                  </View>
                )}
              />
            </View>
          </View>

          <TouchableOpacity 
            style={styles.applyButton}
            onPress={() => setShowFilterModal(false)}
          >
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  useEffect(() => {
    const keyboardWillShow = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const keyboardWillHide = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSubscription = Keyboard.addListener(keyboardWillShow, (e) => {
      setKeyboardHeight(e.endCoordinates.height);
      setIsKeyboardVisible(true);
              setTimeout(() => {
          if (vibeTextInputWrapperRef.current && keyboardAwareScrollViewRef.current && e.endCoordinates.height > 0) {
            const scrollResponderRaw = keyboardAwareScrollViewRef.current.getScrollResponder && keyboardAwareScrollViewRef.current.getScrollResponder();
            const scrollResponder = scrollResponderRaw as any;
            const inputHandle = findNodeHandle(vibeTextInputWrapperRef.current);
            if (scrollResponder && typeof inputHandle === 'number') {
              scrollResponder.scrollResponderScrollNativeHandleToKeyboard(inputHandle, 16, true);
            }
          }
        }, 100);
    });

    const hideSubscription = Keyboard.addListener(keyboardWillHide, () => {
      setKeyboardHeight(0);
      setIsKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}> 
          <Text style={{ fontSize: 20, color: '#888' }}>Loading profiles...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}> 
          <Text style={{ fontSize: 20, color: '#888' }}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentProfile) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}> 
          <Text style={{ fontSize: 20, color: '#888' }}>No more profiles</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentProfile || !currentProfile.name) {
    console.log('=== DISCOVER SCREEN: Profile data missing ===');
    console.log('currentProfile:', currentProfile);
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}> 
          <Text style={{ fontSize: 20, color: '#888' }}>Profile data missing</Text>
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

  const animatedViewStyle = [
    styles.expandableProfile,
    {
      bottom: 0,
      transform: [{ translateY }],
    },
    { height: `100%` as const }
  ];
  const keyboardAwareScrollViewProps = {
    scrollEnabled: isProfileExpanded,
    bounces: false,
    enableOnAndroid: true,
    enableAutomaticScroll: true,
    extraScrollHeight: Platform.OS === 'ios' ? 0 : 20,
    paddingBottom: insets.bottom + tabBarHeight + 40
  };

  const popupAnimatedViewStyle = [
    styles.expandableProfile,
    {
      bottom: 0,
      transform: [{ translateY }],
      height: height * 0.8,
    }
  ];

  return (
    <>
      <SafeAreaView style={styles.safeArea}>
        {renderHeader()}
        {renderFilterModal()}
        <Animated.View style={[styles.container, { opacity: profileOpacity }]}>
          {/* Profile Name and Age */}
          <View style={{ alignItems: 'center', marginTop: 12, marginBottom: 0, flexDirection: 'row', justifyContent: 'center' }}>
            <Text style={{ fontSize: 26, fontWeight: 'bold', color: '#222' }}>{currentProfile.name}</Text>
            <Text style={{ fontSize: 24, color: '#222', marginLeft: 10, fontWeight: 'normal' }}>{currentProfile.age}</Text>
          </View>
          {/* Profile Location */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 8, marginTop: 6 }}>
            <Ionicons name="location-outline" size={18} color="#666" style={{ marginRight: 4 }} />
            <Text style={{ fontSize: 16, color: '#666' }}>{currentProfile.location}</Text>
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
              data={currentProfile.photos}
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
                  onPress={() => handlePhotoFeedback(currentProfile.photos[activePhoto].id, 'remove')}
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
                  onPress={() => handlePhotoFeedback(currentProfile.photos[activePhoto].id, 'neutral')}
                  activeOpacity={0.7}
                  disabled={isTransitioning}
                >
                  <MaterialCommunityIcons 
                    name="circle-outline" 
                    size={20} 
                    color={activeFeedback === 'neutral' ? '#4B5563' : '#222'} 
                    style={{ marginRight: 4 }} 
                  />
                  <Text style={[
                    styles.photoFeedbackButtonText,
                    activeFeedback === 'neutral' && { color: '#4B5563' }
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
                  onPress={() => handlePhotoFeedback(currentProfile.photos[activePhoto].id, 'keep')}
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
            style={popupAnimatedViewStyle}
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
            <KeyboardAwareScrollView
              ref={keyboardAwareScrollViewRef}
              style={styles.profileScroll}
              contentContainerStyle={[
                styles.profileContent,
                { paddingBottom: insets.bottom + tabBarHeight + 40 }
              ]}
              showsVerticalScrollIndicator={false}
              scrollEnabled={isProfileExpanded}
              bounces={false}
              enableOnAndroid={true}
              enableAutomaticScroll={true}
              keyboardShouldPersistTaps="handled"
              extraScrollHeight={Platform.OS === 'ios' ? 0 : 20}
            >
              {/* About Me Section */}
              <View style={styles.sectionCard}>
                <Text style={styles.infoHeader}>About Me</Text>
                <View style={styles.aboutMeItemRow}><Ionicons name="briefcase-outline" size={18} color="#888" style={styles.aboutMeIcon} /><Text style={styles.infoText}>{currentProfile.job}</Text></View>
                <View style={styles.aboutMeItemRow}><Ionicons name="school-outline" size={18} color="#888" style={styles.aboutMeIcon} /><Text style={styles.infoText}>{currentProfile.school}</Text></View>
                <View style={styles.aboutMeItemRow}><Ionicons name="body-outline" size={18} color="#888" style={styles.aboutMeIcon} /><Text style={styles.infoText}>{currentProfile.height}</Text></View>
                <View style={styles.aboutMeItemRow}><Ionicons name="male-female-outline" size={18} color="#888" style={styles.aboutMeIcon} /><Text style={styles.infoText}>{currentProfile.gender}</Text></View>
                <View style={styles.aboutMeItemRow}><Ionicons name="language-outline" size={18} color="#888" style={styles.aboutMeIcon} /><Text style={styles.infoText}>{currentProfile.languages}</Text></View>
                <View style={styles.aboutMeItemRow}><Ionicons name="book-outline" size={18} color="#888" style={styles.aboutMeIcon} /><Text style={styles.infoText}>{currentProfile.religion}</Text></View>
              </View>
              <View style={styles.fullWidthDivider} />

              {/* Prompt Responses as a Single Section */}
              <View style={styles.promptsContainer}>
                {currentProfile.prompts.map((prompt: any) => (
                  <View key={prompt.id} style={styles.promptBox}>
                    <Text style={styles.promptQuestion}>{prompt.question}</Text>
                    <Text style={styles.promptAnswer}>{prompt.answer}</Text>
                    <View style={styles.promptFeedbackButtons}>
                      <TouchableOpacity 
                        style={[styles.promptFeedbackButton, styles.neutralOutlineButton, styles.removeButton, getPromptButtonStyle(prompt.id, 'remove')]}
                        onPress={() => handlePromptFeedback(prompt.id, 'remove')}
                        activeOpacity={0.7}
                      >
                        <MaterialCommunityIcons 
                          name="swap-horizontal" 
                          size={16} 
                          color={activePromptFeedback[prompt.id] === 'remove' ? '#ef4444' : '#222'} 
                        />
                      </TouchableOpacity>

                      <TouchableOpacity 
                        style={[styles.promptFeedbackButton, styles.neutralOutlineButton, styles.neutralButton, getPromptButtonStyle(prompt.id, 'neutral')]}
                        onPress={() => handlePromptFeedback(prompt.id, 'neutral')}
                        activeOpacity={0.7}
                      >
                        <MaterialCommunityIcons 
                          name="circle-outline" 
                          size={16} 
                          color={activePromptFeedback[prompt.id] === 'neutral' ? '#4B5563' : '#222'} 
                        />
                      </TouchableOpacity>

                      <TouchableOpacity 
                        style={[styles.promptFeedbackButton, styles.neutralOutlineButton, styles.keepButton, getPromptButtonStyle(prompt.id, 'keep')]}
                        onPress={() => handlePromptFeedback(prompt.id, 'keep')}
                        activeOpacity={0.7}
                      >
                        <MaterialCommunityIcons 
                          name="check" 
                          size={16} 
                          color={activePromptFeedback[prompt.id] === 'keep' ? '#10b981' : '#222'} 
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
              <View style={styles.fullWidthDivider} />

              {/* Vibe Question Section */}
              <View style={{ marginBottom: 24 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#222', marginBottom: 8 }}>
                  What vibe does my profile give off?
                </Text>
                <View ref={vibeTextInputWrapperRef}>
                  <TextInput
                    ref={vibeTextInputRef}
                    style={{
                      borderWidth: 1,
                      borderColor: '#ddd',
                      borderRadius: 8,
                      padding: 12,
                      fontSize: 15,
                      backgroundColor: '#fff',
                      color: '#222',
                      minHeight: 48,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 2,
                      elevation: 1,
                    }}
                    placeholder="Describe the vibe you get from this profile..."
                    placeholderTextColor="#999"
                    value={vibeAnswer}
                    onChangeText={setVibeAnswer}
                    multiline
                  />
                </View>
              </View>
                              <View style={styles.likelihoodSectionCard}>
                  <Text style={styles.likelihoodQuestion}>How likely are you to like this person?</Text>
                  <View style={styles.likelihoodOptions}>
                    {LIKE_OPTIONS.map(option => (
                      <TouchableOpacity
                        key={option.value}
                        style={[
                          styles.likelihoodButton,
                          !areAllQuestionsAnswered() && styles.likelihoodButtonDisabled
                        ]}
                        onPress={handleOptionSelect}
                        disabled={!areAllQuestionsAnswered()}
                      >
                        <Text style={[
                          styles.likelihoodButtonText,
                          !areAllQuestionsAnswered() && styles.likelihoodButtonTextDisabled
                        ]}>{option.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  {!areAllQuestionsAnswered() && (
                    <Text style={styles.likelihoodHelperText}>
                      {!areAllPromptsRated() 
                        ? 'Please rate all prompts above to continue'
                        : 'Please answer the vibe question above to continue'
                      }
                    </Text>
                  )}
                </View>
            </KeyboardAwareScrollView>
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
    borderColor: '#9CA3AF', // darker grey border
  },
  keepButton: {
    borderColor: '#6EE7B7', // subtle green border
  },
  selectedRemoveButton: {
    borderColor: '#FDEAD7', // very light orange
  },
  selectedNeutralButton: {
    borderColor: '#4B5563', // darker grey
  },
  selectedKeepButton: {
    borderColor: '#D1FAE5', // very light green
  },
  selectedRemoveText: {
    color: '#F97316',
  },
  selectedNeutralText: {
    color: '#4B5563',
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
    top: 32,
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
  promptFeedbackButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  promptFeedbackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    width: 32,
    height: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  likelihoodButtonDisabled: {
    backgroundColor: '#f5f5f5',
    opacity: 0.7,
  },
  likelihoodButtonTextDisabled: {
    color: '#999',
  },
  likelihoodHelperText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterModal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
    padding: 24,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  filterTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  filterSection: {
    marginBottom: 24,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterOption: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    minWidth: 100,
  },
  filterOptionActive: {
    backgroundColor: '#222',
    borderColor: '#222',
  },
  filterOptionText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterOptionTextActive: {
    color: '#fff',
  },
  applyButton: {
    backgroundColor: '#222',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  sliderContainer: {
    paddingHorizontal: 8,
    marginTop: 8,
    alignItems: 'center',
  },
  markerContainer: {
    alignItems: 'center',
  },
  markerValue: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
    marginBottom: 4,
  },
  marker: {
    height: 24,
    width: 24,
    backgroundColor: '#222',
    borderRadius: 12,
  },
});

export default DiscoverScreen; 