import React, { useCallback, useEffect, useMemo, useState } from "react";
import { StyleSheet, View, ScrollView, ActivityIndicator } from "react-native";
import {
  Button,
  Card,
  Dialog,
  Paragraph,
  Portal,
  Searchbar,
  Surface,
  Title,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  addMonths,
  differenceInCalendarDays,
  differenceInCalendarMonths,
  format,
  parseISO,
  startOfDay,
} from "date-fns";

type HolidayEvent = {
  title: string;
  date: string;
  hebrew: string;
  category: string;
  memo?: string; // Hebcal's "memo" property
};

const multiDayRoots = ["Pesach", "Sukkot", "Rosh Hashana", "Shavuot", "Chanukah"];

const MONTHS_AHEAD = 12;

const buildHolidayUrl = () => {
  const today = new Date();
  const startDate = format(today, "yyyy-MM-dd");
  const endDate = format(addMonths(today, MONTHS_AHEAD), "yyyy-MM-dd");

  return `https://www.hebcal.com/hebcal/?v=1&cfg=json&start=${startDate}&end=${endDate}&maj=on&min=on&mod=off&nx=on&mf=on&ss=on&ykk=on&leyning=off`;
};

const consolidateHolidays = (items: HolidayEvent[]) => {
  const consolidatedHolidays: HolidayEvent[] = [];
  let currentHoliday: HolidayEvent | null = null;

  for (const item of items) {
    if (currentHoliday && item.title.startsWith(currentHoliday.title)) {
      if (!currentHoliday.memo?.includes("(multi-day)")) {
        currentHoliday.memo = currentHoliday.memo
          ? `${currentHoliday.memo} (multi-day)`
          : "(multi-day)";
      }
    } else {
      if (currentHoliday) {
        consolidatedHolidays.push(currentHoliday);
      }

      currentHoliday = { ...item };

      if (
        multiDayRoots.some(
          (root) =>
            item.title.startsWith(root) &&
            !item.title.includes("Chol ha-Moed") &&
            !item.title.includes("Intermediate Days")
        )
      ) {
        currentHoliday.memo = currentHoliday.memo
          ? `${currentHoliday.memo} (multi-day holiday)`
          : "(multi-day holiday)";
      }
    }
  }

  if (currentHoliday) {
    consolidatedHolidays.push(currentHoliday);
  }

  return consolidatedHolidays;
};

const getTimeDifference = (dateString: string): string => {
  const today = startOfDay(new Date());
  const parsedEventDate = parseISO(dateString);

  if (Number.isNaN(parsedEventDate.getTime())) {
    return "Date unavailable";
  }

  const eventDate = startOfDay(parsedEventDate);
  const days = differenceInCalendarDays(eventDate, today);
  const months = differenceInCalendarMonths(eventDate, today);

  if (days < 0) return "Passed";
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";

  if (months > 0) {
    const adjustedDays = differenceInCalendarDays(eventDate, addMonths(today, months));

    return `In ${months} month${months !== 1 ? "s" : ""}${
      adjustedDays > 0 ? `, ${adjustedDays} day${adjustedDays !== 1 ? "s" : ""}` : ""
    }`;
  }

  return `In ${days} day${days !== 1 ? "s" : ""}`;
};

