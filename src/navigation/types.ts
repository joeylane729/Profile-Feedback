import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
};

export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
};

export type MainTabParamList = {
  Rate: NavigatorScreenParams<RateStackParamList>;
  Feedback: undefined;
  Profile: undefined;
  Discover: undefined;
};

export type RateStackParamList = {
  RatePhotos: undefined;
  RateBio: undefined;
}; 