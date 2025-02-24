import React from "react";
import { View, Text } from "react-native";
import { styles } from "@/components/drawer/styles";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { auth } from "@/utils/firebaseConfig";

export const DrawerHeader = () => {
  const user = auth.currentUser;

  return (
    <View style={styles.profileContainer}>
      <View style={styles.avatarContainer}>
        <MaterialCommunityIcons
          name="account-circle"
          size={60}
          color="#fac039"
        />
      </View>
      <Text style={styles.userName}>
        {user?.displayName || user?.email || "Utilisateur"}
      </Text>
      <Text style={styles.userEmail}>{user?.email}</Text>
    </View>
  );
};
