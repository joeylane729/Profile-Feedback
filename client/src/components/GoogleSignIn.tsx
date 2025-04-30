import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import axios from 'axios';
import Svg, { Path } from 'react-native-svg';

WebBrowser.maybeCompleteAuthSession();

const GoogleSignIn: React.FC = () => {
  const { setIsAuthenticated, setToken } = useAuth();

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: '658492764527-uhkc011dut0qb7s26htu9951ibbr397i.apps.googleusercontent.com',
    iosClientId: '658492764527-uhkc011dut0qb7s26htu9951ibbr397i.apps.googleusercontent.com',
    androidClientId: '658492764527-uhkc011dut0qb7s26htu9951ibbr397i.apps.googleusercontent.com',
    redirectUri: 'exp://192.168.1.249:8081/--/expo-auth-session',
  });

  React.useEffect(() => {
    if (response?.type === 'success') {
      console.log('Google auth response:', response);
      const { authentication } = response;
      handleGoogleLogin(authentication);
    } else if (response?.type === 'error') {
      console.error('Google auth error:', response.error);
    }
  }, [response]);

  const handleGoogleLogin = async (authentication: any) => {
    try {
      console.log('Starting Google login process...');
      // Get user info from Google
      const userInfo = await axios.get(
        'https://www.googleapis.com/oauth2/v3/userinfo',
        { headers: { Authorization: `Bearer ${authentication.accessToken}` } }
      );
      console.log('Got user info:', userInfo.data);

      // Send to our backend
      const response = await axios.post('http://localhost:5000/api/auth/google', {
        email: userInfo.data.email,
        name: userInfo.data.name,
        googleId: userInfo.data.sub,
        profilePicture: userInfo.data.picture
      });
      console.log('Backend response:', response.data);

      // Store token and update auth state
      setToken(response.data.token);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Google authentication failed:', error);
    }
  };

  return (
    <TouchableOpacity
      onPress={() => {
        console.log('Sign in button pressed');
        promptAsync();
      }}
      style={{
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: 'white',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#D1D5DB',
      }}
    >
      <View style={{ width: 20, height: 20 }}>
        <Svg viewBox="0 0 24 24">
          <Path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <Path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <Path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <Path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </Svg>
      </View>
      <Text style={{ color: '#374151', fontSize: 16, fontWeight: '600' }}>
        Sign in with Google
      </Text>
    </TouchableOpacity>
  );
};

export default GoogleSignIn; 