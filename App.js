import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ShakeProvider } from './hooks/ShakeContext';

import SplashScreen from './screens/SplashScreen';
import WelcomeScreen from './screens/WelcomeScreen';
import SignInScreen from './screens/SignInScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import ResetPasswordScreen from './screens/ResetPasswordScreen';
import PostItemScreen from './screens/PostItemScreen';
import ProductDetailScreen from './screens/ProductDetailScreen';
import FavoritesScreen from './screens/FavoritesScreen';
import SearchScreen from './screens/SearchScreen';
import ReportPostScreen from './screens/ReportPostScreen';
import MainTabs from './MainTabs';
import SettingsScreen from './screens/SettingsScreen';
import HelpScreen from './screens/HelpScreen'; 
import MessageScreen from './screens/MessageScreen'; 
import EditProfileScreen from './screens/EditProfileScreen';
import ProfileScreen from './screens/ProfileScreen';
import EditPostScreen from './screens/EditPostScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <ShakeProvider>
        <Stack.Navigator initialRouteName="SplashScreen" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="SplashScreen" component={SplashScreen} />
          <Stack.Screen name="Login" component={WelcomeScreen} />
          <Stack.Screen name="SignIn" component={SignInScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
          <Stack.Screen name="Home" component={MainTabs} />
          <Stack.Screen name="โพสต์ใหม่ของคุณ" component={PostItemScreen} />
          <Stack.Screen name="สินค้า" component={ProductDetailScreen} />
          <Stack.Screen name="สินค้าที่ถูกใจ" component={FavoritesScreen} />
          <Stack.Screen name="Search" component={SearchScreen} />
          <Stack.Screen name="ReportPost" component={ReportPostScreen} />
          <Stack.Screen name="Message" component={MessageScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="Helps" component={HelpScreen} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="EditPost" component={EditPostScreen} />
        </Stack.Navigator>
      </ShakeProvider>
    </NavigationContainer>
  );
}
