import React from "react";
import { View, Text } from "react-native";
import { styles } from "@/components/drawer/styles";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export const DrawerHeader = () => {
  return (
    <View style={styles.profileContainer}>
      <View style={styles.avatarContainer}>
        <MaterialCommunityIcons
          name="account-circle"
          size={60}
          color="#fac039"
        />
      </View>
      <Text style={styles.userName}>Username</Text>
      <Text style={styles.userEmail}>Email</Text>
    </View>
  );
};
