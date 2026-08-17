import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Navigation,
  Footprints,
  Car,
  Bike,
  Bus,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Clock,
  MapPin,
  X,
  Sparkles,
} from 'lucide-react';
import { ParkingSpace, ParkingZone } from '../../types';
import {
  Coordinates,
  calculateHaversineDistanceKm,
  estimateWalkMinutes,
  estimateDriveMinutes,
  getGoogleMapsDirectionsUrl,
} from '../../utils/geoUtils';

interface DirectionsPanelProps {
  userLocation: Coordinates | null;
  targetSpace: ParkingSpace;
  targetZone: ParkingZone | undefined;
  onClose: () => void;
}

export const DirectionsPanel: React.FC<DirectionsPanelProps> = ({
  userLocation,
  targetSpace,
  targetZone,
  onClose,
}) => {
  const [travelMode, setTravelMode] = useState<'driving' | 'two_wheeler' | 'walking' | 'transit'>('driving');
  const [showSteps, setShowSteps] = useState(false);

  const destCoords: Coordinates = {
    lat: targetSpace.lat || targetZone?.lat || 11.008,
    lng: targetSpace.lng || targetZone?.lng || 76.961,
  };

  const distanceKm = userLocation
    ? calculateHaversineDistanceKm(userLocation, destCoords)
    : 1.2;

  const driveMins = estimateDriveMinutes(distanceKm);
  const walkMins = estimateWalkMinutes(distanceKm);
  const twoWheelerMins = Math.max(1, Math.round(driveMins * 0.8));
  const transitMins = Math.max(3, Math.round(driveMins * 1.5 + 4));

  const currentEtaMins =
    travelMode === 'walking'
      ? walkMins
      : travelMode === 'two_wheeler'
      ? twoWheelerMins
      : travelMode === 'transit'
      ? transitMins
      : driveMins;

  // Simulated turn-by-turn guidance steps based on zone
  const streetName = targetSpace.address || targetZone?.featuredStreet || 'Curb Bay';
  const steps = [
    { text: 'Start heading toward the nearest arterial road', dist: '150m' },
    { text: `Follow signs toward ${targetZone?.name || 'Central District'}`, dist: `${(distanceKm * 0.6).toFixed(1)} km` },
    { text: `Turn into ${targetZone?.featuredStreet || 'designated curb bay corridor'}`, dist: '200m' },
    { text: `Arrive at designated curb slot ${targetSpace.label} (${targetSpace.kind.replace('_', ' ')})`, dist: 'Right side' },
  ];

  const externalUrl = getGoogleMapsDirectionsUrl(userLocation, destCoords, travelMode);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 bg-sand-50 dark:bg-graphite rounded-2xl border border-sand-300 dark:border-graphite-light shadow-2xl overflow-hidden z-20"
    >
      {/* Header */}
      <div className="p-4 bg-sand-200/70 dark:bg-graphite-light/60 border-b border-sand-300 dark:border-graphite-light flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-teal/15 text-teal flex items-center justify-center">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-graphite dark:text-sand-100 flex items-center gap-1.5">
              Route to Bay {targetSpace.label}
            </h4>
            <p className="text-[11px] text-graphite-muted dark:text-sand-400 truncate max-w-[200px]">
              {targetZone?.name || 'Coimbatore Curb'}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-graphite-muted hover:text-graphite dark:text-sand-400 dark:hover:text-sand-100 hover:bg-sand-300 dark:hover:bg-graphite-light transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Travel Modes */}
      <div className="p-3 bg-sand-100 dark:bg-graphite border-b border-sand-300 dark:border-graphite-light flex gap-1.5">
        <button
          onClick={() => setTravelMode('driving')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-all ${
            travelMode === 'driving'
              ? 'bg-teal text-sand-50 shadow-sm'
              : 'bg-sand-200/50 dark:bg-graphite-light/40 text-graphite-muted dark:text-sand-400 hover:text-graphite'
          }`}
        >
          <Car className="w-3.5 h-3.5" />
          {driveMins}m
        </button>
        <button
          onClick={() => setTravelMode('two_wheeler')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-all ${
            travelMode === 'two_wheeler'
              ? 'bg-teal text-sand-50 shadow-sm'
              : 'bg-sand-200/50 dark:bg-graphite-light/40 text-graphite-muted dark:text-sand-400 hover:text-graphite'
          }`}
        >
          <Bike className="w-3.5 h-3.5" />
          {twoWheelerMins}m
        </button>
        <button
          onClick={() => setTravelMode('walking')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-all ${
            travelMode === 'walking'
              ? 'bg-teal text-sand-50 shadow-sm'
              : 'bg-sand-200/50 dark:bg-graphite-light/40 text-graphite-muted dark:text-sand-400 hover:text-graphite'
          }`}
        >
          <Footprints className="w-3.5 h-3.5" />
          {walkMins}m
        </button>
        <button
          onClick={() => setTravelMode('transit')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-all ${
            travelMode === 'transit'
              ? 'bg-teal text-sand-50 shadow-sm'
              : 'bg-sand-200/50 dark:bg-graphite-light/40 text-graphite-muted dark:text-sand-400 hover:text-graphite'
          }`}
        >
          <Bus className="w-3.5 h-3.5" />
          {transitMins}m
        </button>
      </div>

      {/* ETA and Summary */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-teal flex items-baseline gap-1.5">
              <span>{currentEtaMins} min</span>
              <span className="text-xs text-graphite-muted dark:text-sand-400 font-normal">
                ({distanceKm} km)
              </span>
            </div>
            <p className="text-xs text-moss dark:text-teal font-medium flex items-center gap-1 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-moss inline-block" />
              Optimal route · Normal Coimbatore city traffic
            </p>
          </div>

          <a
            href={externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2 px-3 rounded-xl bg-sand-200 dark:bg-graphite-light text-graphite dark:text-sand-100 hover:bg-teal hover:text-sand-50 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
          >
            Google Maps
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Turn-by-turn collapsible */}
        <div className="pt-2 border-t border-sand-300 dark:border-graphite-light">
          <button
            onClick={() => setShowSteps(!showSteps)}
            className="w-full flex items-center justify-between text-xs font-semibold text-graphite dark:text-sand-200 py-1"
          >
            <span>Navigation steps ({steps.length})</span>
            {showSteps ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showSteps && (
            <div className="mt-2 space-y-2 max-h-40 overflow-y-auto pr-1">
              {steps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs">
                  <div className="w-5 h-5 rounded-full bg-sand-300 dark:bg-graphite-light text-graphite dark:text-sand-200 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-graphite dark:text-sand-100">{step.text}</p>
                    <span className="text-[10px] text-graphite-muted dark:text-sand-400">{step.dist}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
