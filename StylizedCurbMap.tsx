import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MapPin, Navigation, Layers, Compass, Plus, Minus, RotateCcw } from 'lucide-react';
import { useCurb } from '../../context/CurbContext';
import { ParkingZone } from '../../types';

interface StylizedCurbMapProps {
  onSelectZone: (zone: ParkingZone) => void;
}

export const StylizedCurbMap: React.FC<StylizedCurbMapProps> = ({ onSelectZone }) => {
  const { zones, selectedZoneId, getZoneStats, selectedVehicleFilter } = useCurb();
  const [zoom, setZoom] = useState(1);
  const [showRoadLabels, setShowRoadLabels] = useState(true);

  // Determine availability color badge per zone
  const getZoneStatusConfig = (zoneId: string) => {
    const stats = getZoneStats(zoneId);
    let availableCount = stats.available;
    if (selectedVehicleFilter === 'two_wheeler') availableCount = stats.twoWheelerAvailable;
    else if (selectedVehicleFilter === 'ev') availableCount = stats.evAvailable;

    if (availableCount >= 6) {
      return {
        label: 'Plentiful',
        colorClass: 'bg-emerald-600 dark:bg-emerald-500 text-white',
        borderClass: 'border-emerald-600',
        ringClass: 'ring-emerald-400/40',
        dotClass: 'bg-emerald-500',
        count: availableCount,
      };
    }
    if (availableCount >= 3) {
      return {
        label: 'Moderate',
        colorClass: 'bg-teal-primary text-white',
        borderClass: 'border-teal-primary',
        ringClass: 'ring-teal-400/40',
        dotClass: 'bg-teal-primary',
        count: availableCount,
      };
    }
    if (availableCount >= 1) {
      return {
        label: 'Limited',
        colorClass: 'bg-amber-custom text-white',
        borderClass: 'border-amber-custom',
        ringClass: 'ring-amber-400/40',
        dotClass: 'bg-amber-custom',
        count: availableCount,
      };
    }
    return {
      label: 'Full',
      colorClass: 'bg-clay text-white',
      borderClass: 'border-clay',
      ringClass: 'ring-rose-400/40',
      dotClass: 'bg-clay',
      count: 0,
    };
  };

  return (
    <div
      id="coimbatore-stylized-map-container"
      className="relative w-full h-[380px] sm:h-[460px] lg:h-[500px] rounded-2xl border border-line bg-[#f0ece1] dark:bg-[#0c1614] overflow-hidden shadow-curb select-none transition-colors"
    >
      {/* Map Header Overlay */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
        <div className="px-3 py-1.5 rounded-xl bg-paper/90 backdrop-blur-md border border-line shadow-xs flex items-center gap-2 text-xs">
          <div className="w-2.5 h-2.5 rounded-full bg-teal-primary animate-pulse" />
          <span className="font-bold text-ink font-serif text-sm">Coimbatore Curbside Mesh</span>
          <span className="text-[10px] text-ink-soft hidden sm:inline">• Live IoT Telemetry</span>
        </div>
      </div>

      {/* Map Control Buttons */}
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5">
        <button
          id="btn-map-zoom-in"
          onClick={() => setZoom((z) => Math.min(1.5, z + 0.15))}
          className="w-8 h-8 rounded-lg bg-paper/90 backdrop-blur-md border border-line text-ink flex items-center justify-center hover:bg-teal-pale hover:text-teal-dark shadow-xs transition-all"
          title="Zoom In"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          id="btn-map-zoom-out"
          onClick={() => setZoom((z) => Math.max(0.85, z - 0.15))}
          className="w-8 h-8 rounded-lg bg-paper/90 backdrop-blur-md border border-line text-ink flex items-center justify-center hover:bg-teal-pale hover:text-teal-dark shadow-xs transition-all"
          title="Zoom Out"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          id="btn-map-reset"
          onClick={() => setZoom(1)}
          className="w-8 h-8 rounded-lg bg-paper/90 backdrop-blur-md border border-line text-ink flex items-center justify-center hover:bg-teal-pale hover:text-teal-dark shadow-xs transition-all"
          title="Reset View"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
        <button
          id="btn-map-toggle-labels"
          onClick={() => setShowRoadLabels((s) => !s)}
          className={`w-8 h-8 rounded-lg border border-line flex items-center justify-center shadow-xs transition-all ${
            showRoadLabels ? 'bg-teal-pale text-teal-dark' : 'bg-paper text-ink-soft'
          }`}
          title="Toggle Road Labels"
        >
          <Layers className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Bottom Map Legend */}
      <div className="absolute bottom-3 left-3 z-20 flex flex-wrap items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-xl bg-paper/90 backdrop-blur-md border border-line shadow-xs text-[10px] sm:text-xs">
        <span className="font-bold text-ink-soft text-[10px] uppercase tracking-wider mr-1">Bays:</span>
        <span className="inline-flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-600" />
          <span className="text-ink-soft">≥6 Free</span>
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-teal-primary" />
          <span className="text-ink-soft">3-5 Free</span>
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-custom" />
          <span className="text-ink-soft">1-2 Left</span>
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-clay" />
          <span className="text-ink-soft">Full</span>
        </span>
      </div>

      {/* SVG Canvas Map Surface */}
      <div
        className="w-full h-full transition-transform duration-300 ease-out origin-center"
        style={{ transform: `scale(${zoom})` }}
      >
        <svg
          viewBox="0 0 800 600"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            {/* Background Grid Pattern */}
            <pattern id="curb-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-[#e2ded2] dark:text-[#182925]"
              />
            </pattern>

            {/* River Gradient */}
            <linearGradient id="noyyalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#b4d7d1" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#7cb6ad" stopOpacity="0.8" />
            </linearGradient>

            {/* Lake Gradient */}
            <radialGradient id="lakeGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#9ec8c1" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#67a79d" stopOpacity="0.85" />
            </radialGradient>
          </defs>

          {/* Grid Background */}
          <rect width="100%" height="100%" fill="url(#curb-grid)" />

          {/* Natural Water Features: Noyyal River & Valankulam / Ukkadam Lakes */}
          <g id="water-features" className="opacity-90">
            {/* Ukkadam / Valankulam Lake Reservoir */}
            <ellipse
              cx="310"
              cy="490"
              rx="90"
              ry="55"
              fill="url(#lakeGrad)"
              className="transition-colors"
            />
            {/* Singanallur Lake representation */}
            <ellipse
              cx="670"
              cy="420"
              rx="75"
              ry="45"
              fill="url(#lakeGrad)"
              className="transition-colors"
            />
            {/* Noyyal River meander */}
            <path
              d="M 0 530 Q 180 500 310 520 T 520 540 T 800 510"
              fill="none"
              stroke="url(#noyyalGrad)"
              strokeWidth="14"
              strokeLinecap="round"
            />
            <text x="260" y="495" className="fill-[#075f57] dark:fill-[#bfe3dc] text-[10px] font-semibold tracking-wider opacity-60">
              VALANKULAM
            </text>
            <text x="620" y="425" className="fill-[#075f57] dark:fill-[#bfe3dc] text-[10px] font-semibold tracking-wider opacity-60">
              SINGANALLUR LAKE
            </text>
          </g>

          {/* Major Coimbatore Highway & Arterial Street Grid */}
          <g id="street-grid">
            {/* Avinashi Road Arterial (East-West spine) */}
            <path
              d="M 120 280 L 320 250 L 520 200 L 780 150"
              fill="none"
              stroke="currentColor"
              strokeWidth="9"
              className="text-[#d8d3c5] dark:text-[#233833]"
            />
            {/* Mettupalayam Road (North-South spine) */}
            <path
              d="M 280 40 L 320 180 L 350 340 L 330 520"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-[#d8d3c5] dark:text-[#233833]"
            />
            {/* Trichy Road (South-East connector) */}
            <path
              d="M 330 360 L 500 410 L 750 460"
              fill="none"
              stroke="currentColor"
              strokeWidth="7"
              className="text-[#d8d3c5] dark:text-[#233833]"
            />
            {/* DB Road & West Bypass */}
            <path
              d="M 140 180 L 220 260 L 250 420"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              className="text-[#ded9cb] dark:text-[#1c2e2a]"
            />
            {/* Cross Cut Road link */}
            <path
              d="M 320 170 L 450 160 L 500 240"
              fill="none"
              stroke="currentColor"
              strokeWidth="5"
              className="text-[#ded9cb] dark:text-[#1c2e2a]"
            />
            {/* Race Course Oval Loop */}
            <ellipse
              cx="530"
              cy="340"
              rx="65"
              ry="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              className="text-[#d0cbbe] dark:text-[#273d38]"
            />
            {/* Secondary local road veins */}
            <path
              d="M 180 320 L 480 320 M 420 80 L 440 280 M 520 200 L 580 480 M 200 460 L 400 460"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeDasharray="4 2"
              className="text-[#e2ded2] dark:text-[#182925]"
            />

            {/* Street Names Labels (if enabled) */}
            {showRoadLabels && (
              <g className="text-[10px] font-bold fill-[#70807e] dark:fill-[#65857e] select-none tracking-wider">
                <text x="610" y="170" transform="rotate(-6 610 170)">
                  AVINASHI ROAD (SH-52)
                </text>
                <text x="305" y="100" transform="rotate(78 305 100)">
                  METTUPALAYAM RD
                </text>
                <text x="540" y="435" transform="rotate(11 540 435)">
                  TRICHY ROAD
                </text>
                <text x="145" y="220" transform="rotate(45 145 220)">
                  D.B. ROAD
                </text>
                <text x="495" y="345">
                  RACE COURSE
                </text>
              </g>
            )}
          </g>

          {/* Railway Tracks representation (Coimbatore Junction) */}
          <g id="railway-tracks" opacity="0.6">
            <path
              d="M 190 390 L 420 370 L 680 320"
              fill="none"
              stroke="#8a9997"
              strokeWidth="2"
              strokeDasharray="6 4"
            />
            <rect x="360" y="362" width="16" height="12" rx="3" fill="#0a7d73" opacity="0.8" />
            <text x="382" y="372" className="fill-[#1f2a2a] dark:fill-[#eef5f1] text-[9px] font-extrabold">
              CBE JN
            </text>
          </g>
        </svg>

        {/* Dynamic Zone Pins overlay positioned mathematically on the map */}
        {zones.map((zone) => {
          const isSelected = selectedZoneId === zone.id;
          const status = getZoneStatusConfig(zone.id);

          return (
            <motion.div
              key={zone.id}
              id={`map-pin-zone-${zone.id}`}
              onClick={() => onSelectZone(zone)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              style={{
                position: 'absolute',
                left: `${zone.mapX}%`,
                top: `${zone.mapY}%`,
                transform: 'translate(-50%, -50%)',
              }}
              className="z-30 cursor-pointer group"
            >
              {/* Pulse Ring when selected */}
              {isSelected && (
                <div className="absolute -inset-2.5 rounded-full bg-teal-primary/30 animate-ping pointer-events-none" />
              )}

              {/* Pin Badge Component */}
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full shadow-lg border-2 backdrop-blur-md transition-all duration-200 ${
                  isSelected
                    ? 'ring-3 ring-teal-primary scale-110 shadow-xl'
                    : 'group-hover:shadow-xl'
                } ${status.borderClass} ${
                  isSelected ? 'bg-paper text-ink font-bold' : 'bg-paper/95 text-ink font-semibold'
                }`}
              >
                {/* Status Dot with availability count */}
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold text-white shadow-xs ${status.colorClass}`}
                >
                  {status.count}
                </div>

                <div className="flex flex-col text-left pr-1">
                  <span className="text-[11px] font-bold text-ink whitespace-nowrap leading-tight">
                    {zone.name.split(' ')[0]}
                  </span>
                  <span className="text-[9px] text-ink-soft leading-none font-medium">
                    ₹{zone.hourlyRate}/h
                  </span>
                </div>
              </div>

              {/* Anchor point indicator */}
              <div
                className={`w-2 h-2 rounded-full mx-auto mt-0.5 border border-white shadow-xs ${status.dotClass}`}
              />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
