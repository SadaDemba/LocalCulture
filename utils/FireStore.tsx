import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  DocumentData,
  DocumentSnapshot,
  getDoc,
  getDocs,
  limit,
  orderBy,
  Query,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db, auth } from "./firebaseConfig";
import { User } from "@/models/User";
import { Event } from "@/models/Event";
import { Location } from "@/models/Location";
import { Coordinates } from "@/models/Coordinates";

export const saveUserToFireStore = async (
  firstName: string,
  lastName: string,
  bio: string
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
        bio,
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

export const getUserById = async (userId: string) => {
  if (!userId) {
    console.error("No user ID provided.");
    return null;
  }

  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      return new User(
        userData.firstName || "",
        userData.lastName || "",
        userData.email || "",
        userData.profilePicture || "",
        userData.bio || "",
        userData.interests || [],
        userSnap.id
      );
    } else {
      console.log("No user found with ID:", userId);
      return null;
    }
  } catch (error) {
    console.error("Error fetching user data: ", error);
    return null;
  }
};

export const createEvent = async (event: Event) => {
  try {
    event.createdAt = new Date().toISOString();
    event.updatedAt = new Date().toISOString();
    event.author = auth.currentUser?.uid;
    const eventRef = await addDoc(collection(db, "events"), event.toJSON());
    await addTags(event.tags);
    console.log("Event created with ID:", eventRef.id);
    return eventRef.id;
  } catch (error) {
    console.error("Error creating event: ", error);
    throw error;
  }
};

export const getEventById = async (eventId: string) => {
  try {
    const eventRef = doc(db, "events", eventId);
    const eventSnap = await getDoc(eventRef);

    const event = convertToEvent(eventSnap);

    return event;
  } catch (error) {
    console.error("Error fetching event: ", error);
    throw error;
  }
};

export const updateEvent = async (event: Event) => {
  try {
    const eventRef = doc(db, "events", event.getId()!);
    const eventSnap = await getDoc(eventRef);

    const oldEvent = convertToEvent(eventSnap);
    event.createdAt = oldEvent?.createdAt;
    event.updatedAt = new Date().toISOString();

    await updateDoc(eventRef, event.toJSON());
    console.log("Event updated successfully!");
  } catch (error) {
    console.error("Error updating event: ", error);
    throw error;
  }
};

export const getAllEvents = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "events"));

    const events = querySnapshot.docs.map((doc) => convertToEvent(doc));
    return events;
  } catch (error) {
    console.error("Error fetching events: ", error);
    throw error;
  }
};

export const deleteEvent = async (eventId: string) => {
  try {
    const eventRef = doc(db, "events", eventId);
    await deleteDoc(eventRef);
    console.log("Event deleted successfully!");
  } catch (error) {
    console.error("Error deleting event: ", error);
    throw error;
  }
};

export const getEventsByUser = async (userId: string) => {
  try {
    const q = query(collection(db, "events"), where("author", "==", userId));
    const querySnapshot = await getDocs(q);

    const events = querySnapshot.docs.map((doc) => convertToEvent(doc));
    return events;
  } catch (error) {
    console.error("Error fetching events by user: ", error);
    throw error;
  }
};

export const getEventsByTags = async (tags: string[]) => {
  if (tags.length === 0) {
    return [];
  }

  try {
    const q = query(
      collection(db, "events"),
      where("tags", "array-contains-any", tags)
    );
    const querySnapshot = await getDocs(q);

    const events = querySnapshot.docs.map((doc) => convertToEvent(doc));
    return events;
  } catch (error) {
    console.error("Error fetching events by tags: ", error);
    throw error;
  }
};

