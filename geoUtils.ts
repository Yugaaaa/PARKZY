export interface Coordinates {
  lat: number;
  lng: number;
}

// Default Coimbatore City Center Anchor (near Town Hall / Collectorate)
export const COIMBATORE_CENTER: Coordinates = {
  lat: 11.008,
  lng: 76.961,
};

// Calculate Haversine distance between two coordinates in kilometers
export function calculateHaversineDistanceKm(
  coord1: Coordinates,
  coord2: Coordinates
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const dLon = ((coord2.lng - coord1.lng) * Math.PI) / 180;
  const lat1 = (coord1.lat * Math.PI) / 180;
  const lat2 = (coord2.lat * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

// Estimate walk time in minutes (assuming 4.8 km/h walking speed)
export function estimateWalkMinutes(distanceKm: number): number {
  return Math.max(1, Math.round(distanceKm * 12.5));
}

// Estimate driving time in minutes (assuming city average 22 km/h)
export function estimateDriveMinutes(distanceKm: number): number {
  return Math.max(1, Math.round((distanceKm / 22) * 60));
}

// Format readable distance and walk label
export function formatDistanceWalkLabel(
  userCoord: Coordinates | null,
  targetCoord: Coordinates
): { distanceKm: number; label: string } {
  if (!userCoord) {
    return { distanceKm: 0, label: 'Nearby in Coimbatore' };
  }
  const distanceKm = calculateHaversineDistanceKm(userCoord, targetCoord);
  const walkMins = estimateWalkMinutes(distanceKm);

  if (distanceKm < 1) {
    const meters = Math.round(distanceKm * 1000);
    return {
      distanceKm,
      label: `${meters}m · ${walkMins} min walk`,
    };
  }

  return {
    distanceKm,
    label: `${distanceKm} km · ${walkMins} min walk`,
  };
}

// Generate native Google Maps deep link
export function getGoogleMapsDirectionsUrl(
  origin: Coordinates | null,
  destination: Coordinates,
  travelMode: 'driving' | 'walking' | 'two_wheeler' | 'transit' = 'driving'
): string {
  let modeParam = 'driving';
  if (travelMode === 'walking') modeParam = 'walking';
  else if (travelMode === 'transit') modeParam = 'transit';
  else if (travelMode === 'two_wheeler') modeParam = 'two_wheeler';

  const originParam = origin ? `&origin=${origin.lat},${origin.lng}` : '';
  return `https://www.google.com/maps/dir/?api=1${originParam}&destination=${destination.lat},${destination.lng}&travelmode=${modeParam}`;
}
