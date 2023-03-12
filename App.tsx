import React from "react";
import { Appbar, Provider as PaperProvider } from 'react-native-paper';
import {SafeAreaProvider} from "react-native-safe-area-context";


function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <Appbar.Header>
          <Appbar.Content title="Yom Tov Reminders" />
        </Appbar.Header>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

export default App;