import React, { useState } from 'react';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Car,
  Bike,
  Zap,
  MapPin,
  Clock,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Camera,
  Ticket,
  AlertCircle,
  Bell,
  SlidersHorizontal,
  LogOut,
  Info,
} from 'lucide-react';
import { useCurb } from '../context/CurbContext';
import { ParkingZone, ParkingSpace, VehicleType } from '../types';
import { Header } from '../components/common/Header';
import { HamburgerMenu } from '../components/common/HamburgerMenu';
import { ParkingMap } from '../components/map/ParkingMap';
import { ZoneDetailSheet } from '../components/citizen/ZoneDetailSheet';
import { CommunityReportModal } from '../components/citizen/CommunityReportModal';
import { MyPassView } from '../components/citizen/MyPassView';
import { HistoryView } from '../components/citizen/HistoryView';
import { NotificationsView } from '../components/citizen/NotificationsView';
import { AccessibilityPermitModal } from '../components/citizen/AccessibilityPermitModal';
import { TrustRibbon } from '../components/common/TrustRibbon';
import { Dock, DockItem, DockSeparator, DockIcon } from '../components/motion/dock';
import { HoverFeatureCards } from '../components/motion/HoverFeatureCards';
import { AnimateDigits } from '../components/motion/AnimateDigits';
import { useLocation } from 'wouter';
import { cn } from '../lib/utils';

