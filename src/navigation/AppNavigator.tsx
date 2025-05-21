import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RootStackParamList, AuthStackParamList, MainTabParamList, RateStackParamList } from './types';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

// Import screens
import LoginScreen from '../screens/auth/LoginScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import RateScreen from '../screens/main/RateScreen';
import FeedbackScreen from '../screens/main/FeedbackScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import BioRatingScreen from '../screens/main/BioRatingScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();
const RateStack = createNativeStackNavigator<RateStackParamList>();

const AuthNavigator = () => {
  console.log('=== AUTH NAVIGATOR RENDER ===');
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen 
        name="Login" 
        component={LoginScreen}
        listeners={{
          focus: () => console.log('Login screen focused'),
        }}
      />
      <AuthStack.Screen 
        name="SignUp" 
        component={SignUpScreen}
        listeners={{
          focus: () => console.log('SignUp screen focused'),
        }}
      />
    </AuthStack.Navigator>
  );
};

const RateNavigator = () => {
  console.log('=== RATE NAVIGATOR RENDER ===');
  return (
    <RateStack.Navigator 
      initialRouteName="RatePhotos"
      screenOptions={{ headerShown: false }}
    >
      <RateStack.Screen 
        name="RatePhotos" 
        component={RateScreen}
        options={{
          headerShown: false,
        }}
        listeners={{
          focus: () => console.log('RatePhotos screen focused'),
        }}
      />
      <RateStack.Screen 
        name="RateBio" 
        component={BioRatingScreen}
        options={{
          headerShown: false,
        }}
        listeners={{
          focus: () => console.log('RateBio screen focused'),
        }}
      />
    </RateStack.Navigator>
  );
};

const MainNavigator = () => {
  const insets = useSafeAreaInsets();
  return (
    <MainTab.Navigator
      initialRouteName="Rate"
      screenOptions={({ route }) => {
        return {
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === 'Rate') {
              iconName = focused ? 'star' : 'star-outline';
            } else if (route.name === 'Feedback') {
              iconName = focused ? 'chatbubble' : 'chatbubble-outline';
            } else if (route.name === 'Profile') {
              iconName = focused ? 'person' : 'person-outline';
            }
            return <Ionicons name={iconName as any} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: 'gray',
          headerShown: false,
          tabBarShowLabel: true,
          tabBarStyle: {
            backgroundColor: '#fff',
            borderTopWidth: 1,
            borderTopColor: '#eee',
            height: 60 + insets.bottom,
            paddingTop: 8,
            paddingBottom: insets.bottom,
          },
        };
      }}
    >
      <MainTab.Screen name="Rate" component={RateNavigator} options={{ tabBarLabel: 'Rate' }} />
      <MainTab.Screen name="Feedback" component={FeedbackScreen} options={{ tabBarLabel: 'Feedback' }} />
      <MainTab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
    </MainTab.Navigator>
  );
};

const AppNavigator = () => {
  const { isAuthenticated } = useAuth();
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        {!isAuthenticated ? (
          <AuthNavigator />
        ) : (
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Main" component={MainNavigator} />
          </Stack.Navigator>
        )}
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default AppNavigator; 