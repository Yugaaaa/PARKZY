/**
 * VehicleZoneSelector Page
 *
 * Visual Architecture:
 * - Step 1 (Vehicle Picker): Dark, premium automotive showroom aesthetic with giant stroke watermark,
 *   ambient floating particles, mouse-parallax tilt, and AnimateDigits spec readouts.
 *   (Note: Scoped showroom mode is dark by design regardless of the global theme).
 * - Step 2 & 3 (Zone Picker & Booking Confirmation): Warm limestone / Curb Atlas palette with smooth crossfade.
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import {
  ArrowLeft,
  Check,
  Car,
  Bike,
  Zap,
  MapPin,
  Clock,
  ShieldCheck,
  Ticket,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Shield,
  Layers,
  ChevronLeft,
} from 'lucide-react';
import { useCurb } from '../context/CurbContext';
import { VehicleType, ParkingZone, ParkingSpace } from '../types';
import { useLocation } from 'wouter';
import { VehicleIllustration } from '../components/vehicles/VehicleIllustrations';
import { AnimateDigits } from '../components/motion/AnimateDigits';
import { cn } from '../lib/utils';

// Vehicle configuration metadata
const VEHICLE_DATA = [
  {
    id: 'two_wheeler' as VehicleType,
    name: 'Two-Wheeler',
    watermark: 'TWO-WHEELER',
    badge: 'Scooter & Motorcycle',
    description: 'Compact urban footprint. Dedicated fast-turnover bays with reduced municipal tariffs.',
    avgDuration: '45 mins',
  },
  {
    id: 'hatchback' as VehicleType,
    name: 'Hatchback',
    watermark: 'HATCHBACK',
    badge: 'Standard City Car',
    description: 'Standard curbside bays with real-time ultrasound guidance and 15-second demonstration hold protection.',
    avgDuration: '60 mins',
  },
  {
    id: 'ev' as VehicleType,
    name: 'Electric Vehicle',
    watermark: 'ELECTRIC',
    badge: 'EV & Hybrid Plug-in',
    description: 'Priority charging stalls with subsidized curbside dwell rates and smart sensor validation.',
    avgDuration: '90 mins',
  },
];

// Ambient Floating Dust Particle Canvas Component (Lightweight, ~25 particles, lazy-mounted)
const AmbientDustParticles: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // 25 lightweight dust particles
    const particles = Array.from({ length: 24 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.5 + 0.5,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: -Math.random() * 0.4 - 0.1,
      opacity: Math.random() * 0.4 + 0.1,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.y < 0) p.y = height;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(45, 212, 191, ${p.opacity})`;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [shouldReduceMotion]);

  if (shouldReduceMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-10 opacity-70"
    />
  );
};

export const VehicleZoneSelector: React.FC = () => {
  const { zones, spaces, getZoneStats, createHold, activeReservation } = useCurb();
  const [, setLocation] = useLocation();
  const shouldReduceMotion = useReducedMotion();

  // Wizard state: 1 = Dark Showroom Picker, 2 = Zone & Duration, 3 = Confirmation Pass
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType>('hatchback');
  const [selectedZone, setSelectedZone] = useState<ParkingZone | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number>(1);
  const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Mouse Parallax Tilt state
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const currentVehicleMeta = useMemo(() => {
    return VEHICLE_DATA.find((v) => v.id === selectedVehicle) || VEHICLE_DATA[1];
  }, [selectedVehicle]);

  // Compute live specs for selected vehicle
  const vehicleStats = useMemo(() => {
    let compatibleZoneCount = 0;
    let totalAvailableSpaces = 0;
    let rateSum = 0;

    zones.forEach((zone) => {
      const stats = getZoneStats(zone.id);
      let count = 0;
      if (selectedVehicle === 'two_wheeler') {
        count = stats.twoWheelerAvailable;
      } else if (selectedVehicle === 'ev') {
        count = stats.evAvailable;
      } else {
        count = stats.standardAvailable + stats.accessibleAvailable;
      }

      if (count > 0) {
        compatibleZoneCount++;
        totalAvailableSpaces += count;
        rateSum += zone.hourlyRate;
      }
    });

    const avgRate = compatibleZoneCount > 0 ? Math.round(rateSum / compatibleZoneCount) : 30;

    return {
      compatibleZoneCount,
      totalAvailableSpaces,
      avgRate,
    };
  }, [zones, getZoneStats, selectedVehicle]);

  const handleSelectZone = (zone: ParkingZone) => {
    setSelectedZone(zone);
    const zoneSpaces = spaces.filter((s) => s.zoneId === zone.id && s.status === 'available');
    let matchingSpace: ParkingSpace | undefined;

    if (selectedVehicle === 'two_wheeler') {
      matchingSpace = zoneSpaces.find((s) => s.kind === 'two_wheeler');
    } else if (selectedVehicle === 'ev') {
      matchingSpace = zoneSpaces.find((s) => s.kind === 'ev');
    } else {
      matchingSpace = zoneSpaces.find((s) => s.kind === 'standard') || zoneSpaces.find((s) => s.kind === 'accessible');
    }

    setSelectedSpaceId(matchingSpace?.id || zoneSpaces[0]?.id || null);
  };

  const handleConfirmBooking = () => {
    if (!selectedZone || !selectedSpaceId) {
      setErrorMsg('Please select a parking zone.');
      return;
    }
    setErrorMsg(null);

    const result = createHold(selectedSpaceId, selectedVehicle, selectedDuration);
    if (result.success) {
      setStep(3);
    } else {
      setErrorMsg(result.message || 'Could not hold space.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col select-none overflow-x-hidden font-sans">
      {/* ========================================================================= */}
      {/* STEP 1: DARK PREMIUM AUTOMOTIVE SHOWROOM VEHICLE PICKER                   */}
      {/* ========================================================================= */}
      {step === 1 && (
        <div
          onMouseMove={handleMouseMove}
          className="relative min-h-screen bg-[#070b12] text-slate-100 flex flex-col justify-between p-6 sm:p-10 overflow-hidden"
        >
          {/* Ambient Dust Particles */}
          <AmbientDustParticles />

          {/* Giant Outlined Stroke Watermark Wordmark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
            <span
              style={{
                WebkitTextStroke: '1.5px rgba(255, 255, 255, 0.08)',
                color: 'transparent',
              }}
              className="font-serif text-[18vw] sm:text-[14vw] font-black uppercase tracking-widest select-none transition-all duration-700 opacity-60 scale-105"
            >
              {currentVehicleMeta.watermark}
            </span>
          </div>

          {/* Top Glass Pill Navigation Bar */}
          <header className="relative z-20 flex items-center justify-between max-w-6xl mx-auto w-full">
            <button
              onClick={() => setLocation('/')}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 backdrop-blur-xl text-xs font-bold text-slate-300 transition-all cursor-pointer shadow-lg"
            >
              <ArrowLeft className="w-4 h-4 text-teal-400" />
              <span>Back to Map</span>
            </button>

            {/* Vehicle Switcher Pill */}
            <div className="flex items-center gap-1.5 p-1 rounded-full bg-slate-900/90 border border-slate-700/60 backdrop-blur-xl shadow-2xl">
              {VEHICLE_DATA.map((v) => {
                const isActive = selectedVehicle === v.id;
                return (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVehicle(v.id)}
                    className={cn(
                      'px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5',
                      isActive
                        ? 'bg-teal text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-100'
                    )}
                  >
                    {v.id === 'two_wheeler' && <Bike className="w-3.5 h-3.5" />}
                    {v.id === 'hatchback' && <Car className="w-3.5 h-3.5" />}
                    {v.id === 'ev' && <Zap className="w-3.5 h-3.5" />}
                    <span>{v.name}</span>
                  </button>
                );
              })}
            </div>

            <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-teal-400/80">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              <span>Coimbatore Live Corridor</span>
            </div>
          </header>

          {/* Center Stage: Left Spec Panel + Hero Vehicle with Mouse Parallax + Right Spec Panel */}
          <div className="relative z-20 max-w-6xl mx-auto w-full my-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left Floating Spec Panel */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              key={`left-${selectedVehicle}`}
              transition={{ duration: 0.4 }}
              className="lg:col-span-3 space-y-4"
            >
              <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-2xl space-y-4">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 block">
                    Compatible Zones
                  </span>
                  <div className="text-3xl font-bold text-teal-400 font-mono mt-1 flex items-baseline gap-1">
                    <AnimateDigits value={vehicleStats.compatibleZoneCount} />
                    <span className="text-sm text-slate-400">/ 8</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/60">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 block">
                    Avg. Price / Hr
                  </span>
                  <div className="text-2xl font-bold text-slate-100 font-mono mt-1">
                    <AnimateDigits value={vehicleStats.avgRate} prefix="₹" suffix="/hr" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Central Hero Vehicle with Subtle Mouse Parallax Tilt */}
            <div className="lg:col-span-6 flex flex-col items-center justify-center">
              <motion.div
                key={selectedVehicle}
                initial={{ opacity: 0, scale: 0.92, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 180, damping: 20 }}
                style={{
                  transform: shouldReduceMotion
                    ? 'none'
                    : `perspective(1000px) rotateY(${mousePos.x * 12}deg) rotateX(${-mousePos.y * 12}deg)`,
                }}
                className="w-full max-w-lg transition-transform duration-100 ease-out py-4"
              >
                <VehicleIllustration type={selectedVehicle} />
              </motion.div>

              <div className="text-center mt-2 space-y-1">
                <span className="text-[11px] font-mono uppercase tracking-widest text-teal-400 px-3 py-1 rounded-full bg-teal-950/60 border border-teal-500/30">
                  {currentVehicleMeta.badge}
                </span>
                <h2 className="font-serif text-2xl font-bold text-white tracking-tight mt-2">
                  {currentVehicleMeta.name}
                </h2>
                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                  {currentVehicleMeta.description}
                </p>
              </div>
            </div>

            {/* Right Floating Spec Panel */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              key={`right-${selectedVehicle}`}
              transition={{ duration: 0.4 }}
              className="lg:col-span-3 space-y-4"
            >
              <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-2xl space-y-4">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 block">
                    Spaces Available Now
                  </span>
                  <div className="text-3xl font-bold text-teal-400 font-mono mt-1">
                    <AnimateDigits value={vehicleStats.totalAvailableSpaces} />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/60">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 block">
                    Typical Session Length
                  </span>
                  <div className="text-xl font-bold text-slate-100 font-mono mt-1">
                    {currentVehicleMeta.avgDuration}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Bottom Action Bar: Prominent CTA */}
          <footer className="relative z-20 max-w-xl mx-auto w-full pt-4">
            <button
              id="btn-select-vehicle-cta"
              onClick={() => setStep(2)}
              className="w-full py-4 px-6 rounded-2xl bg-teal hover:bg-teal-hover text-white font-bold text-sm shadow-xl shadow-teal-950 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.99] border border-teal-400/40"
            >
              <span>Select this vehicle & Pick Zone</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </footer>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: ZONE PICKER & DURATION (WARM LIMESTONE PALETTE)                   */}
      {/* ========================================================================= */}
      {step === 2 && (
        <div className="min-h-screen bg-sand-150 dark:bg-graphite-dark text-graphite dark:text-sand-100 flex flex-col p-6 sm:p-10 animate-in fade-in duration-300">
          <div className="max-w-4xl mx-auto w-full space-y-6">
            {/* Header with Back Button */}
            <div className="flex items-center justify-between pb-4 border-b border-sand-300 dark:border-graphite-light">
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-2 text-xs font-bold text-teal hover:underline cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Change Vehicle ({currentVehicleMeta.name})</span>
              </button>

              <span className="text-xs font-bold text-graphite-muted">Step 2 of 2</span>
            </div>

            <div>
              <h1 className="font-serif text-2xl font-bold text-graphite dark:text-sand-100">
                Choose a Parking Zone in Coimbatore
              </h1>
              <p className="text-xs text-graphite-muted dark:text-sand-400 mt-1">
                Showing zones with available {currentVehicleMeta.name.toLowerCase()} spaces.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-clay/15 border border-clay/30 text-clay text-xs font-bold">
                {errorMsg}
              </div>
            )}

            {/* Zone Selection Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {zones.map((zone) => {
                const stats = getZoneStats(zone.id);
                let availableForType = 0;
                if (selectedVehicle === 'two_wheeler') availableForType = stats.twoWheelerAvailable;
                else if (selectedVehicle === 'ev') availableForType = stats.evAvailable;
                else availableForType = stats.standardAvailable + stats.accessibleAvailable;

                const isSelected = selectedZone?.id === zone.id;

                return (
                  <button
                    key={zone.id}
                    onClick={() => handleSelectZone(zone)}
                    className={cn(
                      'p-4 rounded-3xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 shadow-xs',
                      isSelected
                        ? 'bg-sand-50 dark:bg-graphite border-teal ring-2 ring-teal shadow-md'
                        : 'bg-sand-50 dark:bg-graphite border-sand-300 dark:border-graphite-light hover:border-teal'
                    )}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-serif text-base font-bold text-graphite dark:text-sand-100">
                          {zone.name}
                        </span>
                        <span className="font-bold text-xs text-teal">
                          ₹{zone.hourlyRate}/hr
                        </span>
                      </div>
                      <p className="text-xs text-graphite-muted mt-0.5">{zone.area}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-sand-200 dark:border-graphite-light text-xs font-semibold">
                      <span className="text-teal">
                        {availableForType} {currentVehicleMeta.name.toLowerCase()} bay{availableForType === 1 ? '' : 's'} free
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-teal" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Duration Selector */}
            {selectedZone && (
              <div className="p-5 rounded-3xl bg-sand-50 dark:bg-graphite border border-sand-300 dark:border-graphite-light shadow-sm space-y-3">
                <span className="text-xs font-bold text-graphite dark:text-sand-100 block">
                  Select Parking Duration
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {[0.5, 1, 2, 4].map((hours) => (
                    <button
                      key={hours}
                      onClick={() => setSelectedDuration(hours)}
                      className={cn(
                        'py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer text-center',
                        selectedDuration === hours
                          ? 'bg-teal text-white shadow-xs'
                          : 'bg-sand-200 dark:bg-graphite-light text-graphite dark:text-sand-200 hover:bg-sand-300'
                      )}
                    >
                      {hours === 0.5 ? '30 Mins' : `${hours} Hour${hours > 1 ? 's' : ''}`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Confirm Hold Action */}
            <div className="pt-2">
              <button
                disabled={!selectedZone || !selectedSpaceId}
                onClick={handleConfirmBooking}
                className="w-full py-4 px-6 rounded-2xl bg-teal hover:bg-teal-hover disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Clock className="w-4 h-4" />
                <span>Confirm 15-Second Demo Hold Reservation</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: CONFIRMED RESERVATION PASS                                        */}
      {/* ========================================================================= */}
      {step === 3 && (
        <div className="min-h-screen bg-sand-150 dark:bg-graphite-dark text-graphite dark:text-sand-100 flex flex-col items-center justify-center p-6 animate-in zoom-in-95 duration-200">
          <div className="max-w-md w-full p-6 rounded-3xl bg-sand-50 dark:bg-graphite border border-sand-300 dark:border-graphite-light shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-teal text-white flex items-center justify-center mx-auto shadow-md">
              <Check className="w-6 h-6" />
            </div>

            <div>
              <h2 className="font-serif text-xl font-bold text-graphite dark:text-sand-100">
                15-Second Demo Hold Confirmed
              </h2>
              <p className="text-xs text-graphite-muted dark:text-sand-400 mt-1">
                Your space in {selectedZone?.name} is held for your arrival.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-sand-200/60 dark:bg-graphite-light/40 border border-sand-200 dark:border-graphite-light space-y-2 text-xs text-left">
              <div className="flex justify-between">
                <span className="text-graphite-muted">Vehicle Type</span>
                <span className="font-bold text-teal">{currentVehicleMeta.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-graphite-muted">Zone</span>
                <span className="font-bold text-graphite dark:text-sand-100">{selectedZone?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-graphite-muted">Rate</span>
                <span className="font-bold text-graphite dark:text-sand-100">₹{selectedZone?.hourlyRate}/hr</span>
              </div>
            </div>

            <button
              onClick={() => setLocation('/')}
              className="w-full py-3.5 px-4 rounded-2xl bg-teal hover:bg-teal-hover text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              Open Live Navigation Map
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleZoneSelector;
