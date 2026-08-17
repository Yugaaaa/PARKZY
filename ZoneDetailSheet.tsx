import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  MapPin,
  Car,
  Zap,
  Accessibility,
  Bike,
  ShieldCheck,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Lock,
  ArrowRight,
  Info,
  Camera,
} from 'lucide-react';
import { useCurb } from '../../context/CurbContext';
import { ParkingZone, ParkingSpace, VehicleType } from '../../types';
import { TrustRibbon } from '../common/TrustRibbon';

interface ZoneDetailSheetProps {
  zone: ParkingZone | null;
  onClose: () => void;
  onOpenReportModal: (zone: ParkingZone, space?: ParkingSpace) => void;
  onOpenPassView: () => void;
}

export const ZoneDetailSheet: React.FC<ZoneDetailSheetProps> = ({
  zone,
  onClose,
  onOpenReportModal,
  onOpenPassView,
}) => {
  const {
    getZoneSpaces,
    getZoneStats,
    selectedVehicleFilter,
    setSelectedVehicleFilter,
    createHold,
    currentUser,
    activeReservation,
    holdFormattedTime,
    holdSecondsRemaining,
  } = useCurb();

  const [selectedSpace, setSelectedSpace] = useState<ParkingSpace | null>(null);
  const [chosenDuration, setChosenDuration] = useState<number>(1);
  const [bookingVehicle, setBookingVehicle] = useState<VehicleType>('hatchback');
  const [isHolding, setIsHolding] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!zone) return null;

  const spaces = getZoneSpaces(zone.id);
  const stats = getZoneStats(zone.id);

  // Filter spaces if vehicle filter is applied
  const filteredSpaces = spaces.filter((space) => {
    if (selectedVehicleFilter === 'all') return true;
    if (selectedVehicleFilter === 'two_wheeler') return space.kind === 'two_wheeler';
    if (selectedVehicleFilter === 'ev') return space.kind === 'ev';
    if (selectedVehicleFilter === 'hatchback') return space.kind === 'standard' || space.kind === 'accessible';
    return true;
  });

  const handleStartHold = () => {
    if (!selectedSpace) return;
    setErrorMessage(null);
    setIsHolding(true);

    const result = createHold(selectedSpace.id, bookingVehicle, chosenDuration);
    if (!result.success) {
      setErrorMessage(result.message || 'Unable to hold space.');
      setIsHolding(false);
    } else {
      setIsHolding(false);
      // Advance to pass view
      onOpenPassView();
    }
  };

  const getKindIcon = (kind: ParkingSpace['kind']) => {
    switch (kind) {
      case 'ev':
        return <Zap className="w-3.5 h-3.5 text-teal-primary" />;
      case 'accessible':
        return <Accessibility className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />;
      case 'two_wheeler':
        return <Bike className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />;
      default:
        return <Car className="w-3.5 h-3.5 text-ink-soft" />;
    }
  };

  const getStatusBadge = (status: ParkingSpace['status']) => {
    switch (status) {
      case 'available':
        return {
          bg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
          label: 'Available',
          dot: 'bg-emerald-500',
        };
      case 'held':
        return {
          bg: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30',
          label: 'On Hold (15s demo)',
          dot: 'bg-amber-custom',
        };
      case 'reserved':
      case 'occupied':
        return {
          bg: 'bg-stone-500/10 text-stone-700 dark:text-stone-300 border-stone-500/30',
          label: 'In Use',
          dot: 'bg-stone-500',
        };
      case 'conflict':
        return {
          bg: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30',
          label: 'Conflict Signal',
          dot: 'bg-rose-500',
        };
      case 'out_of_service':
        return {
          bg: 'bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/30',
          label: 'Maintenance',
          dot: 'bg-red-500',
        };
    }
  };

  return (
    <AnimatePresence>
      <div id="zone-detail-modal-overlay" className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#075f57]/50 backdrop-blur-xs"
        />

        {/* Modal Sheet Container */}
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="relative w-full max-w-2xl bg-paper border border-line rounded-t-3xl sm:rounded-3xl shadow-2xl z-10 max-h-[90vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="p-5 border-b border-line flex items-start justify-between bg-limestone/50">
            <div className="flex-1 pr-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="curb-label text-[10px] text-teal-dark font-bold bg-teal-pale px-2 py-0.5 rounded-full border border-teal-500/20">
                  {zone.area}
                </span>
                <span className="text-xs text-ink-soft">• {zone.landmark}</span>
              </div>
              <h2 className="font-serif text-2xl font-bold text-ink leading-tight">{zone.name}</h2>
              <p className="text-xs text-ink-soft mt-0.5">{zone.description}</p>
            </div>

            <button
              id="btn-close-zone-sheet"
              onClick={onClose}
              className="w-9 h-9 rounded-xl border border-line bg-paper text-ink flex items-center justify-center hover:bg-teal-pale hover:text-teal-dark transition-colors shrink-0"
              aria-label="Close sheet"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content Body */}
          <div className="p-5 overflow-y-auto space-y-5 flex-1">
            {/* Trust Telemetry Ribbon */}
            <TrustRibbon
              source={zone.sourceLabel}
              confidenceScore={zone.confidenceScore}
              lastVerifiedMinutesAgo={zone.lastVerifiedMinutesAgo}
            />

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-limestone border border-line">
              <div className="text-center border-r border-line pr-2">
                <div className="curb-label text-[10px]">Hourly Tariff</div>
                <div className="font-serif text-lg font-bold text-ink mt-0.5">₹{zone.hourlyRate}</div>
                <div className="text-[10px] text-ink-soft">per hour</div>
              </div>
              <div className="text-center border-r border-line pr-2">
                <div className="curb-label text-[10px]">Live Available</div>
                <div className="font-serif text-lg font-bold text-teal-primary mt-0.5">
                  {stats.available} <span className="text-xs font-sans text-ink-soft font-normal">/ {stats.total}</span>
                </div>
                <div className="text-[10px] text-ink-soft">{stats.occupancyRate}% Occupied</div>
              </div>
              <div className="text-center">
                <div className="curb-label text-[10px]">Hold Window</div>
                <div className="font-serif text-lg font-bold text-ink mt-0.5">15 Sec</div>
                <div className="text-[10px] text-ink-soft">Guaranteed Hold</div>
              </div>
            </div>

            {/* Vehicle Type Segmented Control */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="curb-label text-[11px]">Filter Spaces by Vehicle</label>
                <span className="text-[11px] text-ink-soft">Showing {filteredSpaces.length} bays</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 p-1 rounded-xl bg-limestone border border-line">
                <button
                  id="filter-all-spaces"
                  onClick={() => setSelectedVehicleFilter('all')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                    selectedVehicleFilter === 'all'
                      ? 'bg-paper text-ink shadow-xs border border-line'
                      : 'text-ink-soft hover:text-ink'
                  }`}
                >
                  All ({spaces.length})
                </button>
                <button
                  id="filter-car-spaces"
                  onClick={() => setSelectedVehicleFilter('hatchback')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                    selectedVehicleFilter === 'hatchback'
                      ? 'bg-paper text-ink shadow-xs border border-line'
                      : 'text-ink-soft hover:text-ink'
                  }`}
                >
                  <Car className="w-3 h-3" /> Car
                </button>
                <button
                  id="filter-two-wheeler-spaces"
                  onClick={() => setSelectedVehicleFilter('two_wheeler')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                    selectedVehicleFilter === 'two_wheeler'
                      ? 'bg-paper text-ink shadow-xs border border-line'
                      : 'text-ink-soft hover:text-ink'
                  }`}
                >
                  <Bike className="w-3 h-3" /> 2W
                </button>
                <button
                  id="filter-ev-spaces"
                  onClick={() => setSelectedVehicleFilter('ev')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                    selectedVehicleFilter === 'ev'
                      ? 'bg-paper text-ink shadow-xs border border-line'
                      : 'text-ink-soft hover:text-ink'
                  }`}
                >
                  <Zap className="w-3 h-3" /> EV
                </button>
              </div>
            </div>

            {/* Individual Numbered Space Tiles Grid */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="curb-label text-[11px]">Select a Specific Curbside Bay</label>
                <div className="flex items-center gap-2 text-[10px] text-ink-soft">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> Free
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-custom" /> Hold
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-stone-400" /> In-use
                  </span>
                </div>
              </div>

              {filteredSpaces.length === 0 ? (
                <div className="p-6 rounded-2xl border border-line bg-limestone text-center">
                  <Info className="w-6 h-6 text-ink-soft mx-auto mb-2" />
                  <p className="text-xs font-bold text-ink">No spaces match the selected filter</p>
                  <p className="text-[11px] text-ink-soft mt-0.5">Try selecting another vehicle type.</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                  {filteredSpaces.map((space) => {
                    const isSelected = selectedSpace?.id === space.id;
                    const statusCfg = getStatusBadge(space.status);
                    const isAvailable = space.status === 'available';

                    return (
                      <button
                        key={space.id}
                        id={`space-tile-${space.label}`}
                        disabled={!isAvailable}
                        onClick={() => setSelectedSpace(space)}
                        className={`p-3 rounded-2xl border text-left transition-all relative flex flex-col justify-between h-24 ${
                          isSelected
                            ? 'bg-teal-pale border-teal-primary ring-2 ring-teal-primary/40 shadow-md'
                            : isAvailable
                            ? 'bg-paper hover:bg-limestone border-line hover:border-teal-primary/50 cursor-pointer shadow-xs'
                            : 'bg-limestone/60 border-line opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <span className="font-serif text-sm font-bold text-ink">{space.label}</span>
                          <span className="p-1 rounded-md bg-paper border border-line">{getKindIcon(space.kind)}</span>
                        </div>

                        <div>
                          <div className="text-[10px] text-ink-soft capitalize flex items-center gap-1">
                            <span>{space.kind.replace('_', ' ')}</span>
                          </div>
                          <div className={`mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded border inline-flex items-center gap-1 ${statusCfg.bg}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                            {statusCfg.label}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Error Message Box */}
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-clay shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Hold Requirement Notice</div>
                  <div className="text-[11px] mt-0.5">{errorMessage}</div>
                </div>
              </div>
            )}

            {/* Selection & Reservation Controls */}
            {selectedSpace && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl border border-teal-500/30 bg-teal-pale space-y-3"
              >
                <div className="flex items-center justify-between border-b border-line pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-teal-primary text-white flex items-center justify-center font-bold text-xs">
                      {selectedSpace.label}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-ink">Selected Bay: {selectedSpace.label}</div>
                      <div className="text-[10px] text-ink-soft">
                        Kind: <span className="font-semibold capitalize">{selectedSpace.kind.replace('_', ' ')}</span> • ₹
                        {zone.hourlyRate}/hr
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-bold text-teal-dark">
                      Total: ₹{zone.hourlyRate * chosenDuration}
                    </div>
                    <div className="text-[10px] text-ink-soft">{chosenDuration} hour(s)</div>
                  </div>
                </div>

                {/* Duration Picker */}
                <div>
                  <div className="curb-label text-[10px] mb-1.5">Estimated Parking Duration</div>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4].map((hours) => (
                      <button
                        key={hours}
                        id={`duration-opt-${hours}h`}
                        onClick={() => setChosenDuration(hours)}
                        className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold border transition-all ${
                          chosenDuration === hours
                            ? 'bg-teal-primary text-white border-teal-primary shadow-xs'
                            : 'bg-paper text-ink border-line hover:bg-limestone'
                        }`}
                      >
                        {hours}h
                      </button>
                    ))}
                  </div>
                </div>

                {/* Vehicle Type Choice */}
                <div>
                  <div className="curb-label text-[10px] mb-1.5">Vehicle Type for this Session</div>
                  <div className="grid grid-cols-3 gap-2">
                    {(['hatchback', 'two_wheeler', 'ev'] as VehicleType[]).map((vType) => (
                      <button
                        key={vType}
                        id={`select-vtype-${vType}`}
                        onClick={() => setBookingVehicle(vType)}
                        className={`py-1.5 px-2 rounded-xl text-xs font-bold border capitalize flex items-center justify-center gap-1.5 transition-all ${
                          bookingVehicle === vType
                            ? 'bg-paper text-teal-dark border-teal-primary ring-1 ring-teal-primary shadow-xs'
                            : 'bg-paper text-ink-soft border-line hover:bg-limestone'
                        }`}
                      >
                        {vType === 'two_wheeler' ? <Bike className="w-3.5 h-3.5" /> : vType === 'ev' ? <Zap className="w-3.5 h-3.5" /> : <Car className="w-3.5 h-3.5" />}
                        {vType.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hold CTA Button */}
                <button
                  id="btn-confirm-hold-space"
                  disabled={isHolding}
                  onClick={handleStartHold}
                  className="w-full py-3 px-4 rounded-xl bg-teal-primary hover:bg-teal-dark text-white font-bold text-sm shadow-md shadow-teal-800/20 flex items-center justify-center gap-2 transition-all transform active:scale-98 cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>Start 15-Second Demo Hold for {selectedSpace.label}</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>

                <p className="text-[10px] text-ink-soft text-center leading-tight">
                  Guaranteed 15-second demo hold window. If you don't dock within 15 seconds for this demo, the space auto-releases to the public pool without penalty.
                </p>
              </motion.div>
            )}

            {/* Community Reporting Affordance */}
            <div className="p-3.5 rounded-2xl border border-line bg-limestone flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-paper border border-line flex items-center justify-center text-teal-dark">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-ink">See something on this curb?</div>
                  <div className="text-[10px] text-ink-soft">Report free space, obstruction, or ramp block</div>
                </div>
              </div>
              <button
                id="btn-report-curb-signal"
                onClick={() => onOpenReportModal(zone, selectedSpace || undefined)}
                className="px-3 py-1.5 rounded-xl bg-paper hover:bg-teal-pale text-teal-dark border border-line text-xs font-bold transition-colors cursor-pointer"
              >
                Report Signal
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
