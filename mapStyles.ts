// Custom Google Maps Styles adhering to "Curb Atlas" civic wayfinding design system
// Muted roads, warm paper/limestone background, graphite text, teal water/parks

export const LIGHT_MAP_STYLE: google.maps.MapTypeStyle[] = [
  {
    elementType: 'geometry',
    stylers: [{ color: '#f6f3ec' }], // Warm limestone base
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#fffefa' }, { weight: 3 }],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [{ color: '#1f2a2a' }], // Graphite ink text
  },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#075f57' }, { weight: 'bold' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#526160' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#e4f4ef' }], // Pale teal park areas
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#0a7d73' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#ffffff' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#dedbd2' }], // Delicate line borders
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#faedd9' }], // Subtle warm arterial road
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#e5cbb0' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#7a4e10' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#e8e5dc' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#d2ece6' }], // Subtle Kovai teal water
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#075f57' }],
  },
];

export const DARK_MAP_STYLE: google.maps.MapTypeStyle[] = [
  {
    elementType: 'geometry',
    stylers: [{ color: '#141e1c' }],
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#0c1312' }],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [{ color: '#8eaba5' }],
  },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#14a094' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#52726c' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#102724' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#1f2d2b' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#2a3b38' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#2b3f3b' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#385550' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#091c19' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#14a094' }],
  },
];
