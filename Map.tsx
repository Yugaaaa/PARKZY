/**
 * CurbSense Civic Cartography: this component supplies one calm, reliable map surface;
 * all interactive map states must share this single provider loader.
 *
 * GOOGLE MAPS FRONTEND INTEGRATION - ESSENTIAL GUIDE
 *
 * USAGE FROM PARENT COMPONENT:
 * ======
 *
 * const mapRef = useRef<google.maps.Map | null>(null);
 *
 * <MapView
 *   initialCenter={{ lat: 40.7128, lng: -74.0060 }}
 *   initialZoom={15}
 *   onMapReady={(map) => {
 *     mapRef.current = map; // Store to control map from parent anytime, google map itself is in charge of the re-rendering, not react state.
 * </MapView>
 *
 * ======
 * Available Libraries and Core Features:
 * -------------------------------
 * 📍 MARKER (from `marker` library)
 * - Attaches to map using { map, position }
 * new google.maps.marker.AdvancedMarkerElement({
 *   map,
 *   position: { lat: 37.7749, lng: -122.4194 },
 *   title: "San Francisco",
 * });
 *
 * -------------------------------
 * 🏢 PLACES (from `places` library)
 * - Does not attach directly to map; use data with your map manually.
 * const place = new google.maps.places.Place({ id: PLACE_ID });
 * await place.fetchFields({ fields: ["displayName", "location"] });
 * map.setCenter(place.location);
 * new google.maps.marker.AdvancedMarkerElement({ map, position: place.location });
 *
 * -------------------------------
 * 🧭 GEOCODER (from `geocoding` library)
 * - Standalone service; manually apply results to map.
 * const geocoder = new google.maps.Geocoder();
 * geocoder.geocode({ address: "New York" }, (results, status) => {
 *   if (status === "OK" && results[0]) {
 *     map.setCenter(results[0].geometry.location);
 *     new google.maps.marker.AdvancedMarkerElement({
 *       map,
 *       position: results[0].geometry.location,
 *     });
 *   }
 * });
 *
 * -------------------------------
 * 📐 GEOMETRY (from `geometry` library)
 * - Pure utility functions; not attached to map.
 * const dist = google.maps.geometry.spherical.computeDistanceBetween(p1, p2);
 *
 * -------------------------------
 * 🛣️ ROUTES (from `routes` library)
 * - Combines DirectionsService (standalone) + DirectionsRenderer (map-attached)
 * const directionsService = new google.maps.DirectionsService();
 * const directionsRenderer = new google.maps.DirectionsRenderer({ map });
 * directionsService.route(
 *   { origin, destination, travelMode: "DRIVING" },
 *   (res, status) => status === "OK" && directionsRenderer.setDirections(res)
 * );
 *
 * -------------------------------
 * 🌦️ MAP LAYERS (attach directly to map)
 * - new google.maps.TrafficLayer().setMap(map);
 * - new google.maps.TransitLayer().setMap(map);
 * - new google.maps.BicyclingLayer().setMap(map);
 *
 * -------------------------------
 * ✅ SUMMARY
 * - “map-attached” → AdvancedMarkerElement, DirectionsRenderer, Layers.
 * - “standalone” → Geocoder, DirectionsService, DistanceMatrixService, ElevationService.
 * - “data-only” → Place, Geometry utilities.
 */

/// <reference types="@types/google.maps" />

import { useEffect, useRef } from "react";
import { usePersistFn } from "@/hooks/usePersistFn";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    google?: typeof google;
  }
}

const API_KEY = import.meta.env.VITE_FRONTEND_FORGE_API_KEY;
const FORGE_BASE_URL =
  import.meta.env.VITE_FRONTEND_FORGE_API_URL ||
  "https://forge.butterfly-effect.dev";
const MAPS_PROXY_URL = `${FORGE_BASE_URL}/v1/maps/proxy`;

const MAPS_SCRIPT_ID = "curbsense-google-maps-proxy";
let mapsScriptPromise: Promise<void> | null = null;

function waitForMapsGlobal(timeoutMs = 10000): Promise<void> {
  return new Promise((resolve, reject) => {
    const started = Date.now();
    const check = () => {
      if (window.google?.maps) {
        resolve();
        return;
      }
      if (Date.now() - started >= timeoutMs) {
        reject(new Error("Google Maps did not finish initializing."));
        return;
      }
      window.setTimeout(check, 50);
    };
    check();
  });
}

function loadMapScript(): Promise<void> {
  if (window.google?.maps) return Promise.resolve();
  if (mapsScriptPromise) return mapsScriptPromise;

  mapsScriptPromise = new Promise<void>((resolve, reject) => {
    const complete = () => {
      void waitForMapsGlobal()
        .then(resolve)
        .catch((error) => {
        mapsScriptPromise = null;
        reject(error);
      });
    };

    const fail = () => {
      mapsScriptPromise = null;
      reject(new Error("Failed to load Google Maps."));
    };

    const existingScript = document.getElementById(MAPS_SCRIPT_ID) as HTMLScriptElement | null;
    if (existingScript) {
      existingScript.addEventListener("load", complete, { once: true });
      existingScript.addEventListener("error", fail, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = MAPS_SCRIPT_ID;
    script.src = `${MAPS_PROXY_URL}/maps/api/js?key=${API_KEY}&v=weekly&libraries=marker,places,geocoding,geometry`;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.addEventListener("load", complete, { once: true });
    script.addEventListener("error", fail, { once: true });
    document.head.appendChild(script);
  });

  return mapsScriptPromise;
}

interface MapViewProps {
  className?: string;
  initialCenter?: google.maps.LatLngLiteral;
  initialZoom?: number;
  onMapReady?: (map: google.maps.Map) => void;
  onMapLoadingChange?: (isLoading: boolean) => void;
  onMapError?: (error: Error) => void;
}

export function MapView({
  className,
  initialCenter = { lat: 37.7749, lng: -74.0060 },
  initialZoom = 12,
  onMapReady,
  onMapLoadingChange,
  onMapError,
}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);

  const init = usePersistFn(async () => {
    onMapLoadingChange?.(true);
    try {
      await loadMapScript();
      if (!mapContainer.current) {
        throw new Error("Map container not found.");
      }
      if (map.current) {
        onMapLoadingChange?.(false);
        return;
      }
      map.current = new window.google.maps.Map(mapContainer.current, {
        zoom: initialZoom,
        center: initialCenter,
        mapTypeControl: true,
        fullscreenControl: true,
        zoomControl: true,
        streetViewControl: true,
        mapId: "DEMO_MAP_ID",
      });
      onMapReady?.(map.current);
      onMapLoadingChange?.(false);
    } catch (error) {
      onMapLoadingChange?.(false);
      onMapError?.(error instanceof Error ? error : new Error("Unable to initialize the map."));
    }
  });

  useEffect(() => {
    init();
  }, [init]);

  return (
    <div ref={mapContainer} className={cn("w-full h-[500px]", className)} />
  );
}
