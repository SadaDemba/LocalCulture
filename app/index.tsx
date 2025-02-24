import {
  NavigationContainer,
  NavigationIndependentTree,
} from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { AuthScreen } from "@/components/screens/AuthScreen";
import { RootStackParamList } from "@/utils/types";
import { DrawerNavigator } from "@/components/navigation/DrawerNavigation";

export default function Index() {
  const Stack = createStackNavigator<RootStackParamList>();
  return (
    <NavigationIndependentTree>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {true ? (
          <Stack.Screen name="Main" component={DrawerNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthScreen} />
        )}
      </Stack.Navigator>
    </NavigationIndependentTree>
  );
}
