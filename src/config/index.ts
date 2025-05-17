import { Platform } from 'react-native';

// config/index.ts
// Always use process.env.EXPO_PUBLIC_API_URL for the backend base URL. Update .env if your IP changes.

export const config = {
  api: {
    baseUrl: process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.247:3000',
    endpoints: {
      auth: {
        login: '/api/auth/login',
        register: '/api/auth/register',
        me: '/api/auth/me',
        google: '/api/auth/google',
      },
    },
  },
  // Add other configuration as needed
  app: {
    name: 'Profile Feedback',
    version: '1.0.0',
  },
} as const;

// Type for the config object
export type Config = typeof config; 