import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  TestSetupScreen: {
    onTestComplete?: () => void;
    preselectedPhoto?: string;
    preselectedPrompt?: string;
  };
  TestReviewScreen: {
    selectedPhotos: string[];
    selectedPrompts: string[];
    note: string;
    previousScore: number;
    mockProfile: any;
    onTestComplete?: () => void;
    photoReplacements?: { [id: string]: string };
    promptReplacements?: { [id: string]: string };
  };
};

export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
};

export type MainTabParamList = {
  Discover: undefined;
  Feedback: undefined;
  Profile: undefined;
}; 