import { MD3DarkTheme, MD3LightTheme, configureFonts } from 'react-native-paper';
import { MD3Colors } from 'react-native-paper/lib/typescript/types';

// Optional: Define custom colors for Jewish holidays
const customColors: MD3Colors = {
  ...MD3LightTheme.colors,
  primary: '#3f51b5', // Indigo blue - often associated with Judaism
  secondary: '#b39ddb', // Light purple
  tertiary: '#4db6ac', // Teal
};

export const lightTheme = {
  ...MD3LightTheme,
  colors: customColors,
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#5c6bc0', // Lighter indigo for dark theme
    secondary: '#9575cd', // Light purple
    tertiary: '#4db6ac', // Teal
  },
};