import React, {useCallback, useEffect, useState} from "react";
import {View, Text, StyleSheet, Dimensions, Alert} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LatLng, LeafletView } from 'react-native-leaflet-view';
import * as Location from 'expo-location';

// Import types
import { Event } from "@/models/Event";

// Import category icons
import { getCategoryIcon } from '../markers/CategoryIcons';
import { getAllEvents, getAllTags, getEvents } from "@/utils/FireStore";
import {useFocusEffect} from "expo-router";

// Get device dimensions
const { width, height } = Dimensions.get('window');

interface MapMarker {
    id: string;
    position: { lat: number; lng: number };
    icon: string;
    size: [number, number];
    title: string;
    description: string;
}

export function MapScreen() {
    const [events, setEvents] = useState<Event[]>([]);
    const [markers, setMarkers] = useState<MapMarker[]>([]);
    const [mapCenter, setMapCenter] = useState({ lat: 48.8566, lng: 2.3522 }); // Paris center as default
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [locationPermission, setLocationPermission] = useState(false);
    const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

    // Request location permissions
    const requestLocationPermission = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert(
                    "Permission refusée",
                    "Nous avons besoin de votre localisation pour afficher les évènements proches de vous. Vous pouvez modifier ce paramètre dans les réglages de votre appareil.",
                    [{ text: "OK" }]
                );
                setLocationPermission(false);
                return;
            }

            setLocationPermission(true);
            getUserLocation();
        } catch (error) {
            console.error("Error requesting location permission:", error);
            Alert.alert("Erreur", "Impossible d'accéder à votre localisation");
        }
    };


    // Get user's current location
    const getUserLocation = async () => {
        try {
            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });

            const userPos = {
                lat: location.coords.latitude,
                lng: location.coords.longitude
            };

            setUserLocation(userPos);
            setMapCenter(userPos); // Center map on user's location

            console.log("User location:", userPos);
        } catch (error) {
            console.error("Error getting location:", error);
            Alert.alert("Erreur", "Impossible de récupérer votre position");
        }
    };

    useEffect(() => {
        requestLocationPermission();
    }, []);

    const fetchEvents = async () => {
        try {
            // setRefreshing(true);
            // setFilters();

            console.log("Fetching events");
            const fetchedEvents = await getEvents();
            if (fetchedEvents) {
                setEvents(fetchedEvents);
                console.log(`Events loaded: ${fetchedEvents.length}`);
            }            // const tags = await getAllTags();
            // if (events) {
            //     setEvents(events);
            // }
            // if (tags) {
            //     setTags(tags);
            // }
        } catch (error) {
            console.error("Erreur lors du chargement:", error);
            Alert.alert("Erreur", "Impossible de charger les évènements");
        } finally {
            // setRefreshing(false);
        }
    };

    useEffect(() => {
        if (!events || events.length === 0) {
            console.log("No events to display on map");
            return;
        }

        console.log(`Converting ${events.length} events to map markers`);


        const eventMarkers: MapMarker[] = events
            .filter(event =>  event.location && event.location.coordinates)
            .map(event => {
                if (!event.location ||
                    !event.location.coordinates) {
                    return null;
                }

                console.log(event.location.coordinates);

                return {
                    id: event.getId(),
                    position: {
                        lat: event.location.coordinates.latitude,
                        lng: event.location.coordinates.longitude
                    },
                    icon: getCategoryIcon(event.tags[0]),
                    size: [32, 32],
                    title: event.title,
                    description: event.description,
                };
            })
            .filter(marker => marker !== null) as MapMarker[];

        console.log(`Created ${eventMarkers.length} markers`);
        console.log(eventMarkers);


        setMarkers(eventMarkers);
    }, [events]);

    useFocusEffect(
        useCallback(() => {
            fetchEvents();
            return () => {};
        }, [])
    );

    const onRefresh = () => {
        fetchEvents();
    };

    const handleMessageReceived = (message: any) => {
        try {
            const { event, payload } = message;

            // Handle marker click event
            if (event === 'onMapMarkerClicked') {
                // console.log('Marker clicked:', payload.mapMarkerID);
                const markerId = payload.mapMarkerID;
                // console.log('Marker clicked:', markerId);

                // Find the selected event
                const foundEvent = eventData.find(event => event.id === markerId);
                if (foundEvent) {
                    // console.log('Event details:', foundEvent);
                    setSelectedEvent(foundEvent);
                }
            }
        } catch (error) {
            console.error('Error parsing message:', error);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.headerText}>Évènements proches de vous</Text>
            </View>
            <View style={styles.mapContainer}>
                <LeafletView
                    zoom={13}
                    mapCenterPosition={mapCenter}
                    mapMarkers={markers}
                    mapLayers={[
                        {
                            url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                            attribution: '© OpenStreetMap contributors'
                        }
                    ]}
                    onMessageReceived={handleMessageReceived}
                />
            </View>

            {selectedEvent && (
                <View style={styles.eventInfoContainer}>
                    <Text style={styles.eventTitle}>{selectedEvent.title}</Text>
                    <Text style={styles.eventDetails}>
                        {selectedEvent.date} at {selectedEvent.time} • {selectedEvent.location.name}
                    </Text>
                    <Text style={styles.eventDescription}>{selectedEvent.description}</Text>
                </View>
            )}

        </SafeAreaView>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    headerContainer: {
        padding: 16,
        backgroundColor: '#f8f8f8',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    subHeaderText: {
        fontSize: 16,
        color: '#666',
        marginTop: 4,
    },
    mapContainer: {
        flex: 1,
        width: width,
        height: height - 150, // Leave space for header and navigation
    },
    map: {
        width: '100%',
        height: '100%',
    },
    eventInfoContainer: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    eventTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    eventDetails: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    eventDescription: {
        fontSize: 14,
        color: '#333',
    }
});