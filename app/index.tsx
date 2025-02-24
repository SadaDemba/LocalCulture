import { NavigationIndependentTree } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { AuthScreen } from "@/components/screens/AuthScreen";
import { RootStackParamList } from "@/utils/types";
import { DrawerNavigator } from "@/components/navigation/DrawerNavigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../utils/firebaseConfig";
import { ActivityIndicator, View, Text } from "react-native";

const Stack = createStackNavigator<RootStackParamList>();

export default function Index() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (usr) => {
      setUser(usr);
      const loadingTimer = setTimeout(() => {
        setIsLoading(false);
      }, 1500);

      return () => {
        clearTimeout(loadingTimer);
      };
    });
    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="tomato" />
        <Text>Chargement ...</Text>
      </View>
    );
  }

  return (
    <NavigationIndependentTree>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="Main" component={DrawerNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthScreen} />
        )}
      </Stack.Navigator>
    </NavigationIndependentTree>
  );
}
