// Event types
export interface EventLocation {
  name: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: EventLocation;
  category: string;
  imageUrl: string;
  organizer: string;
  likes: number;
  attendees: number;
}

// Map marker type (for LeafletView)
export interface MapMarker {
  id: string;
  position: {
    lat: number;
    lng: number;
  };
  icon: string;
  size: [number, number];
  title: string;
  description: string;
}
