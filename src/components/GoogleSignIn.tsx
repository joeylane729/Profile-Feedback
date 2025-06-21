import React, { useEffect, useState } from 'react';
import { TouchableOpacity, Text, View, Platform, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri, useAuthRequest } from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import Svg, { Path } from 'react-native-svg';
import { config } from '../config';

// Configure WebBrowser
WebBrowser.maybeCompleteAuthSession();

// API URL configuration
const API_URL = Platform.select({
  ios: 'http://10.17.150.73:3000',
  android: 'http://10.17.150.73:3000',
  default: 'http://localhost:3000',
});

const GoogleSignIn: React.FC = () => {
  const { setIsAuthenticated, setToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log('GoogleSignIn component mounted');
    return () => {
      console.log('GoogleSignIn component unmounted');
    };
  }, []);

  const redirectUri = makeRedirectUri({
    scheme: 'exp',
    path: 'expo-auth-session',
  });

  console.log('Component rendering with redirectUri:', redirectUri);

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: '658492764527-uhkc011dut0qb7s26htu9951ibbr397i.apps.googleusercontent.com',
    redirectUri,
    scopes: ['openid', 'profile', 'email'],
  });

  useEffect(() => {
    console.log('Auth request object:', request);
    console.log('Auth response object:', response);
    
    if (response?.type === 'success') {
      console.log('Authentication successful');
      handleGoogleLogin(response.authentication);
    } else if (response?.type === 'error') {
      console.error('Authentication error:', response.error);
    }
  }, [response]);

  const handleGoogleLogin = async (auth: any) => {
    try {
      console.log('Starting Google login process...');
      
      if (!auth?.accessToken) {
        console.error('No access token found');
        return;
      }

      const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${auth.accessToken}` },
      });
      
      if (!userInfo.ok) {
        throw new Error('Failed to fetch user info');
      }
      
      const userData = await userInfo.json();
      console.log('User info:', userData);

      const backendResponse = await fetch(`${API_URL}/api/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          googleId: userData.sub,
          email: userData.email,
          name: userData.name,
          profilePicture: userData.picture,
        }),
      });

      if (!backendResponse.ok) {
        throw new Error('Backend error');
      }

      const data = await backendResponse.json();
      
      if (data.token) {
        await setToken(data.token);
        setIsAuthenticated(true);
      } else {
        throw new Error('No token received');
      }
    } catch (error) {
      console.error('Error during Google login:', error);
      throw error;
    }
  };

  const handlePress = async () => {
    try {
      console.log('Button pressed, attempting to sign in...');
      setIsLoading(true);
      await promptAsync();
    } catch (error) {
      console.error('Error in handlePress:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isLoading}
      style={styles.button}
    >
      {isLoading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={styles.buttonText}>Sign in with Google</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#4285F4',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginVertical: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default GoogleSignIn; 