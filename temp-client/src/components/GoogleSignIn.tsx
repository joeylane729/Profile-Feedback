import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session';
import Svg, { Path } from 'react-native-svg';

WebBrowser.maybeCompleteAuthSession();

const GoogleSignIn: React.FC = () => {
  const { setIsAuthenticated, setToken } = useAuth();

  const clientId = '658492764527-uhkc011dut0qb7s26htu9951ibbr397i.apps.googleusercontent.com';
  const iosClientId = '658492764527-uhkc011dut0qb7s26htu9951ibbr397i.apps.googleusercontent.com';
  const androidClientId = '658492764527-uhkc011dut0qb7s26htu9951ibbr397i.apps.googleusercontent.com';
  const redirectUri = 'https://auth.expo.io/@joeylane19/temp-client';

  console.log('Client IDs being used:');
  console.log('Web Client ID:', clientId);
  console.log('iOS Client ID:', iosClientId);
  console.log('Android Client ID:', androidClientId);
  console.log('Redirect URI:', redirectUri);

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId,
    iosClientId,
    androidClientId,
    redirectUri,
    scopes: ['profile', 'email'],
  });

  React.useEffect(() => {
    console.log('Auth response changed:', response);
    if (response?.type === 'success') {
      console.log('Authentication successful, response:', response);
      console.log('Authentication object:', response.authentication);
      console.log('Access token:', response.authentication?.accessToken);
      console.log('ID token:', response.authentication?.idToken);
      handleGoogleLogin(response.authentication);
    } else if (response?.type === 'error') {
      console.error('Authentication error:', response.error);
      console.error('Error details:', response.error?.message);
      console.error('Error code:', response.error?.code);
      console.error('Full error object:', JSON.stringify(response.error, null, 2));
    } else {
      console.log('Response type:', response?.type);
    }
  }, [response]);

  const handleGoogleLogin = async (auth: any) => {
    try {
      console.log('Starting Google login process...');
      console.log('Auth object:', auth);
      
      if (!auth?.accessToken) {
        console.error('No access token found in auth object');
        return;
      }

      console.log('Fetching user info from Google...');
      const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${auth.accessToken}` },
      });
      
      if (!userInfo.ok) {
        const errorText = await userInfo.text();
        console.error('Failed to fetch user info:', errorText);
        console.error('Status:', userInfo.status);
        console.error('Status text:', userInfo.statusText);
        return;
      }
      
      const userData = await userInfo.json();
      console.log('User info from Google:', userData);

      console.log('Sending data to backend...');
      const backendResponse = await fetch('http://localhost:3000/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          googleId: userData.sub,
          email: userData.email,
          name: userData.name,
          profilePicture: userData.picture
        }),
      });

      if (!backendResponse.ok) {
        const errorText = await backendResponse.text();
        console.error('Backend response error:', errorText);
        console.error('Status:', backendResponse.status);
        console.error('Status text:', backendResponse.statusText);
        return;
      }

      const data = await backendResponse.json();
      console.log('Backend response:', data);
      
      if (data.token) {
        console.log('Saving token...');
        await setToken(data.token);
        setIsAuthenticated(true);
        console.log('Successfully authenticated and saved token');
      } else {
        console.error('No token received from backend');
      }
    } catch (error) {
      console.error('Error during Google login:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
      }
    }
  };

  const handleSignIn = async () => {
    try {
      console.log('Sign in button pressed');
      console.log('Request object:', JSON.stringify(request, null, 2));
      console.log('Current response:', response);
      console.log('Starting authentication prompt...');
      const result = await promptAsync();
      console.log('Full prompt result:', JSON.stringify(result, null, 2));
      if (result?.type === 'error') {
        console.error('Prompt error:', result.error);
        console.error('Error code:', result.error?.code);
        console.error('Error message:', result.error?.message);
        console.error('Full error object:', JSON.stringify(result.error, null, 2));
      }
    } catch (error) {
      console.error('Error during prompt:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
      }
    }
  };

  return (
    <TouchableOpacity
      onPress={handleSignIn}
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