import React, { useState } from 'react';
import {
  Bell,
  Sun,
  Moon,
  Shield,
  LogOut,
  UserCheck,
  Calendar,
  Activity,
  CheckCircle2,
  ChevronDown,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { useLocation } from 'wouter';
import { User, NotificationItem } from '../../types';

export type DateRangeOption = 'today' | '7d' | '30d' | 'custom';

interface AuthorityTopBarProps {
  currentUser: User;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  dateRange: DateRangeOption;
  setDateRange: (range: DateRangeOption) => void;
  notifications: NotificationItem[];
  unreadNotificationsCount: number;
  onMarkAllNotificationsRead: () => void;
  onLogout: () => void;
  onSwitchToCitizen: () => void;
}

export const AuthorityTopBar: React.FC<AuthorityTopBarProps> = ({
  currentUser,
  theme,
  toggleTheme,
  dateRange,
  setDateRange,
  notifications,
  unreadNotificationsCount,
  onMarkAllNotificationsRead,
  onLogout,
  onSwitchToCitizen,
}) => {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [, setLocation] = useLocation();

  return (
    <header className="h-16 bg-sand-50/95 dark:bg-graphite/95 backdrop-blur-md border-b border-sand-300 dark:border-graphite-light px-6 flex items-center justify-between z-20 select-none">
      {/* Left: Pilot City & Live Telemetry Badge */}
      <div className="flex items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-graphite dark:text-sand-100 text-sm tracking-tight">
              Coimbatore Smart City
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-teal/15 text-teal border border-teal/30">
              Pilot Sector 1
            </span>
          </div>
          <p className="text-[11px] text-graphite-muted dark:text-sand-400">
            CCMC Dynamic Curbside Management System
          </p>
        </div>

        <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-sand-300 dark:border-graphite-light text-[11px]">
          <span className="flex items-center gap-1.5 text-moss font-semibold">
            <span className="w-2 h-2 rounded-full bg-moss animate-pulse" />
            142 Sensors Live
          </span>
          <span className="text-graphite-muted dark:text-sand-400">•</span>
          <span className="text-graphite-muted dark:text-sand-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-teal" />
            FASTag Sync Active
          </span>
        </div>
      </div>

      {/* Center/Right: Date Range Filter & Actions */}
      <div className="flex items-center gap-3">
        {/* Global Date Range Filter */}
        <div className="hidden sm:flex items-center bg-sand-200/80 dark:bg-graphite-light/80 p-1 rounded-xl border border-sand-300 dark:border-graphite-light text-xs">
          <button
            onClick={() => setDateRange('today')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              dateRange === 'today'
                ? 'bg-sand-50 dark:bg-graphite text-teal font-bold shadow-sm'
                : 'text-graphite-muted dark:text-sand-400 hover:text-graphite'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setDateRange('7d')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              dateRange === '7d'
                ? 'bg-sand-50 dark:bg-graphite text-teal font-bold shadow-sm'
                : 'text-graphite-muted dark:text-sand-400 hover:text-graphite'
            }`}
          >
            7 Days
          </button>
          <button
            onClick={() => setDateRange('30d')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              dateRange === '30d'
                ? 'bg-sand-50 dark:bg-graphite text-teal font-bold shadow-sm'
                : 'text-graphite-muted dark:text-sand-400 hover:text-graphite'
            }`}
          >
            30 Days
          </button>
          <button
            onClick={() => setDateRange('custom')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
              dateRange === 'custom'
                ? 'bg-sand-50 dark:bg-graphite text-teal font-bold shadow-sm'
                : 'text-graphite-muted dark:text-sand-400 hover:text-graphite'
            }`}
          >
            <Calendar className="w-3 h-3" />
            <span>Custom</span>
          </button>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          className="p-2 rounded-xl text-graphite-muted dark:text-sand-400 hover:text-graphite dark:hover:text-sand-100 hover:bg-sand-200 dark:hover:bg-graphite-light border border-sand-300 dark:border-graphite-light transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-teal" />}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setIsNotifOpen(!isNotifOpen);
              setIsProfileOpen(false);
            }}
            title="System Notifications"
            className="p-2 rounded-xl text-graphite-muted dark:text-sand-400 hover:text-graphite dark:hover:text-sand-100 hover:bg-sand-200 dark:hover:bg-graphite-light border border-sand-300 dark:border-graphite-light transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-clay text-sand-50 text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Notifications Flyout */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-sand-50 dark:bg-graphite rounded-2xl border border-sand-300 dark:border-graphite-light shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="p-3 bg-sand-150 dark:bg-graphite-dark border-b border-sand-300 dark:border-graphite-light flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-serif font-bold text-graphite dark:text-sand-100 text-xs">
                    System Alerts & Log
                  </span>
                  {unreadNotificationsCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded bg-teal/15 text-teal text-[10px] font-bold">
                      {unreadNotificationsCount} new
                    </span>
                  )}
                </div>
                {unreadNotificationsCount > 0 && (
                  <button
                    onClick={onMarkAllNotificationsRead}
                    className="text-[11px] text-teal font-semibold hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-sand-200 dark:divide-graphite-light">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-graphite-muted dark:text-sand-400">
                    No new system notifications.
                  </div>
                ) : (
                  notifications.slice(0, 8).map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3 text-xs transition-colors ${
                        notif.read
                          ? 'opacity-70 bg-transparent'
                          : 'bg-teal/5 dark:bg-teal/10 font-medium'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-semibold text-graphite dark:text-sand-100 truncate">
                          {notif.title}
                        </span>
                        <span className="text-[10px] text-graphite-muted dark:text-sand-400 shrink-0">
                          {notif.timestamp}
                        </span>
                      </div>
                      <p className="text-[11px] text-graphite-muted dark:text-sand-300 line-clamp-2">
                        {notif.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Officer Profile Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
              setIsNotifOpen(false);
            }}
            className="flex items-center gap-2 p-1.5 pr-3 rounded-xl border border-sand-300 dark:border-graphite-light hover:bg-sand-200 dark:hover:bg-graphite-light transition-all"
          >
            <div className="w-7 h-7 rounded-lg bg-teal text-sand-50 flex items-center justify-center font-bold text-xs shadow-sm">
              {currentUser.avatarInitials || 'CC'}
            </div>
            <div className="text-left hidden md:block">
              <div className="text-xs font-bold text-graphite dark:text-sand-100 leading-tight">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-graphite-muted dark:text-sand-400">
                {currentUser.department || 'CCMC Mobility'}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-graphite-muted dark:text-sand-400" />
          </button>

          {/* Profile Dropdown */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-sand-50 dark:bg-graphite rounded-2xl border border-sand-300 dark:border-graphite-light shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="p-4 bg-sand-150 dark:bg-graphite-dark border-b border-sand-300 dark:border-graphite-light">
                <div className="font-semibold text-xs text-graphite dark:text-sand-100">
                  {currentUser.name}
                </div>
                <div className="text-[11px] text-graphite-muted dark:text-sand-400">
                  {currentUser.email}
                </div>
                <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-teal/15 text-teal text-[10px] font-bold">
                  <Shield className="w-3 h-3" />
                  Authorized Municipal Officer
                </div>
              </div>

              <div className="p-2 space-y-1 text-xs">
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    onSwitchToCitizen();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-graphite dark:text-sand-200 hover:bg-sand-200 dark:hover:bg-graphite-light transition-colors text-left font-medium"
                >
                  <ExternalLink className="w-4 h-4 text-teal" />
                  <span>Switch to Citizen View</span>
                </button>

                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-clay hover:bg-clay/10 transition-colors text-left font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
