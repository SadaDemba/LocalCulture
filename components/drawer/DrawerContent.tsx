import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
} from "@react-navigation/drawer";
import {
  getFocusedRouteNameFromRoute,
  useRoute,
} from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { DrawerHeader } from "@/components/drawer/DrawerHeader";
import { styles } from "@/components/drawer/styles";
import { NavigationItem } from "@/models/NavigationItem";

export const CustomDrawerContent = (props: DrawerContentComponentProps) => {
  const { navigation } = props;
  const route = useRoute();
  const routeName = getFocusedRouteNameFromRoute(route);

  const menuItems = [
    new NavigationItem("Accueil", "home-circle", "Home"),
    new NavigationItem("Gallerie", "cog", "Gallery"),
    new NavigationItem("Carte", "map", "Map"),
    new NavigationItem("Profil", "cog", "Profile"),
  ];

  const handleLogout = () => {
    console.log("User signed out!");
  };

  return (
    <View style={styles.container}>
      <DrawerHeader />
      <DrawerContentScrollView>
        <View style={styles.menuContainer}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.screen}
              style={[
                styles.menuItem,
                routeName === item.screen && styles.activeMenuItem,
              ]}
              onPress={() => navigation.navigate(item.screen)}
            >
              <MaterialCommunityIcons
                name={item.icon}
                size={24}
                color={routeName === item!.screen ? "white" : "gray"}
              />
              <Text
                style={[
                  styles.menuItemText,
                  routeName === item!.screen && styles.activeMenuItemText,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </DrawerContentScrollView>
      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <MaterialCommunityIcons name="logout" size={24} color="white" />
        <Text style={styles.logoutText}>Déconnexion</Text>
      </TouchableOpacity>
    </View>
  );
};
