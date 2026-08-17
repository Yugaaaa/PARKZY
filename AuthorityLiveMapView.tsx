import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Layers,
  Filter,
  Car,
  Bike,
  Zap,
  Accessibility,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Shield,
  Search,
  Activity,
  Wrench,
  XCircle,
  RefreshCw,
  Info,
  ChevronRight,
} from 'lucide-react';
import { ParkingZone, ParkingSpace, SpaceStatus, SpaceKind, CommunityReport, AuthorityAlert } from '../../types';
import { ParkingMap } from '../map/ParkingMap';

interface AuthorityLiveMapViewProps {
  zones: ParkingZone[];
  spaces: ParkingSpace[];
  selectedZoneId: string | null;
  onSelectZone: (zoneId: string | null) => void;
  updateSpaceStatus: (spaceId: string, newStatus: SpaceStatus, reason?: string) => void;
  communityReports: CommunityReport[];
  alerts: AuthorityAlert[];
  onShowToast: (msg: string) => void;
}

export const AuthorityLiveMapView: React.FC<AuthorityLiveMapViewProps> = ({
  zones,
  spaces,
  selectedZoneId,
  onSelectZone,
  updateSpaceStatus,
  communityReports,
  alerts,
  onShowToast,
}) => {
  const [activeLayer, setActiveLayer] = useState<'all' | 'conflicts' | 'ev' | 'accessible' | 'community'>('all');
  const [selectedSpace, setSelectedSpace] = useState<ParkingSpace | null>(null);
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
  const [overrideStatus, setOverrideStatus] = useState<SpaceStatus>('out_of_service');
  const [overrideReason, setOverrideReason] = useState('');
  const [spaceSearch, setSpaceSearch] = useState('');

  // Filtered spaces based on selected zone and layer
  const filteredSpaces = useMemo(() => {
    return spaces.filter((s) => {
      if (selectedZoneId && s.zoneId !== selectedZoneId) return false;
      if (activeLayer === 'conflicts' && s.status !== 'conflict' && s.status !== 'out_of_service') return false;
      if (activeLayer === 'ev' && s.kind !== 'ev') return false;
      if (activeLayer === 'accessible' && s.kind !== 'accessible') return false;
      if (spaceSearch.trim()) {
        const query = spaceSearch.toLowerCase();
        return (
          s.label.toLowerCase().includes(query) ||
          (s.sensorId && s.sensorId.toLowerCase().includes(query)) ||
          s.address.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [spaces, selectedZoneId, activeLayer, spaceSearch]);

  const activeZone = zones.find((z) => z.id === selectedZoneId);

  const handleApplyOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSpace) return;
    updateSpaceStatus(selectedSpace.id, overrideStatus, overrideReason || 'Manual municipal override');
    setIsOverrideModalOpen(false);
    onShowToast(`Bay ${selectedSpace.label} status changed to ${overrideStatus}.`);
    // update local reference
    setSelectedSpace({
      ...selectedSpace,
      status: overrideStatus,
    });
  };

  return (
    <div className="space-y-4 h-[calc(100vh-8.5rem)] flex flex-col">
      {/* Top Filter Bar */}
      <div className="bg-sand-50 dark:bg-graphite p-3 rounded-2xl border border-sand-300 dark:border-graphite-light shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        {/* Zone Selector */}
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1 md:pb-0">
          <button
            onClick={() => onSelectZone(null)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
              selectedZoneId === null
                ? 'bg-teal text-sand-50 shadow-sm'
                : 'bg-sand-200 dark:bg-graphite-light text-graphite-muted dark:text-sand-300 hover:text-graphite'
            }`}
          >
            All Zones ({spaces.length})
          </button>
          {zones.map((z) => (
            <button
              key={z.id}
              onClick={() => onSelectZone(z.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                selectedZoneId === z.id
                  ? 'bg-teal text-sand-50 shadow-sm'
                  : 'bg-sand-200 dark:bg-graphite-light text-graphite-muted dark:text-sand-300 hover:text-graphite'
              }`}
            >
              {z.name}
            </button>
          ))}
        </div>

        {/* Layer Filters & Search */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
          {/* Quick Space Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Find bay (e.g. GP-01)..."
              value={spaceSearch}
              onChange={(e) => setSpaceSearch(e.target.value)}
              className="w-36 sm:w-44 pl-7 pr-3 py-1.5 rounded-xl text-xs border border-sand-300 dark:border-graphite-light bg-sand-100 dark:bg-graphite-dark text-graphite dark:text-sand-100 focus:outline-none focus:border-teal"
            />
            <Search className="w-3.5 h-3.5 text-graphite-muted dark:text-sand-400 absolute left-2 top-2" />
          </div>

          {/* Layer Selector */}
          <div className="flex items-center bg-sand-200 dark:bg-graphite-light p-0.5 rounded-xl border border-sand-300 dark:border-graphite-light text-xs">
            <button
              onClick={() => setActiveLayer('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                activeLayer === 'all'
                  ? 'bg-sand-50 dark:bg-graphite text-teal font-bold shadow-sm'
                  : 'text-graphite-muted dark:text-sand-400'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveLayer('conflicts')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
                activeLayer === 'conflicts'
                  ? 'bg-sand-50 dark:bg-graphite text-clay font-bold shadow-sm'
                  : 'text-graphite-muted dark:text-sand-400'
              }`}
            >
              <AlertTriangle className="w-3 h-3 text-clay" />
              Incidents
            </button>
            <button
              onClick={() => setActiveLayer('ev')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
                activeLayer === 'ev'
                  ? 'bg-sand-50 dark:bg-graphite text-teal font-bold shadow-sm'
                  : 'text-graphite-muted dark:text-sand-400'
              }`}
            >
              <Zap className="w-3 h-3" />
              EV
            </button>
            <button
              onClick={() => setActiveLayer('accessible')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
                activeLayer === 'accessible'
                  ? 'bg-sand-50 dark:bg-graphite text-teal font-bold shadow-sm'
                  : 'text-graphite-muted dark:text-sand-400'
              }`}
            >
              <Accessibility className="w-3 h-3" />
              PWD
            </button>
          </div>
        </div>
      </div>

      {/* Main Map + Side Telemetry Panel Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0 overflow-hidden">
        {/* Map Canvas (8 or 9 cols) */}
        <div className="lg:col-span-8 xl:col-span-9 rounded-2xl overflow-hidden border border-sand-300 dark:border-graphite-light relative shadow-sm">
          <ParkingMap
            spacesOverride={filteredSpaces}
            selectedZoneIdOverride={selectedZoneId}
            onSelectSpace={setSelectedSpace}
            height="100%"
            showSearchBar={false}
            isAuthorityMode
          />
        </div>

        {/* Right 4 or 3 cols: Curbside Space Telemetry & Inspection Card */}
        <div className="lg:col-span-4 xl:col-span-3 bg-sand-50 dark:bg-graphite rounded-2xl border border-sand-300 dark:border-graphite-light p-4 shadow-sm flex flex-col justify-between overflow-y-auto custom-scrollbar">
          {selectedSpace ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-sand-300 dark:border-graphite-light pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-teal/15 text-teal flex items-center justify-center font-bold text-xs">
                    {selectedSpace.label}
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-graphite dark:text-sand-100 text-sm">
                      Bay {selectedSpace.label}
                    </h3>
                    <p className="text-[10px] text-graphite-muted dark:text-sand-400">
                      {zones.find((z) => z.id === selectedSpace.zoneId)?.name || 'Zone'}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                    selectedSpace.status === 'available'
                      ? 'bg-moss/15 text-moss'
                      : selectedSpace.status === 'held'
                      ? 'bg-amber-500/15 text-amber-600'
                      : selectedSpace.status === 'occupied'
                      ? 'bg-teal/15 text-teal'
                      : 'bg-clay/15 text-clay'
                  }`}
                >
                  {selectedSpace.status}
                </span>
              </div>

              {/* Telemetry Details */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-2 rounded-xl bg-sand-100 dark:bg-graphite-dark">
                  <span className="text-graphite-muted dark:text-sand-400">Type</span>
                  <span className="font-semibold text-graphite dark:text-sand-100 uppercase text-[11px]">
                    {selectedSpace.kind}
                  </span>
                </div>

                <div className="flex justify-between p-2 rounded-xl bg-sand-100 dark:bg-graphite-dark">
                  <span className="text-graphite-muted dark:text-sand-400">Tariff</span>
                  <span className="font-bold text-teal">₹{selectedSpace.hourlyRate}/hr</span>
                </div>

                <div className="flex justify-between p-2 rounded-xl bg-sand-100 dark:bg-graphite-dark">
                  <span className="text-graphite-muted dark:text-sand-400">Sensor ID</span>
                  <span className="font-mono text-[11px] text-graphite dark:text-sand-100">
                    {selectedSpace.sensorId || 'SN-AUT-01'}
                  </span>
                </div>

                <div className="flex justify-between p-2 rounded-xl bg-sand-100 dark:bg-graphite-dark">
                  <span className="text-graphite-muted dark:text-sand-400">Coordinates</span>
                  <span className="font-mono text-[10px] text-graphite dark:text-sand-100">
                    {selectedSpace.lat.toFixed(5)}, {selectedSpace.lng.toFixed(5)}
                  </span>
                </div>

                <div className="flex justify-between p-2 rounded-xl bg-sand-100 dark:bg-graphite-dark">
                  <span className="text-graphite-muted dark:text-sand-400">Last Telemetry Ping</span>
                  <span className="text-moss font-medium">{selectedSpace.lastVerifiedAt}</span>
                </div>
              </div>

              {/* Force Override Action */}
              <div className="pt-2 border-t border-sand-300 dark:border-graphite-light space-y-2">
                <button
                  onClick={() => setIsOverrideModalOpen(true)}
                  className="w-full py-2.5 rounded-xl bg-teal text-sand-50 font-bold text-xs shadow-md hover:bg-teal-light transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Curbside Force Override</span>
                </button>

                {selectedSpace.status !== 'available' && (
                  <button
                    onClick={() => {
                      updateSpaceStatus(selectedSpace.id, 'available', 'Municipal manual release');
                      setSelectedSpace({ ...selectedSpace, status: 'available' });
                      onShowToast(`Bay ${selectedSpace.label} manually set to Available.`);
                    }}
                    className="w-full py-2 rounded-xl bg-sand-200 dark:bg-graphite-light text-graphite dark:text-sand-100 font-semibold text-xs hover:bg-sand-300 transition-colors"
                  >
                    Force Set Available
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="font-serif font-bold text-graphite dark:text-sand-100 text-sm">
                  Active Space Telemetry
                </h3>
                <p className="text-[11px] text-graphite-muted dark:text-sand-400">
                  Select any bay from the list below or click on the map to inspect live sensor status.
                </p>
              </div>

              <div className="space-y-1.5 max-h-[360px] overflow-y-auto custom-scrollbar">
                {filteredSpaces.slice(0, 15).map((sp) => (
                  <button
                    key={sp.id}
                    onClick={() => setSelectedSpace(sp)}
                    className="w-full p-2.5 rounded-xl bg-sand-100 dark:bg-graphite-dark hover:bg-sand-200 dark:hover:bg-graphite-light text-left transition-colors flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-graphite dark:text-sand-100">{sp.label}</span>
                      <span className="text-[10px] text-graphite-muted dark:text-sand-400">
                        {sp.kind}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        sp.status === 'available'
                          ? 'text-moss bg-moss/10'
                          : sp.status === 'held'
                          ? 'text-amber-600 bg-amber-500/10'
                          : sp.status === 'occupied'
                          ? 'text-teal bg-teal/10'
                          : 'text-clay bg-clay/10'
                      }`}
                    >
                      {sp.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Incident Summary in Bottom of Sidebar */}
          <div className="p-3 rounded-xl bg-clay/10 border border-clay/20 text-xs space-y-1 mt-4">
            <div className="flex items-center justify-between text-clay font-bold">
              <span className="flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Active Incidents
              </span>
              <span>{alerts.filter((a) => a.status === 'open').length}</span>
            </div>
            <p className="text-[10px] text-graphite-muted dark:text-sand-400">
              Corridor telemetry updates every 15 seconds.
            </p>
          </div>
        </div>
      </div>

      {/* Force Override Modal */}
      {isOverrideModalOpen && selectedSpace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-graphite-dark/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-sand-50 dark:bg-graphite rounded-3xl border border-sand-300 dark:border-graphite-light p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-teal" />
                <h3 className="font-serif font-bold text-graphite dark:text-sand-100 text-base">
                  Override Bay {selectedSpace.label}
                </h3>
              </div>
              <button
                onClick={() => setIsOverrideModalOpen(false)}
                className="text-graphite-muted hover:text-graphite dark:text-sand-400 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleApplyOverride} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-graphite dark:text-sand-200 mb-1.5">
                  Set New Curbside Status
                </label>
                <select
                  value={overrideStatus}
                  onChange={(e) => setOverrideStatus(e.target.value as SpaceStatus)}
                  className="w-full p-2.5 rounded-xl border border-sand-300 dark:border-graphite-light bg-sand-100 dark:bg-graphite-dark text-graphite dark:text-sand-100 font-semibold focus:outline-none focus:border-teal"
                >
                  <option value="available">Available (Clear Hold / Occupancy)</option>
                  <option value="out_of_service">Out of Service (Maintenance / Obstruction)</option>
                  <option value="conflict">Conflict / Dispute (Unauthorized Hold)</option>
                  <option value="occupied">Occupied (Manual Docking Verification)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-graphite dark:text-sand-200 mb-1.5">
                  Authority Audit Reason
                </label>
                <input
                  type="text"
                  placeholder="e.g. Utility maintenance excavation by TNEB / Smart City crew"
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl border border-sand-300 dark:border-graphite-light bg-sand-100 dark:bg-graphite-dark text-graphite dark:text-sand-100 focus:outline-none focus:border-teal"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOverrideModalOpen(false)}
                  className="px-4 py-2 rounded-xl font-semibold text-graphite-muted hover:bg-sand-200 dark:hover:bg-graphite-light transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal text-sand-50 font-bold shadow-md hover:bg-teal-light transition-all"
                >
                  Commit Override
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
