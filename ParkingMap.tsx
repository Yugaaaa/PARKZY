/**
 * Unified ParkingMap Component
 *
 * CurbSense Civic Cartography: one managed map surface keeps real Coimbatore streets,
 * clustered bays, and reservation actions visually calm and operationally reliable.
 *
 * Architecture: the shared proxy-backed MapView is the sole Google Maps API loader.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MapPin,
  Navigation,
  Crosshair,
  Search,
  CheckCircle2,
  Clock,
  Car,
  Bike,
  Zap,
  Accessibility,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Layers,
  Wrench,
  X,
  ArrowRight,
  ChevronDown,
  SlidersHorizontal,
  Ticket,
  Download,
  Share2,
} from 'lucide-react';
import { useCurb } from '../../context/CurbContext';
import { ParkingSpace, ParkingZone, SpaceStatus, VehicleType } from '../../types';
import {
  Coordinates,
  COIMBATORE_CENTER,
  formatDistanceWalkLabel,
  calculateHaversineDistanceKm,
} from '../../utils/geoUtils';
import { DirectionsPanel } from './DirectionsPanel';
import { ManagedGoogleMapSurface } from './ManagedGoogleMapSurface';
import { cn } from '../../lib/utils';
import { persistReservation, type ReservationReceipt } from '../../lib/reservationApi';

// Landmarks in Coimbatore for quick destination filtering
type SpaceSortMode = 'default' | 'rate' | 'distance';

const COIMBATORE_HUBS = [
  { name: 'Brookefields Mall', area: 'Krishnaswamy Rd', lat: 11.0078, lng: 76.9582 },
  { name: 'Gandhipuram Central Bus Stand', area: 'Central Sector', lat: 11.0188, lng: 76.9678 },
  { name: 'Coimbatore Junction Railway Station', area: 'Station Road', lat: 10.9981, lng: 76.9634 },
  { name: 'Town Hall Clock Tower', area: 'Heritage Core', lat: 11.0018, lng: 76.9628 },
  { name: 'DB Road Flower Market', area: 'R.S. Puram', lat: 11.0096, lng: 76.9482 },
  { name: 'Race Course Promenade', area: 'Thomas Park', lat: 11.0035, lng: 76.9745 },
  { name: 'PSG Tech / Peelamedu', area: 'Avinashi Road', lat: 11.0255, lng: 76.9925 },
  { name: 'Cross Cut Market', area: '7th Street', lat: 11.0215, lng: 76.9612 },
];

export interface ParkingMapProps {
  spacesOverride?: ParkingSpace[];
  selectedZoneIdOverride?: string | null;
  onSelectSpace?: (space: ParkingSpace) => void;
  onOpenReservations?: () => void;
  height?: string;
  showSearchBar?: boolean;
  showControls?: boolean;
  isAuthorityMode?: boolean;
  className?: string;
}

export const ParkingMap: React.FC<ParkingMapProps> = ({
  spacesOverride,
  selectedZoneIdOverride,
  onSelectSpace: onSelectSpaceProp,
  onOpenReservations,
  height = '580px',
  showSearchBar = true,
  showControls = true,
  isAuthorityMode = false,
  className = '',
}) => {
  const {
    theme,
    surfaceMode,
    currentUser,
    zones,
    spaces: contextSpaces,
    selectedZoneId: contextZoneId,
    setSelectedZoneId,
    selectedVehicleFilter,
    setSelectedVehicleFilter,
    searchQuery,
    userLocation,
    setUserLocation,
    destinationLocation,
    setDestinationLocation,
    activeReservation,
    holdFormattedTime,
    createHold,
    activeNavSpace,
    updateSpaceStatus,
  } = useCurb();

  const activeSpaces = spacesOverride || contextSpaces;
  const activeZoneId = selectedZoneIdOverride !== undefined ? selectedZoneIdOverride : contextZoneId;

  // Selected space state for bottom action card
  const [selectedSpace, setSelectedSpace] = useState<ParkingSpace | null>(null);
  const [destinationSearch, setDestinationSearch] = useState('');
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);
  const [mapCenter, setMapCenter] = useState<Coordinates>(COIMBATORE_CENTER);
  const [mapZoom, setMapZoom] = useState(14);
  const [bottomPanel, setBottomPanel] = useState<
    'space-details' | 'directions' | 'authority-actions' | null
  >(null);
  const [isLocating, setIsLocating] = useState(false);
  const [authorityToast, setAuthorityToast] = useState<string | null>(null);
  const [arrivalTime, setArrivalTime] = useState<'now' | '15m' | '30m' | '60m'>('now');
  const [needsAccessibilityPermit, setNeedsAccessibilityPermit] = useState(false);
  const [confirmationReceipt, setConfirmationReceipt] = useState<ReservationReceipt | null>(null);
  const [isMapToolsOpen, setIsMapToolsOpen] = useState(false);
  const [spaceSortMode, setSpaceSortMode] = useState<SpaceSortMode>('default');
  const [receiptAction, setReceiptAction] = useState<string | null>(null);

  useEffect(() => {
    setArrivalTime('now');
    setNeedsAccessibilityPermit(false);
    setConfirmationReceipt(null);
  }, [selectedSpace?.id]);

  // The managed map uses the platform proxy; no browser-exposed Google key is required.

  const receiptText = confirmationReceipt
    ? `CurbSense Municipal Parking Receipt\nBay: ${confirmationReceipt.bay.label}\nZone: ${confirmationReceipt.bay.zoneName}\nArrival: ${confirmationReceipt.arrivalLabel}\nPermit request: ${confirmationReceipt.permitRequest ? 'Requested' : 'Not requested'}\nDemo hold: 15 seconds`
    : '';

  const downloadConfirmationReceipt = () => {
    if (!confirmationReceipt) return;
    const blob = new Blob([receiptText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `curbsense-receipt-${confirmationReceipt.receiptId}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
    setReceiptAction('Receipt downloaded');
  };

  const shareConfirmationReceipt = async () => {
    if (!confirmationReceipt) return;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'CurbSense reservation receipt', text: receiptText });
        setReceiptAction('Receipt shared');
        return;
      }
      await navigator.clipboard?.writeText(receiptText);
      setReceiptAction('Receipt details copied');
    } catch {
      setReceiptAction('Sharing cancelled');
    }
  };

  // Filter spaces based on vehicle type, zone, and search query
  const filteredSpaces = useMemo(() => {
    const filtered = activeSpaces.filter((space) => {
      // Vehicle filter
      if (selectedVehicleFilter === 'two_wheeler' && space.kind !== 'two_wheeler') return false;
      if (selectedVehicleFilter === 'ev' && space.kind !== 'ev') return false;
      if (selectedVehicleFilter === 'hatchback' && space.kind === 'two_wheeler') return false;

      // Zone filter
      if (activeZoneId && space.zoneId !== activeZoneId) return false;

      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const zone = zones.find((z) => z.id === space.zoneId);
        const matchesSpace = space.label.toLowerCase().includes(query);
        const matchesZone =
          zone?.name.toLowerCase().includes(query) || zone?.area.toLowerCase().includes(query);
        if (!matchesSpace && !matchesZone) return false;
      }

      return true;
    });

    if (spaceSortMode === 'default') return filtered;
    const origin = userLocation || COIMBATORE_CENTER;
    return [...filtered].sort((a, b) => {
      if (a.status === 'available' && b.status !== 'available') return -1;
      if (a.status !== 'available' && b.status === 'available') return 1;
      if (spaceSortMode === 'rate') return (a.hourlyRate || 0) - (b.hourlyRate || 0);
      return calculateHaversineDistanceKm(origin, { lat: a.lat, lng: a.lng }) - calculateHaversineDistanceKm(origin, { lat: b.lat, lng: b.lng });
    });
  }, [activeSpaces, selectedVehicleFilter, activeZoneId, searchQuery, zones, spaceSortMode, userLocation]);

  // Recenter on user's live browser geolocation
  const handleRecenterOnMe = () => {
    setIsLocating(true);
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(loc);
          setMapCenter(loc);
          setMapZoom(16);
          setIsLocating(false);
        },
        () => {
          setMapCenter(COIMBATORE_CENTER);
          setMapZoom(14);
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setIsLocating(false);
    }
  };

  // Center on destination landmark
  const handleSelectLandmark = (landmark: (typeof COIMBATORE_HUBS)[0]) => {
    setDestinationLocation({
      lat: landmark.lat,
      lng: landmark.lng,
      name: landmark.name,
    });
    setMapCenter({ lat: landmark.lat, lng: landmark.lng });
    setMapZoom(15);
    setDestinationSearch(landmark.name);
    setShowDestinationSuggestions(false);
  };

  // Handle space pin click
  const handleSpaceClick = (space: ParkingSpace) => {
    setSelectedSpace(space);
    setBottomPanel(isAuthorityMode ? 'authority-actions' : 'space-details');
    if (onSelectSpaceProp) {
      onSelectSpaceProp(space);
    }
  };

  // A zone ring is a map-local filter: selecting it reveals that zone's bay pins.
  const handleZoneClick = useCallback((zone: ParkingZone) => {
    setSelectedZoneId(zone.id);
    setMapCenter({ lat: zone.lat, lng: zone.lng });
    setMapZoom(16);
    setSelectedSpace(null);
    setBottomPanel(null);
  }, [setSelectedZoneId]);

  // When active nav space is triggered, open exactly one mode-appropriate panel.
  useEffect(() => {
    if (activeNavSpace) {
      setSelectedSpace(activeNavSpace);
      setBottomPanel(isAuthorityMode ? 'authority-actions' : 'directions');
    }
  }, [activeNavSpace, isAuthorityMode]);

  // Associated zone for selected space
  const selectedZone = useMemo(() => {
    if (!selectedSpace) return undefined;
    return zones.find((z) => z.id === selectedSpace.zoneId);
  }, [selectedSpace, zones]);

  // Pin color helper
  const getPinColor = (status: SpaceStatus) => {
    switch (status) {
      case 'available':
        return '#0a7d73'; // Green / Moss
      case 'held':
        return '#d97706'; // Yellow / Amber
      case 'occupied':
      case 'reserved':
      case 'conflict':
        return '#b94c40'; // Red / Clay
      case 'out_of_service':
      default:
        return '#78716c'; // Gray
    }
  };

  const fallbackClusters = useMemo(() => {
    const minLat = 10.995;
    const maxLat = 11.038;
    const minLng = 76.938;
    const maxLng = 76.998;
    const threshold = Math.max(2.2, 7 - Math.max(0, mapZoom - 14) * 1.6);

    const positioned = filteredSpaces.map((space) => ({
      space,
      posX: Math.max(5, Math.min(95, ((space.lng - minLng) / (maxLng - minLng)) * 90 + 5)),
      posY: Math.max(8, Math.min(92, (1 - (space.lat - minLat) / (maxLat - minLat)) * 84 + 8)),
    }));

    return positioned.reduce<Array<{ spaces: typeof positioned; posX: number; posY: number }>>(
      (clusters, item) => {
        const cluster = clusters.find(
          (candidate) => Math.hypot(candidate.posX - item.posX, candidate.posY - item.posY) <= threshold
        );

        if (cluster) {
          cluster.spaces.push(item);
          cluster.posX = cluster.spaces.reduce((sum, member) => sum + member.posX, 0) / cluster.spaces.length;
          cluster.posY = cluster.spaces.reduce((sum, member) => sum + member.posY, 0) / cluster.spaces.length;
        } else {
          clusters.push({ spaces: [item], posX: item.posX, posY: item.posY });
        }

        return clusters;
      },
      []
    );
  }, [filteredSpaces, mapZoom]);

  // Authority single-click status modifier
  const handleAuthorityStatusChange = (newStatus: SpaceStatus) => {
    if (!selectedSpace) return;
    updateSpaceStatus(selectedSpace.id, newStatus, `Manual correction via Map pin`);
    setSelectedSpace((prev) => (prev ? { ...prev, status: newStatus } : null));

    const statusLabel =
      newStatus === 'available'
        ? 'Available'
        : newStatus === 'occupied'
        ? 'Occupied'
        : 'Out of service';
    setAuthorityToast(`Space ${selectedSpace.label} marked as ${statusLabel}`);
    setTimeout(() => setAuthorityToast(null), 3000);
  };

  return (
    <div
      id="parking-map-wrapper"
      style={{ height }}
      className={cn(
        'relative w-full rounded-3xl overflow-hidden border border-sand-300 dark:border-graphite-light bg-sand-100 dark:bg-graphite shadow-lg select-none',
        className
      )}
    >
      {/* Toast Notification */}
      <AnimatePresence>
        {authorityToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-40 bg-graphite text-sand-50 dark:bg-sand-50 dark:text-graphite px-4 py-2 rounded-2xl shadow-xl border border-sand-300 text-xs font-bold flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-teal" />
            <span>{authorityToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Floating Controls */}
      {showControls && (
        <div className="absolute top-4 left-4 right-4 z-50 isolate flex flex-col gap-2 pointer-events-none">
          {!isAuthorityMode && (
            <button
              id="btn-mobile-map-tools"
              type="button"
              onClick={() => setIsMapToolsOpen((open) => !open)}
              aria-expanded={isMapToolsOpen}
              aria-controls="map-tools-panel"
              className={cn('pointer-events-auto inline-flex w-fit items-center gap-2 rounded-2xl border border-teal/30 px-3 py-2 text-xs font-extrabold text-teal shadow-lg transition-colors hover:bg-teal hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal/20 active:scale-[0.98] lg:hidden cursor-pointer', surfaceMode === 'opaque' ? 'bg-[#fffef9] dark:bg-[#132321]' : 'bg-[#fffef9]/75 backdrop-blur-md dark:bg-[#132321]/75')}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Map tools</span>
              <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', isMapToolsOpen && 'rotate-180')} />
            </button>
          )}

          <div
            id="map-tools-panel"
            className={cn(
              'flex flex-wrap items-center gap-2 pointer-events-auto',
              !isAuthorityMode && !isMapToolsOpen && 'hidden lg:flex'
            )}
          >
            {/* Destination Search Bar (Citizen Mode) */}
            {showSearchBar && !isAuthorityMode && (
              <div className="relative flex flex-1 min-w-[220px] max-w-sm items-stretch gap-2">
                <div className="relative min-w-0 flex-1">
                  <div className="group relative">
                  <input
                    id="input-map-destination"
                    type="text"
                    aria-label="Search a destination"
                    placeholder="Search street, market, or landmark..."
                    value={destinationSearch}
                    onFocus={() => setShowDestinationSuggestions(true)}
                    onChange={(e) => {
                      setDestinationSearch(e.target.value);
                      setShowDestinationSuggestions(true);
                    }}
                    className={cn('w-full rounded-2xl border border-teal/25 py-2.5 pl-11 pr-20 text-xs font-semibold text-graphite shadow-[0_8px_20px_rgba(22,45,42,0.12)] outline-none transition-all placeholder:text-graphite-muted/80 hover:border-teal/45 focus:border-teal focus:ring-4 focus:ring-teal/15 dark:border-teal/35 dark:text-sand-100 dark:placeholder:text-sand-400', surfaceMode === 'opaque' ? 'bg-[#fffef9] dark:bg-[#132321]' : 'bg-[#fffef9]/75 backdrop-blur-md dark:bg-[#132321]/75')}
                  />
                  <span className="pointer-events-none absolute left-2.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-lg bg-teal text-white shadow-sm">
                    <Search className="h-3.5 w-3.5" />
                  </span>
                  {!destinationSearch && (
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-md border border-sand-300 bg-sand-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-graphite-muted dark:border-graphite-light dark:bg-graphite-light dark:text-sand-400">
                      Search
                    </span>
                  )}
                    {destinationSearch && (
                      <button
                        onClick={() => {
                          setDestinationSearch('');
                          setDestinationLocation(null);
                        }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-xs text-graphite-muted transition-colors hover:bg-sand-100 hover:text-graphite dark:hover:bg-graphite-light cursor-pointer"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                {showDestinationSuggestions && (
                  <div className="absolute top-full mt-1 left-0 right-0 bg-sand-50 dark:bg-graphite rounded-2xl border border-sand-300 dark:border-graphite-light shadow-2xl overflow-hidden z-30 max-h-56 overflow-y-auto">
                    <div className="p-2 text-[10px] uppercase font-bold text-graphite-muted border-b border-sand-200 dark:border-graphite-light">
                      Popular Hubs
                    </div>
                    {COIMBATORE_HUBS.filter(
                      (h) =>
                        h.name.toLowerCase().includes(destinationSearch.toLowerCase()) ||
                        h.area.toLowerCase().includes(destinationSearch.toLowerCase())
                    ).map((h, i) => (
                      <button
                        key={i}
                        onClick={() => handleSelectLandmark(h)}
                        className="w-full p-2.5 text-left hover:bg-sand-200 dark:hover:bg-graphite-light flex items-center justify-between text-xs border-b border-sand-200/50 dark:border-graphite-light/50 last:border-none cursor-pointer"
                      >
                        <div>
                          <div className="font-semibold text-graphite dark:text-sand-100">{h.name}</div>
                          <div className="text-[10px] text-graphite-muted">{h.area}</div>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal/10 text-teal font-medium">
                          Select
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                <button
                  id="btn-recenter-map"
                  type="button"
                  onClick={handleRecenterOnMe}
                  title="Recenter on my location"
                  aria-label="Recenter map on my location"
                  className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-teal/25 text-teal shadow-[0_8px_20px_rgba(22,45,42,0.12)] transition-all hover:border-teal hover:bg-teal hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal/20 active:scale-95 dark:border-teal/35 cursor-pointer', surfaceMode === 'opaque' ? 'bg-[#fffef9] dark:bg-[#132321]' : 'bg-[#fffef9]/75 backdrop-blur-md dark:bg-[#132321]/75')}
                >
                  {isLocating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Crosshair className="h-4 w-4" />}
                </button>
              </div>
            )}

            {/* Vehicle Type Filter Buttons */}
            {!isAuthorityMode && (
              <div id="map-vehicle-filter" className={cn('flex items-center gap-1 rounded-2xl border border-sand-300 p-1 text-xs font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] dark:border-graphite-light', surfaceMode === 'opaque' ? 'bg-[#eef1e9] dark:bg-[#1b2c29]' : 'bg-[#eef1e9]/75 backdrop-blur-sm dark:bg-[#1b2c29]/75')}>
                <button
                  onClick={() => setSelectedVehicleFilter('all')}
                  className={cn(
                    'px-2.5 py-1.5 rounded-xl transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/60',
                    selectedVehicleFilter === 'all'
                      ? 'bg-[#0a7d73] text-white shadow-sm'
                      : 'border border-sand-300/90 bg-[#fffdf7] text-[#203330] hover:border-teal/45 hover:bg-white dark:border-graphite-light dark:bg-[#162322] dark:text-[#f7f4ec] dark:hover:bg-[#213431]'
                  )}
                >
                  All ({filteredSpaces.length})
                </button>
                <button
                  onClick={() => setSelectedVehicleFilter('two_wheeler')}
                  className={cn(
                    'px-2.5 py-1.5 rounded-xl flex items-center gap-1 text-[11px] transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/60',
                    selectedVehicleFilter === 'two_wheeler'
                      ? 'bg-[#0a7d73] text-white shadow-sm'
                      : 'border border-sand-300/90 bg-[#fffdf7] text-[#203330] hover:border-teal/45 hover:bg-white dark:border-graphite-light dark:bg-[#162322] dark:text-[#f7f4ec] dark:hover:bg-[#213431]'
                  )}
                >
                  <Bike className="w-3 h-3" />
                  2W
                </button>
                <button
                  onClick={() => setSelectedVehicleFilter('hatchback')}
                  className={cn(
                    'px-2.5 py-1.5 rounded-xl flex items-center gap-1 text-[11px] transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/60',
                    selectedVehicleFilter === 'hatchback'
                      ? 'bg-[#0a7d73] text-white shadow-sm'
                      : 'border border-sand-300/90 bg-[#fffdf7] text-[#203330] hover:border-teal/45 hover:bg-white dark:border-graphite-light dark:bg-[#162322] dark:text-[#f7f4ec] dark:hover:bg-[#213431]'
                  )}
                >
                  <Car className="w-3 h-3" />
                  Car
                </button>
                <button
                  onClick={() => setSelectedVehicleFilter('ev')}
                  className={cn(
                    'px-2.5 py-1.5 rounded-xl flex items-center gap-1 text-[11px] transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/60',
                    selectedVehicleFilter === 'ev'
                      ? 'bg-[#0a7d73] text-white shadow-sm'
                      : 'border border-sand-300/90 bg-[#fffdf7] text-[#203330] hover:border-teal/45 hover:bg-white dark:border-graphite-light dark:bg-[#162322] dark:text-[#f7f4ec] dark:hover:bg-[#213431]'
                  )}
                >
                  <Zap className="w-3 h-3" />
                  EV
                </button>
              </div>
            )}

            {!isAuthorityMode && (
              <label className={cn('flex items-center gap-2 rounded-2xl border border-sand-300 px-3 py-2 text-[11px] font-bold text-[#203330] shadow-sm dark:border-graphite-light dark:text-sand-100', surfaceMode === 'opaque' ? 'bg-[#fffef9] dark:bg-[#132321]' : 'bg-[#fffef9]/80 backdrop-blur-md dark:bg-[#132321]/80')}>
                <span className="whitespace-nowrap">Sort available</span>
                <select id="map-sort-select" aria-label="Sort available parking bays" value={spaceSortMode} onChange={(event) => setSpaceSortMode(event.target.value as SpaceSortMode)} className="rounded-lg border-0 bg-transparent py-0.5 text-[11px] font-extrabold text-teal-dark outline-none dark:text-teal-100">
                  <option value="default">Recommended</option>
                  <option value="rate">Lowest rate</option>
                  <option value="distance">Closest walk</option>
                </select>
              </label>
            )}

            {/* Authority Mode Info Badge */}
            {isAuthorityMode && (
              <div className="bg-sand-50 dark:bg-graphite px-3 py-1.5 rounded-2xl border border-sand-300 dark:border-graphite-light shadow-md backdrop-blur-md text-xs font-bold text-teal flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal animate-pulse" />
                <span>Tap any space to change its status</span>
              </div>
            )}
          </div>

          {/* Active Hold Alert (Citizen Mode) */}
          {!isAuthorityMode && activeReservation && activeReservation.status === 'held' && (
            <div className="pointer-events-auto inline-flex items-center justify-between gap-3 bg-teal text-sand-50 px-3.5 py-2 rounded-2xl shadow-xl border border-teal/40 backdrop-blur-md max-w-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-sand-50 animate-ping" />
                <div className="text-xs">
                  <span className="font-bold">Hold: {activeReservation.spaceLabel}</span>
                  <span className="text-[10px] text-sand-200 ml-1.5">({holdFormattedTime} left)</span>
                </div>
              </div>
              <button
                onClick={() => {
                  const s = contextSpaces.find((item) => item.id === activeReservation.spaceId);
                  if (s) {
                    setSelectedSpace(s);
                    setBottomPanel('directions');
                  }
                }}
                className="px-2 py-0.5 rounded-lg bg-sand-50 text-teal font-bold text-[11px] shadow hover:bg-sand-100 flex items-center gap-1 cursor-pointer"
              >
                <Navigation className="w-3 h-3" />
                Navigate
              </button>
            </div>
          )}
        </div>
      )}

      {/* Managed interactive map: real Coimbatore coordinates, proxy-authenticated tiles, and clustered clickable pins. */}
      <ManagedGoogleMapSurface
        spaces={filteredSpaces}
        zones={zones}
        selectedZoneId={activeZoneId}
        center={mapCenter}
        zoom={mapZoom}
        userLocation={userLocation}
        onSelectSpace={handleSpaceClick}
        onSelectZone={handleZoneClick}
        className="w-full h-full min-h-[520px]"
      />

      {/* AUTHORITY MODE: Space Action Modal (Screen 2 Requirement: 3 Big Buttons Only) */}
      <AnimatePresence>
        {isAuthorityMode && selectedSpace && bottomPanel === 'authority-actions' && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 bg-sand-50 dark:bg-graphite rounded-3xl border border-sand-300 dark:border-graphite-light shadow-2xl p-4 z-30 space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif text-base font-bold text-graphite dark:text-sand-100">
                    Space {selectedSpace.label}
                  </span>
                  <span
style={{ color: getPinColor(selectedSpace.status) }}
                      className="bg-sand-100 dark:bg-graphite-light border border-sand-300 dark:border-graphite-light text-[10px] px-2 py-0.5 rounded-full font-bold uppercase"
                  >
                    {selectedSpace.status === 'available'
                      ? 'Free'
                      : selectedSpace.status === 'occupied'
                      ? 'Occupied'
                      : selectedSpace.status === 'held'
                      ? 'Held'
                      : 'Out of service'}
                  </span>
                </div>
                <p className="text-xs text-graphite-muted dark:text-sand-400">
                  {selectedZone?.name || 'Coimbatore Zone'} · {selectedSpace.address}
                </p>
              </div>

              <button
                onClick={() => {
                  setSelectedSpace(null);
                  setBottomPanel(null);
                }}
                className="text-graphite-muted hover:text-graphite dark:text-sand-400 text-xs p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="pt-2 border-t border-sand-200 dark:border-graphite-light space-y-2">
              <span className="text-[11px] font-bold text-graphite dark:text-sand-100 block">
                Mark this space as:
              </span>

              {/* Three Big Buttons Mandated by Specification */}
              <div className="grid grid-cols-1 gap-2">
                <button
                  id="btn-mark-space-available"
                  onClick={() => handleAuthorityStatusChange('available')}
                  className={cn(
                    'py-2.5 px-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs',
                    selectedSpace.status === 'available'
                      ? 'bg-teal text-white ring-2 ring-teal/50'
                      : 'bg-sand-200 dark:bg-graphite-light text-teal hover:bg-teal hover:text-white'
                  )}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Available</span>
                </button>

                <button
                  id="btn-mark-space-occupied"
                  onClick={() => handleAuthorityStatusChange('occupied')}
                  className={cn(
                    'py-2.5 px-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs',
                    selectedSpace.status === 'occupied'
                      ? 'bg-clay text-white ring-2 ring-clay/50'
                      : 'bg-sand-200 dark:bg-graphite-light text-clay hover:bg-clay hover:text-white'
                  )}
                >
                  <Car className="w-4 h-4" />
                  <span>Occupied</span>
                </button>

                <button
                  id="btn-mark-space-out-of-service"
                  onClick={() => handleAuthorityStatusChange('out_of_service')}
                  className={cn(
                    'py-2.5 px-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs',
                    selectedSpace.status === 'out_of_service'
                      ? 'bg-amber-600 text-white ring-2 ring-amber-600/50'
                      : 'bg-sand-200 dark:bg-graphite-light text-amber-700 dark:text-amber-300 hover:bg-amber-600 hover:text-white'
                  )}
                >
                  <Wrench className="w-4 h-4" />
                  <span>Out of service (needs repair)</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CITIZEN MODE: Selected-bay reservation panel */}
      <AnimatePresence>
        {!isAuthorityMode && selectedSpace && bottomPanel === 'space-details' && (
          <>
            <motion.button
              type="button"
              aria-label="Close selected bay reservation panel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setSelectedSpace(null);
                setBottomPanel(null);
              }}
              className="absolute inset-0 z-20 bg-graphite/60 sm:bg-graphite/50"
            />
            <motion.aside
              id="space-reservation-panel"
              role="dialog"
              aria-modal="true"
              aria-label={`Reservation details for Bay ${selectedSpace.label}`}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 340, damping: 34 }}
              className="absolute inset-y-0 right-0 z-30 flex w-full max-w-[28rem] flex-col border-l border-sand-300 bg-sand-50 shadow-2xl dark:border-graphite-light dark:bg-graphite"
            >
              <div               className={cn('flex items-start justify-between border-b border-[#d4e0d8] p-5 dark:border-graphite-light', surfaceMode === 'opaque' ? 'bg-white dark:bg-[#152522]' : 'bg-white/90 backdrop-blur-md dark:bg-[#152522]/90')}>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-teal">Selected curb space</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <h2 className="font-serif text-2xl font-bold text-graphite dark:text-sand-100">Bay {selectedSpace.label}</h2>
                    <span
                      style={{ color: getPinColor(selectedSpace.status) }}
                      className="rounded-full border border-sand-300 bg-sand-100 px-2 py-1 text-[10px] font-extrabold uppercase tracking-wide dark:border-graphite-light dark:bg-graphite-light"
                    >
                      {selectedSpace.status === 'available' ? 'Available' : selectedSpace.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-graphite-muted dark:text-sand-400">
                    {selectedZone?.name || 'Coimbatore Zone'} · {selectedSpace.address}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSpace(null);
                    setBottomPanel(null);
                  }}
                  className="ml-4 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-sand-300 text-graphite-muted transition-colors hover:border-teal hover:text-teal dark:border-graphite-light dark:text-sand-400"
                  aria-label="Close reservation panel"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 space-y-5 overflow-y-auto p-5">
                <div className={cn('grid grid-cols-3 gap-2 rounded-2xl border border-[#cbdacf] p-2 shadow-sm dark:border-graphite-light', surfaceMode === 'opaque' ? 'bg-[#f3f7f1] dark:bg-[#1e302d]' : 'bg-[#f3f7f1]/90 backdrop-blur-md dark:bg-[#1e302d]/90')}>
                  <div className="rounded-xl border border-[#d7e2d9] bg-white p-2 text-center shadow-xs dark:border-graphite-light dark:bg-[#152522]">
                    <span className="block text-[10px] font-bold uppercase tracking-wide text-[#45605a] dark:text-sand-300">Rate</span>
                    <span className="mt-1 block text-sm font-extrabold text-graphite dark:text-sand-100">₹{selectedSpace.hourlyRate}/hr</span>
                  </div>
                  <div className="rounded-xl border border-[#d7e2d9] bg-white p-2 text-center shadow-xs dark:border-graphite-light dark:bg-[#152522]">
                    <span className="block text-[10px] font-bold uppercase tracking-wide text-[#45605a] dark:text-sand-300">Type</span>
                    <span className="mt-1 block text-sm font-extrabold capitalize text-teal">{selectedSpace.kind.replace('_', ' ')}</span>
                  </div>
                  <div className="rounded-xl border border-[#d7e2d9] bg-white p-2 text-center shadow-xs dark:border-graphite-light dark:bg-[#152522]">
                    <span className="block text-[10px] font-bold uppercase tracking-wide text-[#45605a] dark:text-sand-300">Walk</span>
                    <span className="mt-1 block text-sm font-extrabold text-graphite dark:text-sand-100">
                      {formatDistanceWalkLabel(userLocation, { lat: selectedSpace.lat, lng: selectedSpace.lng }).label.split('·')[0]}
                    </span>
                  </div>
                </div>

                <section className="rounded-2xl border border-teal/30 bg-teal-pale p-4 dark:bg-[#16312d]" aria-label="Demonstration hold policy">
                  <div className="flex items-start gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal text-xs font-extrabold text-white">15s</span>
                    <div>
                      <p className="text-sm font-extrabold text-graphite dark:text-sand-100">Demonstration hold</p>
                      <p className="mt-1 text-xs leading-relaxed text-graphite-muted dark:text-sand-400">This safely locks the selected bay for a 15-second demonstration hold. It is a no-charge pilot hold; parking-pass activation and check-in remain disabled.</p>
                    </div>
                  </div>
                </section>

                {confirmationReceipt && (
                  <section className="space-y-3 rounded-2xl border border-teal/30 bg-[#edf8f5] p-4 dark:border-teal/40 dark:bg-[#16312d]" aria-label="Reservation confirmation receipt">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-teal">Confirmation receipt</p>
                        <p className="mt-1 text-sm font-extrabold text-graphite dark:text-sand-100">{confirmationReceipt.receiptId}</p>
                      </div>
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-teal" />
                    </div>
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                      <div><dt className="text-graphite-muted dark:text-sand-400">Bay</dt><dd className="font-bold text-graphite dark:text-sand-100">{confirmationReceipt.bay.label}</dd></div>
                      <div><dt className="text-graphite-muted dark:text-sand-400">Arrival</dt><dd className="font-bold text-graphite dark:text-sand-100">{confirmationReceipt.arrivalLabel}</dd></div>
                      <div><dt className="text-graphite-muted dark:text-sand-400">Permit request</dt><dd className="font-bold text-graphite dark:text-sand-100">{confirmationReceipt.permitRequest ? 'Requested' : 'Not requested'}</dd></div>
                      <div><dt className="text-graphite-muted dark:text-sand-400">Hold expires</dt><dd className="font-bold text-graphite dark:text-sand-100">{new Date(confirmationReceipt.holdExpiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</dd></div>
                    </dl>
                    <p className="text-[11px] leading-relaxed text-graphite-muted dark:text-sand-300">{confirmationReceipt.permitMessage}</p>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <button id="btn-download-confirmation-receipt" type="button" onClick={downloadConfirmationReceipt} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-teal/25 bg-white px-3 py-2.5 text-xs font-bold text-graphite transition-colors hover:border-teal hover:text-teal dark:bg-[#152522] dark:text-sand-100">
                        <Download className="h-4 w-4" /> Download receipt
                      </button>
                      <button id="btn-share-confirmation-receipt" type="button" onClick={() => void shareConfirmationReceipt()} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-teal/30 bg-teal-pale px-3 py-2.5 text-xs font-bold text-teal-dark transition-colors hover:bg-teal hover:text-white">
                        <Share2 className="h-4 w-4" /> Share / copy receipt
                      </button>
                    </div>
                    {receiptAction && <p role="status" className="text-center text-xs font-semibold text-teal-dark">{receiptAction}</p>}
                  </section>
                )}

                <section id="availability-evidence" className={cn('space-y-2 rounded-2xl border border-teal/25 p-4 shadow-sm', surfaceMode === 'opaque' ? 'bg-[#fffef9] dark:bg-[#132321]' : 'bg-[#fffef9]/80 backdrop-blur-md dark:bg-[#132321]/80')} aria-label="Availability evidence">
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <span className="font-extrabold text-[#183a34] dark:text-sand-100">Availability evidence</span>
                    <span className="rounded-full bg-[#c6eee4] px-2 py-1 text-[10px] font-extrabold text-[#075f57] dark:bg-[#1e5148] dark:text-[#d8fff5]">Live curb signal</span>
                  </div>
                  <p className="text-xs leading-relaxed text-[#38524d] dark:text-sand-300">Pin status and rate are synchronized from the selected zone. Non-available bays remain visible on the map but cannot be held.</p>
                </section>

                <section id="reservation-details-section" className={cn('space-y-3 rounded-2xl border border-teal/25 p-4 shadow-sm', surfaceMode === 'opaque' ? 'bg-[#fffef9] dark:bg-[#132321]' : 'bg-[#fffef9]/80 backdrop-blur-md dark:bg-[#132321]/80')} aria-labelledby="reservation-details-heading">
                  <div>
                    <p id="reservation-details-heading" className="text-sm font-extrabold text-[#183a34] dark:text-sand-100">Reservation details</p>
                    <p className="mt-1 text-xs leading-relaxed text-[#38524d] dark:text-sand-300">Tell the curb team when you expect to arrive and whether you need an accessibility permit space.</p>
                  </div>

                  <label className="block space-y-1.5" htmlFor="arrival-time-select">
                    <span className="text-[11px] font-bold uppercase tracking-wide text-graphite-muted dark:text-sand-400">Expected arrival</span>
                    <select
                      id="arrival-time-select"
                      value={arrivalTime}
                      onChange={(event) => setArrivalTime(event.target.value as typeof arrivalTime)}
                      className="w-full rounded-xl border border-sand-300 bg-[#fffdf7] px-3 py-2.5 text-xs font-semibold text-graphite outline-none transition-colors focus:border-teal focus:ring-2 focus:ring-teal/20 dark:border-graphite-light dark:bg-[#1b2726] dark:text-sand-100"
                    >
                      <option value="now">Arriving now</option>
                      <option value="15m">Within 15 minutes</option>
                      <option value="30m">Within 30 minutes</option>
                      <option value="60m">Within 60 minutes</option>
                    </select>
                  </label>

                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-sand-300 bg-[#fffdf7] p-3 transition-colors hover:border-teal dark:border-graphite-light dark:bg-[#1b2726]">
                    <input
                      id="accessibility-permit-needed"
                      type="checkbox"
                      checked={needsAccessibilityPermit}
                      onChange={(event) => setNeedsAccessibilityPermit(event.target.checked)}
                      className="mt-0.5 h-4 w-4 accent-teal"
                    />
                    <span>
                      <span className="block text-xs font-bold text-graphite dark:text-sand-100">I need an accessibility-permit space</span>
                      <span className="mt-0.5 block text-[11px] leading-relaxed text-graphite-muted dark:text-sand-400">We’ll flag this request for the pilot team. Permit verification is not performed in this demonstration.</span>
                    </span>
                  </label>
                </section>
              </div>

              <div className={cn('space-y-2 border-t border-[#d4e0d8] p-5 dark:border-graphite-light', surfaceMode === 'opaque' ? 'bg-white dark:bg-[#152522]' : 'bg-white/90 backdrop-blur-md dark:bg-[#152522]/90')}>
                <button
                  id="btn-open-reservations"
                  type="button"
                  onClick={() => {
                    onOpenReservations?.();
                    if (!onOpenReservations) setBottomPanel('directions');
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-teal/30 bg-teal-pale px-3 py-3 text-xs font-extrabold text-teal-dark transition-colors hover:border-teal hover:bg-teal hover:text-white dark:border-teal/40 dark:bg-[#193632] dark:text-teal-100"
                >
                  <Ticket className="h-4 w-4 text-teal" />
                  Open reservation dashboard
                </button>

                {selectedSpace.status === 'available' ? (
                  <button
                    id="btn-start-demonstration-hold"
                    type="button"
                    onClick={async () => {
                      if (needsAccessibilityPermit && selectedSpace.kind !== 'accessible') {
                        setAuthorityToast('Accessibility requests can only be attached to an accessible bay.');
                        return;
                      }
                      if (needsAccessibilityPermit && currentUser.permitStatus !== 'verified') {
                        setAuthorityToast('A verified accessibility permit is required before reserving an accessible bay.');
                        return;
                      }

                      const holdVehicle: VehicleType =
                        selectedSpace.kind === 'two_wheeler'
                          ? 'two_wheeler'
                          : selectedSpace.kind === 'ev'
                          ? 'ev'
                          : 'hatchback';
                      const arrivalLabel = arrivalTime === 'now' ? 'arriving now' : `arriving within ${arrivalTime.replace('m', ' minutes')}`;
                      const input = {
                        email: currentUser.email,
                        userId: currentUser.id,
                        userName: currentUser.name,
                        spaceId: selectedSpace.id,
                        spaceLabel: selectedSpace.label,
                        zoneId: selectedSpace.zoneId,
                        zoneName: selectedZone?.name || 'Coimbatore Zone',
                        vehicleType: holdVehicle,
                        vehiclePlate: currentUser.vehiclePlate,
                        hourlyRate: selectedSpace.hourlyRate,
                        arrivalWindow: arrivalTime,
                        needsAccessibilityPermit,
                        permitStatus: currentUser.permitStatus,
                      } as const;

                      let receipt: ReservationReceipt;
                      try {
                        receipt = await persistReservation(input);
                      } catch (error) {
                        const now = new Date();
                        receipt = {
                          receiptId: `DEMO-${selectedSpace.id}-${Date.now()}`,
                          reservationId: `demo-${Date.now()}`,
                          bay: { id: selectedSpace.id, label: selectedSpace.label, zoneId: selectedSpace.zoneId, zoneName: selectedZone?.name || 'Coimbatore Zone' },
                          arrivalWindow: arrivalTime,
                          arrivalLabel: arrivalTime === 'now' ? 'Arriving now' : `Within ${arrivalTime.replace('m', ' minutes')}`,
                          permitRequest: needsAccessibilityPermit,
                          permitStatus: currentUser.permitStatus,
                          permitMessage: `Demo receipt only: ${error instanceof Error ? error.message : 'database unavailable'}`,
                          vehicle: { type: holdVehicle, plate: currentUser.vehiclePlate },
                          rate: selectedSpace.hourlyRate,
                          holdMinutes: 0.25,
                          holdSeconds: 15,
                          holdExpiresAt: new Date(now.getTime() + 15 * 1000).toISOString(),
                          status: 'held',
                          createdAt: now.toISOString(),
                        };
                      }

                      const res = createHold(selectedSpace.id, holdVehicle);
                      if (res.success) {
                        setConfirmationReceipt(receipt);
                        setAuthorityToast(`Hold prepared · ${arrivalLabel}${needsAccessibilityPermit ? ' · accessibility permit requested' : ''}`);
                        setBottomPanel('space-details');
                      } else {
                        setAuthorityToast(res.message || 'This bay is no longer available.');
                      }
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-teal px-3 py-3 text-xs font-extrabold text-white shadow-md transition-all hover:bg-teal-hover active:scale-[0.97]"
                  >
                    <Clock className="h-4 w-4" />
                    Start 15-second demonstration hold
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="w-full rounded-2xl bg-sand-300 px-3 py-3 text-xs font-bold text-graphite-muted dark:bg-graphite-light/50"
                  >
                    This bay is not currently bookable
                  </button>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Turn-by-Turn Navigation Drawer (Citizen Mode) */}
      <AnimatePresence>
        {!isAuthorityMode && bottomPanel === 'directions' && selectedSpace && (
          <DirectionsPanel
            userLocation={userLocation}
            targetSpace={selectedSpace}
            targetZone={selectedZone}
            onClose={() => {
              setSelectedSpace(null);
              setBottomPanel(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ParkingMap;
