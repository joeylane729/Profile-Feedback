import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

const LoginScreen = () => {
  const { setIsAuthenticated } = useAuth();

  const handleGoogleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleAppleLogin = () => {
    setIsAuthenticated(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Profile Feedback</Text>
      <Text style={styles.subtitle}>Get honest feedback on your dating profile</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleGoogleLogin}>
          <Ionicons name="logo-google" size={24} color="white" />
          <Text style={styles.buttonText}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.appleButton]} onPress={handleAppleLogin}>
          <Ionicons name="logo-apple" size={24} color="white" />
          <Text style={styles.buttonText}>Continue with Apple</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.terms}>
        By continuing, you agree to our Terms of Service and Privacy Policy
      </Text>
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
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4285F4',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  appleButton: {
    backgroundColor: '#000',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  terms: {
    marginTop: 30,
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});

export default LoginScreen; 