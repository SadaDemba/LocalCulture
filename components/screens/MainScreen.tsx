import { Event } from "@/models/Event";
import { getAllEvents, getAllTags, getEvents } from "@/utils/FireStore";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useFocusEffect, useNavigation } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

export function MainScreen({ navigation }) {
  const [events, setEvents] = useState<Event[]>([]);

  const [refreshing, setRefreshing] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedAuthor, setSelectedAuthor] = useState<string>(
    "Tous les évènements"
  );
  const [showFilters, setShowFilters] = useState(false);
  const [tags, setTags] = useState<string[]>([]);

  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const [sortField, setSortField] = useState("beginDate");
  const [sortDirection, setSortDirection] = useState("asc");
  const [queryOptions, setQueryOptions] = useState<EventQueryOptions>({});

  const authors = [
    "Mes évènements",
    "Autres évènements",
    "Tous les évènements",
  ];
  const selectAuthor = (author: string) => {
    setSelectedAuthor(author === selectedAuthor ? "" : author);
  };

  // Gestionnaires pour les sélecteurs de date
  const onStartDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date
  ) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  const onEndDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  // Fonction pour basculer la direction du tri
  const toggleSortDirection = () => {
    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
  };

  // Fonction pour changer le champ de tri
  const changeSortField = (field: string) => {
    setSortField(field);
  };

  // Création des options de filtrage à chaque changement des filtres
  useEffect(() => {
    setFilters();
  }, [
    selectedTags,
    selectedAuthor,
    startDate,
    endDate,
    sortField,
    sortDirection,
  ]);

  const setFilters = () => {
    let options: EventQueryOptions = {};
    options.tags = selectedTags;
    options.userEvents =
      selectedAuthor === "Tous les évènements"
        ? "all"
        : selectedAuthor === "Mes évènements"
        ? "current"
        : "others";
    setQueryOptions(options);
  };

  const fetchEvents = async () => {
    try {
      setRefreshing(true);
      setFilters();

      const events = await getEvents(queryOptions);
      const tags = await getAllTags();
      if (events) {
        setEvents(events);
      }
      if (tags) {
        setTags(tags);
      }
    } catch (error) {
      console.error("Erreur lors du chargement:", error);
      Alert.alert("Erreur", "Impossible de charger les évènements");
    } finally {
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchEvents();
      return () => {};
    }, [])
  );

  useEffect(() => {
    setFilters();
  }, [selectedTags, selectedAuthor]);

  const onRefresh = () => {
    fetchEvents();
  };

  const toggleSelection = (
    item: string,
    selectedList: any,
    setSelectedList: any
  ) => {
    if (selectedList.includes(item)) {
      setSelectedList(selectedList.filter((i: string) => i !== item));
    } else {
      setSelectedList([...selectedList, item]);
    }
  };

  const removeSelections = () => {
    setSelectedAuthor("Tous les évènements");
    setSelectedTags([]);
  };

  const renderFilter = () => {
    return (
      <SafeAreaProvider>
        <SafeAreaView
          style={{
            flex: 1,
            paddingHorizontal: 10,
          }}
          edges={["top"]}
        >
          <ScrollView>
            <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 5 }}>
              Filtrer par tags :
            </Text>
            {tags.map((tag) => (
              <TouchableOpacity
                key={tag}
                onPress={() =>
                  toggleSelection(tag, selectedTags, setSelectedTags)
                }
                style={{
                  padding: 10,
                  marginVertical: 2,
                  backgroundColor: selectedTags.includes(tag)
                    ? "green"
                    : "#e0e0e0",
                  borderRadius: 5,
                }}
              >
                <Text>{tag}</Text>
              </TouchableOpacity>
            ))}

            <Text
              style={{
                fontSize: 16,
                fontWeight: "bold",
                marginTop: 10,
                marginBottom: 5,
              }}
            >
              Filtrer par auteur :
            </Text>
            {authors.map((author) => (
              <TouchableOpacity
                key={author}
                onPress={() => selectAuthor(author)}
                style={{
                  padding: 10,
                  marginVertical: 2,
                  backgroundColor:
                    selectedAuthor === author ? "green" : "#e0e0e0",
                  borderRadius: 5,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text>{author}</Text>
                <View
                  style={{
                    height: 20,
                    width: 20,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: "black",
                    backgroundColor:
                      selectedAuthor === author ? "green" : "white",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {selectedAuthor === author && (
                    <View
                      style={{
                        height: 12,
                        width: 12,
                        borderRadius: 6,
                        backgroundColor: "white",
                      }}
                    />
                  )}
                </View>
              </TouchableOpacity>
            ))}

            <Text
              style={{
                fontSize: 16,
                fontWeight: "bold",
                marginTop: 10,
                marginBottom: 5,
              }}
            >
              Filtrer par date :
            </Text>

            <View style={{ marginVertical: 10 }}>
              <Text>Date de début :</Text>
              <TouchableOpacity
                onPress={() => setShowStartDatePicker(true)}
                style={{
                  padding: 10,
                  marginVertical: 5,
                  backgroundColor: "#e0e0e0",
                  borderRadius: 5,
                }}
              >
                <Text>{startDate.toLocaleDateString()}</Text>
              </TouchableOpacity>

              {showStartDatePicker && (
                <DateTimePicker
                  value={startDate}
                  mode="date"
                  display="default"
                  onChange={onStartDateChange}
                />
              )}
            </View>

            <View style={{ marginVertical: 10 }}>
              <Text>Date de fin :</Text>
              <TouchableOpacity
                onPress={() => setShowEndDatePicker(true)}
                style={{
                  padding: 10,
                  marginVertical: 5,
                  backgroundColor: "#e0e0e0",
                  borderRadius: 5,
                }}
              >
                <Text>{endDate.toLocaleDateString()}</Text>
              </TouchableOpacity>

              {showEndDatePicker && (
                <DateTimePicker
                  value={endDate}
                  mode="date"
                  display="default"
                  onChange={onEndDateChange}
                />
              )}
            </View>

            <Text
              style={{
                fontSize: 16,
                fontWeight: "bold",
                marginTop: 10,
                marginBottom: 5,
              }}
            >
              Options de tri :
            </Text>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginVertical: 10,
              }}
            >
              <Text>Trier par : </Text>
              <View style={{ flexDirection: "row", marginVertical: 5 }}>
                <TouchableOpacity
                  onPress={() => changeSortField("beginDate")}
                  style={{
                    padding: 10,
                    marginRight: 5,
                    backgroundColor:
                      sortField === "beginDate" ? "green" : "#e0e0e0",
                    borderRadius: 5,
                  }}
                >
                  <Text>Date de début</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => changeSortField("title")}
                  style={{
                    padding: 10,
                    marginRight: 5,
                    backgroundColor:
                      sortField === "title" ? "green" : "#e0e0e0",
                    borderRadius: 5,
                  }}
                >
                  <Text>Titre</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginVertical: 10,
              }}
            >
              <Text>Direction du tri : </Text>
              <TouchableOpacity
                onPress={toggleSortDirection}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  padding: 10,
                  backgroundColor: "#e0e0e0",
                  borderRadius: 5,
                }}
              >
                <Text>
                  {sortDirection === "asc" ? "Ascendant ↑" : "Descendant ↓"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Bouton Appliquer les filtres */}
            <View
              style={{
                alignContent: "space-evenly",
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  setShowFilters(false);
                  fetchEvents();
                }}
                style={{
                  marginTop: 15,
                  padding: 10,
                  backgroundColor: "#ff69b4",
                  alignItems: "center",
                  borderRadius: 5,
                }}
              >
                <Text style={{ color: "white", fontWeight: "bold" }}>
                  Appliquer les filtres
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => removeSelections()}
                style={{
                  marginTop: 15,
                  padding: 10,
                  backgroundColor: "#ff69b4",
                  alignItems: "center",
                  borderRadius: 5,
                }}
              >
                <Text style={{ color: "white", fontWeight: "bold" }}>
                  Supprimer les filtres
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  };

  const renderEvent = ({ item }: { item: Event }) => {
    const formatDate = (dateString: string) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      return date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    };

    return (
      <TouchableOpacity
        style={styles.eventCard}
        onPress={() => {
          navigation.navigate("SingleEvent", {
            ev: item,
            navigation: navigation,
          });
        }}
      >
        <View style={styles.eventHeader}>
          <Text style={styles.eventTitle}>{item.title}</Text>
          <Text style={styles.eventDate}>{formatDate(item.beginDate)}</Text>
        </View>

        <View style={styles.eventBody}>
          <Text style={styles.eventDescription} numberOfLines={2}>
            {item.description}
          </Text>

          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={16} color="#665b41" />
            <Text style={styles.locationText}>
              {item.location ? item.location.name : "Emplacement non spécifié"}
            </Text>
          </View>
        </View>

        {item.tags && item.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {item.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.tagBadge}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
            {item.tags.length > 3 && (
              <Text style={styles.moreTags}>+{item.tags.length - 3}</Text>
            )}
          </View>
        )}

        <View style={styles.participantsContainer}>
          <Ionicons name="people-outline" size={16} color="#665b41" />
          <Text style={styles.participantsText}>
            {item.participants
              ? `${item.participants.length} participants`
              : "0 participant"}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>Aucune donnée disponible</Text>
    </View>
  );

  const renderMain = () => {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <FlatList
          data={events}
          renderItem={renderEvent}
          keyExtractor={(item, index) => `${item.getId()}}`}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyComponent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#665b41"]} // Pour Android
              tintColor="#665b41" // Pour iOS
            />
          }
        />
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={() => {
            navigation.navigate("AddEvent", {
              navigation: navigation,
            });
          }}
        >
          <Ionicons name="add" size={34} color="white" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#ffffff" }}>
      {/* HEADER */}
      <Stack.Screen
        options={{
          headerRight: () => (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              {/* Bouton Recherche */}
              <TouchableOpacity
                onPress={() => console.log("Recherche...")}
                style={{ marginRight: 15 }}
              >
                <Ionicons name="search" size={24} color="white" />
              </TouchableOpacity>

              {/* Bouton Filtre */}
              <TouchableOpacity
                onPress={() => setShowFilters(!showFilters)}
                style={{ marginRight: 15 }}
              >
                <Ionicons name="filter" size={24} color="white" />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      {showFilters
        ? /* FILTRES */
          renderFilter()
        : /* CONTENU PRINCIPAL */
          renderMain()}
    </View>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  emptyText: {
    fontSize: 18,
    color: "#aaa",
  },
  floatingButton: {
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-end",
    width: 50,
    height: 50,
    margin: 15,
    backgroundColor: "#665b41",
    borderRadius: 100,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  eventCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333333",
    flex: 1,
  },
  eventDate: {
    fontSize: 14,
    color: "#665b41",
    fontWeight: "600",
  },
  eventBody: {
    marginBottom: 12,
  },
  eventDescription: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  locationText: {
    fontSize: 14,
    color: "#666666",
    marginLeft: 4,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
  },
  tagBadge: {
    backgroundColor: "#f0ece3",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  tagText: {
    fontSize: 12,
    color: "#665b41",
    textTransform: "capitalize",
    flexShrink: 1,
    width: "100%",
  },
  moreTags: {
    fontSize: 12,
    color: "#665b41",
    alignSelf: "center",
    marginLeft: 4,
  },
  participantsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  participantsText: {
    fontSize: 14,
    color: "#666666",
    marginLeft: 4,
  },
});
