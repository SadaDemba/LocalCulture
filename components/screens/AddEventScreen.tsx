import React, { useState } from "react";
import { View, ScrollView, StyleSheet, Alert } from "react-native";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { TextInput, Button, Text, List, Divider } from "react-native-paper";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { Event } from "@/models/Event";
import { createEvent } from "@/utils/FireStore";
import {
  GeocodingResult,
  GeocodingService,
} from "@/components/services/GeocodingService";
import { Location } from "@/models/Location";
import { Coordinates } from "@/models/Coordinates";

const eventSchema = z.object({
  title: z.string().min(3, "Le titre doit contenir au moins 3 caractères"),
  description: z
    .string()
    .min(10, "La description doit contenir au moins 10 caractères"),
  beginDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), "Date invalide"),
  endDate: z.string().optional(),
  tags: z.array(z.string()).optional(),
  participants: z
    .array(z.string().min(3, "Au moins trois caractères"))
    .optional(),
  updatedAt: z.string().optional(),
  locationName: z.string().optional(),
  locationAddress: z.string().optional(),
});
type EventFormValues = z.infer<typeof eventSchema>;

export function AddEventScreen({ route }) {
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<GeocodingResult[]>([]);
  const [selectedLocation, setSelectedLocation] =
    useState<GeocodingResult | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      locationName: "",
      locationAddress: "",
    },
  });

  const watchedLocationAddress = watch("locationAddress");
  const { navigation } = route.params;

  const {
    fields: tagFields,
    append: addTag,
    remove: removeTag,
  } = useFieldArray({
    control,
    name: "tags",
  });

  const {
    fields: participantFields,
    append: addParticipant,
    remove: removeParticipant,
  } = useFieldArray({
    control,
    name: "participants",
  });

  const searchAddress = async (query: string) => {
    if (!query || query.length < 3) return;

    setIsSearching(true);
    setSearchQuery(query);

    try {
      // Use the throttled version instead of the regular search
      const results = await GeocodingService.searchAddressThrottled(query);
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching for address:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Select a location from search results
  const selectLocation = (location: GeocodingResult) => {
    setSelectedLocation(location);
    setValue("locationAddress", location.display_name);
    setValue("locationName", location.display_name.split(",")[0]); // Use first part as name
    setSearchResults([]);
  };

  const onSubmit = (data: EventFormValues) => {
    const formattedData = {
      ...data,
      tags: data.tags ? data.tags : [],
      beginDate: new Date(data.beginDate).toISOString(),
      endDate: data.endDate ? new Date(data.endDate).toISOString() : "",
    };

    formattedData.tags.map((tag) => tag.toLowerCase().trim());

    let eventLocation: Location | undefined = undefined;
    if (selectedLocation && data.locationName && data.locationAddress) {
      eventLocation = new Location(
        data.locationName,
        data.locationAddress,
        new Coordinates(
          parseFloat(selectedLocation.lat),
          parseFloat(selectedLocation.lon)
        )
      );
    }

    const event = new Event(
      formattedData.title,
      formattedData.description,
      formattedData.beginDate,
      "",
      formattedData.tags,
      formattedData.participants,
      eventLocation,
      formattedData.endDate
    );

    console.log("Événement créé :", event);
    createEvent(event);
  };

  const handleCancel = () => {
    Alert.alert("Confirmation", "Êtes-vous sûr de vouloir annuler ?", [
      {
        text: "Non",
        style: "cancel",
      },
      {
        text: "Oui",
        onPress: () => {
          navigation.goBack();
          reset();
        },
      },
    ]);
  };

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
          <View>
            <Controller
              control={control}
              name="title"
              render={({ field }) => (
                <TextInput
                  label="* Titre"
                  mode="outlined"
                  value={field.value}
                  onChangeText={field.onChange}
                  style={{ marginVertical: 5 }}
                  error={!!errors.title}
                />
              )}
            />
            {errors.title && (
              <Text style={{ color: "red", marginBottom: 10 }}>
                {errors.title.message}
              </Text>
            )}
          </View>

          <View>
            <Controller
              control={control}
              name="description"
              render={({ field }) => (
                <TextInput
                  label="* Description"
                  mode="outlined"
                  multiline
                  value={field.value}
                  onChangeText={field.onChange}
                  style={{ marginVertical: 5 }}
                  error={!!errors.description}
                />
              )}
            />
            {errors.description && (
              <Text style={{ color: "red", marginBottom: 15 }}>
                {errors.description.message}
              </Text>
            )}
          </View>

          {/* Location Fields */}
          <View style={{ marginTop: 10 }}>
            <Text style={{ fontWeight: "bold", marginBottom: 5 }}>Lieu :</Text>

            <Controller
              control={control}
              name="locationName"
              render={({ field }) => (
                <TextInput
                  label="Nom du lieu"
                  mode="outlined"
                  value={field.value}
                  onChangeText={field.onChange}
                  style={{ marginBottom: 10 }}
                />
              )}
            />

            <Controller
              control={control}
              name="locationAddress"
              render={({ field }) => (
                <TextInput
                  label="Adresse"
                  mode="outlined"
                  value={field.value}
                  onChangeText={(text) => {
                    field.onChange(text);

                    // Always reset selected location when text changes
                    if (text !== selectedLocation?.display_name) {
                      setSelectedLocation(null);
                    }

                    // Always call searchAddress - throttling is handled internally
                    // This simplifies the logic here and makes the code more maintainable
                    searchAddress(text);
                  }}
                  style={{ marginBottom: 5 }}
                  right={isSearching ? <TextInput.Icon icon="magnify" /> : null}
                />
              )}
            />

            {/* Search Results */}
            {searchResults.length > 0 && (
              <View style={styles.resultsContainer}>
                {searchResults.map((result) => (
                  <React.Fragment key={result.place_id}>
                    <List.Item
                      title={result.display_name.split(",")[0]}
                      description={result.display_name}
                      onPress={() => selectLocation(result)}
                      left={(props) => (
                        <List.Icon {...props} icon="map-marker" />
                      )}
                    />
                    <Divider />
                  </React.Fragment>
                ))}
              </View>
            )}

            {/* Selected Location Info */}
            {selectedLocation && (
              <View style={styles.selectedLocationContainer}>
                <Text style={styles.selectedLocationText}>
                  Lieu sélectionné: {selectedLocation.display_name}
                </Text>
                <Text style={styles.coordinatesText}>
                  Coordonnées: {selectedLocation.lat}, {selectedLocation.lon}
                </Text>
              </View>
            )}
          </View>

          <View>
            <Controller
              control={control}
              name="beginDate"
              render={({ field }) => (
                <TextInput
                  label="* Date de début (YYYY-MM-DD)"
                  mode="outlined"
                  value={field.value}
                  onChangeText={field.onChange}
                  style={{ marginBottom: 10 }}
                  error={!!errors.beginDate}
                />
              )}
            />
            {errors.beginDate && (
              <Text style={{ color: "red", marginBottom: 15 }}>
                {errors.beginDate.message}
              </Text>
            )}
          </View>

          <View>
            <Controller
              control={control}
              name="endDate"
              render={({ field }) => (
                <TextInput
                  label="Date de fin (YYYY-MM-DD)"
                  mode="outlined"
                  value={field.value}
                  onChangeText={field.onChange}
                  style={{ marginBottom: 10 }}
                />
              )}
            />
          </View>

          {/* Tags */}
          <View>
            <Text style={{ fontWeight: "bold", marginBottom: 5 }}>Tags :</Text>
            {tagFields.map((tag, index) => (
              <View
                key={tag.id}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 5,
                }}
              >
                <Controller
                  control={control}
                  name={`tags.${index}`}
                  render={({ field }) => (
                    <TextInput
                      value={field.value}
                      mode="outlined"
                      onChangeText={field.onChange}
                      style={{ flex: 1, marginRight: 10 }}
                    />
                  )}
                />
                <MaterialIcons
                  name="delete"
                  size={24}
                  onPress={() => removeTag(index)}
                  color="red"
                ></MaterialIcons>
              </View>
            ))}
            <Button
              mode="contained"
              onPress={() => addTag("")}
              style={{ marginTop: 5, backgroundColor: "#665b41" }}
            >
              Ajouter un tag
            </Button>
          </View>

          {/* Participants */}
          <View style={{ marginTop: 20 }}>
            <Text style={{ fontWeight: "bold", marginBottom: 5 }}>
              Participants :
            </Text>
            {participantFields.map((participant, index) => (
              <View
                key={participant.id}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 5,
                }}
              >
                <Controller
                  control={control}
                  name={`participants.${index}`}
                  render={({ field }) => (
                    <TextInput
                      value={field.value}
                      mode="outlined"
                      onChangeText={field.onChange}
                      style={{ flex: 1, marginRight: 10 }}
                    />
                  )}
                />
                <MaterialIcons
                  name="delete"
                  size={24}
                  onPress={() => removeParticipant(index)}
                  color="red"
                ></MaterialIcons>
              </View>
            ))}
            <Button
              mode="contained"
              onPress={() => addParticipant("")}
              style={{ marginTop: 5, backgroundColor: "#665b41" }}
            >
              Ajouter un participant
            </Button>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 20,
              marginBottom: 10,
            }}
          >
            <Button
              mode="contained"
              onPress={handleCancel}
              style={{
                flex: 1,
                marginRight: 15,
                backgroundColor: "red",
              }}
            >
              Annuler
            </Button>
            <Button
              mode="contained"
              onPress={handleSubmit(onSubmit)}
              style={{
                flex: 1,
                marginLeft: 15,
                backgroundColor: "green",
              }}
            >
              Valider
            </Button>
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  requiredIcon: {
    paddingLeft: 5,
    paddingTop: 10,
    alignSelf: "flex-start",
  },
  resultsContainer: {
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    maxHeight: 200,
  },
  selectedLocationContainer: {
    backgroundColor: "#f5f5f5",
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  selectedLocationText: {
    fontWeight: "bold",
  },
  coordinatesText: {
    fontStyle: "italic",
    color: "#666",
  },
});
