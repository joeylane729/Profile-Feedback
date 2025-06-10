/**
 * FeedbackScreen.tsx
 *
 * This screen displays feedback and ratings for the user's photos and prompts.
 * - Users can view ranked photos, feedback summaries, and detailed feedback for each photo.
 * - Users can page through their photos and see feedback for each.
 * - Users can view prompt questions and answers, and see feedback for each prompt.
 *
 * State and logic are managed locally for demonstration purposes.
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions, TextInput, Modal, Animated, PanResponder } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../config/theme';

type PhotoFeedback = {
  comment: string;
  count: number;
};

type PhotoBreakdown = {
  5: number;
  4: number;
  3: number;
  2: number;
  1: number;
};

type Photo = {
  id: string;
  uri: string;
  rating: number;
  totalRatings: number;
  breakdown: PhotoBreakdown;
  feedback: PhotoFeedback[];
  ratings?: { keep: number; neutral: number; remove: number };
};

// Dummy data - in a real app, this would come from your backend
const DUMMY_FEEDBACK = {
  totalRatings: 42,
  photos: [
    { 
      id: '1', 
      uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=60', 
      ratings: { keep: 18, neutral: 12, remove: 2 },
    },
    { 
      id: '2', 
      uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=60', 
      ratings: { keep: 10, neutral: 20, remove: 5 },
    },
    { id: '3', uri: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=60', ratings: { keep: 5, neutral: 10, remove: 10 } },
    { id: '4', uri: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop&q=60', ratings: { keep: 2, neutral: 8, remove: 15 } },
    { id: '5', uri: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&auto=format&fit=crop&q=60', ratings: { keep: 15, neutral: 5, remove: 1 } },
  ] as Photo[],
  bio: {
    rating: 4.4,
    totalRatings: 42,
    breakdown: {
      5: 20,
      4: 15,
      3: 5,
      2: 1,
      1: 1
    },
    feedback: [
      { comment: "Feels authentic and genuine.", count: 15 },
      { comment: "Shows great personality!", count: 12 },
      { comment: "Made me smile — love the vibe.", count: 8 },
      { comment: "This doesn't tell me much about you.", count: 4 },
      { comment: "Feels a bit generic — try something more personal.", count: 3 }
    ]
  },
  prompts: [
    {
      id: '1',
      question: "I'm looking for",
      response: "Someone who loves hiking and outdoor adventures. I want to find a partner who shares my passion for exploring nature and trying new experiences.",
      rating: 4.6,
      totalRatings: 42,
      breakdown: {
        5: 25,
        4: 12,
        3: 3,
        2: 1,
        1: 1
      },
      feedback: [
        { comment: "Unique and memorable.", count: 18 },
        { comment: "This makes me want to know more.", count: 12 },
        { comment: "Too vague — give a clearer example.", count: 5 },
        { comment: "Could show more warmth or personality.", count: 4 },
        { comment: "Comes off a little negative or closed-off.", count: 3 }
      ]
    },
    {
      id: '2',
      question: "My ideal first date",
      response: "A casual coffee followed by a walk in the park. I love getting to know someone in a relaxed setting where we can really talk and connect.",
      rating: 4.2,
      totalRatings: 42,
      breakdown: {
        5: 18,
        4: 15,
        3: 6,
        2: 2,
        1: 1
      },
      feedback: [
        { comment: "Shows great personality!", count: 16 },
        { comment: "Made me smile — love the vibe.", count: 12 },
        { comment: "Feels a bit generic — try something more personal.", count: 8 },
        { comment: "Too vague — give a clearer example.", count: 4 },
        { comment: "This doesn't tell me much about you.", count: 2 }
      ]
    },
    {
      id: '3',
      question: "My perfect weekend",
      response: "Starting with a morning hike, followed by brunch at my favorite local spot. Then maybe some time at the beach or exploring a new neighborhood in the city.",
      rating: 4.0,
      totalRatings: 42,
      breakdown: {
        5: 15,
        4: 16,
        3: 8,
        2: 2,
        1: 1
      },
      feedback: [
        { comment: "Feels authentic and genuine.", count: 14 },
        { comment: "This makes me want to know more.", count: 10 },
        { comment: "Could show more warmth or personality.", count: 8 },
        { comment: "Too vague — give a clearer example.", count: 6 },
        { comment: "Comes off a little negative or closed-off.", count: 4 }
      ]
    }
  ]
};

const RatingBar = ({ count, total, rating }: { count: number; total: number; rating: number }) => {
  const percentage = (count / total) * 100;
  return (
    <View style={styles.ratingBarContainer}>
      <Text style={styles.ratingLabel}>{rating} stars</Text>
      <View style={styles.ratingBarBackground}>
        <View style={[styles.ratingBarFill, { width: `${percentage}%` }]} />
      </View>
      <Text style={styles.ratingCount}>{count}</Text>
    </View>
  );
};

const FeedbackComment = ({ comment, count }: { comment: string; count: number }) => {
  const isPositive = !comment.includes("doesn't") && !comment.includes("generic") && 
                    !comment.includes("vague") && !comment.includes("negative");
  
  return (
    <View style={styles.feedbackItem}>
      <View style={[styles.feedbackBubble, isPositive ? styles.positiveFeedback : styles.negativeFeedback]}>
        <Text style={styles.feedbackText}>{comment}</Text>
      </View>
      <Text style={styles.feedbackCount}>{count} people</Text>
    </View>
  );
};

const PHOTOS_PER_PAGE = 12;

const PhotoFeedbackModal = ({ photo, visible, onClose }: { photo: Photo | null, visible: boolean, onClose: () => void }) => {
  if (!photo) return null;

  // Add safety check for feedback array
  const feedbackArray = Array.isArray(photo.feedback) ? photo.feedback : [];
  
  // Sort feedback by count and take top 3
  const topFeedback = [...feedbackArray]
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Photo Feedback</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
            <Image source={{ uri: photo.uri }} style={styles.modalPhoto} />

            <View style={styles.feedbackContainer}>
              <Text style={styles.feedbackTitle}>Top Feedback</Text>
              {topFeedback.length > 0 ? (
                topFeedback.map((item, index) => (
                  <FeedbackComment key={index} comment={item.comment} count={item.count} />
                ))
              ) : (
                <Text style={styles.noFeedbackText}>No feedback yet</Text>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// Updated colors for better visual balance
const KEEP_COLOR = '#22c55e';
const NEUTRAL_COLOR = '#e5e7eb';
const REMOVE_COLOR = '#ef233c';

// Refactor PhotoBarChart to split bar and numbers
const PhotoBarChart = ({ keep, neutral, remove, style }: { keep: number; neutral: number; remove: number; style?: any }) => {
  const total = keep + neutral + remove;
  const keepPct = total ? keep / total : 0;
  const removePct = total ? remove / total : 0;
  const neutralPct = total ? neutral / total : 0;
  const BAR_WIDTH = 180;
  const BAR_HEIGHT = 28;
  const minLabelWidth = 28;

  // Animated values for each segment
  const keepAnim = useRef(new Animated.Value(0)).current;
  const removeAnim = useRef(new Animated.Value(0)).current;
  const neutralAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    keepAnim.setValue(0);
    removeAnim.setValue(0);
    neutralAnim.setValue(0);
    
    Animated.parallel([
      Animated.timing(keepAnim, {
        toValue: keepPct,
        duration: 800,
        useNativeDriver: false,
      }),
      Animated.timing(removeAnim, {
        toValue: removePct,
        duration: 1000,
        useNativeDriver: false,
      }),
      Animated.timing(neutralAnim, {
        toValue: neutralPct,
        duration: 1200,
        useNativeDriver: false,
      }),
    ]).start();
  }, [keepPct, removePct, neutralPct, keepAnim, removeAnim, neutralAnim]);

  // Helper for below label
  const BelowLabel = ({ value, color }: { value: number; color: string }) => (
    <Text style={{ color, fontWeight: '600', fontSize: 13, opacity: 0.7, textAlign: 'center', marginTop: 2 }}>{value}</Text>
  );

  return (
    <View style={[{ flexDirection: 'column', alignItems: 'center' }, style]}>
      <View style={{ width: BAR_WIDTH, height: BAR_HEIGHT, flexDirection: 'row', borderRadius: 8, overflow: 'hidden', backgroundColor: 'transparent' }}>
        <Animated.View style={{ flex: keepAnim, backgroundColor: KEEP_COLOR, minWidth: keep ? 2 : 0 }} />
        <Animated.View style={{ flex: removeAnim, backgroundColor: REMOVE_COLOR, minWidth: remove ? 2 : 0 }} />
        <Animated.View style={{ flex: neutralAnim, backgroundColor: NEUTRAL_COLOR, minWidth: neutral ? 2 : 0 }} />
      </View>
      {/* Always show all numbers below */}
      <View style={{ width: BAR_WIDTH, flexDirection: 'row', marginTop: 2 }}>
        <View style={{ flex: keep, alignItems: 'center', minWidth: keep ? 2 : 0 }}>
          {keep > 0 && <BelowLabel value={keep} color={KEEP_COLOR} />}
        </View>
        <View style={{ flex: remove, alignItems: 'center', minWidth: remove ? 2 : 0 }}>
          {remove > 0 && <BelowLabel value={remove} color={REMOVE_COLOR} />}
        </View>
        <View style={{ flex: neutral, alignItems: 'center', minWidth: neutral ? 2 : 0 }}>
          {neutral > 0 && <BelowLabel value={neutral} color={'#888'} />}
        </View>
      </View>
    </View>
  );
};

