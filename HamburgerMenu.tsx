import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MapPin,
  Car,
  Ticket,
  History,
  Bell,
  Accessibility,
  ShieldAlert,
  Sun,
  Moon,
  X,
  UserCheck,
  ChevronRight,
  ExternalLink,
  LogIn,
  LogOut,
  Layers3,
} from 'lucide-react';
import { useCurb } from '../../context/CurbContext';
import { useLocation } from 'wouter';

interface HamburgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  activeView: string;
  onSelectView: (view: string) => void;
}

export const HamburgerMenu: React.FC<HamburgerMenuProps> = ({
  isOpen,
  onClose,
  activeView,
  onSelectView,
}) => {
  const {
    currentUser,
    switchUserRole,
    logoutUser,
    theme,
    toggleTheme,
    surfaceMode,
    toggleSurfaceMode,
    unreadNotificationsCount,
    activeReservation,
    openAlertsCount,
  } = useCurb();
  const [, setLocation] = useLocation();

  const handleNavClick = (viewId: string, route?: string) => {
    if (route) {
      setLocation(route);
    } else {
      onSelectView(viewId);
    }
    onClose();
  };

  const navItems = [
    {
      id: 'find',
      label: 'Find a parking space',
      icon: MapPin,
      badge: null,
      desc: 'Live map & space availability',
    },
    {
      id: 'vehicle-selector',
      label: 'Vehicle & zone selector',
      icon: Car,
      route: '/vehicle-selector',
      badge: 'Fast Flow',
      desc: 'Vehicle-first guided booking',
    },
    {
      id: 'pass',
      label: 'My pass',
      icon: Ticket,
      badge: activeReservation ? 'ACTIVE' : null,
      badgeColor: 'bg-teal-primary text-white',
      desc: activeReservation ? `Space ${activeReservation.spaceLabel}` : 'Digital parking pass & QR',
    },
    {
      id: 'history',
      label: 'Recent bookings',
      icon: History,
      badge: null,
      desc: 'Past receipts and logs',
    },
    {
      id: 'notifications',
      label: 'My notifications',
      icon: Bell,
      badge: unreadNotificationsCount > 0 ? `${unreadNotificationsCount}` : null,
      badgeColor: 'bg-amber-custom text-white',
      desc: 'Telemetry & permit alerts',
    },
    {
      id: 'permits',
      label: 'Accessibility permits',
      icon: Accessibility,
      badge: currentUser.permitStatus === 'verified' ? 'Verified' : 'Apply',
      badgeColor: currentUser.permitStatus === 'verified' ? 'bg-moss text-white' : 'bg-line text-ink',
      desc: 'Govt disability pass verification',
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div id="hamburger-menu-overlay" className="fixed inset-0 z-50 flex">
          {/* Backdrop Scrim */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#075f57]/50 backdrop-blur-xs"
          />

          {/* Slide-out Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 280 }}
            className="relative w-full max-w-sm bg-limestone border-r border-line shadow-2xl flex flex-col h-full z-10 overflow-y-auto"
          >
            {/* Drawer Header */}
            <div className="p-5 border-b border-line flex items-center justify-between bg-paper">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-primary text-white flex items-center justify-center font-serif text-xl font-bold shadow-md shadow-teal-500/20">
                  C
                </div>
                <div>
                  <h2 className="font-serif text-lg text-ink font-bold leading-tight">CurbSense</h2>
                  <p className="text-[11px] text-ink-soft font-medium">Coimbatore Civic Transit Pilot</p>
                </div>
              </div>
              <button
                id="btn-close-hamburger"
                onClick={onClose}
                className="w-9 h-9 rounded-xl border border-line bg-limestone text-ink flex items-center justify-center hover:bg-teal-pale hover:text-teal-dark transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Citizen Profile Box */}
            <div className="p-4 m-4 rounded-2xl border border-line bg-paper shadow-curb">
              <div className="flex items-center justify-between mb-2">
                <div className="curb-label text-[10px]">Verified Driver</div>
                <button
                  id="btn-switch-vehicle-hamburger"
                  onClick={() => {
                    setLocation('/vehicle-selector');
                    onClose();
                  }}
                  className="text-[11px] font-semibold text-teal-primary hover:text-teal-dark hover:underline flex items-center gap-1"
                >
                  <Car className="w-3.5 h-3.5" />
                  Switch Vehicle
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-pale text-teal-dark font-bold flex items-center justify-center text-sm border border-teal-500/20">
                  {currentUser.avatarInitials}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-sm text-ink truncate">{currentUser.name}</div>
                  <div className="text-xs text-ink-soft">
                    {currentUser.vehiclePlate ? `Plate: ${currentUser.vehiclePlate}` : currentUser.email}
                  </div>
                </div>
              </div>
            </div>

            {/* Staggered Navigation Items */}
            <div className="px-4 py-2 flex-1 space-y-1">
              <div className="curb-label px-2 py-1 text-[10px]">Navigation</div>
              {navItems.map((item, idx) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <motion.button
                    key={item.id}
                    id={`nav-item-${item.id}`}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.04 * idx, duration: 0.2 }}
                    onClick={() => handleNavClick(item.id, item.route)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all ${
                      isActive
                        ? 'bg-teal-pale text-teal-dark font-bold shadow-xs border border-teal-500/20'
                        : 'hover:bg-paper text-ink border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isActive ? 'bg-teal-primary text-white' : 'bg-paper text-ink-soft border border-line'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold truncate leading-tight">{item.label}</div>
                        <div className="text-[11px] text-ink-soft truncate">{item.desc}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {item.badge && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            item.badgeColor || 'bg-teal-pale text-teal-dark border border-teal-500/20'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 text-ink-soft/60" />
                    </div>
                  </motion.button>
                );
              })}

              {/* Citizen Account Options */}
              <div className="pt-3 space-y-2">
                {/* Logout Button */}
                <motion.button
                  id="nav-item-logout"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25, duration: 0.2 }}
                  onClick={() => {
                    logoutUser();
                    setLocation('/login');
                    onClose();
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl text-left text-clay hover:bg-clay/10 transition-colors cursor-pointer border border-transparent hover:border-clay/20"
                >
                  <LogOut className="w-4 h-4 ml-1" />
                  <span className="text-xs font-bold">Sign Out</span>
                </motion.button>
              </div>
            </div>

            {/* Drawer Footer Controls */}
            <div className="p-4 border-t border-line bg-paper space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs text-ink-soft">
                  <span className="font-bold text-ink">Settings</span>
                  <div className="text-[10px]">CurbSense Pilot v2.4 · Smart City Coimbatore</div>
                </div>
                <Layers3 className="w-4 h-4 text-teal-dark shrink-0" />
              </div>

              <div className="grid grid-cols-2 gap-2" aria-label="Surface mode previews">
                <button type="button" aria-label="Apply opaque surface mode" onClick={() => { if (surfaceMode !== 'opaque') toggleSurfaceMode(); }} className={`rounded-xl border p-2 text-left transition-all ${surfaceMode === 'opaque' ? 'border-teal bg-teal-pale ring-2 ring-teal/20' : 'border-line bg-paper hover:border-teal/50'}`}>
                  <span className="mb-1 block h-7 rounded-lg border border-[#d4e0d8] bg-white shadow-sm"><span className="m-1 block h-2 rounded bg-teal/20" /></span>
                  <span className="block text-[10px] font-extrabold text-ink">Opaque</span>
                  <span className="block text-[9px] text-ink-soft">Maximum clarity</span>
                </button>
                <button type="button" aria-label="Apply translucent surface mode" onClick={() => { if (surfaceMode !== 'translucent') toggleSurfaceMode(); }} className={`rounded-xl border p-2 text-left transition-all ${surfaceMode === 'translucent' ? 'border-teal bg-teal-pale ring-2 ring-teal/20' : 'border-line bg-paper hover:border-teal/50'}`}>
                  <span className="mb-1 block h-7 rounded-lg border border-teal/30 bg-teal/10 p-1 backdrop-blur"><span className="block h-2 rounded bg-white/70" /></span>
                  <span className="block text-[10px] font-extrabold text-ink">Soft</span>
                  <span className="block text-[9px] text-ink-soft">Lighter layers</span>
                </button>
              </div>

              <button
                id="btn-toggle-surface-mode"
                onClick={toggleSurfaceMode}
                aria-pressed={surfaceMode === 'translucent'}
                className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl border border-line bg-limestone text-xs font-semibold text-ink hover:bg-teal-pale hover:text-teal-dark transition-colors"
              >
                <span>
                  <span className="block text-left">Map surface contrast</span>
                  <span className="block text-left text-[10px] font-medium text-ink-soft">
                    {surfaceMode === 'opaque' ? 'Opaque · maximum readability' : 'Soft · translucent layers'}
                  </span>
                </span>
                <span className="rounded-full bg-teal-pale px-2 py-1 text-[10px] font-bold text-teal-dark">
                  {surfaceMode === 'opaque' ? 'Opaque' : 'Soft'}
                </span>
              </button>

              <div className="flex items-center justify-between gap-3">
                <div className="text-[10px] text-ink-soft">Visual mode</div>

                <button
                id="btn-toggle-theme-hamburger"
                onClick={toggleTheme}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-line bg-limestone text-xs font-semibold text-ink hover:bg-teal-pale hover:text-teal-dark transition-colors"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-custom" />
                    <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-teal-primary" />
                    <span>Dark Mode</span>
                  </>
                )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
