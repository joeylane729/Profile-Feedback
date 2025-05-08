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

const EmailAuth: React.FC = () => {
  const { setIsAuthenticated, setToken } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      
      if (!email || !password || (!isLogin && !name)) {
        Alert.alert('Error', 'Please fill in all fields');
        return;
      }

      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const url = `http://192.168.1.249:3000${endpoint}`;
      console.log('Making request to:', url);
      
      const body = {
        email,
        password,
        ...(isLogin ? {} : { name }),
      };
      console.log('Request body:', body);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(body),
      });

      console.log('Response status:', response.status);
      const responseText = await response.text();
      console.log('Response text:', responseText);

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

      try {
        const data = JSON.parse(responseText);
        console.log('Parsed response data:', data);
        
        if (data.token) {
          await setToken(data.token);
          setIsAuthenticated(true);
          console.log('Successfully authenticated');
        } else {
          throw new Error('No token received');
        }
      } catch (e) {
        console.log('Error parsing success response:', e);
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      console.log('Error in handleSubmit:', error);
      Alert.alert('Error', error.message || 'Something went wrong');
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
        style={styles.button}
        onPress={handleSubmit}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading
            ? 'Loading...'
            : isLogin
            ? 'Sign In'
            : 'Sign Up'}
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
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 20,
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
});

export default EmailAuth; 