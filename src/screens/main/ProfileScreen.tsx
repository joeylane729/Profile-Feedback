/**
 * ProfileScreen.tsx
 *
 * This screen displays the user's profile, including photos, prompts, and bio.
 * - Users can view and manage their photos in a grid layout.
 * - Users can edit their bio and prompt answers.
 * - Users can add new photos from their device.
 *
 * State and logic are managed locally for demonstration purposes.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  Dimensions,
  FlatList,
  Animated,
  Platform,
  ActionSheetIOS,
  TextInput,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5, Fontisto } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { config } from '../../config';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { MainTabParamList, RootStackParamList } from '../../navigation/types';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { colors } from '../../config/theme';
import CreateProfileScreen from './CreateProfileScreen';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');
const PHOTO_SIZE = (width - 48) / 3;

interface Photo {
  id: string;
  uri: string;
}

interface Prompt {
  id: string;
  question: string;
  answer: string;
}

type ProfileStatus = 'not_tested' | 'testing' | 'complete';

interface ProfileData {
  photos: Photo[];
  bio: string;
  prompts: Prompt[];
  status: ProfileStatus;
}

interface TestStatus {
  status: ProfileStatus;
  testId?: string;
  completedAt?: string;
}

// Mock test duration in milliseconds (5 seconds for demo purposes)
const MOCK_TEST_DURATION = 5000;

const REQUIRED_CREDITS = 10;
const FULL_PROFILE_TEST_COST = 10;
const SINGLE_ITEM_TEST_COST = 5;

const INITIAL_DATA: ProfileData = {
  photos: [
    { id: '1', uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=60' },
    { id: '2', uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=60' },
    { id: '3', uri: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=60' },
  ],
  bio: "Hi! I'm a software engineer who loves hiking, photography, and trying new restaurants. Looking for someone who shares my passion for adventure and good food.",
  prompts: [
    { id: '1', question: "I'm looking for", answer: "Someone who can make me laugh and isn't afraid to be themselves." },
    { id: '2', question: "My ideal first date", answer: "Coffee and a walk in the park, followed by a visit to a local art gallery or museum." },
    { id: '3', question: "A fact about me", answer: "I once biked across the country!" },
  ],
  status: 'not_tested',
};

const ProfileScreen = () => {
  const { setIsAuthenticated, setToken, token } = useAuth();
  const [data, setData] = useState(INITIAL_DATA);
  const [userData, setUserData] = useState<{ name: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [testStatus, setTestStatus] = useState<TestStatus | null>(null);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const pulseAnim = React.useRef(new Animated.Value(1)).current;
  const progressAnim = React.useRef(new Animated.Value(0)).current;
  const [credits, setCredits] = useState(7); // mock value, replace with real data as needed
  const [hasProfile, setHasProfile] = useState(false); // always false by default for now
  const [showCreate, setShowCreate] = useState(false);
  const [editingBio, setEditingBio] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<string | null>(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selectPromptMode, setSelectPromptMode] = useState(false);
  const [showNewTestModal, setShowNewTestModal] = useState(false);

  useEffect(() => {
    if (token) {
      fetchUserData();
    }
  }, [token]);

  // Mock test completion
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (testStatus?.status === 'testing') {
      // Simulate test completion after MOCK_TEST_DURATION
      timeoutId = setTimeout(() => {
        setTestStatus({
          status: 'complete',
          testId: testStatus.testId,
          completedAt: new Date().toISOString(),
        });
        setData(prev => ({ ...prev, status: 'complete' }));
      }, MOCK_TEST_DURATION) as unknown as NodeJS.Timeout;
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [testStatus?.status]);

  // Replace bouncing animation with progress bar animation
  React.useEffect(() => {
    if (testStatus?.status === 'testing') {
      // Reset progress
      progressAnim.setValue(0);
      // Animate progress bar from 0 to 100%
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: MOCK_TEST_DURATION,
        useNativeDriver: false,
      }).start();
    }
  }, [testStatus?.status]);

  useEffect(() => {
    // Check if navigation param requests to trigger test
    const unsubscribe = navigation.addListener('focus', () => {
      const params = (navigation as any)?.getState?.()?.routes?.find((r: any) => r.name === 'Profile')?.params;
      if (params?.triggerTest) {
        startTestLogic();
        // Remove the param so it doesn't retrigger
        navigation.setParams({ triggerTest: undefined });
      }
    });
    return unsubscribe;
  }, [navigation]);

  const fetchUserData = async () => {
    try {
      console.log('Fetching user data with token:', token);
      const url = `${config.api.baseUrl}${config.api.endpoints.auth.me}`;
      console.log('Using URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      const responseText = await response.text();
      console.log('Response text:', responseText);

      if (!response.ok) {
        throw new Error(`Failed to fetch user data: ${response.status} - ${responseText}`);
      }

      const data = JSON.parse(responseText);
      console.log('User data received:', data);
      setUserData(data);
    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert('Error', 'Failed to load user data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await setToken(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error during logout:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  const handleStartTesting = () => {
    navigation.navigate('ProfileTestSetupScreen');
  };

  const startTestLogic = () => {
    const mockTestId = `test_${Date.now()}`;
    setTestStatus({
      status: 'testing',
      testId: mockTestId,
    });
    setData(prev => ({ ...prev, status: 'testing' }));
    setHasProfile(true); // Ensure profile is always shown during testing
  };

  const handleNewTest = () => {
    navigation.navigate('ProfileTestSetupScreen');
  };

  const handleViewResults = () => {
    navigation.navigate('Main', { screen: 'Feedback' });
  };

  const showMenu = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Log Out'],
          destructiveButtonIndex: 1,
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) handleLogout();
        }
      );
    } else {
      Alert.alert(
        'Menu',
        '',
        [
          { text: 'Log Out', style: 'destructive', onPress: handleLogout },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    }
  };

  const handleProfileSave = () => {
    setHasProfile(true);
    setShowCreate(false);
  };

  const handleDisabledTestOption = (cost: number, type: string) => {
    Alert.alert(
      "Not enough credits",
      `You need ${cost} credits to test ${type}. Review more profiles to earn more credits.`
    );
  };

  // Add photo logic
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const newPhoto = {
        id: Date.now().toString(),
        uri: result.assets[0].uri,
      };
      setData(prev => ({ ...prev, photos: [...prev.photos, newPhoto] }));
    }
  };

  // Remove photo logic
  const removePhoto = (photoId: string) => {
    Alert.alert(
      'Remove Photo',
      'Are you sure you want to remove this photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setData(prev => ({ ...prev, photos: prev.photos.filter(photo => photo.id !== photoId) }));
          },
        },
      ]
    );
  };

  // Edit bio logic
  const handleBioChange = (text: string) => {
    setData(prev => ({ ...prev, bio: text }));
  };

  // Edit prompt logic
  const handlePromptChange = (promptId: string, text: string) => {
    setData(prev => ({
      ...prev,
      prompts: prev.prompts.map(p =>
        p.id === promptId ? { ...p, answer: text } : p
      ),
    }));
  };

  const renderHeader = () => {
    return (
      <View style={styles.headerRow}>
        <Text style={styles.title}>Profile</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setCredits(credits >= REQUIRED_CREDITS ? 7 : REQUIRED_CREDITS)}
            style={styles.creditsInline}
          >
            <FontAwesome5 name="coins" size={18} color="#444" style={{ marginRight: 4 }} />
            <Text style={styles.creditsInlineText}>{credits}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={showMenu} style={styles.logoutButton}>
            <Ionicons name="settings-outline" size={26} color="#333" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderStatusIndicator = () => {
    switch (data.status) {
      case 'not_tested':
        return (
          <View style={styles.statusContainer}>
            <View style={styles.statusInfo}>
              <Ionicons name="information-circle-outline" size={24} color="#666" />
              <Text style={styles.statusInfoText}>Your profile is ready to be tested</Text>
            </View>
            <TouchableOpacity 
              style={[styles.statusButton, styles.startTestButton, { backgroundColor: '#222', borderWidth: 1, borderColor: '#ccc' }]} 
              onPress={handleStartTesting}
            >
              <Ionicons name="play-circle-outline" size={20} color="#fff" />
              <Text style={[styles.statusButtonText, { color: '#fff' }]}>Start Testing</Text>
            </TouchableOpacity>
          </View>
        );
      case 'testing':
        return (
          <View style={[styles.statusContainer, styles.testingContainer]}>
            <View style={styles.statusInfo}>
              <Ionicons name="time-outline" size={24} color="#222" />
              <Text style={[styles.statusInfoText, styles.testingText]}>
                Testing in Progress
              </Text>
            </View>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <Animated.View 
                  style={[
                    styles.progressFill,
                    {
                      width: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%'],
                      }),
                      backgroundColor: '#222',
                    }
                  ]} 
                />
              </View>
              <Text style={[styles.progressText, { color: '#222' }]}>Profile is locked</Text>
            </View>
          </View>
        );
      case 'complete':
        const progress = Math.min(credits / REQUIRED_CREDITS, 1);
        const hasEnough = credits >= REQUIRED_CREDITS;
        return (
          <View style={styles.statusContainer}>
            <View style={[styles.statusInfo, styles.completeInfo]}>
              <Ionicons name="checkmark-circle-outline" size={24} color="#222" />
              <Text style={[styles.statusInfoText, styles.completeText]}>
                Testing Complete
              </Text>
            </View>
            <View style={styles.buttonGroup}>
              <TouchableOpacity 
                style={[styles.statusButton, styles.viewResultsButton]} 
                onPress={handleViewResults}
              >
                <Ionicons name="analytics-outline" size={20} color="#222" />
                <Text style={styles.statusButtonText}>View Results</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.statusButton, styles.newTestButton]} 
                onPress={() => setShowNewTestModal(true)}
              >
                <Ionicons name="refresh-outline" size={20} color="#222" />
                <Text style={styles.statusButtonText}>New Test</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
    }
  };

  if (showCreate) {
    return <CreateProfileScreen onSave={handleProfileSave} />;
  }
  return (
    <SafeAreaView style={styles.safeArea}>
      {renderHeader()}
      <Modal
        visible={selectMode}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectMode(false)}
      >
        <View style={styles.selectModalOverlay}>
          <View style={styles.selectModalCard}>
            <View style={styles.selectModalHeaderRow}>
              <Text style={styles.selectModalTitle}>Swap a Photo</Text>
              <TouchableOpacity style={styles.selectModeCancel} onPress={() => setSelectMode(false)}>
                <Ionicons name="close" size={24} color="#222" />
              </TouchableOpacity>
            </View>
            <Text style={styles.selectModalSubtitle}>
              Choose a photo you want to test swapping out. You'll be able to compare it with a new photo to see which one reviewers like better.
            </Text>
            <FlatList
              data={data.photos}
              keyExtractor={item => item.id}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.selectModalGrid}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.photoContainer, styles.photoSelectable, styles.photoPop, { marginRight: 12 }]}
                  activeOpacity={0.8}
                  onPress={() => {
                    setSelectMode(false);
                    navigation.navigate('TestSetupScreen', { preselectedPhoto: item.id });
                  }}
                >
                  <Image source={{ uri: item.uri }} style={styles.photo} />
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
      <Modal
        visible={selectPromptMode}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectPromptMode(false)}
      >
        <View style={styles.selectModalOverlay}>
          <View style={styles.selectModalCard}>
            <View style={styles.selectModalHeaderRow}>
              <Text style={styles.selectModalTitle}>Swap a Prompt</Text>
              <TouchableOpacity style={styles.selectModeCancel} onPress={() => setSelectPromptMode(false)}>
                <Ionicons name="close" size={24} color="#222" />
              </TouchableOpacity>
            </View>
            <Text style={styles.selectModalSubtitle}>
              Choose a prompt you want to test swapping out. You'll be able to compare it with a new answer to see which one reviewers like better.
            </Text>
            <ScrollView style={styles.promptList}>
              {data.prompts.map((prompt) => (
                <TouchableOpacity
                  key={prompt.id}
                  style={styles.promptSelectable}
                  activeOpacity={0.8}
                  onPress={() => {
                    setSelectPromptMode(false);
                    navigation.navigate('TestSetupScreen', { preselectedPrompt: prompt.id });
                  }}
                >
                  <Text style={styles.promptSelectableQuestion}>{prompt.question}</Text>
                  <Text style={styles.promptSelectableAnswer}>{prompt.answer}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
      <Modal
        visible={showNewTestModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNewTestModal(false)}
      >
        <View style={styles.selectModalOverlay}>
          <View style={styles.selectModalCard}>
            <View style={styles.selectModalHeaderRow}>
              <Text style={styles.selectModalTitle}>Start a New Test</Text>
              <TouchableOpacity style={styles.selectModeCancel} onPress={() => setShowNewTestModal(false)}>
                <Ionicons name="close" size={24} color="#222" />
              </TouchableOpacity>
            </View>
            <View style={styles.creditsDisplay}>
              <FontAwesome5 name="coins" size={16} color="#444" style={{ marginRight: 4 }} />
              <Text style={styles.creditsText}>{credits} credits available</Text>
            </View>
            <Text style={styles.selectModalSubtitle}>What would you like to test?</Text>
            <TouchableOpacity
              style={[styles.newTestOptionButton, credits < FULL_PROFILE_TEST_COST && styles.disabledTestOption]}
              onPress={() => {
                if (credits < FULL_PROFILE_TEST_COST) {
                  handleDisabledTestOption(FULL_PROFILE_TEST_COST, "your entire profile");
                  return;
                }
                setShowNewTestModal(false);
                navigation.navigate('ProfileTestSetupScreen');
              }}
            >
              <View style={styles.testOptionContent}>
                <Text style={styles.newTestOptionText}>Test entire profile again</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <FontAwesome5 name="coins" size={14} color="#666" style={{ marginRight: 4 }} />
                  <Text style={styles.testOptionCost}>{FULL_PROFILE_TEST_COST}</Text>
                </View>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.newTestOptionButton, credits < SINGLE_ITEM_TEST_COST && styles.disabledTestOption]}
              onPress={() => {
                if (credits < SINGLE_ITEM_TEST_COST) {
                  handleDisabledTestOption(SINGLE_ITEM_TEST_COST, "a new photo");
                  return;
                }
                setShowNewTestModal(false);
                setTimeout(() => setSelectMode(true), 250);
              }}
            >
              <View style={styles.testOptionContent}>
                <Text style={styles.newTestOptionText}>Test a new photo</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <FontAwesome5 name="coins" size={14} color="#666" style={{ marginRight: 4 }} />
                  <Text style={styles.testOptionCost}>{SINGLE_ITEM_TEST_COST}</Text>
                </View>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.newTestOptionButton, credits < SINGLE_ITEM_TEST_COST && styles.disabledTestOption]}
              onPress={() => {
                if (credits < SINGLE_ITEM_TEST_COST) {
                  handleDisabledTestOption(SINGLE_ITEM_TEST_COST, "a new prompt");
                  return;
                }
                setShowNewTestModal(false);
                setTimeout(() => setSelectPromptMode(true), 250);
              }}
            >
              <View style={styles.testOptionContent}>
                <Text style={styles.newTestOptionText}>Test a new prompt</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <FontAwesome5 name="coins" size={14} color="#666" style={{ marginRight: 4 }} />
                  <Text style={styles.testOptionCost}>{SINGLE_ITEM_TEST_COST}</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <KeyboardAwareScrollView style={{ flex: 1 }}>
        {/* Blank state if no profile and not creating */}
        {!hasProfile && (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 64 }}>
            <Text style={{ fontSize: 18, color: '#333', marginBottom: 24, textAlign: 'center' }}>
              You haven't set up your profile yet.
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: '#fff',
                borderRadius: 12,
                paddingVertical: 14,
                paddingHorizontal: 32,
                borderWidth: 1,
                borderColor: '#e5e5e5',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 4,
              }}
              onPress={() => setShowCreate(true)}
            >
              <Text style={{ color: '#222', fontWeight: '500', fontSize: 16 }}>Set up your profile</Text>
            </TouchableOpacity>
          </View>
        )}
        {/* Show regular profile view if profile exists */}
        {hasProfile && (
          <>
            <View style={styles.statusSection}>{renderStatusIndicator()}</View>
            <View style={styles.section}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text style={styles.sectionTitle}>Photos</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {data.status !== 'testing' && (
                    <TouchableOpacity onPress={pickImage} style={{ padding: 4 }}>
                      <Ionicons name="add-circle-outline" size={24} color="#222" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
              <View style={styles.photoGrid}>
                {data.photos.map((photo, idx) => {
                  const isSelectable = false;
                  return (
                    <TouchableOpacity
                      key={photo.id}
                      style={[
                        styles.photoContainer,
                        (idx + 1) % 3 !== 0 && { marginRight: 8 },
                        idx < data.photos.length - (data.photos.length % 3 || 3) && { marginBottom: 8 },
                        isSelectable && styles.photoSelectable,
                      ]}
                      activeOpacity={1}
                      disabled={data.status === 'testing'}
                    >
                      <Image source={{ uri: photo.uri }} style={styles.photo} />
                      {data.status !== 'testing' && (
                        <TouchableOpacity
                          style={styles.removeButton}
                          onPress={() => removePhoto(photo.id)}
                        >
                          <Ionicons name="close-circle" size={24} color="#ff3b30" />
                        </TouchableOpacity>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Bio</Text>
              <View style={styles.contentBox}>
                {data.status !== 'testing' ? (
                  editingBio ? (
                    <TextInput
                      style={[styles.bioText, { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 8, minHeight: 80 }]}
                      value={data.bio}
                      onChangeText={handleBioChange}
                      multiline
                      autoFocus
                      onBlur={() => setEditingBio(false)}
                      placeholder="Write a short bio about yourself..."
                    />
                  ) : (
                    <TouchableOpacity onPress={() => setEditingBio(true)}>
                      <Text style={styles.bioText}>{data.bio || 'Write a short bio about yourself...'}</Text>
                    </TouchableOpacity>
                  )
                ) : (
                  <Text style={styles.bioText}>{data.bio}</Text>
                )}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Prompts</Text>
              {data.prompts.map((prompt) => (
                <View key={prompt.id} style={{ position: 'relative', marginBottom: 16 }}>
                  <Text style={styles.promptQuestion}>{prompt.question}</Text>
                  <View style={styles.contentBox}>
                    {data.status !== 'testing' ? (
                      editingPrompt === prompt.id ? (
                        <TextInput
                          style={[styles.promptAnswer, { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 8, minHeight: 40 }]}
                          value={prompt.answer}
                          onChangeText={text => handlePromptChange(prompt.id, text)}
                          multiline
                          autoFocus
                          onBlur={() => setEditingPrompt(null)}
                          placeholder={`Answer: ${prompt.question}`}
                        />
                      ) : (
                        <TouchableOpacity onPress={() => setEditingPrompt(prompt.id)}>
                          <Text style={styles.promptAnswer}>{prompt.answer || `Answer: ${prompt.question}`}</Text>
                        </TouchableOpacity>
                      )
                    ) : (
                      <Text style={styles.promptAnswer}>{prompt.answer}</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </>
        )}
      </KeyboardAwareScrollView>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  logoutButton: {
    padding: 8,
    marginLeft: 8,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    paddingVertical: 16,
    paddingHorizontal: 0,
  },
  photoContainer: {
    position: 'relative',
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
  },
  photo: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: 8,
    marginBottom: 4,
  },
  contentBox: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 4,
    marginTop: 2,
  },
  bioText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  promptContainer: {
    marginBottom: 16,
  },
  promptQuestion: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  promptAnswer: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  statusSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  statusContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusInfoText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    color: '#666',
  },
  testingContainer: {
    // No background for minimal look
  },
  testingText: {
    color: '#222',
  },
  completeInfo: {
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  completeText: {
    color: '#222',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  statusButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    minWidth: 0,
  },
  viewResultsButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  newTestButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  statusButtonText: {
    color: '#222',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
    flexShrink: 1,
    flexWrap: 'nowrap',
    textAlign: 'center',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  progressText: {
    color: '#fff',
    fontSize: 14,
    marginTop: 8,
    opacity: 0.8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  creditsInline: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  creditsInlineText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#222',
  },
  disabledButton: {
    backgroundColor: '#eee',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 1,
  },
  disabledButtonText: {
    color: '#777',
    opacity: 1,
  },
  startTestButton: {
    backgroundColor: '#222',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  selectModeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 8,
  },
  selectModeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  selectModeCancel: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  photoSelectable: {
    borderWidth: 2,
    borderColor: '#2563eb',
    borderRadius: 10,
    overflow: 'hidden',
  },
  selectModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectModalCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
  },
  selectModalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 8,
  },
  selectModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    flex: 1,
    textAlign: 'center',
  },
  selectModalSubtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 18,
    marginHorizontal: 4,
    lineHeight: 20,
  },
  selectModalGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  photoGridAbsolute: {
    position: 'absolute',
    top: 140,
    left: 0,
    right: 0,
    zIndex: 25,
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
  },
  photoPop: {
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
  },
  newTestOptionButton: {
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginVertical: 8,
    alignItems: 'center',
    width: '100%',
  },
  newTestOptionText: {
    fontSize: 16,
    color: '#222',
    fontWeight: '600',
  },
  promptList: {
    maxHeight: 400,
  },
  promptSelectable: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  promptSelectableQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  promptSelectableAnswer: {
    fontSize: 15,
    color: '#666',
    lineHeight: 20,
  },
  creditsDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  creditsText: {
    fontSize: 15,
    color: '#444',
    fontWeight: '500',
  },
  testOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  testOptionCost: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  disabledTestOption: {
    opacity: 0.5,
  },
});

export default ProfileScreen; 