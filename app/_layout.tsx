import React, { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { SplashScreen, Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { lightTheme, darkTheme } from '../constants/Theme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;

  const [loaded, error] = useFonts({
    // Your fonts here
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <PaperProvider theme={theme}>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Hide the header for the "(tabs)" group */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        {/* Hide the header for the root "index" screen */}
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>
    </PaperProvider>
  );
}