export const getEventsByUserAndTags = async (
  userId: string,
  tags: string[]
) => {
  if (tags.length === 0) {
    return getEventsByUser(userId);
  }

  try {
    const q = query(
      collection(db, "events"),
      where("author", "==", userId),
      where("tags", "array-contains-any", tags)
    );

    const querySnapshot = await getDocs(q);
    const events = querySnapshot.docs.map((doc) => convertToEvent(doc));
    return events;
  } catch (error) {
    console.error("Error fetching events by user and tags: ", error);
    throw error;
  }
};

export const convertToEvent = (
  eventSnap: DocumentSnapshot<DocumentData, DocumentData>
) => {
  if (!eventSnap.exists()) {
    console.log("No such event found!");
    return null;
  }
  const eventData = eventSnap.data();

  let location = undefined;
  if (eventData.location) {
    // console.log("Location: " + eventData.location.c);
    location = new Location(
        eventData.location.name,
        eventData.location.address,
        new Coordinates(eventData.location.coordinates.latitude, eventData.location.coordinates.longitude)
    );
  }

  const event = new Event(
    eventData.title,
    eventData.description,
    eventData.beginDate,
    eventData.author,
    eventData.tags,
    eventData.participants,
    location,
    eventData.endDate,
    eventSnap.id,
    eventData.createdAt,
    eventData.updatedAt
  );

  return event;
};

export const addTags = async (tags: string[]) => {
  try {
    const tagsRef = collection(db, "tags");

    const existingTagsSnapshot = await getDocs(tagsRef);
    const existingTags = existingTagsSnapshot.docs.map(
      (doc) => doc.data().name
    );

    const newTags = tags
      .map((tag) => tag.toLowerCase().trim())
      .filter((tag) => !existingTags.includes(tag));

    if (newTags.length === 0) {
      return;
    }

    const addPromises = newTags.map((tag) => addDoc(tagsRef, { name: tag }));
    await Promise.all(addPromises);
  } catch (error) {
    console.error("Erreur lors de l'ajout des tags :", error);
    throw error;
  }
};

export const getAllTags = async () => {
  const tagsRef = collection(db, "tags");

  const tagsSnapshot = await getDocs(tagsRef);
  const tags: string[] = tagsSnapshot.docs.map((doc) => doc.data().name);
  return tags;
};

export const getEvents = async (options: EventQueryOptions = {}) => {
  try {
    let eventsQuery: Query<DocumentData> = collection(db, "events");
    const constraints = [];

    const user = auth.currentUser;

    // Filtre par utilisateur
    if (options.userEvents) {
      switch (options.userEvents.type) {
        case "current":
          if (!user || !user.uid) {
            throw new Error("User is not authenticated");
          }
          constraints.push(where("author", "==", user.uid));
          break;
        case "others":
          if (!user || !user.uid) {
            throw new Error("User is not authenticated");
          }
          constraints.push(where("author", "!=", user.uid));
          break;
      }
    }

    // Filtre par tags (si au moins un tag est fourni)
    if (options.tags && options.tags.length > 0) {
      constraints.push(where("tags", "array-contains-any", options.tags));
    }

    // Filtre par plage de date
    /*     if (options.dateRange) {
      if (options.dateRange.start) {
        constraints.push(
          where("beginDate", ">=", options.dateRange.start.toISOString())
        );
      }
      if (options.dateRange.end) {
        constraints.push(
          where("beginDate", "<=", options.dateRange.end.toISOString())
        );
      }
    } */

    if (constraints.length > 0) {
      eventsQuery = query(eventsQuery, ...constraints);
    }

    if (options.sortBy) {
      const { field, direction } = options.sortBy;
      eventsQuery = query(eventsQuery, orderBy(field, direction));
    }

    if (options.limit && options.limit > 0) {
      eventsQuery = query(eventsQuery, limit(options.limit));
    }

    const querySnapshot = await getDocs(eventsQuery);

    const events = querySnapshot.docs.map((doc) => convertToEvent(doc));
    console.log("events");
    console.log(events);
    return events;
  } catch (error) {
    console.error("Error fetching events: ", error);
    throw error;
  }
};
