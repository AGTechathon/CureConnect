import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
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
    <View style={{ flex: 1 }}>
      <Stack>
        {!isAuthenticated ? (
          <Stack.Screen 
            name="sign-in"
            options={{ headerShown: false }}
          />
        ) : (
          <Stack.Screen 
            name="dashboard"
            options={{ headerShown: false }}
          />
        )}
      </Stack>
    </View>
  );
}