const FeedbackScreen = () => {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [activeTab, setActiveTab] = useState<'photos' | 'prompts'>('photos');
  const translateX = useRef(new Animated.Value(0)).current;
  const { width } = Dimensions.get('window');
  const gestureStartTab = useRef<'photos' | 'prompts'>(activeTab);
  const isSwiping = useRef(false);

  // Calculate score for each photo and sort
  const sortedPhotos = DUMMY_FEEDBACK.photos
    .map(photo => ({ ...photo, score: (photo.ratings?.keep || 0) - (photo.ratings?.remove || 0) }))
    .sort((a, b) => b.score - a.score);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => false,
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return Math.abs(gestureState.dx) > 5 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
    },
    onPanResponderGrant: () => {
      gestureStartTab.current = activeTab;
      isSwiping.current = true;
    },
    onPanResponderMove: (_, gestureState) => {
      const baseX = gestureStartTab.current === 'photos' ? 0 : -width;
      const newX = baseX + (gestureState.dx * 0.5);
      translateX.setValue(newX);
    },
    onPanResponderRelease: (_, gestureState) => {
      const SWIPE_THRESHOLD = width * 0.2;
      const baseX = gestureStartTab.current === 'photos' ? 0 : -width;
      const relativeX = gestureState.dx;
      isSwiping.current = false;
      
      if (relativeX > SWIPE_THRESHOLD && gestureStartTab.current !== 'photos') {
        setActiveTab('photos');
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }).start();
      } else if (relativeX < -SWIPE_THRESHOLD && gestureStartTab.current !== 'prompts') {
        setActiveTab('prompts');
        Animated.spring(translateX, {
          toValue: -width,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }).start();
      } else {
        Animated.spring(translateX, {
          toValue: baseX,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }).start();
      }
    },
  });

  useEffect(() => {
    if (isSwiping.current) return;
    const toValue = activeTab === 'photos' ? 0 : -width;
    Animated.spring(translateX, {
      toValue,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  }, [activeTab, width]);

  const renderContent = () => {
    if (activeTab === 'photos') {
      return (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.totalReviewsText}>{DUMMY_FEEDBACK.totalRatings} total reviews</Text>
            <View style={styles.photoList}>
              {sortedPhotos.map((photo, index) => {
                const keeps = photo.ratings?.keep || 0;
                const neutrals = photo.ratings?.neutral || 0;
                const removes = photo.ratings?.remove || 0;
                return (
                  <View key={photo.id} style={styles.photoCard}>
                    <View style={styles.photoRow}>
                      <Image source={{ uri: photo.uri }} style={styles.photoListImage} />
                      <View style={styles.photoBarChartCol}>
                        <View style={styles.menuRow}>
                          <TouchableOpacity>
                            <Ionicons name="ellipsis-horizontal" size={24} color="#888" />
                          </TouchableOpacity>
                        </View>
                        <View style={styles.scoreRow}>
                          <MaterialCommunityIcons name="swap-vertical" size={26} color={'#000'} style={{ marginRight: 4 }} />
                          <Text style={[styles.scoreText, { color: (keeps - removes) > 0 ? '#22c55e' : (keeps - removes) < 0 ? '#ef4444' : '#888', marginLeft: 0 }]}>{(keeps - removes) > 0 ? '+' : ''}{keeps - removes}</Text>
                        </View>
                        <PhotoBarChart keep={keeps} neutral={neutrals} remove={removes} />
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </ScrollView>
      );
    }
    return (
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.totalReviewsText}>{DUMMY_FEEDBACK.totalRatings} total reviews</Text>
          <View style={styles.photoList}>
            {DUMMY_FEEDBACK.prompts.map((prompt) => {
              const keeps = prompt.breakdown[5] + prompt.breakdown[4];
              const neutrals = prompt.breakdown[3];
              const removes = prompt.breakdown[2] + prompt.breakdown[1];
              return (
                <View key={prompt.id} style={styles.photoCard}>
                  <View style={styles.promptHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ 
                        fontSize: 15, 
                        fontWeight: '600', 
                        color: '#333', 
                        marginBottom: 6
                      }}>Q: {prompt.question}</Text>
                      <Text style={{ 
                        fontSize: 14, 
                        color: '#444', 
                        lineHeight: 20
                      }}>A: {prompt.response}</Text>
                    </View>
                    <TouchableOpacity>
                      <Ionicons name="ellipsis-horizontal" size={24} color="#888" />
                    </TouchableOpacity>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 28, marginTop: 12 }}>
                    <MaterialCommunityIcons name="swap-vertical" size={26} color={'#000'} style={{ marginRight: 4 }} />
                    <Text style={[styles.scoreText, { color: (keeps - removes) > 0 ? '#22c55e' : (keeps - removes) < 0 ? '#ef4444' : '#888', marginLeft: 0, marginRight: 0 }]}>{(keeps - removes) > 0 ? '+' : ''}{keeps - removes}</Text>
                    <View style={{ width: 220, height: 28, justifyContent: 'center', paddingRight: 0 }}>
                      <PhotoBarChart keep={keeps} neutral={neutrals} remove={removes} style={{ position: 'absolute', top: 0, right: 0 }} />
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Feedback</Text>
        </View>
        <View style={styles.tabBar}>
          <TouchableOpacity onPress={() => setActiveTab('photos')} style={[styles.tabItem, activeTab === 'photos' && styles.activeTabItem]}>
            <Text style={[styles.tabText, activeTab === 'photos' && styles.activeTabText]}>Photos</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab('prompts')} style={[styles.tabItem, activeTab === 'prompts' && styles.activeTabItem]}>
            <Text style={[styles.tabText, activeTab === 'prompts' && styles.activeTabText]}>Prompts</Text>
          </TouchableOpacity>
        </View>
        <View {...panResponder.panHandlers} style={{ flex: 1, overflow: 'hidden' }}>
          <Animated.View style={[
            styles.content,
            {
              transform: [{ translateX }],
              width: width * 2,
              flexDirection: 'row',
            }
          ]}>
            <View style={{ width }}>
              {renderContent()}
            </View>
            <View style={{ width }}>
              {renderContent()}
            </View>
          </Animated.View>
        </View>
        <PhotoFeedbackModal 
          photo={selectedPhoto} 
          visible={!!selectedPhoto} 
          onClose={() => setSelectedPhoto(null)} 
        />
      </View>
    </SafeAreaView>
  );
};

const { width } = Dimensions.get('window');
const PHOTO_SIZE = (width - 60) / 3; // 3 photos per row with padding

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
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  photoList: {
    marginTop: 0,
  },
  photoCard: {
    backgroundColor: '#fafbfc',
    borderRadius: 16,
    padding: 16,
    paddingBottom: 32,
    marginBottom: 18,
    shadowColor: '#222',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  photoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
  },
  photoListImage: {
    width: 128,
    height: 128,
    borderRadius: 8,
    marginRight: 12,
  },
  photoBarChartCol: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    gap: 12,
    marginLeft: 8,
  },
  menuRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 4,
    paddingHorizontal: 0,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    width: '100%',
    paddingHorizontal: 0,
  },
  scoreLabel: {
    fontSize: 22,
    fontWeight: '400',
  },
  scoreText: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  ratingSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  ratingNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginRight: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 8,
  },
  totalRatings: {
    color: '#666',
    fontSize: 14,
  },
  ratingBreakdown: {
    gap: 8,
  },
  promptItem: {
    marginBottom: 24,
  },
  promptQuestion: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  feedbackContainer: {
    marginTop: 16,
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  feedbackItem: {
    marginBottom: 12,
  },
  feedbackBubble: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  positiveFeedback: {
    backgroundColor: '#E8F5E9',
  },
  negativeFeedback: {
    backgroundColor: '#FFEBEE',
  },
  feedbackText: {
    fontSize: 14,
    lineHeight: 20,
  },
  feedbackCount: {
    fontSize: 12,
    color: '#666',
    marginLeft: 12,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  paginationButton: {
    padding: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  pageText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalScrollView: {
    padding: 20,
  },
  modalPhoto: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  touchIndicator: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 4,
    borderRadius: 12,
  },
  noFeedbackText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  tabBar: {
    flexDirection: 'row',
    marginTop: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabItem: {
    borderBottomColor: '#222',
  },
  tabText: {
    fontSize: 16,
    color: '#888',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#222',
    fontWeight: '700',
  },
  ratingBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingLabel: {
    width: 60,
    fontSize: 14,
    color: '#666',
  },
  ratingBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  ratingBarFill: {
    height: '100%',
    backgroundColor: '#FFD700',
  },
  ratingCount: {
    width: 30,
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
  },
  totalReviewsText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginTop: 0,
    marginBottom: 16,
    fontWeight: '500',
  },
  promptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 12,
    marginBottom: 0,
  },
});

export default FeedbackScreen; 