import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Shield,
  User as UserIcon,
  CheckCircle2,
  Car,
  KeyRound,
  Building2,
  Lock,
  ArrowRight,
  Sparkles,
  Smartphone,
  Mail,
  BadgeCheck,
} from 'lucide-react';
import { useCurb } from '../../context/CurbContext';
import { DEMO_USERS } from '../../data/seedData';
import { VehicleType } from '../../types';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalInitialRole,
    currentUser,
    loginAsUser,
    loginWithCredentials,
    logoutUser,
  } = useCurb();

  const [activeTab, setActiveTab] = useState<'citizen' | 'admin'>(authModalInitialRole || 'citizen');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [plateInput, setPlateInput] = useState('');
  const [vehicleType, setVehicleType] = useState<VehicleType>('hatchback');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [officerBadgeId, setOfficerBadgeId] = useState('');
  const [loginFeedback, setLoginFeedback] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) {
      setLoginFeedback('Please enter an email address.');
      return;
    }

    if (activeTab === 'admin' && !emailInput.includes('@ccmc.gov.in') && !emailInput.includes('admin') && !emailInput.includes('gov')) {
      setLoginFeedback('Authority access requires an authorized municipal domain (@ccmc.gov.in).');
      return;
    }

    loginWithCredentials(
      emailInput,
      activeTab,
      nameInput || undefined,
      plateInput || undefined
    );
    setLoginFeedback(null);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-graphite/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-lg bg-sand-100 dark:bg-graphite rounded-2xl border border-sand-300 dark:border-graphite-light shadow-2xl overflow-hidden my-8"
        >
          {/* Header */}
          <div className="p-6 bg-sand-200 dark:bg-graphite-light/50 border-b border-sand-300 dark:border-graphite-light flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal/10 dark:bg-teal/20 text-teal flex items-center justify-center font-display text-xl font-bold border border-teal/20">
                CS
              </div>
              <div>
                <h2 className="font-display text-xl font-semibold text-graphite dark:text-sand-100">
                  CurbSense Access Portal
                </h2>
                <p className="text-xs text-graphite-muted dark:text-sand-400">
                  Coimbatore Municipal Curbside Parking Platform
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsAuthModalOpen(false)}
              className="p-2 rounded-xl text-graphite-muted hover:text-graphite dark:text-sand-400 dark:hover:text-sand-100 hover:bg-sand-300 dark:hover:bg-graphite-light transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Role Tabs */}
          <div className="flex border-b border-sand-300 dark:border-graphite-light bg-sand-150 dark:bg-graphite">
            <button
              onClick={() => {
                setActiveTab('citizen');
                setLoginFeedback(null);
              }}
              className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-all ${
                activeTab === 'citizen'
                  ? 'border-teal text-teal bg-sand-100 dark:bg-graphite-light/40 font-semibold'
                  : 'border-transparent text-graphite-muted dark:text-sand-400 hover:text-graphite dark:hover:text-sand-200'
              }`}
            >
              <UserIcon className="w-4 h-4" />
              Citizen Driver
            </button>
            <button
              onClick={() => {
                setActiveTab('admin');
                setLoginFeedback(null);
              }}
              className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-all ${
                activeTab === 'admin'
                  ? 'border-teal text-teal bg-sand-100 dark:bg-graphite-light/40 font-semibold'
                  : 'border-transparent text-graphite-muted dark:text-sand-400 hover:text-graphite dark:hover:text-sand-200'
              }`}
            >
              <Building2 className="w-4 h-4" />
              Municipal Authority
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Quick Demo Personas */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-graphite-muted dark:text-sand-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-teal" />
                  Instant Demo Profiles
                </span>
                <span className="text-[11px] text-teal font-medium">Click to login directly</span>
              </div>

              {activeTab === 'citizen' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => loginAsUser(DEMO_USERS.citizen)}
                    className="p-3 rounded-xl border border-sand-300 dark:border-graphite-light bg-sand-50 dark:bg-graphite-light/30 hover:border-teal text-left transition-all group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm text-graphite dark:text-sand-100 group-hover:text-teal">
                        Ananya R.
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal/15 text-teal font-medium">
                        Verified Permit
                      </span>
                    </div>
                    <p className="text-xs text-graphite-muted dark:text-sand-400">
                      TN 38 CY 8842 · Hatchback
                    </p>
                    <p className="text-[11px] text-moss dark:text-teal font-medium mt-1">
                      Full access + Accessible bays
                    </p>
                  </button>

                  <button
                    onClick={() => loginAsUser(DEMO_USERS.citizen_suresh || {
                      id: 'usr-suresh',
                      name: 'Suresh Kumar',
                      email: 'suresh.k@gmail.com',
                      role: 'citizen',
                      avatarInitials: 'SK',
                      vehiclePlate: 'TN 37 AB 1234',
                      defaultVehicle: 'two_wheeler',
                      permitStatus: 'none',
                    })}
                    className="p-3 rounded-xl border border-sand-300 dark:border-graphite-light bg-sand-50 dark:bg-graphite-light/30 hover:border-teal text-left transition-all group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm text-graphite dark:text-sand-100 group-hover:text-teal">
                        Suresh Kumar
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300 font-medium">
                        Two-Wheeler
                      </span>
                    </div>
                    <p className="text-xs text-graphite-muted dark:text-sand-400">
                      TN 37 AB 1234 · EV Scooter
                    </p>
                    <p className="text-[11px] text-graphite-muted dark:text-sand-400 font-medium mt-1">
                      Standard citizen driver
                    </p>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => loginAsUser(DEMO_USERS.admin)}
                    className="p-3 rounded-xl border border-sand-300 dark:border-graphite-light bg-sand-50 dark:bg-graphite-light/30 hover:border-teal text-left transition-all group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm text-graphite dark:text-sand-100 group-hover:text-teal">
                        Er. Karthik S.
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-clay/15 text-clay font-medium">
                        Chief Engineer
                      </span>
                    </div>
                    <p className="text-xs text-graphite-muted dark:text-sand-400">
                      CCMC Traffic & Mobility
                    </p>
                    <p className="text-[11px] text-teal font-medium mt-1">
                      Pricing + Alerts + Full City Audit
                    </p>
                  </button>

                  <button
                    onClick={() => loginAsUser(DEMO_USERS.admin_priya || {
                      id: 'adm-priya',
                      name: 'Priya Rajendran',
                      title: 'Senior Municipal Systems Officer',
                      email: 'priya.mobility@ccmc.gov.in',
                      role: 'admin',
                      avatarInitials: 'PR',
                      vehiclePlate: 'TN 38 G 0088',
                      defaultVehicle: 'ev',
                      permitStatus: 'none',
                    })}
                    className="p-3 rounded-xl border border-sand-300 dark:border-graphite-light bg-sand-50 dark:bg-graphite-light/30 hover:border-teal text-left transition-all group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm text-graphite dark:text-sand-100 group-hover:text-teal">
                        Priya Rajendran
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal/15 text-teal font-medium">
                        Systems Officer
                      </span>
                    </div>
                    <p className="text-xs text-graphite-muted dark:text-sand-400">
                      CCMC Smart Mobility Cell
                    </p>
                    <p className="text-[11px] text-teal font-medium mt-1">
                      Dynamic Tariffs & Simulation
                    </p>
                  </button>
                </div>
              )}
            </div>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-sand-300 dark:border-graphite-light w-full"></div>
              <span className="bg-sand-100 dark:bg-graphite px-3 text-xs text-graphite-muted dark:text-sand-400 uppercase tracking-wider">
                Or Sign In With Credentials
              </span>
            </div>

            {/* Custom Login Form */}
            <form onSubmit={handleCustomSubmit} className="space-y-4">
              {activeTab === 'citizen' && isRegisterMode && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-graphite dark:text-sand-200 mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Arun Kumar"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-sand-300 dark:border-graphite-light bg-sand-50 dark:bg-graphite-light/50 text-graphite dark:text-sand-100 text-sm focus:outline-none focus:border-teal"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-graphite dark:text-sand-200 mb-1.5">
                      Vehicle Registration Number (FASTag linked)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. TN 38 BZ 4410"
                      value={plateInput}
                      onChange={(e) => setPlateInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-sand-300 dark:border-graphite-light bg-sand-50 dark:bg-graphite-light/50 text-graphite dark:text-sand-100 text-sm uppercase focus:outline-none focus:border-teal"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-graphite dark:text-sand-200 mb-1.5">
                  {activeTab === 'admin' ? 'Municipal Staff Email' : 'Email or Mobile Number'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder={
                      activeTab === 'admin'
                        ? 'officer.name@ccmc.gov.in'
                        : 'yourname@gmail.com or 98420 12345'
                    }
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-sand-300 dark:border-graphite-light bg-sand-50 dark:bg-graphite-light/50 text-graphite dark:text-sand-100 text-sm focus:outline-none focus:border-teal"
                  />
                  <Mail className="w-4 h-4 text-graphite-muted dark:text-sand-400 absolute left-3.5 top-3" />
                </div>
              </div>

              {activeTab === 'admin' && (
                <div>
                  <label className="block text-xs font-semibold text-graphite dark:text-sand-200 mb-1.5">
                    CCMC Security Badge ID / 2FA Code
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g. CCMC-TRF-4091"
                      value={officerBadgeId}
                      onChange={(e) => setOfficerBadgeId(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-sand-300 dark:border-graphite-light bg-sand-50 dark:bg-graphite-light/50 text-graphite dark:text-sand-100 text-sm focus:outline-none focus:border-teal"
                    />
                    <Shield className="w-4 h-4 text-graphite-muted dark:text-sand-400 absolute left-3.5 top-3" />
                  </div>
                </div>
              )}

              {loginFeedback && (
                <div className="p-3 rounded-xl bg-clay/10 border border-clay/30 text-xs text-clay">
                  {loginFeedback}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-teal hover:bg-teal-hover text-sand-50 font-semibold text-sm flex items-center justify-center gap-2 shadow-md transition-all"
              >
                {activeTab === 'admin' ? (
                  <>
                    <Lock className="w-4 h-4" />
                    Authorize Municipal Session
                  </>
                ) : isRegisterMode ? (
                  <>
                    <BadgeCheck className="w-4 h-4" />
                    Register Citizen Profile
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-4 h-4" />
                    Sign In to CurbSense
                  </>
                )}
              </button>

              {activeTab === 'citizen' && (
                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => setIsRegisterMode(!isRegisterMode)}
                    className="text-xs text-teal hover:underline font-medium"
                  >
                    {isRegisterMode
                      ? 'Already have an account? Sign In'
                      : 'New driver in Coimbatore? Register vehicle profile'}
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Current Active Account Status */}
          <div className="p-4 bg-sand-200 dark:bg-graphite-light/40 border-t border-sand-300 dark:border-graphite-light flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-moss animate-pulse" />
              <span className="text-graphite-muted dark:text-sand-400">Current active session:</span>
              <span className="font-semibold text-graphite dark:text-sand-100">
                {currentUser.name} ({currentUser.role === 'admin' ? 'Authority' : 'Citizen'})
              </span>
            </div>
            <button
              onClick={logoutUser}
              className="text-clay hover:underline font-medium"
            >
              Sign Out
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
