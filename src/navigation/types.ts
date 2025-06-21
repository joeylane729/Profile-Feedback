import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList> & {
    triggerTest?: boolean;
    testFilters?: {
      gender: string[];
      age: string[];
    };
    customQuestion?: string;
  };
  TestSetupScreen: {
    onTestComplete?: () => void;
    preselectedPhoto?: string;
    preselectedPrompt?: string;
    customQuestion?: string;
  };
  ProfileTestSetupScreen: undefined;
  TestReviewScreen: {
    selectedPhotos: string[];
    selectedPrompts: string[];
    note: string;
    previousScore: number;
    mockProfile: any;
    onTestComplete?: () => void;
    photoReplacements?: { [id: string]: string };
    promptReplacements?: { [id: string]: string };
    customQuestion?: string;
  };
};

export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
};

export type MainTabParamList = {
  Discover: undefined;
  Feedback: undefined;
  Profile: {
    triggerTest?: boolean;
    testId?: number;
    testFilters?: {
      gender: string[];
      age: string[];
    };
    customQuestion?: string;
  };
}; 