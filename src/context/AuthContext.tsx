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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);

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
        setToken(null);
        setIsAuthenticated(false);
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
            setToken(storedToken);
            setIsAuthenticated(true);
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

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, token, setToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 