import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AuthProvider } from './src/context/AuthContext';
import GoogleSignIn from './src/components/GoogleSignIn';

export default function App() {
  return (
    <AuthProvider>
      <View style={styles.container}>
        <GoogleSignIn />
      </View>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
}); 