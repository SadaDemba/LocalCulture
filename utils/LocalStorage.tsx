import AsyncStorage from "@react-native-async-storage/async-storage";

export const storeData = async (key: string, value: string) => {
  try {
    await AsyncStorage.setItem(key, value);
    console.log(`Donnée stockée avec succès sous la clé: ${key}`);
  } catch (e) {
    console.error("Erreur lors du stockage des données", e);
  }
};

export const getData = async (key: string) => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ?? "";
  } catch (e) {
    console.error("Erreur lors de la récupération des données", e);
  }
};
