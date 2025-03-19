import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Card, Title, Paragraph, Button, Chip, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { differenceInDays, format } from 'date-fns';
// Import from the ESM build to avoid module resolution problems.
import { HebrewCalendar, HDate, Location, Event } from '@hebcal/core/dist/es/index';

/**
 * Utility function to remove duplicate events.
 * Two events are considered identical if their description and Gregorian date match.
 */
const uniqueEvents = (events: Event[]): Event[] => {
  return events.reduce((acc: Event[], current: Event) => {
    const currentDateStr = current.getDate().greg().toDateString();
    const exists = acc.find(item => {
      const itemDateStr = item.getDate().greg().toDateString();
      return item.getDesc() === current.getDesc() && itemDateStr === currentDateStr;
    });
    if (!exists) {
      return acc.concat([current]);
    }
    return acc;
  }, []);
};

export default function Home() {
  const theme = useTheme();
  const currentDate = new Date();
  
  // Get the Jewish holidays for one year starting today.
  const getJewishHolidays = (): Event[] => {
    const endDate = new Date(currentDate);
    endDate.setFullYear(endDate.getFullYear() + 1);
    
    const options = {
      start: currentDate,
      end: endDate,
      isHebrewYear: false,
      candlelighting: true,
      location: Location.lookup('New York'),
      sedrot: false,
      omer: false,
    };
    
    // HebrewCalendar.calendar returns an array of events.
    const events = HebrewCalendar.calendar(options) as Event[];
    
    // Filter out events that are for candle lighting (assuming the description includes "candle")
    const holidays = events.filter(ev => {
      return !ev.getDesc().toLowerCase().includes("candle");
    });
    
    return uniqueEvents(holidays);
  };
  
  const holidays = getJewishHolidays();

  // Given an event's Gregorian date, compute how many days away it is.
  // Returns "Today", "Tomorrow", or "In X days".
  const getDaysDifference = (eventDate: Date): string => {
    const days = differenceInDays(eventDate, currentDate);
    if (days === 0) return "Today";
    if (days === 1) return "Tomorrow";
    return `In ${days} days`;
  };
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView style={styles.container}>
        <Title style={styles.mainTitle}>Upcoming Yomtovs</Title>
        {holidays.map((holiday, index) => {
          const gregDate: Date = holiday.getDate().greg();
          const hebrewDateStr: string = holiday.getDate().toString();
          const daysDifference = getDaysDifference(gregDate);
          
          return (
            <Card key={index} style={styles.card}>
              <Card.Content>
                <Title>{holiday.render('en')}</Title>
                <View style={styles.dateContainer}>
                  <Paragraph style={styles.date}>
                    {format(gregDate, 'EEEE, MMMM d, yyyy')}
                  </Paragraph>
                  <Chip style={[
                    styles.chip,
                    { backgroundColor: daysDifference === "Today" ? theme.colors.primary : theme.colors.secondaryContainer }
                  ]}>
                    {daysDifference}
                  </Chip>
                </View>
                <Paragraph style={styles.hebrewDate}>{hebrewDateStr}</Paragraph>
                <Paragraph>{holiday.getDesc()}</Paragraph>
              </Card.Content>
              <Card.Actions>
                <Button mode="contained-tonal">Details</Button>
              </Card.Actions>
            </Card>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  card: {
    marginVertical: 8,
    elevation: 2,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  date: {
    opacity: 0.7,
  },
  hebrewDate: {
    fontStyle: 'italic',
    marginBottom: 8,
    opacity: 0.7,
  },
  chip: {
    marginLeft: 8,
  },
});