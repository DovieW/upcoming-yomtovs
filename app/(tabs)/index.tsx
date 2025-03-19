import React, { useEffect, useState } from "react";
import { StyleSheet, View, ScrollView, ActivityIndicator } from "react-native";
import { Card, Title, Paragraph, Button, Chip, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { differenceInDays, format } from "date-fns";

type HolidayEvent = {
  title: string;
  date: string;
  hebrew: string;
  category: string;
};

export default function Home() {
  const theme = useTheme();
  const [holidays, setHolidays] = useState<HolidayEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const currentDate = new Date();

  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        // Calculate today's date and one year from today in yyyy-MM-dd format
        const startDate = format(currentDate, "yyyy-MM-dd");
        const endDate = format(
          new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), currentDate.getDate()),
          "yyyy-MM-dd"
        );

        // Build Hebcal API URL; adjust parameters as needed.
        const url = `https://www.hebcal.com/hebcal/?v=1&cfg=json&start=${startDate}&end=${endDate}&maj=on&min=on&mod=on&nx=on`;
        const response = await fetch(url);
        const data = await response.json();

        // The API returns an items array. Filter for events with category "holiday". 
        const holidayItems: HolidayEvent[] = data.items.filter((item: HolidayEvent) => {
          return item.category === "holiday";
        });

        // Optionally sort events by date ascending.
        holidayItems.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        setHolidays(holidayItems);
      } catch (error) {
        console.error("Error fetching holidays:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHolidays();
  }, [currentDate]);

  // Given a holiday's date, compute how many days away it is.
  const getDaysDifference = (dateString: string): string => {
    const eventDate = new Date(dateString);
    const days = differenceInDays(eventDate, currentDate);
    if (days === 0) return "Today";
    if (days === 1) return "Tomorrow";
    return `In ${days} days`;
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.loaderContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.container}>
        <Title style={styles.mainTitle}>Upcoming Yomtovs</Title>
        {holidays.map((holiday, index) => {
          const eventDate = new Date(holiday.date);
          const daysDifference = getDaysDifference(holiday.date);
          return (
            <Card key={index} style={styles.card}>
              <Card.Content>
                <Title>{holiday.title}</Title>
                <View style={styles.dateContainer}>
                  <Paragraph style={styles.date}>
                    {format(eventDate, "EEEE, MMMM d, yyyy")}
                  </Paragraph>
                  <Chip
                    style={[
                      styles.chip,
                      {
                        backgroundColor:
                          daysDifference === "Today"
                            ? theme.colors.primary
                            : theme.colors.secondaryContainer,
                      },
                    ]}
                  >
                    {daysDifference}
                  </Chip>
                </View>
                <Paragraph style={styles.hebrewDate}>{holiday.hebrew}</Paragraph>
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
  safeArea: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    padding: 16,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  card: {
    marginVertical: 8,
    elevation: 2,
  },
  dateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  date: {
    opacity: 0.7,
  },
  hebrewDate: {
    fontStyle: "italic",
    marginBottom: 8,
    opacity: 0.7,
  },
  chip: {
    marginLeft: 8,
  },
});