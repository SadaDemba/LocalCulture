import { Event } from "@/models/Event";
import { User } from "@/models/User";
import { getUserById } from "@/utils/FireStore";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
} from "react-native";
import { Image } from "expo-image";
import { limitArrayItems, truncateText } from "@/utils/Truncator";
import { Button } from "react-native-paper";

export function EventScreen({ route }) {
  const { ev, navigation } = route.params;
  const [author, setAuthor] = useState<User>();
  const [isLoading, setIsLoading] = useState(true);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showAllParticipants, setShowAllParticipants] = useState(false);
  const [showAllTags, setShowAllTags] = useState(false);
  const event: Event = ev;
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const fetchUser = async () => {
    try {
      setIsLoading(true);
      const user = await getUserById(event.author!);
      setAuthor(user!);
    } catch (error) {
      Alert.alert("Erreur", "Impossible de charger les évènements");
    } finally {
      setIsLoading(false);
    }
  };

  const formatLocation = () => {
    return event.location?.address
      ? event.location.address + " (" + event.location.name + ")"
      : "Emplacement non spécifié";
  };

  useFocusEffect(
    useCallback(() => {
      fetchUser();
      return () => {};
    }, [author])
  );

  const shareEvent = async () => {
    try {
      const title = `${event.title}`;
      const message = `Découvrez cet événement organisé par ${
        author?.firstName
      } ${author?.lastName}: ${event.title}\n\n${
        event.description
      }\n\nQuand : ${formatDate(event.beginDate)}${
        event.endDate ? ` - ${formatDate(event.endDate)}` : ""
      }\n\n${
        event.location
          ? `Où : ${event.location.address || event.location.name}`
          : ""
      }\n\n${
        event.participants ? `En présence de : ${event.participants}` : ""
      }`;

      const shareOptions = {
        title: title,
        message: message,
      };

      const result = await Share.share(shareOptions);

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // Partagé avec une activité de type result.activityType
          console.log(`Shared with activity type: ${result.activityType}`);
        } else {
          // Partagé
          console.log("Shared successfully");
        }
      } else if (result.action === Share.dismissedAction) {
        // Le dialogue de partage a été fermé
        console.log("Share dismissed");
      }
    } catch (error) {
      console.error("Error sharing event:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* En-tête de l'événement */}

        <View>
          <Stack.Screen
            options={{
              headerTitle: "Évènement",
              headerLeft: () => (
                <TouchableOpacity
                  style={styles.headerButton}
                  onPress={() => navigation.goBack()}
                >
                  <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
              ),
              headerRight: () => (
                <View style={styles.headerRightContainer}>
                  <TouchableOpacity
                    style={styles.headerButton}
                    onPress={() => shareEvent()}
                  >
                    <Ionicons name="share-outline" size={24} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.headerButton}>
                    <Ionicons name="bookmark-outline" size={24} color="#fff" />
                  </TouchableOpacity>
                </View>
              ),
            }}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.infoRow}>
            <Text style={styles.infoText}>{event.title}</Text>
          </View>
          {author && (
            <View style={styles.authorContainer}>
              <View style={styles.authorRow}>
                {author?.profilePicture ? (
                  <Image
                    source={{ uri: author.profilePicture }}
                    style={styles.authorAvatar}
                  />
                ) : (
                  <View style={styles.authorAvatarPlaceholder}>
                    <Text style={styles.authorInitials}>
                      {author?.firstName?.charAt(0)}
                      {author?.lastName?.charAt(0)}
                    </Text>
                  </View>
                )}

                <View style={styles.authorInfo}>
                  <Text style={styles.authorName}>
                    {author?.firstName} {author?.lastName}
                  </Text>
                  <Text style={styles.authorBio}>{author?.getEmail()}</Text>
                  {author?.bio && (
                    <Text style={styles.authorBio} numberOfLines={2}>
                      {author.bio}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Section Date et Lieu */}
        <View style={styles.section}>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color="#555" />
            <Text style={styles.infoText}>
              {formatDate(event.beginDate)}
              {event.endDate && ` - ${formatDate(event.endDate)}`}
            </Text>
          </View>

          {event.location && (
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={20} color="#555" />
              <Text style={styles.infoText}>{formatLocation()}</Text>
            </View>
          )}
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>
            {truncateText(event.description, 100, !showFullDescription)}
          </Text>
          {event.description && event.description.length > 100 && (
            <Button
              mode="text"
              style={styles.seeMoreButton}
              onPress={() => setShowFullDescription(!showFullDescription)}
            >
              <Text style={styles.seeMoreButtonText}>
                {showFullDescription ? "Voir moins" : "Voir plus"}
              </Text>
            </Button>
          )}
        </View>

        {/* Participants */}
        {event.participants && event.participants.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Invités ({event.participants.length})
            </Text>
            <View style={styles.participantsContainer}>
              {limitArrayItems(event.participants, 3, showAllParticipants).map(
                (participant, index) => (
                  <Text key={index} style={styles.participant}>
                    {participant}
                  </Text>
                )
              )}
            </View>
            {event.participants.length > 3 && (
              <Button
                mode="text"
                style={styles.seeMoreButton}
                onPress={() => setShowAllParticipants(!showAllParticipants)}
              >
                <Text style={styles.seeMoreButtonText}>
                  {showAllParticipants ? "Voir moins" : "Voir plus"}
                </Text>
              </Button>
            )}
          </View>
        )}

        {/* Tags */}
        {event.tags && event.tags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tags</Text>

            <View style={styles.tagsContainer}>
              {limitArrayItems(event.tags, 4, showAllParticipants).map(
                (tags, index) => (
                  <View key={index} style={styles.tag}>
                    <Text key={index} style={styles.tagText}>
                      {tags}
                    </Text>
                  </View>
                )
              )}
            </View>

            {event.tags.length > 4 && (
              <Button
                mode="text"
                style={styles.seeMoreButton}
                onPress={() => setShowAllTags(!showAllTags)}
              >
                <Text style={styles.seeMoreButtonText}>
                  {showAllTags ? "Voir moins" : "Voir plus"}
                </Text>
              </Button>
            )}
          </View>
        )}

        {/* Informations supplémentaires */}
        <View style={styles.section}>
          <Text style={styles.infoText}>
            Créé le:{" "}
            {event.createdAt ? formatDate(event.createdAt) : "Non précisé"}
          </Text>
          {event.updatedAt && (
            <Text style={styles.infoText}>
              Mis à jour le: {formatDate(event.updatedAt)}
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  scrollView: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
  },
  author: {
    fontSize: 14,
  },
  section: {
    padding: 15,
    marginVertical: 5,
    backgroundColor: "white",
    borderRadius: 8,
    marginHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    color: "#333",
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: "#444",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  infoText: {
    fontSize: 15,
    marginLeft: 10,
    color: "#444",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tag: {
    backgroundColor: "#eaeaea",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 14,
    color: "#555",
  },
  participantsContainer: {
    marginTop: 5,
  },
  participant: {
    fontSize: 15,
    paddingVertical: 5,
    color: "#444",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerButton: {
    padding: 8,
  },
  headerRightContainer: {
    flexDirection: "row",
  },

  eventTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  authorContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  authorAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  authorAvatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  authorInitials: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#555",
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  authorBio: {
    fontSize: 14,
    color: "#666",
    marginTop: 3,
  },
  seeMoreButton: {
    marginTop: 8,
    alignSelf: "flex-end",
    backgroundColor: "#eaeaea",
  },
  seeMoreButtonText: {
    color: "#555",
  },
});
