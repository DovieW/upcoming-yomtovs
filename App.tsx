import React, {useEffect} from "react";
import { Appbar, Provider as PaperProvider } from 'react-native-paper';
import {SafeAreaProvider} from "react-native-safe-area-context";
import AsyncStorage from '@react-native-async-storage/async-storage';

function App() {

  useEffect(() => {
    const date = new Date();
    const currentYear = date.getFullYear();
    const currentMonth = date.getMonth() + 1;
    const currentDay = date.getDate();
    const startDate = `${currentYear}-${currentMonth}-${currentDay}`;
    const endDate = `${currentYear + 1}-${currentMonth}-01`;
    (async () => {
      const response = await fetch(`https://www.hebcal.com/hebcal?start=${startDate}&end=${endDate}&v=1&cfg=json&maj=on&min=on&mod=off&nx=on&month=x&ss=on&mf=on&c=off&s=off&D=off&d=off&o=off&F=off&myomi=off&leyning=off`);
      const json = await response.json();
      console.log(json);
    })();
  }, []);

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