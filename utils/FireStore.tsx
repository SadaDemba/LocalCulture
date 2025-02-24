import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db, auth } from "./firebaseConfig";
import { User } from "@/models/User";

export const saveUserToFireStore = async (
  firstName: string,
  lastName: string
) => {
  const user = auth.currentUser;
  if (!user || !user.uid) {
    console.error("User is not authenticated.");
    return;
  }

  try {
    const userRef = doc(db, "users", user.uid);
    await setDoc(
      userRef,
      {
        firstName,
        lastName,
        email: user.email,
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      },
      { merge: true }
    );
    console.log("User data saved successfully!");
  } catch (error) {
    console.error("Error while saving user data: ", error);
  }
};

export const updateUser = async (userData: Partial<User>) => {
  const user = auth.currentUser;
  if (!user || !user.uid) {
    console.error("User is not authenticated.");
    return;
  }

  try {
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, {
      ...userData,
      updatedAt: serverTimestamp(),
    });
    console.log("User data updated successfully!");
  } catch (error) {
    console.error("Error while updating user data: ", error);
    throw error;
  }
};

export const deleteUser = async () => {
  const user = auth.currentUser;
  if (!user || !user.uid) {
    console.error("User is not authenticated.");
    return;
  }

  try {
    const userRef = doc(db, "users", user.uid);
    await deleteDoc(userRef);

    console.log("User data deleted successfully!");
  } catch (error) {
    console.error("Error while deleting user data: ", error);
    throw error;
  }
};
