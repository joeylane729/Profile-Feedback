import { Platform } from 'react-native';

// config/index.ts
// Always use process.env.EXPO_PUBLIC_API_URL for the backend base URL. Update .env if your IP changes.

const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
console.log('=== CONFIG LOADED ===');
console.log('Platform:', Platform.OS);
console.log('EXPO_PUBLIC_API_URL:', process.env.EXPO_PUBLIC_API_URL);
console.log('Using baseUrl:', baseUrl);
console.log('===================');

export const config = {
  api: {
    baseUrl,
    endpoints: {
      auth: {
        login: '/api/auth/login',
        register: '/api/auth/register',
        me: '/api/auth/me',
        google: '/api/auth/google',
      },
      tests: {
        start: '/api/tests/start',
        status: '/api/tests/status',
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