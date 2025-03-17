import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";

interface MultiSelectInterestsProps {
  interests: string[];
  setInterests: (interests: string[]) => void;
}

const MultiSelectInterests: React.FC<MultiSelectInterestsProps> = ({
  interests,
  setInterests,
}) => {
  const [inputValue, setInputValue] = useState("");

  const addInterest = () => {
    if (inputValue.trim() !== "" && !interests.includes(inputValue.trim())) {
      setInterests([...interests, inputValue.trim()]);
      setInputValue("");
    }
  };

  const removeInterest = (interest: string) => {
    setInterests(interests.filter((item) => item !== interest));
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Ajouter un centre d'intérêt..."
        value={inputValue}
        onChangeText={setInputValue}
        onSubmitEditing={addInterest}
        returnKeyType="done"
      />

      <View style={styles.chipContainer}>
        {interests.map((interest, index) => (
          <TouchableOpacity
            key={index}
            style={styles.chip}
            onPress={() => removeInterest(interest)}
          >
            <Text style={styles.chipText}>{interest} ✖</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default MultiSelectInterests;

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  chip: {
    backgroundColor: "#007bff",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    marginRight: 5,
    marginBottom: 5,
  },
  chipText: {
    color: "#fff",
  },
});
