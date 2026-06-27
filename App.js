import React, { useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { 
  useFonts, 
  Urbanist_400Regular, 
  Urbanist_500Medium, 
  Urbanist_600SemiBold, 
  Urbanist_700Bold, 
  Urbanist_800ExtraBold, 
  Urbanist_900Black 
} from '@expo-google-fonts/urbanist';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store } from './store';
import { loadStoredAuth } from './store/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SplashScreen from './components/SplashScreen';
import Onboarding from './components/Onboarding';
import IndexScreen from './components/IndexScreen';
import AuthScreen from './components/AuthScreen';

function MainLayout() {
  const dispatch = useDispatch();
  const { isAuthenticated, isStartupLoading } = useSelector((state) => state.auth);
  const [isAppReady, setIsAppReady] = useState(false);
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState(false);

  const handleOnboardingComplete = async () => {
    try {
      await AsyncStorage.setItem('@onboarding_completed', 'true');
    } catch (err) {
      console.error('Error saving onboarding status:', err);
    }
    setIsOnboardingCompleted(true);
  };

  const [fontsLoaded] = useFonts({
    Urbanist_400Regular,
    Urbanist_500Medium,
    Urbanist_600SemiBold,
    Urbanist_700Bold,
    Urbanist_800ExtraBold,
    Urbanist_900Black,
  });

  useEffect(() => {
    const initApp = async () => {
      try {
        // Attempt auto-login using saved storage tokens
        dispatch(loadStoredAuth());

        // Check if onboarding is completed
        const onboardingVal = await AsyncStorage.getItem('@onboarding_completed');
        if (onboardingVal === 'true') {
          setIsOnboardingCompleted(true);
        }
      } catch (err) {
        console.error('Error loading onboarding status:', err);
      } finally {
        setIsAppReady(true);
      }
    };

    const timer = setTimeout(() => {
      initApp();
    }, 2500);

    return () => clearTimeout(timer);
  }, [dispatch]);

  if (!isAppReady || !fontsLoaded || isStartupLoading) {
    return <SplashScreen />;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {!isOnboardingCompleted ? (
        <Onboarding onComplete={handleOnboardingComplete} />
      ) : !isAuthenticated ? (
        <AuthScreen />
      ) : (
        <IndexScreen />
      )}
    </SafeAreaProvider>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <MainLayout />
    </Provider>
  );
}




