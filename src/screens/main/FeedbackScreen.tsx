import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions, TextInput, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

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
};

// Dummy data - in a real app, this would come from your backend
const DUMMY_FEEDBACK = {
  totalRatings: 42,
  photos: [
    { 
      id: '1', 
      uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=60', 
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
        { comment: "Great composition and framing", count: 18 },
        { comment: "Perfect lighting and exposure", count: 15 },
        { comment: "Natural and engaging expression", count: 12 },
        { comment: "Background complements the subject", count: 10 },
        { comment: "Professional quality photo", count: 8 },
        { comment: "Could use better lighting", count: 5 },
        { comment: "Background is distracting", count: 4 },
        { comment: "Subject is too centered", count: 3 },
        { comment: "Image quality could be better", count: 2 },
        { comment: "Expression feels forced", count: 1 }
      ]
    },
    { 
      id: '2', 
      uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=60', 
      rating: 4.3,
      totalRatings: 42,
      breakdown: {
        5: 20,
        4: 15,
        3: 5,
        2: 1,
        1: 1
      },
      feedback: [
        { comment: "Great composition and framing", count: 16 },
        { comment: "Perfect lighting and exposure", count: 14 },
        { comment: "Natural and engaging expression", count: 11 },
        { comment: "Background complements the subject", count: 9 },
        { comment: "Professional quality photo", count: 7 },
        { comment: "Could use better lighting", count: 4 },
        { comment: "Background is distracting", count: 3 },
        { comment: "Subject is too centered", count: 2 },
        { comment: "Image quality could be better", count: 1 },
        { comment: "Expression feels forced", count: 1 }
      ]
    },
    { id: '3', uri: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=60', rating: 3.9 },
    { id: '4', uri: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop&q=60', rating: 3.6 },
    { id: '5', uri: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&auto=format&fit=crop&q=60', rating: 3.3 },
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

const PhotoItem = ({ photo, rank, onSelect }: { photo: Photo; rank: number; onSelect: (photo: Photo) => void }) => {
  return (
    <TouchableOpacity 
      style={styles.photoItem}
      onPress={() => onSelect(photo)}
      activeOpacity={0.7}
    >
      <View style={styles.rankBadge}>
        <Text style={styles.rankText}>#{rank}</Text>
      </View>
      <Image source={{ uri: photo.uri }} style={styles.photo} />
      <View style={styles.touchIndicator}>
        <Ionicons name="chevron-forward" size={16} color="#fff" />
      </View>
    </TouchableOpacity>
  );
};

const FeedbackScreen = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  const sortedPhotos = DUMMY_FEEDBACK.photos.sort((a, b) => b.rating - a.rating);
  const totalPages = Math.ceil(sortedPhotos.length / PHOTOS_PER_PAGE);
  const startIndex = (currentPage - 1) * PHOTOS_PER_PAGE;
  const endIndex = startIndex + PHOTOS_PER_PAGE;
  const currentPhotos = sortedPhotos.slice(startIndex, endIndex);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Feedback</Text>
        </View>
      </SafeAreaView>
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Photo Rankings</Text>
          <Text style={styles.subtitle}>Based on {DUMMY_FEEDBACK.totalRatings} ratings</Text>
          
          <View style={styles.photosGrid}>
            {currentPhotos.map((photo, index) => (
              <PhotoItem 
                key={photo.id} 
                photo={photo} 
                rank={startIndex + index + 1} 
                onSelect={setSelectedPhoto}
              />
            ))}
          </View>

          <View style={styles.paginationContainer}>
            <TouchableOpacity 
              style={[styles.paginationButton, currentPage === 1 && styles.disabledButton]}
              onPress={handlePrevPage}
              disabled={currentPage === 1}
            >
              <Ionicons name="chevron-back" size={20} color={currentPage === 1 ? "#ccc" : "#007AFF"} />
            </TouchableOpacity>
            
            <Text style={styles.pageText}>
              Page {currentPage} of {totalPages}
            </Text>
            
            <TouchableOpacity 
              style={[styles.paginationButton, currentPage === totalPages && styles.disabledButton]}
              onPress={handleNextPage}
              disabled={currentPage === totalPages}
            >
              <Ionicons name="chevron-forward" size={20} color={currentPage === totalPages ? "#ccc" : "#007AFF"} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bio Rating</Text>
          <View style={styles.ratingSummary}>
            <Text style={styles.ratingNumber}>{DUMMY_FEEDBACK.bio.rating.toFixed(1)}</Text>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name={star <= Math.round(DUMMY_FEEDBACK.bio.rating) ? 'star' : 'star-outline'}
                  size={24}
                  color="#FFD700"
                />
              ))}
            </View>
            <Text style={styles.totalRatings}>{DUMMY_FEEDBACK.bio.totalRatings} ratings</Text>
          </View>

          <View style={styles.ratingBreakdown}>
            {[5, 4, 3, 2, 1].map((rating) => (
              <RatingBar
                key={rating}
                rating={rating}
                count={DUMMY_FEEDBACK.bio.breakdown[rating as keyof typeof DUMMY_FEEDBACK.bio.breakdown]}
                total={DUMMY_FEEDBACK.bio.totalRatings}
              />
            ))}
          </View>

          <View style={styles.feedbackContainer}>
            <Text style={styles.feedbackTitle}>Common Feedback</Text>
            {DUMMY_FEEDBACK.bio.feedback.slice(0, 3).map((item, index) => (
              <FeedbackComment key={index} comment={item.comment} count={item.count} />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Prompt Ratings</Text>
          {DUMMY_FEEDBACK.prompts.map((prompt) => (
            <View key={prompt.id} style={styles.promptItem}>
              <Text style={styles.promptQuestion}>{prompt.question}</Text>
              <View style={styles.ratingSummary}>
                <Text style={styles.ratingNumber}>{prompt.rating.toFixed(1)}</Text>
                <View style={styles.starsContainer}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                      key={star}
                      name={star <= Math.round(prompt.rating) ? 'star' : 'star-outline'}
                      size={20}
                      color="#FFD700"
                    />
                  ))}
                </View>
                <Text style={styles.totalRatings}>{prompt.totalRatings} ratings</Text>
              </View>
              <View style={styles.ratingBreakdown}>
                {[5, 4, 3, 2, 1].map((rating) => (
                  <RatingBar
                    key={rating}
                    rating={rating}
                    count={prompt.breakdown[rating as keyof typeof prompt.breakdown]}
                    total={prompt.totalRatings}
                  />
                ))}
              </View>
              <View style={styles.feedbackContainer}>
                <Text style={styles.feedbackTitle}>Common Feedback</Text>
                {prompt.feedback.slice(0, 3).map((item, index) => (
                  <FeedbackComment key={index} comment={item.comment} count={item.count} />
                ))}
              </View>
            </View>
          ))}
        </View>

        <PhotoFeedbackModal 
          photo={selectedPhoto} 
          visible={!!selectedPhoto} 
          onClose={() => setSelectedPhoto(null)} 
        />
      </ScrollView>
    </View>
  );
};

const { width } = Dimensions.get('window');
const PHOTO_SIZE = (width - 60) / 3; // 3 photos per row with padding

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  safeArea: {
    backgroundColor: '#fff',
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
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
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
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  photoItem: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    marginBottom: 10,
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  rankBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 1,
  },
  rankText: {
    color: '#fff',
    fontSize: 12,
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
});

export default FeedbackScreen; 