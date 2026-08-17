/**
 * CurbSense Civic Cartography: advanced markers make every curb space readable,
 * while a calm loading layer preserves trust on slow or unavailable networks.
 */
import React, { useEffect, useRef, useState } from 'react';
import { MarkerClusterer, Renderer } from '@googlemaps/markerclusterer';
import { MapView } from '../Map';
import { Coordinates } from '../../utils/geoUtils';
import { ParkingSpace, ParkingZone, SpaceStatus } from '../../types';

interface ManagedGoogleMapSurfaceProps {
  spaces: ParkingSpace[];
  zones: ParkingZone[];
  selectedZoneId: string | null;
  center: Coordinates;
  zoom: number;
  userLocation: Coordinates | null;
  onSelectSpace: (space: ParkingSpace) => void;
  onSelectZone: (zone: ParkingZone) => void;
  className?: string;
}

type MapStatus = 'loading' | 'ready' | 'error';

type CurbSenseMapDebugWindow = Window & {
  __curbsenseMapDebug?: {
    advancedMarkerCount: number;
    zoneMarkerCount: number;
    selectFirstAvailable: () => void;
    selectFirstZone: () => void;
    visibleZoneMarkerCount: () => number;
    visibleSpaceOrder: string[];
    setMapZoom: (zoom: number) => void;
  };
};

const statusColor = (status: SpaceStatus) => {
  switch (status) {
    case 'available':
      return '#0a7d73';
    case 'held':
      return '#d97706';
    case 'occupied':
    case 'reserved':
    case 'conflict':
      return '#b94c40';
    default:
      return '#78716c';
  }
};

const statusName = (status: SpaceStatus) => status.replaceAll('_', ' ');

const makePinContent = (space: ParkingSpace) => {
  const color = statusColor(space.status);
  const pin = document.createElement('div');
  pin.className = 'relative flex h-10 min-w-10 items-center justify-center rounded-full border-2 border-white px-1.5 text-[10px] font-extrabold tracking-wide text-white shadow-lg transition-transform duration-150 hover:scale-110 focus:scale-110';
  pin.dataset.curbsenseSpaceId = space.id;
  pin.dataset.curbsenseStatus = space.status;
  pin.style.backgroundColor = color;
  pin.style.boxShadow = `0 8px 20px ${color}59`;
  pin.setAttribute('aria-hidden', 'true');

  const inner = document.createElement('span');
  inner.className = 'flex h-6 min-w-6 items-center justify-center rounded-full border border-white/40 px-1 text-[9px]';
  inner.textContent = space.label.replace(/^[A-Z-]+/, '') || 'P';
  pin.appendChild(inner);
  return pin;
};

const makeClusterContent = (count: number) => {
  const cluster = document.createElement('div');
  cluster.className = 'flex h-12 min-w-12 items-center justify-center rounded-full border-[3px] border-white bg-teal px-2 text-sm font-extrabold text-white shadow-xl ring-4 ring-teal/20 transition-transform duration-150 hover:scale-110';
  cluster.textContent = String(count);
  cluster.setAttribute('aria-hidden', 'true');
  return cluster;
};

const clusterRenderer: Renderer = {
  render: ({ count, position }) =>
    new google.maps.marker.AdvancedMarkerElement({
      position,
      content: makeClusterContent(count),
      title: `${count} nearby parking spaces`,
      zIndex: 1000 + count,
    }),
};

