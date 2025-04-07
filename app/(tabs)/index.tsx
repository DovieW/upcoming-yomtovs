import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import {
  Card,
  Title,
  Paragraph,
  Chip,
  useTheme,
  IconButton,
  Dialog,
  Portal,
  Button,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  format,
  differenceInDays,
  addMonths,
  differenceInCalendarMonths,
} from "date-fns";

type HolidayEvent = {
  title: string;
  date: string;
  hebrew: string;
  category: string;
  memo?: string; // Hebcal's "memo" property
};

export default function Home() {
  const theme = useTheme();
  const [holidays, setHolidays] = useState<HolidayEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedMemo, setSelectedMemo] = useState<string>("");
  const [dialogVisible, setDialogVisible] = useState<boolean>(false);

  const currentDate = new Date();

  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const startDate = format(currentDate, "yyyy-MM-dd");
        const endDate = format(
          new Date(
            currentDate.getFullYear() + 1,
            currentDate.getMonth(),
            currentDate.getDate()
          ),
          "yyyy-MM-dd"
        );

        const url = `https://www.hebcal.com/hebcal/?v=1&cfg=json&start=${startDate}&end=${endDate}&maj=on&min=on&mod=off&nx=on&mf=on&ss=on&ykk=on&leyning=off`;
        const response = await fetch(url);
        const data = await response.json();

        // Filter for events with category="holiday"
        const holidayItems: HolidayEvent[] = data.items.filter(
          (item: HolidayEvent) => item.category === "holiday"
        );

        // Sort by ascending date
        holidayItems.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        setHolidays(holidayItems);
      } catch (error) {
        console.error("Error fetching holidays:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHolidays();
  }, [currentDate]);

  // If the difference is more than one calendar month, say "In X months, Y days"
  // Otherwise, show "In X days" or "Today"/"Tomorrow".
  const getTimeDifference = (dateString: string): string => {
    const eventDate = new Date(dateString);
  
    let months = differenceInCalendarMonths(eventDate, currentDate);
  
    if (months > 0) {
      let adjustedDate = addMonths(currentDate, months);
      let days = differenceInDays(eventDate, adjustedDate);

      if (days < 0) {
        months -= 1;
        adjustedDate = addMonths(currentDate, months);
        days = differenceInDays(eventDate, adjustedDate);
      }
  
      if (months > 0) {
        let result = `In ${months} month${months !== 1 ? "s" : ""}`;
        if (days > 0) {
          result += `, ${days} day${days !== 1 ? "s" : ""}`;
        }
        return result;
      }
    }
  
    const days = differenceInDays(eventDate, currentDate);
    if (days === 0) return "Today";
    if (days === 1) return "Tomorrow";
    return `In ${days} day${days !== 1 ? "s" : ""}`;
  };

  const openMemoDialog = (memo?: string) => {
    setSelectedMemo(memo || "");
    setDialogVisible(true);
  };

  const hideMemoDialog = () => {
    setDialogVisible(false);
    setSelectedMemo("");
  };

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.loaderContainer, { backgroundColor: theme.colors.background }]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.container}>
        <Title style={styles.mainTitle}>Upcoming YomTovs</Title>
        {holidays.map((holiday, index) => {
          const eventDate = new Date(holiday.date);
          const timeDifference = getTimeDifference(holiday.date);
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
                          timeDifference === "Today"
                            ? theme.colors.primary
                            : theme.colors.secondaryContainer,
                      },
                    ]}
                  >
                    {timeDifference}
                  </Chip>
                </View>
                <Paragraph style={styles.hebrewDate}>{holiday.hebrew}</Paragraph>
              </Card.Content>
              <Card.Actions style={{ justifyContent: "flex-end" }}>
                <IconButton
                  icon="information-outline"
                  onPress={() => openMemoDialog(holiday.memo)}
                  containerColor="transparent"
                  mode="contained-tonal"
                  size={24}
                />
              </Card.Actions>
            </Card>
          );
        })}
      </ScrollView>
      <Portal>
        <Dialog visible={dialogVisible} onDismiss={hideMemoDialog}>
          <Dialog.Title>YomTov Details</Dialog.Title>
          <Dialog.Content>
            <Paragraph>{selectedMemo || "No details available."}</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideMemoDialog}>OK</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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