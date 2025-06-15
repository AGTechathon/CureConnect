import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { auth } from '../utils/firebaseConfig';

export default function Layout() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const userLoggedIn = await AsyncStorage.getItem('userLoggedIn');
        if (userLoggedIn === 'true') {
          // If AsyncStorage says user is logged in, use Firebase to confirm (optional but good practice)
          const unsubscribe = onAuthStateChanged(auth, (user) => {
            setIsAuthenticated(!!user);
            setIsLoading(false);
          });
          return () => unsubscribe();
        } else {
          setIsAuthenticated(false);
          setIsLoading(false);
        }
      } catch (e) {
        console.error('Failed to load login status from storage', e);
        setIsAuthenticated(false);
        setIsLoading(false);
      }
    };

    checkLoginStatus();
  }, []);

  if (isLoading) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <>
          <Stack.Screen name="sign-in" />
          <Stack.Screen name="sign-up" />
        </>
      ) : (
        <>
          <Stack.Screen name="dashboard" />
          <Stack.Screen name="models" />
          <Stack.Screen name="specific-diseases" />
          <Stack.Screen name="specific-image-analysis" />
          <Stack.Screen name="specific-video-analysis" />
        </>
      )}
    </Stack>
  );
}
