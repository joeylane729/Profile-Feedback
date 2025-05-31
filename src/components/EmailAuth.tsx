import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { config } from '../config';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../config/theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const EmailAuth: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { setIsAuthenticated, setToken } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      console.log('Starting login/register process...');
      
      if (!email || !password || (!isLogin && !name)) {
        Alert.alert('Error', 'Please fill in all fields');
        return;
      }

      const endpoint = isLogin ? config.api.endpoints.auth.login : config.api.endpoints.auth.register;
      const url = `${config.api.baseUrl}${endpoint}`;
      console.log('Making request to:', url);
      
      const body = {
        email,
        password,
        ...(isLogin ? {} : { name }),
      };
      console.log('Request body:', body);

      console.log('Sending request...');
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(body),
      });

      console.log('Response received:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      const responseText = await response.text();
      console.log('Raw response text:', responseText);

      if (!response.ok) {
        let errorMessage = 'Authentication failed';
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          console.log('Error parsing error response:', e);
        }
        throw new Error(errorMessage);
      }

      let data;
      try {
        data = JSON.parse(responseText);
        console.log('Parsed response data:', data);
      } catch (e) {
        console.error('Error parsing response:', e);
        throw new Error('Invalid response format');
      }

      if (data.token) {
        console.log('=== LOGIN SUCCESS FLOW START ===');
        try {
          // First set the token and wait for it to complete
          console.log('1. Setting token...');
          await setToken(data.token);
          console.log('2. Token set successfully');

          // Wait for token to be saved to AsyncStorage
          console.log('3. Waiting for token to be saved...');
          await new Promise(resolve => setTimeout(resolve, 500)); // Increased delay to ensure token is saved

          // Only set isAuthenticated after token is confirmed saved
          console.log('4. Setting isAuthenticated to true...');
          setIsAuthenticated(true);
          console.log('5. Auth state update complete');
          console.log('=== LOGIN SUCCESS FLOW END ===');
        } catch (error) {
          console.error('Error in login flow:', error);
          // If anything fails, ensure we're logged out
          await setToken(null);
          setIsAuthenticated(false);
          throw error;
        }
      } else {
        console.error('No token in response:', data);
        throw new Error('No token received');
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isLogin ? 'Sign In' : 'Sign Up'}</Text>
      
      {!isLogin && (
        <TextInput
          style={styles.input}
          placeholder="Name"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />
      )}
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Loading...' : isLogin ? 'Sign In' : 'Sign Up'}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.switchButton}
        onPress={() => setIsLogin(!isLogin)}
      >
        <Text style={styles.switchButtonText}>
          {isLogin
            ? "Don't have an account? Sign Up"
            : 'Already have an account? Sign In'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 20,
    backgroundColor: '#FFFDF7',
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F3E9D2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 5,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchButton: {
    marginTop: 15,
    alignItems: 'center',
  },
  switchButtonText: {
    color: '#007AFF',
    fontSize: 14,
  },
  buttonDisabled: {
    backgroundColor: '#999',
    opacity: 0.7,
  },
});

export default EmailAuth; 