export const CitizenDashboard: React.FC = () => {
  const {
    zones,
    selectedZoneId,
    setSelectedZoneId,
    selectedVehicleFilter,
    setSelectedVehicleFilter,
    getZoneStats,
    activeReservation,
    searchQuery,
    setSearchQuery,
    unreadNotificationsCount,
    logoutUser,
    currentUser,
  } = useCurb();
  const [, setLocation] = useLocation();

  const [activeTab, setActiveTab] = useState<'find' | 'pass' | 'history' | 'notifications' | 'permits'>('find');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDetailZone, setActiveDetailZone] = useState<ParkingZone | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportZone, setReportZone] = useState<ParkingZone | null>(null);
  const [reportSpace, setReportSpace] = useState<ParkingSpace | null>(null);
  const [isPermitModalOpen, setIsPermitModalOpen] = useState(false);
  const [isFirstUseWalkthroughOpen, setIsFirstUseWalkthroughOpen] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(`curbsense_first_use_seen_${currentUser.id}`) !== 'true';
  });

  useEffect(() => {
    setIsFirstUseWalkthroughOpen(localStorage.getItem(`curbsense_first_use_seen_${currentUser.id}`) !== 'true');
  }, [currentUser.id]);

  const dismissFirstUseWalkthrough = () => {
    localStorage.setItem(`curbsense_first_use_seen_${currentUser.id}`, 'true');
    setIsFirstUseWalkthroughOpen(false);
  };

  // Filter zones by search query and vehicle filter
  const filteredZones = zones.filter((zone) => {
    const matchesSearch =
      zone.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      zone.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
      zone.featuredStreet.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedVehicleFilter === 'all') return true;
    const stats = getZoneStats(zone.id);
    if (selectedVehicleFilter === 'two_wheeler') return stats.twoWheelerAvailable > 0;
    if (selectedVehicleFilter === 'ev') return stats.evAvailable > 0;
    if (selectedVehicleFilter === 'hatchback') return stats.standardAvailable > 0 || stats.accessibleAvailable > 0;
    return true;
  });

  const handleOpenZoneDetails = (zone: ParkingZone) => {
    setSelectedZoneId(zone.id);
    setActiveDetailZone(zone);
  };

  const handleCloseZoneDetails = () => {
    setActiveDetailZone(null);
    setSelectedZoneId(null);
  };

  const handleOpenReport = (zone: ParkingZone, space?: ParkingSpace) => {
    setReportZone(zone);
    setReportSpace(space || null);
    setIsReportModalOpen(true);
  };

  return (
    <div id="curbsense-citizen-app" className="min-h-screen bg-sand-150 dark:bg-graphite-dark text-graphite dark:text-sand-100 flex flex-col transition-colors pb-24">
      {/* Top Header */}
      <Header
        onOpenMenu={() => setIsMenuOpen(true)}
        onOpenNotifications={() => setActiveTab('notifications')}
      />

      {/* Slide-in Hamburger Menu */}
      <HamburgerMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        activeView={activeTab}
        onSelectView={(view) => {
          if (view === 'permits') {
            setIsPermitModalOpen(true);
          } else {
            setActiveTab(view as any);
          }
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Navigation Tabs Pill Bar */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 no-scrollbar">
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-sand-50 dark:bg-graphite border border-sand-300 dark:border-graphite-light shadow-xs">
            <button
              id="tab-btn-find"
              onClick={() => setActiveTab('find')}
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer',
                activeTab === 'find'
                  ? 'bg-teal text-sand-50 shadow-xs'
                  : 'text-graphite-muted dark:text-sand-400 hover:text-graphite'
              )}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Find & Book</span>
            </button>

            <button
              id="tab-btn-pass"
              onClick={() => setActiveTab('pass')}
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer',
                activeTab === 'pass'
                  ? 'bg-teal text-sand-50 shadow-xs'
                  : 'text-graphite-muted dark:text-sand-400 hover:text-graphite'
              )}
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>My Pass</span>
              {activeReservation && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              )}
            </button>

            <button
              id="tab-btn-history"
              onClick={() => setActiveTab('history')}
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer',
                activeTab === 'history'
                  ? 'bg-teal text-sand-50 shadow-xs'
                  : 'text-graphite-muted dark:text-sand-400 hover:text-graphite'
              )}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>History</span>
            </button>

            <button
              id="tab-btn-notifications"
              onClick={() => setActiveTab('notifications')}
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer',
                activeTab === 'notifications'
                  ? 'bg-teal text-sand-50 shadow-xs'
                  : 'text-graphite-muted dark:text-sand-400 hover:text-graphite'
              )}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Notifications</span>
              {unreadNotificationsCount > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-clay" />
              )}
            </button>
          </div>

          {/* Quick Vehicle Booking Pill */}
          <button
            id="btn-fast-vehicle-selector"
            onClick={() => setLocation('/vehicle-selector')}
            className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-sand-50 dark:bg-graphite hover:bg-teal hover:text-sand-50 text-teal border border-sand-300 dark:border-graphite-light text-xs font-bold shadow-xs transition-all shrink-0 cursor-pointer"
          >
            <Car className="w-4 h-4" />
            <span>Vehicle Showroom Flow</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Tab 1: Find View (Core Screen) */}
        {activeTab === 'find' && (
          <div className="space-y-6">
            {/* Why CurbSense Animated Feature Cards */}
            <HoverFeatureCards onCardClick={() => setLocation('/vehicle-selector')} />

            {/* Search and Vehicle Filter Row */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-graphite-muted dark:text-sand-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="search-input-zones"
                  type="text"
                  placeholder="Search curbs by street, landmark, or zone (e.g. Town Hall, R.S. Puram, DB Road)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-sand-300 dark:border-graphite-light bg-sand-50 dark:bg-graphite text-xs font-medium text-graphite dark:text-sand-100 placeholder:text-graphite-muted shadow-xs focus:outline-none focus:border-teal"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-graphite-muted hover:text-graphite cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Vehicle Filter Pills */}
              <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-sand-50 dark:bg-graphite border border-sand-300 dark:border-graphite-light shrink-0">
                <button
                  id="filter-vehicle-all"
                  onClick={() => setSelectedVehicleFilter('all')}
                  className={cn(
                    'px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer',
                    selectedVehicleFilter === 'all'
                      ? 'bg-teal text-white shadow-xs'
                      : 'text-graphite-muted hover:text-graphite'
                  )}
                >
                  All Vehicles
                </button>
                <button
                  id="filter-vehicle-car"
                  onClick={() => setSelectedVehicleFilter('hatchback')}
                  className={cn(
                    'px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer',
                    selectedVehicleFilter === 'hatchback'
                      ? 'bg-teal text-white shadow-xs'
                      : 'text-graphite-muted hover:text-graphite'
                  )}
                >
                  <Car className="w-3.5 h-3.5" />
                  <span>Car</span>
                </button>
                <button
                  id="filter-vehicle-tw"
                  onClick={() => setSelectedVehicleFilter('two_wheeler')}
                  className={cn(
                    'px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer',
                    selectedVehicleFilter === 'two_wheeler'
                      ? 'bg-teal text-white shadow-xs'
                      : 'text-graphite-muted hover:text-graphite'
                  )}
                >
                  <Bike className="w-3.5 h-3.5" />
                  <span>2-Wheeler</span>
                </button>
                <button
                  id="filter-vehicle-ev"
                  onClick={() => setSelectedVehicleFilter('ev')}
                  className={cn(
                    'px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer',
                    selectedVehicleFilter === 'ev'
                      ? 'bg-teal text-white shadow-xs'
                      : 'text-graphite-muted hover:text-graphite'
                  )}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>EV Charge</span>
                </button>
              </div>
            </div>

            {/* Live Interactive Map with 112+ Space Pins, Clustering, Directions */}
            <ParkingMap height="520px" onOpenReservations={() => setActiveTab('pass')} />

            {/* Zone Space Cards Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-graphite dark:text-sand-100">
                    Curbside Zones in Coimbatore
                  </h2>
                  <p className="text-xs text-graphite-muted dark:text-sand-400">
                    Real-time slot occupancy backed by ground sensors and high-trust telemetry.
                  </p>
                </div>
                <button
                  id="btn-report-curb-general"
                  onClick={() => handleOpenReport(zones[0])}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sand-50 dark:bg-graphite hover:bg-teal hover:text-sand-50 text-teal border border-sand-300 dark:border-graphite-light text-xs font-bold transition-colors cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Report Signal</span>
                </button>
              </div>

              {/* Grid of Zone Cards */}
              {filteredZones.length === 0 ? (
                <div className="p-8 sm:p-12 rounded-3xl border border-sand-300 dark:border-graphite-light bg-sand-50 dark:bg-graphite text-center max-w-lg mx-auto">
                  <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                  <h3 className="font-serif text-lg font-bold text-graphite dark:text-sand-100">
                    No Zones Found
                  </h3>
                  <p className="text-xs text-graphite-muted mt-1">
                    No parking zones match &quot;{searchQuery}&quot; for the chosen vehicle filter.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedVehicleFilter('all');
                    }}
                    className="mt-4 px-4 py-2 rounded-xl bg-teal text-white text-xs font-bold shadow-xs hover:bg-teal-hover transition-colors cursor-pointer"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {filteredZones.map((zone) => {
                    const stats = getZoneStats(zone.id);
                    let availableCount = stats.available;
                    if (selectedVehicleFilter === 'two_wheeler') availableCount = stats.twoWheelerAvailable;
                    else if (selectedVehicleFilter === 'ev') availableCount = stats.evAvailable;

                    const isPlentiful = availableCount >= 6;
                    const isModerate = availableCount >= 3 && availableCount < 6;

                    return (
                      <button
                        type="button"
                        key={zone.id}
                        id={`zone-card-${zone.id}`}
                        onClick={() => handleOpenZoneDetails(zone)}
                        className="group flex min-h-[138px] flex-col justify-between rounded-2xl border border-sand-300 bg-sand-50 p-3.5 text-left shadow-xs transition-all hover:border-teal hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 dark:border-graphite-light dark:bg-graphite dark:focus-visible:ring-offset-graphite cursor-pointer"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h3 className="truncate font-serif text-base font-bold text-graphite transition-colors group-hover:text-teal dark:text-sand-100">
                                {zone.name}
                              </h3>
                              <p className="mt-0.5 truncate text-[11px] text-graphite-muted dark:text-sand-400">{zone.area} · {zone.featuredStreet}</p>
                            </div>
                            <span className="shrink-0 rounded-lg bg-teal-pale px-2 py-1 text-[11px] font-extrabold text-teal">
                              ₹<AnimateDigits value={zone.hourlyRate} />/hr
                            </span>
                          </div>

                          <div className="mt-3 flex items-center gap-2">
                            <span
                              className={cn(
                                'w-2.5 h-2.5 rounded-full',
                                isPlentiful ? 'bg-teal' : isModerate ? 'bg-amber-500' : 'bg-clay'
                              )}
                            />
                            <span className="text-xs font-bold text-graphite dark:text-sand-100">
                              <AnimateDigits value={availableCount} /> spaces free
                            </span>
                            <span className="text-[11px] text-graphite-muted dark:text-sand-400">of {stats.total}</span>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between border-t border-sand-200 pt-2 text-[11px] font-bold text-teal dark:border-graphite-light">
                          <span>View bays</span>
                          <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: My Pass View */}
        {activeTab === 'pass' && (
          <MyPassView onFindParking={() => setActiveTab('find')} />
        )}

        {/* Tab 3: History View */}
        {activeTab === 'history' && <HistoryView />}

        {/* Tab 4: Notifications View */}
        {activeTab === 'notifications' && <NotificationsView />}
      </main>

      {/* Zone Detail Sheet Drawer */}
      <ZoneDetailSheet
        zone={activeDetailZone}
        onClose={handleCloseZoneDetails}
        onOpenReportModal={handleOpenReport}
        onOpenPassView={() => {
          handleCloseZoneDetails();
          setActiveTab('pass');
        }}
      />

      {/* Community Report Modal */}
      <CommunityReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        zone={reportZone}
        space={reportSpace}
      />

      {/* Accessibility Permit Modal */}
      <AccessibilityPermitModal
        isOpen={isPermitModalOpen}
        onClose={() => setIsPermitModalOpen(false)}
      />

      <AnimatePresence>
        {isFirstUseWalkthroughOpen && (
          <motion.div
            id="first-use-walkthrough"
            className="fixed inset-0 z-[70] flex items-end justify-center bg-graphite/60 p-4 backdrop-blur-sm sm:items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="first-use-walkthrough-title"
          >
            <motion.section
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
              className="w-full max-w-md rounded-3xl border border-teal/20 bg-sand-50 p-5 shadow-2xl dark:bg-graphite"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-teal text-white shadow-md"><Sparkles className="h-5 w-5" /></span>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-teal">First-use guide</p>
                  <h2 id="first-use-walkthrough-title" className="mt-1 font-serif text-xl font-bold text-graphite dark:text-sand-100">Find a bay in three steps</h2>
                </div>
              </div>
              <ol className="mt-5 space-y-3">
                {[
                  ['1', 'Choose a zone', 'Tap a zone ring to reveal every available bay in that area.'],
                  ['2', 'Select a pin', 'Tap an individual bay pin to open its reservation details.'],
                  ['3', 'Start your hold', 'Pick an arrival window, then start a no-charge 15-second demonstration hold.'],
                ].map(([step, title, detail]) => (
                  <li key={step} className="flex gap-3 rounded-2xl border border-sand-200 bg-sand-50 p-3 dark:border-graphite-light dark:bg-graphite-light">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal text-[11px] font-extrabold text-white">{step}</span>
                    <span><strong className="block text-xs text-graphite dark:text-sand-100">{title}</strong><span className="mt-0.5 block text-[11px] leading-relaxed text-graphite-muted dark:text-sand-400">{detail}</span></span>
                  </li>
                ))}
              </ol>
              <button
                id="btn-dismiss-first-use-guide"
                type="button"
                onClick={dismissFirstUseWalkthrough}
                className="mt-5 w-full rounded-2xl bg-teal px-4 py-3 text-xs font-extrabold text-white shadow-md transition-transform hover:bg-teal-hover active:scale-[0.98]"
              >
                Got it — show me the map
              </button>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Magnetic Citizen Dock Navigation (Fixed Bottom-Center) */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40">
        <Dock>
          <DockItem
            id="dock-btn-find"
            tooltip="Find & Book"
            isActive={activeTab === 'find'}
            onClick={() => setActiveTab('find')}
          >
            <DockIcon>
              <MapPin className="w-4 h-4" />
            </DockIcon>
          </DockItem>

          <DockItem
            id="dock-btn-vehicle-selector"
            tooltip="Vehicle Showroom"
            onClick={() => setLocation('/vehicle-selector')}
          >
            <DockIcon>
              <Car className="w-4 h-4" />
            </DockIcon>
          </DockItem>

          <DockItem
            id="dock-btn-my-pass"
            tooltip="Active Pass"
            isActive={activeTab === 'pass'}
            badge={!!activeReservation}
            onClick={() => setActiveTab('pass')}
          >
            <DockIcon>
              <Ticket className="w-4 h-4" />
            </DockIcon>
          </DockItem>

          <DockItem
            id="dock-btn-history"
            tooltip="History"
            isActive={activeTab === 'history'}
            onClick={() => setActiveTab('history')}
          >
            <DockIcon>
              <Clock className="w-4 h-4" />
            </DockIcon>
          </DockItem>

          <DockItem
            id="dock-btn-notifications"
            tooltip="Notifications"
            isActive={activeTab === 'notifications'}
            badge={unreadNotificationsCount > 0}
            onClick={() => setActiveTab('notifications')}
          >
            <DockIcon>
              <Bell className="w-4 h-4" />
            </DockIcon>
          </DockItem>

          <DockSeparator />

          <DockItem
            id="dock-btn-permits"
            tooltip="Accessibility Permit"
            onClick={() => setIsPermitModalOpen(true)}
          >
            <DockIcon>
              <ShieldCheck className="w-4 h-4" />
            </DockIcon>
          </DockItem>
        </Dock>
      </div>
    </div>
  );
};

export default CitizenDashboard;
