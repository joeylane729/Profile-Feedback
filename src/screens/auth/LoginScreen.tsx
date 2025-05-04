import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

const LoginScreen = () => {
  const { setIsAuthenticated, setToken } = useAuth();

  const clientId = '658492764527-uhkc011dut0qb7s26htu9951ibbr397i.apps.googleusercontent.com';
  const iosClientId = '658492764527-uhkc011dut0qb7s26htu9951ibbr397i.apps.googleusercontent.com';
  const androidClientId = '658492764527-uhkc011dut0qb7s26htu9951ibbr397i.apps.googleusercontent.com';
  const redirectUri = 'https://auth.expo.io/@joeylane19/profile_feedback';

  console.log('Using redirect URI:', redirectUri);

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId,
    iosClientId,
    androidClientId,
    redirectUri,
    scopes: ['profile', 'email', 'openid', 'https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'],
  });

  React.useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      handleGoogleLogin(authentication);
    } else if (response?.type === 'error') {
      console.error('Google auth error:', response.error);
    }
  }, [response]);

  const handleGoogleLogin = async (authentication: any) => {
    try {
      console.log('Starting Google login process...');
      
      if (!authentication?.accessToken) {
        console.error('No access token found in auth object');
        return;
      }

      // Get user info from Google
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${authentication.accessToken}` },
      });
      
      if (!userInfoResponse.ok) {
        throw new Error(`Failed to fetch user info: ${userInfoResponse.status}`);
      }
      
      const userInfo = await userInfoResponse.json();
      console.log('User info from Google:', userInfo);

      // Send to our backend
      const backendResponse = await fetch('http://localhost:3000/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          googleId: userInfo.sub,
          email: userInfo.email,
          name: userInfo.name,
          profilePicture: userInfo.picture
        }),
      });

      if (!backendResponse.ok) {
        throw new Error(`Backend error: ${backendResponse.status}`);
      }

      const data = await backendResponse.json();
      console.log('Backend response:', data);
      
      if (data.token) {
        await setToken(data.token);
        setIsAuthenticated(true);
      } else {
        console.error('No token received from backend');
      }
    } catch (error) {
      console.error('Google authentication failed:', error);
    }
  };

  const handleGoogleLoginPress = async () => {
    try {
      await promptAsync();
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