const makeZoneContent = (zone: ParkingZone, selected: boolean) => {
  const ring = document.createElement('button');
  ring.type = 'button';
  ring.className = `relative flex h-[5.5rem] w-[5.5rem] items-center justify-center rounded-full border-[3px] border-white bg-[#0b2926]/85 text-center text-white shadow-[0_0_0_3px_#0a7d73,0_10px_24px_rgba(13,42,38,.38)] transition-transform duration-150 hover:scale-110 ${selected ? 'ring-4 ring-[#f4b860] scale-110' : ''}`;
  ring.dataset.curbsenseZoneId = zone.id;
  ring.setAttribute('aria-label', `${zone.name}. Click to show its parking bays.`);

  const inner = document.createElement('span');
  inner.className = 'flex h-[3.8rem] w-[3.8rem] flex-col items-center justify-center rounded-full border border-white/70 bg-[#0f4d45]/95 px-1';
  const title = document.createElement('span');
  title.className = 'max-w-[3.4rem] truncate text-[9px] font-extrabold leading-tight';
  title.textContent = zone.name.split(' ')[0];
  const subtitle = document.createElement('span');
  subtitle.className = 'mt-0.5 text-[8px] font-bold text-[#c9f1e7]';
  subtitle.textContent = 'Show bays';
  inner.append(title, subtitle);
  ring.appendChild(inner);
  return ring;
};

const makeUserLocationContent = () => {
  const location = document.createElement('div');
  location.className = 'relative flex h-5 w-5 items-center justify-center rounded-full border-[3px] border-white bg-teal shadow-lg ring-8 ring-teal/20';
  location.setAttribute('aria-hidden', 'true');
  return location;
};

