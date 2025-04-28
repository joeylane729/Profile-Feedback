import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

// Google OAuth configuration
// TODO: Replace these with your actual credentials
const GOOGLE_CLIENT_ID = Platform.select({
  ios: 'YOUR_IOS_CLIENT_ID',
  android: 'YOUR_ANDROID_CLIENT_ID',
  default: 'YOUR_WEB_CLIENT_ID',
});

const GOOGLE_REDIRECT_URI = Platform.select({
  ios: 'YOUR_IOS_REDIRECT_URI',
  android: 'YOUR_ANDROID_REDIRECT_URI',
  default: 'YOUR_WEB_REDIRECT_URI',
});

export const useAuth = () => {
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: GOOGLE_CLIENT_ID,
    redirectUri: GOOGLE_REDIRECT_URI,
  });

  const handleGoogleLogin = async () => {
    try {
      const result = await promptAsync();
      if (result.type === 'success') {
        const { authentication } = result;
        // Here you would typically send the authentication token to your backend
        console.log('Google login successful:', authentication);
        return authentication;
      }
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  };

  const handleAppleLogin = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      // Here you would typically send the credential to your backend
      console.log('Apple login successful:', credential);
      return credential;
    } catch (error) {
      console.error('Apple login error:', error);
      throw error;
    }
  };

  return {
    handleGoogleLogin,
    handleAppleLogin,
  };
}; 