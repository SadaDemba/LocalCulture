import { Event } from "@/models/Event";
import { getAllEvents, getAllTags } from "@/utils/FireStore";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
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

export function MainScreen({ navigation }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedAuthors, setSelectedAuthors] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [tags, setTags] = useState<string[]>([]);

  const authors = [
    "Mes évènements",
    "Autres évènements",
    "Tous les évènements",
  ];
  const fetchEvents = async () => {
    try {
      setRefreshing(true);
      const events = await getAllEvents();
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

  const onRefresh = () => {
    fetchEvents();
  };

  const toggleSelection = (
    item: string,
    selectedList: any,
    setSelectedList: any
  ) => {
    if (selectedList.includes(item)) {
      setSelectedList(selectedList.filter((i: string) => i !== item)); // Supprimer si déjà sélectionné
    } else {
      setSelectedList([...selectedList, item]); // Ajouter si pas encore sélectionné
    }
  };

  const removeSelections = () => {
    setSelectedAuthors([]);
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
                onPress={() =>
                  toggleSelection(author, selectedAuthors, setSelectedAuthors)
                }
                style={{
                  padding: 10,
                  marginVertical: 2,
                  backgroundColor: selectedAuthors.includes(author)
                    ? "green"
                    : "#e0e0e0",
                  borderRadius: 5,
                }}
              >
                <Text>{author}</Text>
              </TouchableOpacity>
            ))}

            {/* Bouton Appliquer les filtres */}
            <View
              style={{
                alignContent: "space-evenly",
              }}
            >
              <TouchableOpacity
                onPress={() => setShowFilters(false)}
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
    // Formatage de la date pour l'affichage
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
          /* Navigation vers le détail de l'événement */
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

          {item.location && (
            <View style={styles.locationContainer}>
              <Ionicons name="location-outline" size={16} color="#665b41" />
              <Text style={styles.locationText}>
                {item.location.address || "Emplacement non spécifié"}
              </Text>
            </View>
          )}
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
            navigation.navigate("AddEvent");
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
