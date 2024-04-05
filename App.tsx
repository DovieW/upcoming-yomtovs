import React, {useEffect, useState} from 'react';
import {
  Appbar,
  Card,
  Paragraph,
  Provider as PaperProvider,
  Text,
  Title,
} from 'react-native-paper';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Linking, FlatList} from 'react-native';

/**
 * YomTov interface represents the structure of a Jewish holiday object.
 */
interface YomTov {
  title: string;
  date: string;
  hebrew: string;
  category: string;
  memo: string;
  link: string;
  location: string;
}

/**
 * YomTovCard is a functional component that displays the details of a Jewish holiday.
 * @param {object} props - The properties passed to the component.
 * @param {YomTov} props.yomTov - The Jewish holiday object.
 * @returns {JSX.Element} The rendered component.
 */
function YomTovCard({yomTov}: {yomTov: YomTov}): JSX.Element {
  return (
    <Card style={{margin: 10}}>
      <Card.Content>
        <Title>{yomTov.title}</Title>
        <Text>{yomTov.date}</Text>
        <Text>{yomTov.hebrew}</Text>
        <Text>{yomTov.category}</Text>
        <Text>{generateDaysUntil(yomTov.date)}</Text>
        <Paragraph>{yomTov.memo}</Paragraph>
        <Text
          onPress={() => Linking.openURL(yomTov.link)}
          style={{color: 'purple'}}>
          Click here for more information on {yomTov.title}
        </Text>
        <Text>{yomTov.location}</Text>
      </Card.Content>
    </Card>
  );
}

/**
 * YomTovList is a functional component that displays a list of Jewish holidays.
 * @param {object} props - The properties passed to the component.
 * @param {YomTov[]} props.yomTovs - The list of Jewish holiday objects.
 * @returns {JSX.Element} The rendered component.
 */
function YomTovList({yomTovs}: {yomTovs: YomTov[]}): JSX.Element {
  return (
    <SafeAreaView style={{flex: 1}}>
      <FlatList
        data={yomTovs}
        renderItem={({item}) => <YomTovCard yomTov={item} />}
        keyExtractor={(item, index) => index.toString()}
      />
    </SafeAreaView>
  );
}

/**
 * generateDaysUntil calculates the number of days until a given date.
 * @param {string} date - The target date.
 * @returns {string} The number of days until the target date.
 */
function generateDaysUntil(date: string): string {
  const currentDate = new Date();
  let targetDate = new Date(date);
  const difference = targetDate.getTime() - currentDate.getTime();
  const days = Math.ceil(difference / (1000 * 3600 * 24));
  return `Days until: ${days}`;
}

/**
 * App is the main functional component of the application.
 * It fetches data from an API, stores the data in its state, and displays a list of Jewish holidays.
 * @returns {JSX.Element} The rendered component.
 */
function App() {
  const [yomTovs, setYomTovs] = useState<YomTov[]>([]);

  useEffect(() => {
    const date = new Date();
    const currentYear = date.getFullYear();
    const currentMonth = (date.getMonth() + 1).toString().padStart(2, '0');
    const currentDay = date.getDate().toString().padStart(2, '0');
    const startDate = `${currentYear}-${currentMonth}-${currentDay}`;
    const endDate = `${currentYear + 1}-${currentMonth}-01`;
    (async () => {
      try {
        const response = await fetch(
          `https://www.hebcal.com/hebcal?start=${startDate}&end=${endDate}&v=1&cfg=json&maj=on&min=on&mod=off&nx=on&month=x&ss=on&mf=on&c=off&s=off&D=off&d=off&o=off&F=off&myomi=off&leyning=off`,
        );
        const data = await response.json();
        setYomTovs(data.items);
        // await AsyncStorage.setItem('yomTovs', JSON.stringify(yomTovs));
      } catch (error) {
        console.error('Error getting holidays: ' + error);
      }
    })();
  }, []);

  /**
   * The main render method of the App component.
   * It wraps the YomTovList component with necessary context providers and an AppBar.
   * @returns {JSX.Element} The rendered component.
   */
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <Appbar.Header>
          <Appbar.Content title="Yom Tov Reminders" />
          <Appbar.Action icon="dots-vertical" />
        </Appbar.Header>
        <YomTovList yomTovs={yomTovs} />
      </PaperProvider>
    </SafeAreaProvider>
  );
}

export default App;
