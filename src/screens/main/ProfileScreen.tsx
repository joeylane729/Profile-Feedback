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

  // Helper to group photos into columns of 2
  const groupPhotosInColumns = (photos: { id: string; uri: string }[]) => {
    const columns: { id: string; uri: string }[][] = [];
    for (let i = 0; i < photos.length; i += 2) {
      columns.push(photos.slice(i, i + 2));
    }
    return columns;
  };

  const handleStartTesting = () => {
    Alert.alert(
      'Start Testing',
      'Are you sure you want to start testing? Your profile will be locked until the test is complete.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Start Testing',
          style: 'default',
          onPress: startTestLogic,
        },
      ],
    );
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
    navigation.navigate('TestSetupScreen', { onTestComplete: startTestLogic });
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

  // Handler for disabled new test button
  const handleDisabledNewTest = () => {
    Alert.alert(
      "Not enough credits",
      "You don't have enough credits to run another test. Review more profiles to earn more credits."
    );
  };

  const renderHeader = () => {
    const progress = Math.min(credits / REQUIRED_CREDITS, 1);
    const hasEnough = credits >= REQUIRED_CREDITS;
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
            <Text style={styles.creditsInlineText}>{credits}/{REQUIRED_CREDITS}</Text>
            <View style={styles.creditsInlineBarBg}>
              <View style={[styles.creditsInlineBarFill, { width: `${progress * 100}%`, backgroundColor: hasEnough ? '#333' : '#bbb' }]} />
            </View>
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
                style={[styles.statusButton, styles.newTestButton, !hasEnough ? styles.disabledButton : null]} 
                onPress={hasEnough ? handleNewTest : handleDisabledNewTest}
              >
                <Ionicons name="refresh-outline" size={20} color={hasEnough ? '#222' : '#777'} />
                <Text style={[styles.statusButtonText, !hasEnough ? styles.disabledButtonText : null]}>New Test</Text>
                {!hasEnough && (
                  <MaterialCommunityIcons name="help-circle-outline" size={18} color="#777" style={{ marginLeft: 4 }} />
                )}
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
              <Text style={styles.sectionTitle}>Photos</Text>
              <FlatList
                data={groupPhotosInColumns(data.photos)}
                renderItem={({ item: column }) => (
                  <View style={styles.photoColumn}>
                    {column.map((photo, idx) => (
                      <View key={photo.id} style={{ position: 'relative', marginRight: 8 }}>
                        <Image source={{ uri: photo.uri }} style={styles.photo} />
                        <TouchableOpacity
                          style={{ position: 'absolute', top: 4, right: 4, backgroundColor: '#fff', borderRadius: 12, padding: 2, elevation: 2 }}
                          onPress={() => navigation.navigate('TestSetupScreen', { preselectedPhoto: photo.id })}
                        >
                          <MaterialCommunityIcons name="flask-outline" size={18} color="#2563eb" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
                keyExtractor={(_, idx) => idx.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.photoGrid}
                style={{ maxHeight: PHOTO_SIZE * 2 + 24 }}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Bio</Text>
              <View style={styles.contentBox}>
                <Text style={styles.bioText}>{data.bio}</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Prompts</Text>
              {data.prompts.map((prompt) => (
                <View key={prompt.id} style={{ position: 'relative', marginBottom: 16 }}>
                  <Text style={styles.promptQuestion}>{prompt.question}</Text>
                  <View style={styles.contentBox}>
                    <Text style={styles.promptAnswer}>{prompt.answer}</Text>
                    <TouchableOpacity
                      style={{ position: 'absolute', top: 4, right: 4, backgroundColor: '#fff', borderRadius: 12, padding: 2, elevation: 2 }}
                      onPress={() => navigation.navigate('TestSetupScreen', { preselectedPrompt: prompt.id })}
                    >
                      <MaterialCommunityIcons name="flask-outline" size={18} color="#2563eb" />
                    </TouchableOpacity>
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
    alignItems: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 0,
  },
  photoColumn: {
    flexDirection: 'column',
    marginHorizontal: 4,
  },
  photoContainer: {
    marginVertical: 4,
    marginHorizontal: 0,
    position: 'relative',
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
    minWidth: 80,
  },
  creditsInlineText: {
    fontSize: 15,
    fontWeight: '400',
    marginLeft: 4,
    marginRight: 6,
    color: '#222',
  },
  creditsInlineBarBg: {
    width: 56,
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  creditsInlineBarFill: {
    height: '100%',
    borderRadius: 3,
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
});

export default ProfileScreen; 