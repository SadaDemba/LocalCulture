import React from "react";
import { View, ScrollView, StyleSheet, Alert } from "react-native";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { TextInput, Button, Text } from "react-native-paper";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { Event } from "@/models/Event";
import { createEvent } from "@/utils/FireStore";

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
});
type EventFormValues = z.infer<typeof eventSchema>;

export function AddEventScreen({ route }) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
  });
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

  const onSubmit = (data: EventFormValues) => {
    const formattedData = {
      ...data,
      tags: data.tags ? data.tags : [],
      beginDate: new Date(data.beginDate).toISOString(),
      endDate: data.endDate ? new Date(data.endDate).toISOString() : "",
    };
    formattedData.tags.map((tag) => tag.toLowerCase().trim());
    const event = new Event(
      formattedData.title,
      formattedData.description,
      formattedData.beginDate,
      "",
      formattedData.tags,
      formattedData.participants,
      undefined,
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
});
