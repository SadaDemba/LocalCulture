import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LatLng, LeafletView } from 'react-native-leaflet-view';

// Import types
import { Event, MapMarker } from '../../types';

// Import category icons
import { getCategoryIcon } from '../markers/CategoryIcons';

// Import static event data
// We need to explicitly cast the imported JSON as an array of Event objects
const eventData = require('../../data/events.json') as Event[];

// Get device dimensions
const { width, height } = Dimensions.get('window');

export function MapScreen() {
    const [markers, setMarkers] = useState<MapMarker[]>([]);
    const [mapCenter, setMapCenter] = useState({ lat: 48.8566, lng: 2.3522 }); // Paris center as default
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

    useEffect(() => {
        // Convert event data to map markers
        const eventMarkers: MapMarker[] = eventData.map(event => ({
            id: event.id,
            position: event.location.coordinates,
            icon: getCategoryIcon(event.category),
            size: [32, 32],
            title: event.title,
            description: `${event.description} - ${event.date} at ${event.time}`
        }));
        
        setMarkers(eventMarkers);
    }, []);


    const handleMessageReceived = (message: any) => {
        try {
            const { event, payload } = message;

            // Handle marker click event
            if (event === 'onMapMarkerClicked') {
                console.log('Marker clicked:', payload.mapMarkerID);
                const markerId = payload.mapMarkerID;
                console.log('Marker clicked:', markerId);

                // Find the selected event
                const foundEvent = eventData.find(event => event.id === markerId);
                if (foundEvent) {
                    console.log('Event details:', foundEvent);
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
                    // style={styles.map}
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