export const ManagedGoogleMapSurface: React.FC<ManagedGoogleMapSurfaceProps> = ({
  spaces,
  zones,
  selectedZoneId,
  center,
  zoom,
  userLocation,
  onSelectSpace,
  onSelectZone,
  className,
}) => {
  const mapRef = useRef<google.maps.Map | null>(null);
  const clustererRef = useRef<MarkerClusterer | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const zoneMarkersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const userMarkerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapStatus, setMapStatus] = useState<MapStatus>('loading');
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!mapRef.current || !mapReady) return;

    mapRef.current.setCenter(center);
    mapRef.current.setZoom(zoom);

    clustererRef.current?.clearMarkers();
    markersRef.current.forEach((marker) => {
      marker.map = null;
    });
    zoneMarkersRef.current.forEach((marker) => {
      marker.map = null;
    });

    zoneMarkersRef.current = zones.map((zone) => {
      const marker = new google.maps.marker.AdvancedMarkerElement({
        map: mapRef.current,
        position: { lat: zone.lat, lng: zone.lng },
        title: `${zone.name}. Click to show its parking bays.`,
        content: makeZoneContent(zone, selectedZoneId === zone.id),
        gmpClickable: true,
        zIndex: selectedZoneId === zone.id ? 900 : 500,
      });
      marker.addEventListener('gmp-click', () => onSelectZone(zone));
      return marker;
    });

    markersRef.current = spaces.map((space) => {
      const content = makePinContent(space);
      const marker = new google.maps.marker.AdvancedMarkerElement({
        position: { lat: space.lat, lng: space.lng },
        title: `Bay ${space.label} — ${statusName(space.status)}`,
        content,
        gmpClickable: true,
      });
      marker.addEventListener('gmp-click', () => onSelectSpace(space));
      // Retain an explicit content-level fallback so a user can always open the
      // reservation drawer even when a map provider intercepts marker events.
      content.addEventListener('click', () => onSelectSpace(space));
      return marker;
    });

    // When a zone is expanded, every bay is deliberately rendered as an individual,
    // immediately clickable pin rather than being reclustered into another aggregate.
    if (selectedZoneId) {
      markersRef.current.forEach((marker) => {
        marker.map = mapRef.current;
      });
    } else {
      clustererRef.current = new MarkerClusterer({
        map: mapRef.current,
        markers: markersRef.current,
        renderer: clusterRenderer,
        algorithmOptions: { maxZoom: 16 },
      });
    }

    // Zone rings stay visible at the overview level. Selecting a zone expands its
    // pins at street level and hides all rings until the user zooms back out.
    const syncZoneVisibility = () => {
      const currentZoom = mapRef.current?.getZoom() ?? zoom;
      const shouldHideZoneRings = Boolean(selectedZoneId) && currentZoom >= 15;
      zoneMarkersRef.current.forEach((marker) => {
        marker.map = shouldHideZoneRings ? null : mapRef.current;
      });
    };
    syncZoneVisibility();
    const zoomListener = mapRef.current.addListener('zoom_changed', syncZoneVisibility);

    userMarkerRef.current && (userMarkerRef.current.map = null);
    if (userLocation) {
      userMarkerRef.current = new google.maps.marker.AdvancedMarkerElement({
        position: userLocation,
        map: mapRef.current,
        title: 'Your current location',
        content: makeUserLocationContent(),
      });
    }

    if (import.meta.env.DEV) {
      (window as CurbSenseMapDebugWindow).__curbsenseMapDebug = {
        advancedMarkerCount: markersRef.current.length,
        zoneMarkerCount: zoneMarkersRef.current.length,
        selectFirstAvailable: () => {
          const availableSpace = spaces.find((space) => space.status === 'available');
          if (availableSpace) onSelectSpace(availableSpace);
        },
        selectFirstZone: () => {
          const firstZone = zones[0];
          if (firstZone) onSelectZone(firstZone);
        },
        visibleZoneMarkerCount: () => zoneMarkersRef.current.filter((marker) => Boolean(marker.map)).length,
        visibleSpaceOrder: spaces.map((space) => space.id),
        setMapZoom: (nextZoom) => mapRef.current?.setZoom(nextZoom),
      };
    }

    return () => {
      clustererRef.current?.clearMarkers();
      markersRef.current.forEach((marker) => {
        marker.map = null;
      });
      zoomListener.remove();
      if (userMarkerRef.current) userMarkerRef.current.map = null;
      zoneMarkersRef.current.forEach((marker) => {
        marker.map = null;
      });
      if (import.meta.env.DEV) delete (window as CurbSenseMapDebugWindow).__curbsenseMapDebug;
    };
  }, [center, mapReady, onSelectSpace, onSelectZone, selectedZoneId, spaces, userLocation, zones, zoom]);

  const retryMap = () => {
    mapRef.current = null;
    setMapReady(false);
    setMapStatus('loading');
    setRetryKey((key) => key + 1);
  };

  return (
    <div className="relative h-full w-full overflow-hidden">
      <MapView
        key={retryKey}
        initialCenter={center}
        initialZoom={zoom}
        className={className}
        onMapLoadingChange={(isLoading) => {
          if (isLoading) setMapStatus('loading');
        }}
        onMapReady={(map) => {
          mapRef.current = map;
          setMapReady(true);
          setMapStatus('ready');
        }}
        onMapError={() => setMapStatus('error')}
      />

      {mapStatus === 'loading' && (
        <div
          className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center bg-sand-50/80 backdrop-blur-sm dark:bg-graphite/80"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-3 rounded-2xl border border-sand-300 bg-sand-50 px-4 py-3 shadow-xl dark:border-graphite-light dark:bg-graphite">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-teal/25 border-t-teal" />
            <div>
              <p className="text-xs font-bold text-graphite dark:text-sand-100">Syncing curbside map</p>
              <p className="text-[11px] text-graphite-muted dark:text-sand-400">Loading live Coimbatore map evidence…</p>
            </div>
          </div>
        </div>
      )}

      {mapStatus === 'error' && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-sand-50/90 p-6 text-center backdrop-blur-sm dark:bg-graphite/90">
          <div className="max-w-xs space-y-3 rounded-3xl border border-sand-300 bg-sand-50 p-5 shadow-xl dark:border-graphite-light dark:bg-graphite">
            <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-clay/10 text-lg font-bold text-clay">!</span>
            <div>
              <p className="font-serif text-base font-bold text-graphite dark:text-sand-100">Map temporarily unavailable</p>
              <p className="mt-1 text-xs leading-relaxed text-graphite-muted dark:text-sand-400">You can still compare zones and availability below. Try reconnecting when your network is ready.</p>
            </div>
            <button
              type="button"
              onClick={retryMap}
              className="w-full rounded-2xl bg-teal px-3 py-2.5 text-xs font-bold text-white shadow-md transition-transform duration-150 hover:bg-teal-hover active:scale-[0.97]"
            >
              Retry map connection
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
