import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";

import { CustomDrawerContent } from "@/components/drawer/DrawerContent";
import { DrawerParamList } from "@/utils/types";
import { MainScreen } from "../screens/MainScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { MapScreen } from "../screens/MapScreen";
import { GalleryScreen } from "../screens/GalleryScreen";

const Drawer = createDrawerNavigator<DrawerParamList>();

export const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: "#ffffff",
        },
      }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen name="Home" component={MainScreen} />
      <Drawer.Screen name="Map" component={MapScreen} />
      <Drawer.Screen name="Gallery" component={GalleryScreen} />
      <Drawer.Screen name="Profile" component={ProfileScreen} />
    </Drawer.Navigator>
  );
};
