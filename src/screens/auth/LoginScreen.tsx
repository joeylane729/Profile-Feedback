import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

const LoginScreen = () => {
  const { setIsAuthenticated } = useAuth();

  const handleGoogleLoginPress = async () => {
    try {
      // TODO: Implement actual Google login
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Google login error:', error);
    }
  };

  const handleAppleLoginPress = async () => {
    try {
      // TODO: Implement actual Apple login
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Apple login error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Profile Feedback</Text>
      <Text style={styles.subtitle}>Sign in to get started</Text>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={handleGoogleLoginPress}
      >
        <Ionicons name="logo-google" size={24} color="#fff" />
        <Text style={styles.buttonText}>Continue with Google</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, styles.appleButton]}
        onPress={handleAppleLoginPress}
      >
        <Ionicons name="logo-apple" size={24} color="#fff" />
        <Text style={styles.buttonText}>Continue with Apple</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4285F4',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    marginBottom: 15,
  },
  appleButton: {
    backgroundColor: '#000',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
});

export default LoginScreen; 