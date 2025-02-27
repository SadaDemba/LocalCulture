import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";

import { CustomDrawerContent } from "@/components/drawer/DrawerContent";
import { DrawerParamList } from "@/utils/types";
import { MainScreen } from "../screens/MainScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { MapScreen } from "../screens/MapScreen";
import { GalleryScreen } from "../screens/GalleryScreen";
import { AddEventScreen } from "../screens/AddEventScreen";

const Drawer = createDrawerNavigator<DrawerParamList>();

export const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: "#665b41",
        },

        headerTintColor: "#ffffff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
        drawerStyle: {
          backgroundColor: "#ffffff",
        },
      }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen name="Home" component={MainScreen} />
      <Drawer.Screen name="AddEvent" component={AddEventScreen} />
      <Drawer.Screen name="Map" component={MapScreen} />
      <Drawer.Screen name="Gallery" component={GalleryScreen} />
      <Drawer.Screen name="Profile" component={ProfileScreen} />
    </Drawer.Navigator>
  );
};
