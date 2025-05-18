import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { config } from '../config';

interface AuthContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  token: string | null;
  setToken: (token: string | null) => void;
}

interface DecodedToken {
  exp: number;
  userId: number;
  email: string;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  setIsAuthenticated: () => {},
  token: null,
  setToken: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticatedState] = useState(false);
  const [token, setTokenState] = useState<string | null>(null);

  const checkTokenExpiration = (token: string) => {
    try {
      // Remove 'Bearer ' prefix if present
      const tokenWithoutPrefix = token.replace('Bearer ', '');
      const decoded = jwtDecode<DecodedToken>(tokenWithoutPrefix);
      const currentTime = Date.now() / 1000;
      
      console.log('Token expiration check:', {
        expiration: decoded.exp,
        currentTime,
        isValid: decoded.exp > currentTime
      });
      
      if (decoded.exp < currentTime) {
        console.log('Token has expired');
        setTokenState(null);
        setIsAuthenticatedState(false);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return false;
    }
  };

  useEffect(() => {
    // Check for existing token on mount
    const loadToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        console.log('Loaded token from storage:', storedToken ? 'exists' : 'null');
        
        if (storedToken) {
          if (checkTokenExpiration(storedToken)) {
            setTokenState(storedToken);
            setIsAuthenticatedState(true);
            console.log('Token is valid, user is authenticated');
          } else {
            console.log('Token is invalid or expired, removing from storage');
            await AsyncStorage.removeItem('token');
          }
        }
      } catch (error) {
        console.error('Error loading token:', error);
      }
    };
    loadToken();
  }, []);

  useEffect(() => {
    // Update AsyncStorage when token changes
    const saveToken = async () => {
      try {
        if (token) {
          console.log('Saving token to storage');
          await AsyncStorage.setItem('token', token);
        } else {
          console.log('Removing token from storage');
          await AsyncStorage.removeItem('token');
        }
      } catch (error) {
        console.error('Error saving token:', error);
      }
    };
    saveToken();
  }, [token]);

  const setToken = async (newToken: string | null) => {
    console.log('=== SET TOKEN FLOW START ===');
    console.log('1. Setting token...');
    try {
      // First save to AsyncStorage
      if (newToken) {
        console.log('2. Saving token to AsyncStorage');
        await AsyncStorage.setItem('token', newToken);
        console.log('3. Token saved to AsyncStorage');
      } else {
        console.log('2. Removing token from AsyncStorage');
        await AsyncStorage.removeItem('token');
        console.log('3. Token removed from AsyncStorage');
      }

      // Then update state
      console.log('4. Updating token state');
      setTokenState(newToken);
      console.log('5. Token state updated');
      console.log('=== SET TOKEN FLOW END ===');
    } catch (error) {
      console.error('Error in setToken flow:', error);
      // Ensure state is cleared if there's an error
      setTokenState(null);
      throw error;
    }
  };

  const setIsAuthenticated = (value: boolean) => {
    console.log('=== SET AUTH FLOW START ===');
    console.log('1. Setting isAuthenticated to:', value);
    console.log('2. Current auth state:', isAuthenticated);
    setIsAuthenticatedState(value);
    console.log('3. isAuthenticated state updated');
    console.log('=== SET AUTH FLOW END ===');
  };

  // Add effect to log auth state changes
  useEffect(() => {
    console.log('=== AUTH STATE CHANGED ===');
    console.log('New auth state:', isAuthenticated);
    console.log('Current token:', token);
  }, [isAuthenticated, token]);

  // Add logging to the token effect
  useEffect(() => {
    console.log('=== TOKEN EFFECT START ===');
    console.log('1. Token changed:', token ? 'exists' : 'null');
    const saveToken = async () => {
      try {
        if (token) {
          console.log('2. Saving token to storage');
          await AsyncStorage.setItem('token', token);
        } else {
          console.log('2. Removing token from storage');
          await AsyncStorage.removeItem('token');
        }
        console.log('3. Token storage operation complete');
      } catch (error) {
        console.error('Error in token effect:', error);
      }
    };
    saveToken();
    console.log('=== TOKEN EFFECT END ===');
  }, [token]);

  // Add logging to the initial load effect
  useEffect(() => {
    console.log('=== INITIAL LOAD START ===');
    const loadToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        console.log('1. Loaded token from storage:', storedToken ? 'exists' : 'null');
        
        if (storedToken) {
          if (checkTokenExpiration(storedToken)) {
            console.log('2. Token is valid, setting states');
            setTokenState(storedToken);
            setIsAuthenticatedState(true);
            console.log('3. States updated, user is authenticated');
          } else {
            console.log('2. Token is invalid or expired, removing from storage');
            await AsyncStorage.removeItem('token');
          }
        }
      } catch (error) {
        console.error('Error in initial load:', error);
      }
    };
    loadToken();
    console.log('=== INITIAL LOAD END ===');
  }, []);

  return (
    <AuthContext.Provider 
      value={{ 
        isAuthenticated, 
        setIsAuthenticated, 
        token, 
        setToken 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 