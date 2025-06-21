import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput, Platform, Keyboard, TouchableWithoutFeedback, Switch, Alert } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { testService } from '../../services/test';

type FilterOption = {
  id: string;
  label: string;
  value: string;
};

type FilterSection = {
  id: string;
  title: string;
  options: FilterOption[];
  multiSelect?: boolean;
  type?: 'slider';
};

const FILTER_SECTIONS: FilterSection[] = [
  {
    id: 'gender',
    title: 'Gender',
    options: [
      { id: 'all', label: 'All', value: 'all' },
      { id: 'men', label: 'Men', value: 'men' },
      { id: 'women', label: 'Women', value: 'women' },
      { id: 'non-binary', label: 'Non-binary', value: 'non-binary' },
    ],
    multiSelect: true,
  },
  {
    id: 'age',
    title: 'Age Range',
    type: 'slider',
    options: [], // Not used for slider
  },
  {
    id: 'liked',
    title: 'Reviewers',
    options: [
      { id: 'all', label: 'All Users', value: 'all' },
      { id: 'liked', label: 'Only Profiles I Liked', value: 'liked' },
    ],
  },
];

export default function ProfileTestSetupScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({
    gender: ['all'],
    age: [],
    liked: ['all'],
  });
  const [ageRange, setAgeRange] = useState([18, 35]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [customQuestion, setCustomQuestion] = useState<string>('');
  const TEST_COST = 5;
  const userCredits = 7; // TODO: Replace with real value or context
  const [questionType, setQuestionType] = useState<'open' | 'mc'>('open');
  const [mcOptions, setMcOptions] = useState<string[]>(['', '']);
  const [askQuestion, setAskQuestion] = useState(false);
  const questionInputRef = useRef<TextInput>(null);
  const scrollRef = useRef<any>(null);
  const questionSectionRef = useRef<View>(null);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', (e) => {
      console.log('Keyboard shown', e.endCoordinates);
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      console.log('Keyboard hidden');
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleFilterSelect = (sectionId: string, optionId: string) => {
    setSelectedFilters(prev => {
      const section = FILTER_SECTIONS.find(s => s.id === sectionId);
      if (!section) return prev;

      if (section.multiSelect) {
        const currentSelections = prev[sectionId] || [];
        
        // Special handling for gender section
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

        // Special handling for location section
        if (sectionId === 'location') {
          if (optionId === 'all') {
            // If 'all' is selected, only keep 'all'
            return { ...prev, [sectionId]: ['all'] };
          } else {
            // If selecting individual options
            let newSelections = currentSelections.includes(optionId)
              ? currentSelections.filter(id => id !== optionId)
              : [...currentSelections.filter(id => id !== 'all'), optionId];
            
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

        // Default handling for other multi-select sections
        const newSelections = currentSelections.includes(optionId)
          ? currentSelections.filter(id => id !== optionId)
          : [...currentSelections, optionId];
        return { ...prev, [sectionId]: newSelections };
      } else {
        return { ...prev, [sectionId]: [optionId] };
      }
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

  const handleStartTest = async () => {
    console.log('ProfileTestSetupScreen: handleStartTest called');
    console.log('Selected filters:', selectedFilters);
    console.log('Age range:', ageRange);
    console.log('Custom question:', customQuestion);
    
    try {
      // Close the modal
      setShowConfirmModal(false);

      // Create the test in the backend
      console.log('Creating test in backend...');
      const testResponse = await testService.createTest({
        type: 'full_profile'
      });
      
      console.log('Test created successfully:', testResponse);

      // Navigate back to Profile screen with triggerTest parameter
      console.log('Navigating to Main/Profile with triggerTest parameter');
      navigation.navigate('Main', {
        screen: 'Profile',
        params: {
          triggerTest: true,
          testId: testResponse.id,
          testFilters: {
            gender: selectedFilters.gender,
            age: [`${ageRange[0]}-${ageRange[1]}`]
          },
          customQuestion: customQuestion
        }
      });
    } catch (error) {
      console.error('Failed to create test:', error);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to start test. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const renderFilterSection = (section: FilterSection) => {
    if (section.type === 'slider') {
      return (
        <View key={section.id} style={styles.questionSectionBox}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
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
              selectedStyle={{ backgroundColor: '#222' }}
              unselectedStyle={{ backgroundColor: '#ddd' }}
              containerStyle={{ height: 40 }}
              trackStyle={{ height: 4, backgroundColor: '#ddd' }}
              customMarker={(e) => (
                <View style={[styles.markerContainer, { transform: [{ translateY: -12 }] }]}> 
                  <Text style={styles.markerValue}>{e.currentValue}</Text>
                  <View style={styles.marker} />
                </View>
              )}
            />
          </View>
        </View>
      );
    }

    return (
      <View key={section.id} style={styles.questionSectionBox}>
        <Text style={styles.sectionTitle}>{section.title}</Text>
        <View style={styles.optionsContainer}>
          {section.options.map(option => {
            const isSelected = selectedFilters[section.id]?.includes(option.id);
            return (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionButton,
                  isSelected && styles.optionButtonSelected,
                  section.multiSelect && styles.multiSelectOption
                ]}
                onPress={() => handleFilterSelect(section.id, option.id)}
              >
                <Text style={[
                  styles.optionText,
                  isSelected && styles.optionTextSelected
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Setup Profile Test</Text>
        <View style={styles.backButton} />
      </View>
      <KeyboardAwareScrollView
        ref={scrollRef}
        contentContainerStyle={[styles.scrollContainer, { flexGrow: 1 }]}
        enableOnAndroid={true}
        extraScrollHeight={80}
        keyboardShouldPersistTaps="always"
      >
        <View style={styles.container}>
          <Text style={styles.description}>
            Choose who will review your profile using the filters below.
          </Text>
          {FILTER_SECTIONS.map(renderFilterSection)}
          <View style={styles.questionSectionBox} ref={questionSectionRef}>
            <View style={styles.askQuestionToggleRow}>
              <Text style={styles.sectionTitle}>Ask Reviewers a Question</Text>
              <Switch
                value={askQuestion}
                onValueChange={setAskQuestion}
                thumbColor={askQuestion ? '#222' : '#ccc'}
                trackColor={{ false: '#e5e7eb', true: '#bbb' }}
              />
            </View>
            {askQuestion && (
              <>
                <View style={styles.segmentedControl}>
                  <TouchableOpacity
                    style={[styles.segmentedOption, questionType === 'open' && styles.segmentedOptionActive]}
                    onPress={() => setQuestionType('open')}
                  >
                    <Text style={[styles.segmentedOptionText, questionType === 'open' && styles.segmentedOptionTextActive]}>Open Ended</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.segmentedOption, questionType === 'mc' && styles.segmentedOptionActive]}
                    onPress={() => setQuestionType('mc')}
                  >
                    <Text style={[styles.segmentedOptionText, questionType === 'mc' && styles.segmentedOptionTextActive]}>Multiple Choice</Text>
                  </TouchableOpacity>
                </View>
                <TextInput
                  ref={questionInputRef}
                  style={styles.questionInput}
                  placeholder={questionType === 'open' ? 'What do you think of my profile?' : 'Enter your multiple choice question'}
                  value={customQuestion}
                  onChangeText={setCustomQuestion}
                  multiline={true}
                  numberOfLines={2}
                  textAlignVertical="top"
                  onFocus={() => {
                    console.log('Main question input focused');
                    if (scrollRef.current && questionSectionRef.current) {
                      console.log('Attempting to scroll question section');
                      try {
                        // Measure the entire question section
                        questionSectionRef.current.measure((x, y, width, height, pageX, pageY) => {
                          console.log('Question section position:', { pageY, height });
                          if (scrollRef.current) {
                            // Position the bottom of the section just above the keyboard
                            const keyboardHeight = 336; // From logs
                            const screenHeight = 844; // iPhone 12/13 height
                            const targetPosition = pageY + height - (screenHeight - keyboardHeight);
                            console.log('Scrolling to position:', targetPosition);
                            scrollRef.current.scrollToPosition(0, Math.max(0, targetPosition), true);
                          }
                        });
                      } catch (error) {
                        console.log('Error scrolling question section:', error);
                      }
                    }
                  }}
                />
                {questionType === 'mc' && (
                  <View style={{ marginTop: 12 }}>
                    {mcOptions.map((option, idx) => (
                      <View key={idx} style={styles.mcOptionRow}>
                        <Text style={styles.mcOptionLabel}>{String.fromCharCode(65 + idx)}.</Text>
                        <TextInput
                          style={styles.mcOptionInput}
                          placeholder={`Option ${idx + 1}`}
                          value={option}
                          onChangeText={text => {
                            const newOptions = [...mcOptions];
                            newOptions[idx] = text;
                            setMcOptions(newOptions);
                          }}
                        />
                        {mcOptions.length > 2 && (
                          <TouchableOpacity onPress={() => setMcOptions(mcOptions.filter((_, i) => i !== idx))}>
                            <Text style={styles.mcRemove}>✕</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    ))}
                    {mcOptions.length < 5 && (
                      <TouchableOpacity style={styles.mcAddOption} onPress={() => setMcOptions([...mcOptions, ''])}>
                        <Text style={styles.mcAddOptionText}>+ Add Option</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </>
            )}
          </View>
          <TouchableOpacity 
            style={styles.startButton}
            onPress={handleStartTest}
          >
            <Text style={styles.startButtonText}>Start Test</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
      <Modal visible={showConfirmModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Start Test?</Text>
            <Text style={styles.modalText}>This test costs <Text style={{fontWeight:'bold'}}>{TEST_COST} credits</Text>.</Text>
            <Text style={styles.modalText}>You have <Text style={{fontWeight:'bold'}}>{userCredits} credits</Text>.</Text>
            {errorMsg ? <Text style={styles.modalError}>{errorMsg}</Text> : null}
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalCancelBtn} 
                onPress={() => setShowConfirmModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalConfirmBtn} 
                onPress={handleStartTest}
              >
                <Text style={styles.modalConfirmText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    padding: 24,
    paddingBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    lineHeight: 22,
  },
  filterSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  optionButtonSelected: {
    backgroundColor: '#222',
    borderColor: '#222',
  },
  multiSelectOption: {
    minWidth: 100,
  },
  optionText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  optionTextSelected: {
    color: '#fff',
  },
  questionSectionBox: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  questionInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    backgroundColor: '#fff',
  },
  startButton: {
    backgroundColor: '#222',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  modalText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  modalError: {
    color: '#dc2626',
    fontSize: 14,
    marginTop: 8,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
  },
  modalCancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  modalCancelText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
  },
  modalConfirmBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#222',
  },
  modalConfirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 16,
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
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#e5e7eb',
    borderRadius: 999,
    padding: 4,
    marginBottom: 12,
    marginTop: 8,
  },
  segmentedOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 999,
  },
  segmentedOptionActive: {
    backgroundColor: '#222',
  },
  segmentedOptionText: {
    color: '#222',
    fontWeight: '500',
    fontSize: 15,
  },
  segmentedOptionTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  mcOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  mcOptionLabel: {
    fontSize: 16,
    color: '#222',
    width: 20,
    textAlign: 'center',
  },
  mcOptionInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 8,
    fontSize: 15,
    backgroundColor: '#fff',
    marginRight: 8,
    marginLeft: 1,
  },
  mcRemove: {
    color: '#222',
    fontSize: 18,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  mcAddOption: {
    marginTop: 4,
    alignSelf: 'flex-start',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  mcAddOptionText: {
    color: '#222',
    fontWeight: '600',
    fontSize: 15,
  },
  askQuestionToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
}); 