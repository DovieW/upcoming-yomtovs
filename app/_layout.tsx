import React, { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { SplashScreen, Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { lightTheme, darkTheme } from '../constants/Theme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;

  const [loaded, error] = useFonts({
    // Your fonts
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const pageBackground = theme.colors.background;
    const pageForeground = theme.colors.onBackground;

    document.documentElement.style.backgroundColor = pageBackground;
    document.documentElement.style.colorScheme = theme.dark ? 'dark' : 'light';
    document.body.style.backgroundColor = pageBackground;
    document.body.style.color = pageForeground;

    const root = document.getElementById('root');

    if (root) {
      root.style.backgroundColor = pageBackground;
      root.style.color = pageForeground;
    }
  }, [theme]);

  if (!loaded) {
    return null;
  }

  return (
    <PaperProvider theme={theme}>
      {/* 
        Set the StatusBar to match the theme background 
        and use a contrasting style (light/dark) so icons remain visible.
      */}
      <StatusBar
        backgroundColor={theme.colors.background}
        style={colorScheme === 'dark' ? 'light' : 'dark'}
        translucent={false}
      />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </PaperProvider>
  );
}