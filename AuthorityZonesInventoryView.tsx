import React, { useState, useMemo } from 'react';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Car,
  Bike,
  Zap,
  Accessibility,
  Search,
  Filter,
  CheckCircle2,
  Wrench,
  XCircle,
  AlertTriangle,
  Clock,
  Shield,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { ParkingZone, ParkingSpace, SpaceKind, SpaceStatus, VehicleType } from '../../types';

interface AuthorityZonesInventoryViewProps {
  zones: ParkingZone[];
  spaces: ParkingSpace[];
  getZoneStats: (zoneId: string) => any;
  updateZone: (zoneId: string, updates: Partial<ParkingZone>) => void;
  addZone: (zoneData: Omit<ParkingZone, 'id'>, initialSpacesCount?: number) => void;
  bulkUpdateZoneAvailability: (zoneId: string, status: 'available' | 'out_of_service', reason: string, autoRestoreAt?: string) => void;
  addSpaceToZone: (zoneId: string, spaceData: { label: string; kind: SpaceKind; hourlyRate: number }) => void;
  removeSpace: (spaceId: string) => void;
  updateSpaceStatus: (spaceId: string, newStatus: SpaceStatus, reason?: string) => void;
  onShowToast: (msg: string) => void;
}

export const AuthorityZonesInventoryView: React.FC<AuthorityZonesInventoryViewProps> = ({
  zones,
  spaces,
  getZoneStats,
  updateZone,
  addZone,
  bulkUpdateZoneAvailability,
  addSpaceToZone,
  removeSpace,
  updateSpaceStatus,
  onShowToast,
}) => {
  const [selectedZoneId, setSelectedZoneId] = useState<string>(zones[0]?.id || 'zone-gandhipuram');
  const [spaceSearchQuery, setSpaceSearchQuery] = useState('');
  const [spaceStatusFilter, setSpaceStatusFilter] = useState<'all' | SpaceStatus>('all');
  const [spaceKindFilter, setSpaceKindFilter] = useState<'all' | SpaceKind>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Modals
  const [isAddZoneModalOpen, setIsAddZoneModalOpen] = useState(false);
  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneArea, setNewZoneArea] = useState('');
  const [newZoneRate, setNewZoneRate] = useState(30);
  const [newZoneBays, setNewZoneBays] = useState(12);

  const [isEditZoneModalOpen, setIsEditZoneModalOpen] = useState(false);
  const [editZoneData, setEditZoneData] = useState<ParkingZone | null>(null);

  const [isAddBayModalOpen, setIsAddBayModalOpen] = useState(false);
  const [newBayLabel, setNewBayLabel] = useState('');
  const [newBayKind, setNewBayKind] = useState<SpaceKind>('standard');

  const [isBulkCloseModalOpen, setIsBulkCloseModalOpen] = useState(false);
  const [bulkReason, setBulkReason] = useState('');

  const activeZone = zones.find((z) => z.id === selectedZoneId) || zones[0];
  const activeZoneStats = getZoneStats(activeZone.id);

  // Filter bays
  const filteredSpaces = useMemo(() => {
    return spaces.filter((s) => {
      if (s.zoneId !== selectedZoneId) return false;
      if (spaceStatusFilter !== 'all' && s.status !== spaceStatusFilter) return false;
      if (spaceKindFilter !== 'all' && s.kind !== spaceKindFilter) return false;
      if (spaceSearchQuery.trim()) {
        const q = spaceSearchQuery.toLowerCase();
        return (
          s.label.toLowerCase().includes(q) ||
          (s.sensorId && s.sensorId.toLowerCase().includes(q)) ||
          s.address.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [spaces, selectedZoneId, spaceStatusFilter, spaceKindFilter, spaceSearchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredSpaces.length / pageSize));
  const paginatedSpaces = filteredSpaces.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleCreateZone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newZoneName.trim() || !newZoneArea.trim()) return;

    addZone(
      {
        name: newZoneName,
        area: newZoneArea,
        hourlyRate: newZoneRate,
        lat: 11.01 + (Math.random() - 0.5) * 0.03,
        lng: 76.96 + (Math.random() - 0.5) * 0.03,
        featuredStreet: `${newZoneName} Main Road`,
        operatingHours: '08:00 AM - 10:00 PM',
        compatibleVehicleKinds: ['two_wheeler', 'hatchback', 'sedan_suv', 'ev'],
        rules: ['15-second demonstration hold', 'FASTag auto-debit supported'],
      },
      newZoneBays
    );

    onShowToast(`Provisioned new parking zone "${newZoneName}" with ${newZoneBays} bays.`);
    setIsAddZoneModalOpen(false);
    setNewZoneName('');
    setNewZoneArea('');
  };

  const handleSaveEditZone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editZoneData) return;
    updateZone(editZoneData.id, {
      name: editZoneData.name,
      area: editZoneData.area,
      hourlyRate: editZoneData.hourlyRate,
      operatingHours: editZoneData.operatingHours,
    });
    onShowToast(`Updated zone parameters for ${editZoneData.name}.`);
    setIsEditZoneModalOpen(false);
  };

  const handleCreateBay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBayLabel.trim()) return;
    addSpaceToZone(activeZone.id, {
      label: newBayLabel.toUpperCase(),
      kind: newBayKind,
      hourlyRate: activeZone.hourlyRate,
    });
    onShowToast(`Added bay ${newBayLabel.toUpperCase()} to ${activeZone.name}.`);
    setIsAddBayModalOpen(false);
    setNewBayLabel('');
  };

  const handleBulkClosure = (e: React.FormEvent) => {
    e.preventDefault();
    bulkUpdateZoneAvailability(activeZone.id, 'out_of_service', bulkReason || 'Event / Festival Curbside Closure');
    onShowToast(`Temporarily closed all bays in ${activeZone.name}.`);
    setIsBulkCloseModalOpen(false);
    setBulkReason('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-graphite dark:text-sand-100 flex items-center gap-2">
            Zone Directory & Bay Inventory
          </h1>
          <p className="text-xs text-graphite-muted dark:text-sand-400">
            Provision corridors, configure tariffs, inspect individual bay sensors, and execute emergency closures.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddZoneModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-teal text-sand-50 font-bold text-xs shadow-md hover:bg-teal-light transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Zone</span>
          </button>
        </div>
      </div>

      {/* Zone Overview Cards Carousel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {zones.map((zone) => {
          const stats = getZoneStats(zone.id);
          const isSelected = zone.id === selectedZoneId;

          return (
            <div
              key={zone.id}
              onClick={() => {
                setSelectedZoneId(zone.id);
                setCurrentPage(1);
              }}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-teal/10 dark:bg-teal/15 border-teal shadow-sm ring-1 ring-teal'
                  : 'bg-sand-50 dark:bg-graphite border-sand-300 dark:border-graphite-light hover:bg-sand-100'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-graphite dark:text-sand-100 truncate">
                    {zone.name}
                  </span>
                  <span className="text-[10px] text-teal font-bold">
                    ₹{zone.hourlyRate}/h
                  </span>
                </div>
                <div className="text-[11px] text-graphite-muted dark:text-sand-400 truncate">
                  {zone.area}
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-sand-200 dark:border-graphite-light flex items-center justify-between text-[11px]">
                <span className="text-graphite-muted dark:text-sand-400 font-medium">
                  {stats.total} bays
                </span>
                <span
                  className={`font-bold ${
                    stats.occupancyRate > 75 ? 'text-clay' : 'text-teal'
                  }`}
                >
                  {stats.occupancyRate}% occ
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Zone Detail Card & Action Bar */}
      <div className="p-5 rounded-2xl bg-sand-50 dark:bg-graphite border border-sand-300 dark:border-graphite-light shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-sand-300 dark:border-graphite-light">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif font-bold text-graphite dark:text-sand-100 text-lg">
                {activeZone.name}
              </h2>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-teal/15 text-teal border border-teal/30">
                {activeZone.area}
              </span>
            </div>
            <p className="text-xs text-graphite-muted dark:text-sand-400 mt-0.5">
              Operating hours: {activeZone.operatingHours || '08:00 AM - 10:00 PM'} • Standard base rate: ₹{activeZone.hourlyRate}/hr
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                setEditZoneData(activeZone);
                setIsEditZoneModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-sand-200 dark:bg-graphite-light hover:bg-sand-300 text-xs font-semibold text-graphite dark:text-sand-100 flex items-center gap-1.5 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5 text-teal" />
              <span>Edit Zone</span>
            </button>

            <button
              onClick={() => setIsAddBayModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-sand-200 dark:bg-graphite-light hover:bg-sand-300 text-xs font-semibold text-graphite dark:text-sand-100 flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-teal" />
              <span>Add Bay</span>
            </button>

            <button
              onClick={() => setIsBulkCloseModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-clay/15 text-clay hover:bg-clay/20 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-clay/30"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Event / Temp Closure</span>
            </button>

            <button
              onClick={() => {
                bulkUpdateZoneAvailability(activeZone.id, 'available', 'Municipal manual reopening');
                onShowToast(`Reopened all bays in ${activeZone.name}.`);
              }}
              className="px-3 py-1.5 rounded-xl bg-moss/15 text-moss hover:bg-moss/20 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-moss/30"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Reopen All Bays</span>
            </button>
          </div>
        </div>

        {/* Space Distribution Pill Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-sand-100 dark:bg-graphite-dark flex items-center gap-2">
            <Car className="w-4 h-4 text-teal" />
            <div>
              <div className="text-[10px] text-graphite-muted dark:text-sand-400 font-semibold">
                Standard Bays
              </div>
              <div className="font-bold text-graphite dark:text-sand-100">
                {activeZoneStats.standardAvailable} free / {spaces.filter((s) => s.zoneId === activeZone.id && s.kind === 'standard').length} total
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-sand-100 dark:bg-graphite-dark flex items-center gap-2">
            <Bike className="w-4 h-4 text-teal" />
            <div>
              <div className="text-[10px] text-graphite-muted dark:text-sand-400 font-semibold">
                Two-Wheeler Bays
              </div>
              <div className="font-bold text-graphite dark:text-sand-100">
                {activeZoneStats.twoWheelerAvailable} free / {spaces.filter((s) => s.zoneId === activeZone.id && s.kind === 'two_wheeler').length} total
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-sand-100 dark:bg-graphite-dark flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <div>
              <div className="text-[10px] text-graphite-muted dark:text-sand-400 font-semibold">
                EV Fast Chargers
              </div>
              <div className="font-bold text-graphite dark:text-sand-100">
                {activeZoneStats.evAvailable} free / {spaces.filter((s) => s.zoneId === activeZone.id && s.kind === 'ev').length} total
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-sand-100 dark:bg-graphite-dark flex items-center gap-2">
            <Accessibility className="w-4 h-4 text-teal" />
            <div>
              <div className="text-[10px] text-graphite-muted dark:text-sand-400 font-semibold">
                Accessible (PWD)
              </div>
              <div className="font-bold text-graphite dark:text-sand-100">
                {activeZoneStats.accessibleAvailable} free / {spaces.filter((s) => s.zoneId === activeZone.id && s.kind === 'accessible').length} total
              </div>
            </div>
          </div>
        </div>

        {/* Bay-Level Table with Filters & Search */}
        <div className="space-y-3 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <select
                value={spaceStatusFilter}
                onChange={(e) => {
                  setSpaceStatusFilter(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1.5 rounded-xl border border-sand-300 dark:border-graphite-light bg-sand-100 dark:bg-graphite-dark text-xs text-graphite dark:text-sand-100 font-medium focus:outline-none focus:border-teal"
              >
                <option value="all">All Statuses</option>
                <option value="available">Available</option>
                <option value="held">Held</option>
                <option value="occupied">Occupied</option>
                <option value="conflict">Conflict</option>
                <option value="out_of_service">Out of Service</option>
              </select>

              <select
                value={spaceKindFilter}
                onChange={(e) => {
                  setSpaceKindFilter(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1.5 rounded-xl border border-sand-300 dark:border-graphite-light bg-sand-100 dark:bg-graphite-dark text-xs text-graphite dark:text-sand-100 font-medium focus:outline-none focus:border-teal"
              >
                <option value="all">All Vehicle Kinds</option>
                <option value="standard">Standard Car</option>
                <option value="two_wheeler">Two-Wheeler</option>
                <option value="ev">EV Charger</option>
                <option value="accessible">Accessible PWD</option>
              </select>
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Search bays by label or sensor..."
                value={spaceSearchQuery}
                onChange={(e) => {
                  setSpaceSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full sm:w-56 pl-8 pr-3 py-1.5 rounded-xl border border-sand-300 dark:border-graphite-light bg-sand-100 dark:bg-graphite-dark text-xs text-graphite dark:text-sand-100 focus:outline-none focus:border-teal"
              />
              <Search className="w-3.5 h-3.5 text-graphite-muted dark:text-sand-400 absolute left-2.5 top-2" />
            </div>
          </div>

          <div className="border border-sand-300 dark:border-graphite-light rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-sand-150 dark:bg-graphite-dark text-[11px] font-bold text-graphite-muted dark:text-sand-400 uppercase tracking-wider border-b border-sand-300 dark:border-graphite-light">
                  <th className="p-3">Bay Label</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Sensor ID</th>
                  <th className="p-3">Rate</th>
                  <th className="p-3 text-right">Bay Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-200 dark:divide-graphite-light">
                {paginatedSpaces.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-graphite-muted dark:text-sand-400">
                      No parking bays found in this zone matching filters.
                    </td>
                  </tr>
                ) : (
                  paginatedSpaces.map((space) => (
                    <tr key={space.id} className="hover:bg-sand-100 dark:hover:bg-graphite-dark transition-colors">
                      <td className="p-3 font-bold font-mono text-graphite dark:text-sand-100">
                        {space.label}
                      </td>

                      <td className="p-3 capitalize text-graphite-muted dark:text-sand-300">
                        {space.kind.replace('_', ' ')}
                      </td>

                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            space.status === 'available'
                              ? 'bg-moss/15 text-moss'
                              : space.status === 'held'
                              ? 'bg-amber-500/15 text-amber-600'
                              : space.status === 'occupied'
                              ? 'bg-teal/15 text-teal'
                              : 'bg-clay/15 text-clay'
                          }`}
                        >
                          {space.status}
                        </span>
                      </td>

                      <td className="p-3 font-mono text-graphite-muted dark:text-sand-400">
                        {space.sensorId || 'SN-AUTO'}
                      </td>

                      <td className="p-3 font-bold text-teal">
                        ₹{space.hourlyRate}/h
                      </td>

                      <td className="p-3 text-right space-x-1 whitespace-nowrap">
                        {space.status === 'out_of_service' ? (
                          <button
                            onClick={() => {
                              updateSpaceStatus(space.id, 'available', 'Maintenance completed');
                              onShowToast(`Bay ${space.label} marked Available.`);
                            }}
                            className="px-2 py-1 rounded-lg bg-moss/15 text-moss font-semibold text-[11px] hover:bg-moss/25"
                          >
                            Set Available
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              updateSpaceStatus(space.id, 'out_of_service', 'Manual maintenance flagged');
                              onShowToast(`Bay ${space.label} marked Out of Service.`);
                            }}
                            className="px-2 py-1 rounded-lg bg-sand-200 dark:bg-graphite-light text-graphite dark:text-sand-200 font-semibold text-[11px] hover:bg-sand-300"
                          >
                            Set Out-of-Service
                          </button>
                        )}

                        <button
                          onClick={() => {
                            removeSpace(space.id);
                            onShowToast(`Decommissioned bay ${space.label}.`);
                          }}
                          className="p-1 rounded-lg text-graphite-muted hover:text-clay transition-colors"
                          title="Decommission bay"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-2 text-xs">
              <span className="text-graphite-muted dark:text-sand-400">
                Page {currentPage} of {totalPages} ({filteredSpaces.length} bays)
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1 rounded border border-sand-300 dark:border-graphite-light disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1 rounded border border-sand-300 dark:border-graphite-light disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add New Zone Modal */}
      {isAddZoneModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-graphite-dark/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-sand-50 dark:bg-graphite rounded-3xl border border-sand-300 dark:border-graphite-light p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-graphite dark:text-sand-100 text-base">
                Provision New Parking Zone
              </h3>
              <button onClick={() => setIsAddZoneModalOpen(false)} className="text-graphite-muted text-sm">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateZone} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-graphite dark:text-sand-200 mb-1">
                  Zone Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Town Hall Heritage Corridor"
                  value={newZoneName}
                  onChange={(e) => setNewZoneName(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl border border-sand-300 dark:border-graphite-light bg-sand-100 dark:bg-graphite-dark text-graphite dark:text-sand-100 focus:outline-none focus:border-teal"
                />
              </div>

              <div>
                <label className="block font-semibold text-graphite dark:text-sand-200 mb-1">
                  Sector / Area
                </label>
                <input
                  type="text"
                  placeholder="e.g. Heritage Core / Big Bazaar St"
                  value={newZoneArea}
                  onChange={(e) => setNewZoneArea(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl border border-sand-300 dark:border-graphite-light bg-sand-100 dark:bg-graphite-dark text-graphite dark:text-sand-100 focus:outline-none focus:border-teal"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-graphite dark:text-sand-200 mb-1">
                    Base Tariff (₹/hr)
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={150}
                    step={5}
                    value={newZoneRate}
                    onChange={(e) => setNewZoneRate(Number(e.target.value))}
                    required
                    className="w-full p-2.5 rounded-xl border border-sand-300 dark:border-graphite-light bg-sand-100 dark:bg-graphite-dark text-graphite dark:text-sand-100 focus:outline-none focus:border-teal"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-graphite dark:text-sand-200 mb-1">
                    Initial Bays Count
                  </label>
                  <input
                    type="number"
                    min={4}
                    max={50}
                    value={newZoneBays}
                    onChange={(e) => setNewZoneBays(Number(e.target.value))}
                    required
                    className="w-full p-2.5 rounded-xl border border-sand-300 dark:border-graphite-light bg-sand-100 dark:bg-graphite-dark text-graphite dark:text-sand-100 focus:outline-none focus:border-teal"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddZoneModalOpen(false)}
                  className="px-4 py-2 rounded-xl font-semibold text-graphite-muted hover:bg-sand-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal text-sand-50 font-bold shadow-md hover:bg-teal-light transition-all"
                >
                  Provision Zone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Zone Modal */}
      {isEditZoneModalOpen && editZoneData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-graphite-dark/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-sand-50 dark:bg-graphite rounded-3xl border border-sand-300 dark:border-graphite-light p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-graphite dark:text-sand-100 text-base">
                Edit {editZoneData.name} Parameters
              </h3>
              <button onClick={() => setIsEditZoneModalOpen(false)} className="text-graphite-muted text-sm">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditZone} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-graphite dark:text-sand-200 mb-1">
                  Zone Name
                </label>
                <input
                  type="text"
                  value={editZoneData.name}
                  onChange={(e) => setEditZoneData({ ...editZoneData, name: e.target.value })}
                  required
                  className="w-full p-2.5 rounded-xl border border-sand-300 dark:border-graphite-light bg-sand-100 dark:bg-graphite-dark text-graphite dark:text-sand-100 focus:outline-none focus:border-teal"
                />
              </div>

              <div>
                <label className="block font-semibold text-graphite dark:text-sand-200 mb-1">
                  Sector / Area
                </label>
                <input
                  type="text"
                  value={editZoneData.area}
                  onChange={(e) => setEditZoneData({ ...editZoneData, area: e.target.value })}
                  required
                  className="w-full p-2.5 rounded-xl border border-sand-300 dark:border-graphite-light bg-sand-100 dark:bg-graphite-dark text-graphite dark:text-sand-100 focus:outline-none focus:border-teal"
                />
              </div>

              <div>
                <label className="block font-semibold text-graphite dark:text-sand-200 mb-1">
                  Base Tariff (₹/hr)
                </label>
                <input
                  type="number"
                  min={10}
                  max={150}
                  step={5}
                  value={editZoneData.hourlyRate}
                  onChange={(e) => setEditZoneData({ ...editZoneData, hourlyRate: Number(e.target.value) })}
                  required
                  className="w-full p-2.5 rounded-xl border border-sand-300 dark:border-graphite-light bg-sand-100 dark:bg-graphite-dark text-graphite dark:text-sand-100 focus:outline-none focus:border-teal"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditZoneModalOpen(false)}
                  className="px-4 py-2 rounded-xl font-semibold text-graphite-muted hover:bg-sand-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal text-sand-50 font-bold shadow-md hover:bg-teal-light transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Bay Modal */}
      {isAddBayModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-graphite-dark/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-sand-50 dark:bg-graphite rounded-3xl border border-sand-300 dark:border-graphite-light p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-graphite dark:text-sand-100 text-base">
                Add Bay to {activeZone.name}
              </h3>
              <button onClick={() => setIsAddBayModalOpen(false)} className="text-graphite-muted text-sm">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBay} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-graphite dark:text-sand-200 mb-1">
                  Bay Label (e.g. GP-25)
                </label>
                <input
                  type="text"
                  placeholder="e.g. GP-25"
                  value={newBayLabel}
                  onChange={(e) => setNewBayLabel(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl border border-sand-300 dark:border-graphite-light bg-sand-100 dark:bg-graphite-dark text-graphite dark:text-sand-100 uppercase focus:outline-none focus:border-teal font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-graphite dark:text-sand-200 mb-1">
                  Vehicle Type / Reservation Category
                </label>
                <select
                  value={newBayKind}
                  onChange={(e) => setNewBayKind(e.target.value as SpaceKind)}
                  className="w-full p-2.5 rounded-xl border border-sand-300 dark:border-graphite-light bg-sand-100 dark:bg-graphite-dark text-graphite dark:text-sand-100 font-semibold focus:outline-none focus:border-teal"
                >
                  <option value="standard">Standard Car</option>
                  <option value="two_wheeler">Two-Wheeler / Bike</option>
                  <option value="ev">EV Fast Charger</option>
                  <option value="accessible">Accessible / PWD Bay</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddBayModalOpen(false)}
                  className="px-4 py-2 rounded-xl font-semibold text-graphite-muted hover:bg-sand-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal text-sand-50 font-bold shadow-md hover:bg-teal-light transition-all"
                >
                  Add Bay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Closure Modal */}
      {isBulkCloseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-graphite-dark/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-sand-50 dark:bg-graphite rounded-3xl border border-sand-300 dark:border-graphite-light p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-clay">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-serif font-bold text-graphite dark:text-sand-100 text-base">
                  Emergency / Event Closure
                </h3>
              </div>
              <button onClick={() => setIsBulkCloseModalOpen(false)} className="text-graphite-muted text-sm">
                ✕
              </button>
            </div>

            <p className="text-xs text-graphite-muted dark:text-sand-400">
              This action will mark all {activeZoneStats.total} bays in <strong>{activeZone.name}</strong> as Out of Service and prevent citizen holds.
            </p>

            <form onSubmit={handleBulkClosure} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-graphite dark:text-sand-200 mb-1">
                  Reason for Closure
                </label>
                <input
                  type="text"
                  placeholder="e.g. Festival Procession / Road Surfacing Works"
                  value={bulkReason}
                  onChange={(e) => setBulkReason(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl border border-sand-300 dark:border-graphite-light bg-sand-100 dark:bg-graphite-dark text-graphite dark:text-sand-100 focus:outline-none focus:border-teal"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsBulkCloseModalOpen(false)}
                  className="px-4 py-2 rounded-xl font-semibold text-graphite-muted hover:bg-sand-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-clay text-sand-50 font-bold shadow-md hover:bg-clay/90 transition-all"
                >
                  Execute Temporary Closure
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
