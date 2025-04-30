declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.svg';

declare module '@react-oauth/google' {
  export const GoogleLogin: React.FC<any>;
  export const useGoogleLogin: () => any;
  export const useGoogleOneTapLogin: () => any;
}

declare module '@types/react-router-dom' {
  export * from 'react-router-dom';
} 