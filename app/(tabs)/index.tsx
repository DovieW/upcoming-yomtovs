import React, { useCallback, useEffect, useMemo, useState } from "react";
import { StyleSheet, View, ScrollView, ActivityIndicator } from "react-native";
import {
  Button,
  Card,
  Chip,
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

const timeWindows = [
  { label: "6 Months", value: 6 },
  { label: "12 Months", value: 12 },
];

const buildHolidayUrl = (monthsAhead: number) => {
  const today = new Date();
  const startDate = format(today, "yyyy-MM-dd");
  const endDate = format(addMonths(today, monthsAhead), "yyyy-MM-dd");

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
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [selectedMemo, setSelectedMemo] = useState<string>("");
  const [dialogVisible, setDialogVisible] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [monthsAhead, setMonthsAhead] = useState<number>(12);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadHolidays = useCallback(
    async (isManualRefresh = false) => {
      if (isManualRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        const response = await fetch(buildHolidayUrl(monthsAhead));

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
        setLastUpdated(new Date());
      } catch (fetchError) {
        console.error("Error fetching holidays:", fetchError);
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Couldn't load the latest YomTov data. Please try again."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [monthsAhead]
  );

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

  const nextHoliday = holidays[0];

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
          <View style={styles.heroHeader}>
            <View style={styles.heroCopy}>
              <Title style={styles.mainTitle}>Upcoming YomTovs</Title>
              <Paragraph style={styles.heroSubtitle}>
                The same holiday tracker, now ready for GitHub Pages with search, refresh,
                and a cleaner web layout.
              </Paragraph>
            </View>
            <Button
              mode="contained-tonal"
              icon="refresh"
              onPress={() => loadHolidays(true)}
              loading={refreshing}
              disabled={refreshing}
            >
              Refresh
            </Button>
          </View>

          {nextHoliday ? (
            <View style={styles.summaryRow}>
              <View style={styles.summaryCard}>
                <Paragraph style={styles.summaryLabel}>Next up</Paragraph>
                <Title style={styles.summaryValue}>{nextHoliday.title}</Title>
                <Paragraph>{getTimeDifference(nextHoliday.date)}</Paragraph>
              </View>
              <View style={styles.summaryCard}>
                <Paragraph style={styles.summaryLabel}>Window</Paragraph>
                <Title style={styles.summaryValue}>{monthsAhead} months</Title>
                <Paragraph>{holidays.length} holidays loaded</Paragraph>
              </View>
              <View style={styles.summaryCard}>
                <Paragraph style={styles.summaryLabel}>Updated</Paragraph>
                <Title style={styles.summaryValue}>
                  {lastUpdated ? format(lastUpdated, "MMM d") : "—"}
                </Title>
                <Paragraph>
                  {lastUpdated ? format(lastUpdated, "h:mm a") : "Not yet synced"}
                </Paragraph>
              </View>
            </View>
          ) : null}
        </Surface>

        <Searchbar
          placeholder="Search yomtovs, Hebrew dates, or notes"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchbar}
        />

        <View style={styles.filterRow}>
          {timeWindows.map((option) => (
            <Chip
              key={option.value}
              selected={monthsAhead === option.value}
              onPress={() => setMonthsAhead(option.value)}
              style={styles.filterChip}
            >
              {option.label}
            </Chip>
          ))}
        </View>

        {error ? (
          <Card style={styles.statusCard}>
            <Card.Content>
              <Title>Couldn&apos;t sync just now</Title>
              <Paragraph>{error}</Paragraph>
            </Card.Content>
            <Card.Actions>
              <Button onPress={() => loadHolidays(true)}>Try again</Button>
            </Card.Actions>
          </Card>
        ) : null}

        <View style={styles.sectionHeader}>
          <Title style={styles.sectionTitle}>Holiday list</Title>
          <Paragraph>{filteredHolidays.length} matches</Paragraph>
        </View>

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
                    textStyle={{
                      color:
                        timeDifference === "Today"
                          ? theme.colors.onPrimary
                          : theme.colors.onSecondaryContainer,
                    }}
                  >
                    {timeDifference}
                  </Chip>
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
    marginBottom: 16,
    borderRadius: 24,
  },
  heroHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    flexWrap: "wrap",
  },
  heroCopy: {
    flex: 1,
    minWidth: 240,
  },
  mainTitle: {
    fontSize: 30,
    fontWeight: "bold",
  },
  heroSubtitle: {
    marginTop: 8,
    opacity: 0.75,
  },
  summaryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 20,
  },
  summaryCard: {
    flexGrow: 1,
    minWidth: 180,
    padding: 16,
    borderRadius: 18,
    backgroundColor: "rgba(63, 81, 181, 0.07)",
  },
  summaryLabel: {
    textTransform: "uppercase",
    fontSize: 12,
    letterSpacing: 0.8,
    opacity: 0.7,
  },
  summaryValue: {
    marginTop: 4,
    marginBottom: 4,
  },
  searchbar: {
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  filterChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 22,
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
  },
  cardActions: {
    justifyContent: "flex-end",
  },
});