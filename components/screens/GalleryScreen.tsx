import { SafeAreaView, View, Text, StatusBar } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function GalleryScreen() {
  const insets = useSafeAreaInsets();
  return (
    <SafeAreaView>
      <View>
        <Text>Gallery screen</Text>
      </View>
    </SafeAreaView>
  );
}
