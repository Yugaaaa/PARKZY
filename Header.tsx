import React, { useState, useEffect } from 'react';
import { Menu, Car, Bell, Sun, Moon, Shield, User as UserIcon, Check, LogOut, LogIn, Sparkles, X } from 'lucide-react';
import { useCurb } from '../../context/CurbContext';
import { useLocation } from 'wouter';

interface HeaderProps {
  onOpenMenu: () => void;
  onOpenNotifications: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMenu, onOpenNotifications }) => {
  const {
    currentUser,
    isAuthenticated,
    welcomeToast,
    setWelcomeToast,
    switchUserRole,
    openAuthModal,
    logoutUser,
    theme,
    toggleTheme,
    unreadNotificationsCount,
    activeReservation,
  } = useCurb();
  const [, setLocation] = useLocation();
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);

  // Auto-dismiss welcome toast after 4.5 seconds
  useEffect(() => {
    if (welcomeToast) {
      const timer = setTimeout(() => {
        setWelcomeToast(null);
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [welcomeToast, setWelcomeToast]);

  return (
    <>
      {/* Welcome Toast / Banner */}
      {welcomeToast && (
        <div
          id="auth-welcome-banner"
          className="bg-teal-primary text-white text-xs font-semibold px-4 py-2.5 flex items-center justify-between shadow-md z-50 animate-in slide-in-from-top duration-200"
        >
          <div className="flex items-center gap-2 max-w-4xl mx-auto w-full">
            <Sparkles className="w-4 h-4 text-emerald-300 shrink-0" />
            <span>{welcomeToast}</span>
          </div>
          <button
            onClick={() => setWelcomeToast(null)}
            className="text-white/80 hover:text-white ml-2 cursor-pointer"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <header
        id="citizen-top-header"
        className="sticky top-0 z-40 h-16 bg-paper border-b border-line px-4 sm:px-6 flex items-center justify-between transition-colors shadow-xs"
      >
        {/* Left section: Hamburger + Brand */}
        <div className="flex items-center gap-3">
          <button
            id="btn-open-hamburger-menu"
            onClick={onOpenMenu}
            className="w-10 h-10 rounded-xl border border-line bg-limestone text-ink flex items-center justify-center hover:bg-teal-pale hover:text-teal-dark hover:border-teal-500/30 transition-all cursor-pointer"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div
            id="brand-logo-clickable"
            onClick={() => setLocation('/')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-teal-primary text-white flex items-center justify-center font-serif text-lg font-bold shadow-sm shadow-teal-700/20 group-hover:scale-105 transition-transform">
              CS
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif text-lg text-ink font-bold tracking-tight">CurbSense</span>
                <span className="curb-label text-[9px] bg-teal-pale text-teal-dark px-1.5 py-0.5 rounded-full border border-teal-500/20 hidden sm:inline-block">
                  Pilot
                </span>
              </div>
              <p className="text-[10px] text-ink-soft font-medium leading-none hidden xs:block">
                Coimbatore Municipal Corporation
              </p>
            </div>
          </div>
        </div>

        {/* Right Section Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Book by Vehicle Pill Button */}
          <button
            id="btn-nav-vehicle-selector"
            onClick={() => setLocation('/vehicle-selector')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-teal-primary hover:bg-teal-dark text-white text-xs font-bold shadow-sm shadow-teal-800/20 transition-all transform active:scale-95 cursor-pointer"
          >
            <Car className="w-4 h-4" />
            <span className="hidden sm:inline">Book by Vehicle</span>
            <span className="sm:hidden">Book</span>
          </button>

          {/* Active Hold Alert Pill (if any) */}
          {activeReservation && (
            <button
              id="btn-active-pass-pill"
              onClick={() => setLocation('/')}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-[#3a2a0a] border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-bold animate-pulse"
            >
              <span className="w-2 h-2 rounded-full bg-amber-custom" />
              <span>Pass: {activeReservation.spaceLabel}</span>
            </button>
          )}

          {/* Notification Bell */}
          <button
            id="btn-open-notifications-header"
            onClick={onOpenNotifications}
            className="relative w-10 h-10 rounded-xl border border-line bg-limestone text-ink flex items-center justify-center hover:bg-teal-pale hover:text-teal-dark transition-all cursor-pointer"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-clay text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 ring-2 ring-paper">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Dark / Light Mode Toggle */}
          <button
            id="btn-toggle-theme-header"
            onClick={toggleTheme}
            className="w-10 h-10 rounded-xl border border-line bg-limestone text-ink flex items-center justify-center hover:bg-teal-pale hover:text-teal-dark transition-all cursor-pointer"
            aria-label="Toggle theme mode"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-custom" />
            ) : (
              <Moon className="w-4 h-4 text-teal-primary" />
            )}
          </button>

          {/* Citizen Profile & Session Dropdown */}
          <div className="relative">
            <button
              id="btn-user-persona-toggle"
              onClick={() => setShowPersonaMenu(!showPersonaMenu)}
              className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-line bg-limestone hover:bg-paper transition-all text-xs cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg font-bold flex items-center justify-center text-xs bg-teal-pale text-teal-dark border border-teal-500/20">
                {currentUser.avatarInitials}
              </div>
              <div className="text-left hidden lg:block">
                <div className="font-bold text-xs text-ink leading-tight truncate max-w-[110px]">
                  {currentUser.name.split(' ')[0]}
                </div>
                <div className="text-[10px] text-ink-soft font-medium leading-none">
                  Citizen Driver
                </div>
              </div>
            </button>

            {/* Profile Dropdown Popup */}
            {showPersonaMenu && (
              <div
                id="persona-dropdown-menu"
                className="absolute right-0 mt-2 w-72 rounded-2xl bg-paper border border-line shadow-2xl p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150"
              >
                {/* Active Session Info */}
                <div className="p-2.5 border-b border-line mb-1 bg-limestone rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-ink-soft">
                      Signed In Driver
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-teal-pale text-teal-dark">
                      Verified Citizen
                    </span>
                  </div>
                  <div className="font-bold text-xs text-ink mt-1 truncate">{currentUser.name}</div>
                  <div className="text-[11px] text-ink-soft truncate">{currentUser.email}</div>
                  {currentUser.vehiclePlate && (
                    <div className="text-[10px] font-mono text-teal-dark mt-0.5">
                      Plate: {currentUser.vehiclePlate}
                    </div>
                  )}
                  {currentUser.permitStatus === 'verified' && (
                    <div className="text-[10px] text-moss font-semibold mt-0.5 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Accessible Permit Verified
                    </div>
                  )}
                </div>

                <div className="p-2 space-y-1">
                  <button
                    id="btn-switch-vehicle-nav"
                    onClick={() => {
                      setShowPersonaMenu(false);
                      setLocation('/vehicle-selector');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-ink hover:bg-limestone transition-colors text-xs font-semibold text-left cursor-pointer"
                  >
                    <Car className="w-4 h-4 text-teal-primary" />
                    <span>Switch Vehicle or Mode</span>
                  </button>

                  <button
                    id="btn-logout-header"
                    onClick={() => {
                      setShowPersonaMenu(false);
                      logoutUser();
                      setLocation('/login');
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-clay hover:bg-clay/10 text-xs font-bold transition-colors cursor-pointer border-t border-line mt-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
};
