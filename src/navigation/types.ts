import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  AlbumDetail: { album: any; isActive: boolean; setActiveReviewedCollectionId: (id: string) => void };
};

export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
};

export type MainTabParamList = {
  Rate: NavigatorScreenParams<RateStackParamList>;
  Feedback: undefined;
  Profile: undefined;
  AlbumDetail: { album: any; isActive: boolean; setActiveReviewedCollectionId: (id: string) => void };
};

export type RateStackParamList = {
  RatePhotos: undefined;
  RateBio: undefined;
}; 