export default function Home() {
  const theme = useTheme();
  const [holidays, setHolidays] = useState<HolidayEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [selectedMemo, setSelectedMemo] = useState<string>("");
  const [dialogVisible, setDialogVisible] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const loadHolidays = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(buildHolidayUrl());

      if (!response.ok) {
        throw new Error(
          `Unable to reach Hebcal right now (${response.status} ${response.statusText}).`
        );
      }

      const data = await response.json();
      const holidayItems: HolidayEvent[] = Array.isArray(data.items)
        ? data.items.filter((item: HolidayEvent) => item.category === "holiday")
        : [];

      setHolidays(consolidateHolidays(holidayItems));
    } catch (fetchError) {
      console.error("Error fetching holidays:", fetchError);
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Couldn't load the latest YomTov data. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHolidays();
  }, [loadHolidays]);

  const openMemoDialog = (memo?: string) => {
    setSelectedMemo(memo || "");
    setDialogVisible(true);
  };

  const hideMemoDialog = () => {
    setDialogVisible(false);
    setSelectedMemo("");
  };

  const filteredHolidays = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return holidays;
    }

    return holidays.filter((holiday) =>
      [holiday.title, holiday.hebrew, holiday.memo]
        .filter((value): value is string => value !== undefined && value !== null)
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery)
    );
  }, [holidays, searchQuery]);

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.loaderContainer, { backgroundColor: theme.colors.background }]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Paragraph style={styles.loadingText}>Loading upcoming YomTovs…</Paragraph>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={[styles.scrollView, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={[
          styles.contentContainer,
          { backgroundColor: theme.colors.background },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <Surface style={styles.heroCard} elevation={1}>
          <Title style={styles.mainTitle}>Upcoming YomTovs</Title>
        </Surface>

        <Searchbar
          placeholder="Search yomtovs, Hebrew dates, or notes"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchbar}
        />

        {error ? (
          <Card style={styles.statusCard}>
            <Card.Content>
              <Title>Couldn&apos;t sync just now</Title>
              <Paragraph>{error}</Paragraph>
            </Card.Content>
            <Card.Actions>
              <Button onPress={loadHolidays}>Try again</Button>
            </Card.Actions>
          </Card>
        ) : null}

        {filteredHolidays.length === 0 ? (
          <Card style={styles.statusCard}>
            <Card.Content>
              <Title>No yomtovs matched</Title>
              <Paragraph>Try a different search term or clear the filter.</Paragraph>
            </Card.Content>
            <Card.Actions>
              <Button onPress={() => setSearchQuery("")}>Clear search</Button>
            </Card.Actions>
          </Card>
        ) : null}

        {filteredHolidays.map((holiday, index) => {
          const eventDate = parseISO(holiday.date);
          const timeDifference = getTimeDifference(holiday.date);

          return (
            <Card key={index} style={styles.card}>
              <Card.Content>
                <Title>{holiday.title}</Title>
                <View style={styles.dateContainer}>
                  <Paragraph style={styles.date}>
                    {format(eventDate, "EEEE, MMMM d, yyyy")}
                  </Paragraph>
                  <View
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
                    <Paragraph
                      style={[
                        styles.chipLabel,
                        {
                          color:
                            timeDifference === "Today"
                              ? theme.colors.onPrimary
                              : theme.colors.onSecondaryContainer,
                        },
                      ]}
                    >
                      {timeDifference}
                    </Paragraph>
                  </View>
                </View>
                <Paragraph style={styles.hebrewDate}>{holiday.hebrew}</Paragraph>
                {holiday.memo ? (
                  <Paragraph style={styles.memoPreview} numberOfLines={2}>
                    {holiday.memo}
                  </Paragraph>
                ) : null}
              </Card.Content>
              <Card.Actions style={styles.cardActions}>
                <Button
                  mode="text"
                  icon="information-outline"
                  onPress={() => openMemoDialog(holiday.memo)}
                >
                  Details
                </Button>
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
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
    width: "100%",
    maxWidth: 960,
    alignSelf: "center",
  },
  heroCard: {
    padding: 20,
    marginBottom: 12,
    borderRadius: 24,
  },
  mainTitle: {
    fontSize: 30,
    fontWeight: "bold",
  },
  searchbar: {
    marginBottom: 16,
  },
  statusCard: {
    marginBottom: 16,
    borderRadius: 20,
  },
  card: {
    marginVertical: 8,
    elevation: 2,
    borderRadius: 20,
  },
  dateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    gap: 12,
    flexWrap: "wrap",
  },
  date: {
    opacity: 0.7,
    flexShrink: 1,
  },
  hebrewDate: {
    fontStyle: "italic",
    marginBottom: 8,
    opacity: 0.7,
  },
  memoPreview: {
    opacity: 0.75,
  },
  chip: {
    marginLeft: "auto",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  cardActions: {
    justifyContent: "flex-end",
  },
});