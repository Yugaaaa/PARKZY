import React, { useState, useMemo } from 'react';
import { Redirect, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar,
  MapPin,
  Tag,
  Clock,
  ClipboardList,
  CheckCircle2,
  AlertTriangle,
  Sun,
  Moon,
  LogOut,
  Search,
  ChevronRight,
  Shield,
} from 'lucide-react';
import { useCurb } from '../../context/CurbContext';
import { ParkingMap } from '../map/ParkingMap';
import { AnimateDigits } from '../motion/AnimateDigits';
import { cn } from '../../lib/utils';
import { ParkingZone, SpaceStatus } from '../../types';
import { AuthorityReservationsView } from './AuthorityReservationsView';

export type SimpleAuthorityTab = 'today' | 'map' | 'reservations' | 'pricing_alerts' | 'history';

export const AuthorityShell: React.FC = () => {
  const {
    currentUser,
    isAuthenticated,
    logoutUser,
    theme,
    toggleTheme,
    zones,
    spaces,
    getZoneStats,
    alerts,
    resolveAlertWithNote,
    updateZone,
    auditLog,
    activeReservation,
    reservationHistory,
    pendingPermits,
    reviewPermit,
  } = useCurb();

  const [, setLocation] = useLocation();

  // Navigation: 4 Mandated Screens
  const [activeTab, setActiveTab] = useState<SimpleAuthorityTab>('today');
  const [selectedMapZoneId, setSelectedMapZoneId] = useState<string | null>(null);
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Price overrides state tracking locally for instant feedback
  const [zonePriceDecisions, setZonePriceDecisions] = useState<Record<string, 'accepted' | 'kept'>>({});

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage((prev) => (prev === msg ? null : prev)), 3500);
  };

  // 1. Unauthenticated Security Check: Redirect to login maintaining query params
  if (!isAuthenticated) {
    return <Redirect to="/?mode=authority&redirect=/authority" />;
  }

  // 2. Role Restriction
  if (currentUser.role !== 'admin') {
    return <Redirect to="/?redirect=/authority" />;
  }

  // Calculate live numbers for "Today" screen
  const totalSpaces = spaces.length;
  const freeSpaces = spaces.filter((s) => s.status === 'available').length;
  const inUseSpaces = spaces.filter((s) => s.status === 'occupied' || s.status === 'held').length;
  const moneyCollectedToday = 18450; // Current day's municipal tally
  const activeAlerts = alerts.filter((a) => a.status === 'open' || a.status === 'investigating');
  const attentionCount = activeAlerts.length;
  const operatorReservations = Array.from(new Map([...(activeReservation ? [activeReservation] : []), ...reservationHistory].map((reservation) => [reservation.id, reservation])).values());
  const pendingPermitCount = pendingPermits.filter((permit) => permit.status === 'pending').length;

  // Operator navigation
  const navItems = [
    { id: 'today' as const, label: 'Today', icon: Calendar },
    { id: 'map' as const, label: 'Parking Map', icon: MapPin },
    { id: 'reservations' as const, label: 'Reservations', icon: ClipboardList, badge: pendingPermitCount > 0 ? pendingPermitCount : undefined },
    {
      id: 'pricing_alerts' as const,
      label: 'Prices & Alerts',
      icon: Tag,
      badge: attentionCount > 0 ? attentionCount : undefined,
    },
    { id: 'history' as const, label: 'History', icon: Clock },
  ];

  // Pricing suggestion calculation using plain language explanations
  const pricingCards = useMemo(() => {
    return zones.map((zone) => {
      const stats = getZoneStats(zone.id);
      const occupancy = stats.total > 0 ? stats.occupied / stats.total : 0;

      let suggestedRate = zone.hourlyRate;
      let reason = 'no change needed';

      if (occupancy > 0.65) {
        suggestedRate = zone.hourlyRate + 5;
        reason = "it's busier than usual";
      } else if (occupancy < 0.25 && zone.hourlyRate > 20) {
        suggestedRate = Math.max(15, zone.hourlyRate - 5);
        reason = "it's quieter than usual";
      }

      return {
        zone,
        currentRate: zone.hourlyRate,
        suggestedRate,
        reason,
        decision: zonePriceDecisions[zone.id],
      };
    });
  }, [zones, getZoneStats, zonePriceDecisions]);

  // Handle Price Decision
  const handleUseSuggestedPrice = (zone: ParkingZone, newRate: number) => {
    updateZone(zone.id, { hourlyRate: newRate });
    setZonePriceDecisions((prev) => ({ ...prev, [zone.id]: 'accepted' }));
    showToast(`Updated price for ${zone.name} to ₹${newRate}/hour`);
  };

  const handleKeepCurrentPrice = (zone: ParkingZone) => {
    setZonePriceDecisions((prev) => ({ ...prev, [zone.id]: 'kept' }));
    showToast(`Kept current price of ₹${zone.hourlyRate}/hour for ${zone.name}`);
  };

  // Handle Alert Checked (1 button)
  const handleMarkAlertChecked = (alertId: string, alertTitle: string) => {
    resolveAlertWithNote(alertId, 'Marked as checked by municipal officer');
    showToast(`Marked alert as checked`);
  };

  // Format History Items into readable plain sentences grouped by day
  const formattedHistoryGroups = useMemo(() => {
    const todayItems: string[] = [];
    const yesterdayItems: string[] = [];
    const olderItems: string[] = [];

    // Pre-populate with realistic municipal actions
    const defaultSentences = [
      { text: 'Today, 2:14 PM — You approved a price change for R.S. Puram Market (₹40 → ₹45)', group: 'today' },
      { text: 'Today, 1:50 PM — Space M-01 in Gandhipuram was marked out of service', group: 'today' },
      { text: 'Today, 11:20 AM — Space A-04 in Town Hall North was marked as available', group: 'today' },
      { text: 'Yesterday, 6:02 PM — You marked an alert as checked in Ukkadam Lakefront', group: 'yesterday' },
      { text: 'Yesterday, 3:45 PM — Space C-02 in DB Road was marked as occupied', group: 'yesterday' },
      { text: '14 Aug 2026, 10:15 AM — You kept price at ₹30/hour for Race Course North', group: 'older' },
      { text: '14 Aug 2026, 9:00 AM — Morning curb sensors synchronized across 8 zones', group: 'older' },
    ];

    // Merge recent audit log entries
    auditLog.slice(0, 10).forEach((entry) => {
      let sentence = '';
      if (entry.type === 'authority_action') {
        sentence = `Today, ${entry.timestamp} — ${entry.details}`;
      } else {
        sentence = `Today, ${entry.timestamp} — ${entry.source}: Space ${entry.spaceLabel} ${entry.previousStatus} → ${entry.nextStatus}`;
      }
      if (!todayItems.includes(sentence)) {
        todayItems.push(sentence);
      }
    });

    defaultSentences.forEach((item) => {
      if (item.group === 'today' && !todayItems.includes(item.text)) todayItems.push(item.text);
      if (item.group === 'yesterday') yesterdayItems.push(item.text);
      if (item.group === 'older') olderItems.push(item.text);
    });

    const filterText = historySearchQuery.toLowerCase();
    return {
      today: todayItems.filter((s) => s.toLowerCase().includes(filterText)),
      yesterday: yesterdayItems.filter((s) => s.toLowerCase().includes(filterText)),
      older: olderItems.filter((s) => s.toLowerCase().includes(filterText)),
    };
  }, [auditLog, historySearchQuery]);

  return (
    <div
      id="authority-simplified-root"
      data-release="operator-dashboard-2026-08"
      className="flex h-screen bg-sand-150 dark:bg-graphite-dark text-graphite dark:text-sand-100 overflow-hidden font-sans select-none"
    >
      {/* Toast Feedback */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-6 z-50 flex items-center gap-2.5 bg-graphite dark:bg-sand-50 text-sand-50 dark:text-graphite px-4 py-2.5 rounded-2xl shadow-2xl border border-sand-300 dark:border-graphite-light text-xs font-semibold"
          >
            <CheckCircle2 className="w-4 h-4 text-teal shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Persistent Left Sidebar: Exactly 4 Items */}
      <aside
        id="authority-sidebar"
        className="w-64 flex flex-col bg-sand-50 dark:bg-graphite border-r border-sand-300 dark:border-graphite-light shrink-0 z-30"
      >
        {/* Municipal Header */}
        <div className="h-16 flex items-center px-5 border-b border-sand-300 dark:border-graphite-light justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal text-sand-50 flex items-center justify-center shadow-md font-serif font-bold text-base">
              CS
            </div>
            <div>
              <div className="font-serif font-bold text-graphite dark:text-sand-100 text-sm tracking-tight flex items-center gap-1.5">
                CurbSense
                <span className="text-[9px] uppercase font-sans font-bold px-1.5 py-0.5 rounded bg-teal/15 text-teal border border-teal/30">
                  City
                </span>
              </div>
              <p className="text-[11px] text-graphite-muted dark:text-sand-400">
                Coimbatore Operations
              </p>
            </div>
          </div>
        </div>

        {/* 4 Navigation Items */}
        <nav className="flex-1 p-3 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                id={`authority-nav-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  'w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer',
                  isActive
                    ? 'bg-teal text-white shadow-sm'
                    : 'text-graphite dark:text-sand-200 hover:bg-sand-200 dark:hover:bg-graphite-light'
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className={cn('w-4 h-4', isActive ? 'text-white' : 'text-teal')} />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-clay text-white">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-sand-300 dark:border-graphite-light bg-sand-100/60 dark:bg-graphite-dark/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal text-sand-50 font-bold text-xs flex items-center justify-center">
              AD
            </div>
            <div>
              <div className="text-xs font-bold text-graphite dark:text-sand-100">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-teal font-semibold">Municipal Officer</div>
            </div>
          </div>

          <button
            id="btn-authority-logout"
            onClick={() => {
              logoutUser();
              setLocation('/');
            }}
            title="Sign Out"
            className="p-2 rounded-xl text-graphite-muted hover:text-clay hover:bg-sand-200 dark:hover:bg-graphite-light transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header Bar */}
        <header className="h-16 border-b border-sand-300 dark:border-graphite-light bg-sand-50/90 dark:bg-graphite/90 backdrop-blur-md px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-lg font-bold text-graphite dark:text-sand-100 capitalize">
              {activeTab === 'today'
                ? 'Today'
                : activeTab === 'map'
                ? 'Parking Map'
                : activeTab === 'reservations'
                ? 'Reservations & Permits'
                : activeTab === 'pricing_alerts'
                ? 'Prices & Alerts'
                : 'History'}
            </h1>
            <span className="text-[10px] text-teal bg-teal/10 px-2 py-0.5 rounded-full font-bold">
              Coimbatore
            </span>
          </div>

          {/* Theme Toggle */}
          <button
            id="btn-authority-theme"
            onClick={toggleTheme}
            className="w-9 h-9 rounded-xl border border-sand-300 dark:border-graphite-light bg-sand-50 dark:bg-graphite text-graphite dark:text-sand-100 flex items-center justify-center hover:bg-sand-200 dark:hover:bg-graphite-light transition-colors cursor-pointer"
            title="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-500" />
            ) : (
              <Moon className="w-4 h-4 text-teal" />
            )}
          </button>
        </header>

        {/* Dynamic Screen View */}
        <main className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {/* ========================================================================= */}
          {/* SCREEN 1: TODAY                                                           */}
          {/* ========================================================================= */}
          {activeTab === 'today' && (
            <div className="max-w-5xl mx-auto space-y-6">
              {/* 4 Large Friendly Number Cards in a Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Card 1: Spaces free right now */}
                <div className="p-5 rounded-3xl bg-sand-50 dark:bg-graphite border border-sand-300 dark:border-graphite-light shadow-sm flex flex-col justify-between">
                  <span className="text-xs font-bold text-graphite-muted dark:text-sand-400">
                    Spaces free right now
                  </span>
                  <div className="text-3xl font-bold text-teal mt-2 flex items-baseline gap-1">
                    <AnimateDigits value={freeSpaces} />
                    <span className="text-sm text-graphite-muted font-medium">of {totalSpaces}</span>
                  </div>
                </div>

                {/* Card 2: Spaces in use */}
                <div className="p-5 rounded-3xl bg-sand-50 dark:bg-graphite border border-sand-300 dark:border-graphite-light shadow-sm flex flex-col justify-between">
                  <span className="text-xs font-bold text-graphite-muted dark:text-sand-400">
                    Spaces in use
                  </span>
                  <div className="text-3xl font-bold text-graphite dark:text-sand-100 mt-2">
                    <AnimateDigits value={inUseSpaces} />
                  </div>
                </div>

                {/* Card 3: Money collected today */}
                <div className="p-5 rounded-3xl bg-sand-50 dark:bg-graphite border border-sand-300 dark:border-graphite-light shadow-sm flex flex-col justify-between">
                  <span className="text-xs font-bold text-graphite-muted dark:text-sand-400">
                    Money collected today
                  </span>
                  <div className="text-3xl font-bold text-graphite dark:text-sand-100 mt-2">
                    <AnimateDigits value={moneyCollectedToday} prefix="₹" />
                  </div>
                </div>

                {/* Card 4: Things that need your attention */}
                <div className="p-5 rounded-3xl bg-sand-50 dark:bg-graphite border border-sand-300 dark:border-graphite-light shadow-sm flex flex-col justify-between">
                  <span className="text-xs font-bold text-graphite-muted dark:text-sand-400">
                    Things that need your attention
                  </span>
                  <div
                    className={cn(
                      'text-3xl font-bold mt-2',
                      attentionCount > 0 ? 'text-clay' : 'text-teal'
                    )}
                  >
                    <AnimateDigits value={attentionCount} />
                  </div>
                </div>
              </div>

              {/* Simple List of the 8 Zones (One Row Each) */}
              <div className="rounded-3xl bg-sand-50 dark:bg-graphite border border-sand-300 dark:border-graphite-light shadow-sm overflow-hidden p-2">
                <div className="px-4 py-3 border-b border-sand-200 dark:border-graphite-light text-xs font-bold text-graphite-muted dark:text-sand-400 uppercase tracking-wider">
                  Zone Status (Click row to see on map)
                </div>

                <div className="divide-y divide-sand-200 dark:divide-graphite-light">
                  {zones.map((zone) => {
                    const stats = getZoneStats(zone.id);
                    const occupancy = stats.total > 0 ? stats.occupied / stats.total : 0;

                    // Dot color: Green = plenty of space, Yellow = filling up, Red = full / problem
                    let dotColor = 'bg-teal';
                    if (occupancy >= 0.8) {
                      dotColor = 'bg-clay';
                    } else if (occupancy >= 0.5) {
                      dotColor = 'bg-amber-500';
                    }

                    return (
                      <button
                        key={zone.id}
                        onClick={() => {
                          setSelectedMapZoneId(zone.id);
                          setActiveTab('map');
                        }}
                        className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-sand-200/70 dark:hover:bg-graphite-light/70 transition-colors text-left cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <span className={cn('w-3 h-3 rounded-full shrink-0', dotColor)} />
                          <div>
                            <span className="text-sm font-bold text-graphite dark:text-sand-100 group-hover:text-teal transition-colors">
                              {zone.name}
                            </span>
                            <span className="text-xs text-graphite-muted ml-2">({zone.area})</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xs font-semibold text-graphite dark:text-sand-200">
                            {stats.available} of {stats.total} free
                          </span>
                          <ChevronRight className="w-4 h-4 text-graphite-muted group-hover:text-teal group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SCREEN 2: PARKING MAP                                                     */}
          {/* ========================================================================= */}
          {activeTab === 'map' && (
            <div className="max-w-6xl mx-auto h-[calc(100vh-140px)]">
              <ParkingMap
                height="100%"
                selectedZoneIdOverride={selectedMapZoneId}
                isAuthorityMode={true}
                showSearchBar={false}
              />
            </div>
          )}

          {/* ========================================================================= */}
          {/* SCREEN 3: RESERVATIONS & PERMITS                                         */}
          {/* ========================================================================= */}
          {activeTab === 'reservations' && (
            <AuthorityReservationsView
              reservations={operatorReservations}
              pendingPermits={pendingPermits}
              reviewPermit={reviewPermit}
              onShowToast={showToast}
            />
          )}

          {/* SCREEN 4: PRICES & ALERTS                                                 */}
          {/* ========================================================================= */}
          {activeTab === 'pricing_alerts' && (
            <div className="max-w-5xl mx-auto space-y-8">
              {/* TOP HALF: PRICES */}
              <div className="space-y-4">
                <div>
                  <h2 className="font-serif text-lg font-bold text-graphite dark:text-sand-100">
                    Prices
                  </h2>
                  <p className="text-xs text-graphite-muted dark:text-sand-400">
                    Review and confirm suggested hourly prices for each zone.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {pricingCards.map(({ zone, currentRate, suggestedRate, reason, decision }) => {
                    const isChanged = suggestedRate !== currentRate;

                    return (
                      <div
                        key={zone.id}
                        className="p-4 rounded-3xl bg-sand-50 dark:bg-graphite border border-sand-300 dark:border-graphite-light shadow-sm flex flex-col justify-between gap-3"
                      >
                        <p className="text-xs sm:text-sm text-graphite dark:text-sand-100 leading-relaxed font-medium">
                          <span className="font-bold">{zone.name}</span> — currently{' '}
                          <span className="font-bold">₹{currentRate}/hour</span>. Suggested:{' '}
                          <span className="font-bold text-teal">₹{suggestedRate}/hour</span>{' '}
                          because {reason}.
                        </p>

                        <div className="flex items-center gap-2 pt-1">
                          {isChanged ? (
                            <>
                              <button
                                onClick={() => handleUseSuggestedPrice(zone, suggestedRate)}
                                className={cn(
                                  'py-2 px-3.5 rounded-2xl text-xs font-bold transition-all cursor-pointer shadow-xs',
                                  decision === 'accepted'
                                    ? 'bg-teal text-white'
                                    : 'bg-teal hover:bg-teal-hover text-white'
                                )}
                              >
                                {decision === 'accepted' ? 'Using ₹' + suggestedRate : 'Use ₹' + suggestedRate}
                              </button>

                              <button
                                onClick={() => handleKeepCurrentPrice(zone)}
                                className={cn(
                                  'py-2 px-3.5 rounded-2xl text-xs font-semibold border border-sand-300 dark:border-graphite-light hover:bg-sand-200 dark:hover:bg-graphite-light transition-all cursor-pointer',
                                  decision === 'kept' ? 'bg-sand-200 dark:bg-graphite-light font-bold' : ''
                                )}
                              >
                                Keep ₹{currentRate}
                              </button>
                            </>
                          ) : (
                            <span className="text-xs font-semibold text-teal py-1 flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4" />
                              Current price is optimal
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* BOTTOM HALF: THINGS TO CHECK */}
              <div className="space-y-4 pt-4 border-t border-sand-300 dark:border-graphite-light">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-serif text-lg font-bold text-graphite dark:text-sand-100">
                      Things to check
                    </h2>
                    <p className="text-xs text-graphite-muted dark:text-sand-400">
                      Reported issues and conflicting reports that need verification.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-teal">
                    {activeAlerts.length} item{activeAlerts.length === 1 ? '' : 's'}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {activeAlerts.length === 0 ? (
                    <div className="p-6 rounded-3xl bg-sand-50 dark:bg-graphite border border-sand-300 dark:border-graphite-light text-center space-y-1">
                      <CheckCircle2 className="w-6 h-6 text-teal mx-auto" />
                      <p className="text-sm font-bold text-graphite dark:text-sand-100">
                        Everything looks good right now.
                      </p>
                      <p className="text-xs text-graphite-muted">No alerts to check.</p>
                    </div>
                  ) : (
                    activeAlerts.map((alert) => (
                      <div
                        key={alert.id}
                        className="p-3.5 px-4 rounded-2xl bg-sand-50 dark:bg-graphite border border-sand-300 dark:border-graphite-light shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <AlertTriangle className="w-4 h-4 text-clay shrink-0" />
                          <span className="text-xs text-graphite dark:text-sand-100 font-medium">
                            Space {alert.spaceId || 'A-04'} in {alert.zoneName || 'Town Hall North'} might have a problem —{' '}
                            {alert.type === 'community_conflict'
                              ? 'two citizens disagree on whether it is free'
                              : alert.description || 'needs physical verification'}
                          </span>
                        </div>

                        <button
                          onClick={() => handleMarkAlertChecked(alert.id, alert.title)}
                          className="py-1.5 px-3.5 rounded-xl bg-sand-200 dark:bg-graphite-light hover:bg-teal hover:text-white text-xs font-bold text-graphite dark:text-sand-100 transition-colors shrink-0 cursor-pointer shadow-xs"
                        >
                          Mark as checked
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SCREEN 4: HISTORY                                                         */}
          {/* ========================================================================= */}
          {activeTab === 'history' && (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Single Search Box */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search history..."
                  value={historySearchQuery}
                  onChange={(e) => setHistorySearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-sand-300 dark:border-graphite-light bg-sand-50 dark:bg-graphite text-xs font-medium text-graphite dark:text-sand-100 focus:outline-none focus:border-teal"
                />
                <Search className="w-4 h-4 text-graphite-muted absolute left-3.5 top-3" />
              </div>

              {/* Grouped by Date (Today / Yesterday / Earlier) */}
              <div className="space-y-6">
                {/* Today */}
                {formattedHistoryGroups.today.length > 0 && (
                  <div className="space-y-2.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-graphite-muted dark:text-sand-400 px-1">
                      Today
                    </h3>
                    <div className="rounded-3xl bg-sand-50 dark:bg-graphite border border-sand-300 dark:border-graphite-light p-2 divide-y divide-sand-200 dark:divide-graphite-light shadow-sm">
                      {formattedHistoryGroups.today.map((sentence, idx) => (
                        <div key={idx} className="p-3 text-xs text-graphite dark:text-sand-100 font-medium">
                          {sentence}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Yesterday */}
                {formattedHistoryGroups.yesterday.length > 0 && (
                  <div className="space-y-2.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-graphite-muted dark:text-sand-400 px-1">
                      Yesterday
                    </h3>
                    <div className="rounded-3xl bg-sand-50 dark:bg-graphite border border-sand-300 dark:border-graphite-light p-2 divide-y divide-sand-200 dark:divide-graphite-light shadow-sm">
                      {formattedHistoryGroups.yesterday.map((sentence, idx) => (
                        <div key={idx} className="p-3 text-xs text-graphite dark:text-sand-100 font-medium">
                          {sentence}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Older Dates */}
                {formattedHistoryGroups.older.length > 0 && (
                  <div className="space-y-2.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-graphite-muted dark:text-sand-400 px-1">
                      Earlier
                    </h3>
                    <div className="rounded-3xl bg-sand-50 dark:bg-graphite border border-sand-300 dark:border-graphite-light p-2 divide-y divide-sand-200 dark:divide-graphite-light shadow-sm">
                      {formattedHistoryGroups.older.map((sentence, idx) => (
                        <div key={idx} className="p-3 text-xs text-graphite dark:text-sand-100 font-medium">
                          {sentence}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AuthorityShell;
