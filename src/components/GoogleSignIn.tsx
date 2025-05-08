import React, { useEffect, useState } from 'react';
import { TouchableOpacity, Text, View, Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri, useAuthRequest } from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import Svg, { Path } from 'react-native-svg';

// Configure WebBrowser
WebBrowser.maybeCompleteAuthSession();

// API URL configuration
const API_URL = Platform.select({
  ios: 'http://192.168.1.249:3000',
  android: 'http://192.168.1.249:3000',
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
      style={{
        backgroundColor: '#4285F4',
        padding: 10,
        borderRadius: 5,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: isLoading ? 0.7 : 1,
      }}
    >
      <Svg width="24" height="24" viewBox="0 0 24 24">
        <Path
          fill="#FFC107"
          d="M21.35,11.1H12.18V13.83H16.69C16.36,17.64 14.19,19.27 12.19,19.27C9.36,19.27 7,16.89 7,14C7,11.11 9.36,8.73 12.19,8.73C13.63,8.73 14.89,9.34 15.85,10.3L18.22,7.93C16.64,6.45 14.52,5.5 12.19,5.5C7.36,5.5 3.5,9.36 3.5,14C3.5,18.64 7.36,22.5 12.19,22.5C17.19,22.5 21.5,18.29 21.5,14C21.5,13.13 21.35,12.19 21.35,11.1Z"
        />
      </Svg>
      <Text style={{ color: 'white', marginLeft: 10 }}>
        {isLoading ? 'Signing in...' : 'Sign in with Google'}
      </Text>
    </TouchableOpacity>
  );
};

export default GoogleSignIn; 