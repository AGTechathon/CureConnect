import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="models" />
      <Stack.Screen name="specific-diseases" />
      <Stack.Screen name="specific-image-analysis" />
      <Stack.Screen name="specific-video-analysis" />
    </Stack>
  );
} 