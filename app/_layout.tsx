import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { SplashScreen } from 'expo-router';
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
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>
    </PaperProvider>
  );
}