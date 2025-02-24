import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';


const firebaseConfig = {
    apiKey: "AIzaSyBVvdIWMFwFJPdcIvIFrxh_H29V1tiaTcc",
    authDomain: "localculture-m2.firebasestorage.com",
    projectId: "localculture-m2",
    storageBucket: "localculture-m2.firebasestorage.app",
    messagingSenderId: "621418285006",
    appId: "1:621418285006:android:6725eafa0bf904187f0d9f"
};

const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
});

const db = getFirestore(app);

export { app, auth, db };