/**
 * Importing necessary modules and components from various libraries
 */
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
//import AsyncStorage from '@react-native-async-storage/async-storage';
import {Linking, FlatList} from 'react-native';

/**
 * YomTov interface to define the structure of YomTov object
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
 * YomTovCard functional component to render individual YomTov item
 * @param {Object} yomTov - YomTov object
 */
function YomTovCard({yomTov}: {yomTov: YomTov}) {
  return (
    <Card style={{margin: 10}}>
      <Card.Content>
        <Title>{yomTov.title}</Title>
        <Text>{yomTov.date}</Text>
        <Text>{generateDaysUntil(yomTov.date)}</Text>
        <Text>{yomTov.hebrew}</Text>
        <Text>{yomTov.category}</Text>
        <Paragraph>{yomTov.memo}</Paragraph>
        <Text
          onPress={() => Linking.openURL(yomTov.link)}
          style={{color: 'blue'}}>
          {yomTov.link}
        </Text>
        <Text>{yomTov.location}</Text>
      </Card.Content>
    </Card>
  );
}

/**
 * YomTovList functional component to render a list of YomTov items
 * @param {Array} yomTovs - Array of YomTov objects
 */
function YomTovList({yomTovs}: {yomTovs: YomTov[]}) {
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

function generateDaysUntil(date: string): string {
  const currentDate = new Date();
  let targetDate = new Date(date);
  const difference = targetDate.getTime() - currentDate.getTime();
  const days = Math.ceil(difference / (1000 * 3600 * 24));
  return `Days until: ${days}`;
}

/**
 * App functional component to fetch and render YomTov data
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
        console.log(data.items);
        // await AsyncStorage.setItem('yomTovs', JSON.stringify(yomTovs));
      } catch (error) {
        console.error('Error getting holidays: ' + error);
      }
    })();
  }, []);

  return (
    <SafeAreaProvider>
      <PaperProvider>
        <Appbar.Header>
          <Appbar.Content title="Upcoming Yomtovs" />
          <Appbar.Action icon="calendar" />
        </Appbar.Header>
        <YomTovList yomTovs={yomTovs} />
      </PaperProvider>
    </SafeAreaProvider>
  );
}

/**
 * Exporting App component as default
 */
export default App;
