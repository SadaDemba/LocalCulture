import React from "react";
import {
  View,
  TouchableOpacity,
  Text,
  SafeAreaView,
  StatusBar,
} from "react-native";
import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
} from "@react-navigation/drawer";
import {
  getFocusedRouteNameFromRoute,
  useRoute,
} from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { DrawerHeader } from "@/components/drawer/DrawerHeader";
import { styles } from "@/components/drawer/styles";
import { NavigationItem } from "@/models/NavigationItem";
import { auth } from "@/utils/firebaseConfig";

export const CustomDrawerContent = (props: DrawerContentComponentProps) => {
  const { navigation } = props;
  const routeName = getFocusedRouteNameFromRoute(useRoute());

  const menuItems = [
    new NavigationItem("Accueil", "home", "Home"),
    new NavigationItem("Ajouter Évènement", "event", "AddEvent"),
    new NavigationItem("Gallerie", "image", "Gallery"),
    new NavigationItem("Carte", "map", "Map"),
    new NavigationItem("Profil", "settings-applications", "Profile"),
  ];

  const handleLogout = () => {
    auth.signOut().then(() => console.log("User signed out!"));
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ backgroundColor: "#665b41" }}>
        <StatusBar
          translucent
          backgroundColor="transparent"
          barStyle="dark-content"
        />
        <DrawerHeader />
      </SafeAreaView>
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
              <MaterialIcons
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
        <MaterialIcons name="logout" size={24} color="white" />
        <Text style={styles.logoutText}>Déconnexion</Text>
      </TouchableOpacity>
    </View>
  );
};
