import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function TestReviewScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { selectedPhotos, selectedPrompts, note, previousScore, mockProfile, onTestComplete } = route.params || {};
  const [customQuestion, setCustomQuestion] = useState('');

  // For demo, just highlight selected photos/prompts as changed
  const newPhotos = mockProfile?.photos?.map((photo: any) => ({
    ...photo,
    changed: selectedPhotos?.includes(photo.id),
  })) || [];
  const newPrompts = mockProfile?.prompts?.map((prompt: any) => ({
    ...prompt,
    changed: selectedPrompts?.includes(prompt.id),
  })) || [];

  const changeCount = (selectedPhotos?.length || 0) + (selectedPrompts?.length || 0);

  const handleStartTest = () => {
    if (onTestComplete) {
      onTestComplete();
    }
    navigation.goBack();
  };

  if (!mockProfile) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Error: No profile data available</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Ready to Run Your Test?</Text>
      <Text style={styles.subheader}>Review your changes below.</Text>
      <View style={styles.comparisonRow}>
        <View style={styles.col}>
          <Text style={styles.colTitle}>Previous Version</Text>
          <View style={styles.photoRow}>
            {mockProfile.photos.map((photo: any) => (
              <Image key={photo.id} source={{ uri: photo.uri }} style={styles.photoThumb} />
            ))}
          </View>
          {mockProfile.prompts.map((prompt: any) => (
            <View key={prompt.id} style={styles.promptBox}>
              <Text style={styles.promptQ}>{prompt.question}</Text>
              <Text style={styles.promptA}>{prompt.answer}</Text>
            </View>
          ))}
        </View>
        <View style={styles.col}>
          <Text style={styles.colTitle}>New Version</Text>
          <View style={styles.photoRow}>
            {newPhotos.map((photo: any) => (
              <Image key={photo.id} source={{ uri: photo.uri }} style={[styles.photoThumb, photo.changed && styles.changed]} />
            ))}
          </View>
          {newPrompts.map((prompt: any) => (
            <View key={prompt.id} style={[styles.promptBox, prompt.changed && styles.changedPrompt]}>
              <Text style={styles.promptQ}>{prompt.question}</Text>
              <Text style={styles.promptA}>{prompt.answer}</Text>
            </View>
          ))}
        </View>
      </View>
      <Text style={styles.summary}>You changed {changeCount} thing{changeCount === 1 ? '' : 's'}{note ? `: "${note}"` : ''}</Text>
      <Text style={styles.sectionTitle}>Optional: Ask a custom question</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Does this new photo make me look more fun?"
        value={customQuestion}
        onChangeText={setCustomQuestion}
      />
      <TouchableOpacity style={styles.startBtn} onPress={handleStartTest}>
        <Text style={styles.startBtnText}>Start Test</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, backgroundColor: '#fff', flexGrow: 1 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  subheader: { fontSize: 16, marginBottom: 16, color: '#555' },
  comparisonRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 18 },
  col: { flex: 1, marginHorizontal: 4 },
  colTitle: { fontWeight: '600', fontSize: 16, marginBottom: 6, textAlign: 'center' },
  photoRow: { flexDirection: 'row', marginBottom: 8, justifyContent: 'center' },
  photoThumb: { width: 48, height: 48, borderRadius: 8, marginRight: 6, borderWidth: 2, borderColor: '#eee' },
  changed: { borderColor: '#2563eb', borderWidth: 2 },
  promptBox: { backgroundColor: '#f7f7f7', borderRadius: 8, padding: 8, marginBottom: 6, borderWidth: 2, borderColor: '#eee' },
  changedPrompt: { borderColor: '#2563eb', backgroundColor: '#e0e7ff' },
  promptQ: { fontWeight: '600', color: '#333' },
  promptA: { color: '#222', marginTop: 2 },
  summary: { fontSize: 16, marginVertical: 12, textAlign: 'center', color: '#333' },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginTop: 18, marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, minHeight: 40, marginBottom: 16 },
  startBtn: { backgroundColor: '#2563eb', borderRadius: 8, padding: 16, alignItems: 'center', marginTop: 18 },
  startBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
}); 