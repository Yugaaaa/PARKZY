import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'motion/react';
import {
  User as UserIcon,
  Shield,
  Building2,
  Car,
  Bike,
  Zap,
  Lock,
  Mail,
  KeyRound,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Info,
  Layers,
  Activity,
  Check,
  ChevronRight,
  Compass,
  FileCheck,
  Building,
  Eye,
  EyeOff,
  RefreshCw,
} from 'lucide-react';
import { useCurb } from '../context/CurbContext';
import { DEMO_USERS } from '../data/seedData';
import { VehicleType } from '../types';

type RoleMode = 'citizen' | 'admin';
type CitizenView = 'signin' | 'signup' | 'forgot_password';
type AuthorityView = 'signin' | 'request_access';

export const LoginPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const {
    currentUser,
    isAuthenticated,
    loginWithCredentials,
    loginAuthority3Factor,
    loginAsUser,
    submitAuthorityAccessRequest,
    theme,
    toggleTheme,
  } = useCurb();

  // Read URL query parameters for initial role (?mode=authority or ?mode=citizen)
  const initialRoleFromUrl = useMemo<RoleMode>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const mode = params.get('mode') || params.get('role');
      if (mode === 'authority' || mode === 'admin') return 'admin';
    }
    return 'citizen';
  }, []);

  const [roleMode, setRoleMode] = useState<RoleMode>(initialRoleFromUrl);
  const [citizenView, setCitizenView] = useState<CitizenView>('signin');
  const [authorityView, setAuthorityView] = useState<AuthorityView>('signin');

  // Form State: Citizen Sign In
  const [citizenEmail, setCitizenEmail] = useState('');
  const [citizenDisplayName, setCitizenDisplayName] = useState('');
  const [citizenPassword, setCitizenPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Form State: Citizen Sign Up
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPlate, setSignUpPlate] = useState('');
  const [signUpVehicleType, setSignUpVehicleType] = useState<VehicleType>('hatchback');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [signUpHasPermit, setSignUpHasPermit] = useState(false);
  const [signUpPermitNumber, setSignUpPermitNumber] = useState('');

  // Form State: Forgot Password
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  // Form State: Authority 3-Factor Sign In
  const [authorityStaffId, setAuthorityStaffId] = useState('');
  const [authorityPassword, setAuthorityPassword] = useState('');
  const [authorityBadgeCode, setAuthorityBadgeCode] = useState('');
  const [showAuthorityPassword, setShowAuthorityPassword] = useState(false);
  const [authorityError, setAuthorityError] = useState<string | null>(null);
  const [failedAttempts, setFailedAttempts] = useState<Record<string, number>>({});
  const [lockoutSeconds, setLockoutSeconds] = useState<number>(0);
  const [isVerifying, setIsVerifying] = useState(false);

  // Demo disclosure toggle (default collapsed)
  const [isDemoDisclosureOpen, setIsDemoDisclosureOpen] = useState(false);

  // Countdown timer for 60s soft lockout
  useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const timer = setInterval(() => {
      setLockoutSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutSeconds]);

  // Form State: Authority Request Access
  const [reqFullName, setReqFullName] = useState('');
  const [reqDepartment, setReqDepartment] = useState('CCMC Traffic & Mobility Wing');
  const [reqGovEmail, setReqGovEmail] = useState('');
  const [reqBadgeId, setReqBadgeId] = useState('');
  const [reqReason, setReqReason] = useState('');
  const [requestSubmittedRef, setRequestSubmittedRef] = useState<string | null>(null);

  // Generic loading & feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync role if URL query changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const mode = params.get('mode') || params.get('role');
      if (mode === 'authority' || mode === 'admin') {
        setRoleMode('admin');
      } else if (mode === 'citizen') {
        setRoleMode('citizen');
      }
    }
  }, []);

  // Password strength calculation for Sign Up
  const passwordStrength = useMemo(() => {
    if (!signUpPassword) return { score: 0, label: 'None', color: 'bg-sand-300 dark:bg-graphite-light' };
    let score = 0;
    if (signUpPassword.length >= 8) score += 1;
    if (/[0-9]/.test(signUpPassword)) score += 1;
    if (/[A-Z]/.test(signUpPassword) || /[^A-Za-z0-9]/.test(signUpPassword)) score += 1;

    if (score === 1) return { score: 33, label: 'Weak', color: 'bg-clay' };
    if (score === 2) return { score: 66, label: 'Medium', color: 'bg-amber-custom' };
    return { score: 100, label: 'Strong', color: 'bg-moss' };
  }, [signUpPassword]);

  // Handle Citizen Sign In Submission
  const handleCitizenSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!citizenEmail) {
      setErrorMessage('Please provide an email address or mobile number.');
      return;
    }
    if (!citizenPassword) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = loginWithCredentials(citizenEmail, 'citizen', citizenDisplayName || undefined, undefined, citizenPassword);
      setIsLoading(false);
      if (res.success) {
        const params = new URLSearchParams(window.location.search);
        const redirectUrl = params.get('redirect') || '/';
        setLocation(redirectUrl);
      } else {
        setErrorMessage(res.message || 'Unable to sign in. Please verify your credentials.');
      }
    }, 600);
  };

  // Handle Google OAuth Simulation
  const handleGoogleSignIn = () => {
    setIsLoading(true);
    setErrorMessage(null);
    setTimeout(() => {
      loginAsUser(DEMO_USERS.citizen);
      setIsLoading(false);
      const params = new URLSearchParams(window.location.search);
      const redirectUrl = params.get('redirect') || '/';
      setLocation(redirectUrl);
    }, 800);
  };

  // Handle Citizen Sign Up Submission
  const handleCitizenSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!signUpName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!signUpEmail.trim() || !signUpEmail.includes('@')) {
      setErrorMessage('Please provide a valid email address.');
      return;
    }
    if (signUpPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (signUpPassword !== signUpConfirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const plate = signUpPlate.trim().toUpperCase() || 'TN 38 BZ 4410';
      const res = loginWithCredentials(signUpEmail, 'citizen', signUpName, plate, signUpPassword);
      setIsLoading(false);
      if (res.success) {
        setLocation('/');
      } else {
        setErrorMessage(res.message || 'Registration failed. Please try again.');
      }
    }, 700);
  };

  // Handle Forgot Password
  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail || !forgotEmail.includes('@')) {
      setErrorMessage('Please enter a valid registered email address.');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setForgotSent(true);
      setErrorMessage(null);
    }, 600);
  };

  // Handle 3-Factor Authority Sign In Submission
  const handleAuthoritySignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutSeconds > 0 || isVerifying || isLoading) return;
    setAuthorityError(null);
    setErrorMessage(null);

    const cleanStaffId = authorityStaffId.trim().toUpperCase();
    const cleanBadgeCode = authorityBadgeCode.trim().toUpperCase();

    if (!cleanStaffId || !authorityPassword || !cleanBadgeCode) {
      setAuthorityError('All three credentials are required.');
      return;
    }

    const currentFails = failedAttempts[cleanStaffId] || 0;
    if (currentFails >= 3) {
      setLockoutSeconds(60);
      setAuthorityError('Too many attempts. Try again in 60 seconds.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = loginAuthority3Factor(cleanStaffId, authorityPassword, cleanBadgeCode);
      setIsLoading(false);

      if (res.success) {
        // Reset failures on success
        setFailedAttempts((prev) => ({ ...prev, [cleanStaffId]: 0 }));
        setIsVerifying(true);
        setTimeout(() => {
          setIsVerifying(false);
          const params = new URLSearchParams(window.location.search);
          const redirectUrl = params.get('redirect') || '/authority';
          setLocation(redirectUrl);
        }, 700);
      } else {
        const nextFails = currentFails + 1;
        setFailedAttempts((prev) => ({ ...prev, [cleanStaffId]: nextFails }));

        if (nextFails >= 3) {
          setLockoutSeconds(60);
          setAuthorityError('Too many attempts. Try again in 60 seconds.');
        } else {
          if (res.errorType === 'UNKNOWN_STAFF') {
            setAuthorityError("We couldn't find that Staff ID. Contact your municipal IT administrator if you believe this is an error.");
          } else if (res.errorType === 'WRONG_PASSWORD') {
            setAuthorityError("Incorrect security password.");
          } else if (res.errorType === 'WRONG_BADGE') {
            setAuthorityError("Station badge not recognized for this account. Check the code on your badge and try again.");
          } else {
            setAuthorityError(res.message || 'Invalid municipal credentials.');
          }
        }
      }
    }, 450);
  };

  // Handle Authority Access Request Submission
  const handleAuthorityRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqFullName.trim() || !reqGovEmail.trim() || !reqReason.trim()) {
      setErrorMessage('Please complete all required clearance fields.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = submitAuthorityAccessRequest({
        fullName: reqFullName,
        department: reqDepartment,
        email: reqGovEmail,
        badgeId: reqBadgeId,
        reason: reqReason,
      });
      setIsLoading(false);
      setRequestSubmittedRef(res.refId);
    }, 800);
  };

  // Convenience Credential Populators (Do NOT auto-submit)
  const fillAuthorityDemoCredentials = () => {
    setAuthorityStaffId('ADMIN01');
    setAuthorityPassword('SMARTCBE2026');
    setAuthorityBadgeCode('CBE-01');
    setAuthorityError(null);
    setRoleMode('admin');
    setAuthorityView('signin');
  };

  const fillCitizenDemoCredentials = () => {
    setCitizenEmail('citizen@curbsense.city');
    setCitizenPassword('coimbatore2026');
    setErrorMessage(null);
    setRoleMode('citizen');
    setCitizenView('signin');
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-limestone text-ink overflow-x-hidden font-sans">
      {/* ========================================================= */}
      {/* LEFT PANEL: Civic Branding, Value Prop & Visual Atlas     */}
      {/* ========================================================= */}
      <div
        className={`w-full lg:w-[45%] xl:w-[42%] flex flex-col justify-between p-6 sm:p-10 lg:p-12 relative overflow-hidden transition-colors duration-500 ${
          roleMode === 'admin'
            ? 'bg-[#075f57] text-[#eef5f1]'
            : 'bg-gradient-to-br from-[#0a7d73] via-[#075f57] to-[#142623] text-white'
        }`}
      >
        {/* Subtle Map / Grid Vector Overlay (Civic Cartography) */}
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="login-grid" width="48" height="48" patternUnits="userSpaceOnUse">
                <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#ffffff" strokeWidth="0.75" strokeOpacity="0.4" />
                <circle cx="24" cy="24" r="1.5" fill="#ffffff" fillOpacity="0.6" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#login-grid)" />
            {/* Coimbatore Arterial Road Lines */}
            <line x1="15%" y1="85%" x2="85%" y2="25%" stroke="#ffffff" strokeWidth="2.5" strokeOpacity="0.4" />
            <line x1="25%" y1="20%" x2="75%" y2="80%" stroke="#ffffff" strokeWidth="2" strokeOpacity="0.3" />
            <circle cx="50%" cy="50%" r="90" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.25" />
            <circle cx="50%" cy="50%" r="140" fill="none" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.15" />
          </svg>
        </div>

        {/* Top Branding Section */}
        <div className="relative z-10 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-md text-white flex items-center justify-center font-serif text-xl font-bold border border-white/20 shadow-lg">
                CS
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif text-2xl font-bold tracking-tight text-white">
                    CurbSense
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white px-2 py-0.5 rounded-full border border-white/25">
                    Coimbatore Pilot
                  </span>
                </div>
                <p className="text-xs text-white/80 font-medium">
                  Smart Curbside & Municipal Mobility Platform
                </p>
              </div>
            </div>
          </div>

          {/* Value Prop Headline */}
          <div className="space-y-2.5 pt-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-semibold backdrop-blur-sm border border-white/15">
              <Compass className="w-3.5 h-3.5 text-emerald-300" />
              <span>Civic Curbside Management</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-4xl xl:text-5xl font-bold text-white leading-tight">
              {roleMode === 'citizen'
                ? 'Stress-free curbside parking for Coimbatore.'
                : 'Municipal traffic command & dynamic tariff console.'}
            </h1>
            <p className="text-sm sm:text-base text-white/85 max-w-md leading-relaxed font-normal">
              {roleMode === 'citizen'
                ? 'Real-time sensor availability, 15-second demonstration holds, and fair tariffs across R.S. Puram, Town Hall, Gandhipuram, and Race Course.'
                : 'CCMC administrative portal for real-time sensor mesh telemetry, occupancy pressure forecasting, dynamic tariff approvals, and warden dispatch.'}
            </p>
          </div>
        </div>

        {/* Middle Illustrated Cartographic Abstract Diagram */}
        <div className="relative z-10 my-8 py-4 hidden sm:block">
          <div className="p-5 rounded-3xl bg-white/10 backdrop-blur-md border border-white/15 space-y-4">
            <div className="flex items-center justify-between text-xs text-white/90 font-semibold border-b border-white/15 pb-2.5">
              <span className="flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-emerald-300" />
                Live Coimbatore Curbside Mesh
              </span>
              <span className="text-[10px] bg-emerald-400/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold border border-emerald-400/30 animate-pulse">
                98.4% Telemetry Uptime
              </span>
            </div>

            {/* Zone Mini Badges */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">R.S. Puram West</div>
                  <div className="text-[10px] text-white/70">16 Bays · ₹35/hr</div>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              </div>

              <div className="p-2 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">Town Hall Core</div>
                  <div className="text-[10px] text-white/70">14 Bays · ₹30/hr</div>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-custom" />
              </div>

              <div className="p-2 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">Race Course East</div>
                  <div className="text-[10px] text-white/70">12 Bays · Dual EV</div>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              </div>

              <div className="p-2 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">Gandhipuram Cross</div>
                  <div className="text-[10px] text-white/70">18 Bays · Transit Hub</div>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Civic Footer info */}
        <div className="relative z-10 pt-4 border-t border-white/15 flex items-center justify-between text-xs text-white/75">
          <div>Coimbatore City Municipal Corporation</div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
              Govt. Pilot 2026
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* RIGHT PANEL: Auth Container with Prominent Role Toggle   */}
      {/* ========================================================= */}
      <div className="flex-1 flex flex-col justify-center items-center p-4 sm:p-8 lg:p-12 xl:p-16 relative">
        <div className="w-full max-w-md mx-auto space-y-6">
          {/* ======================================================= */}
          {/* PROMINENT ROLE TOGGLE (Citizen vs. Authority)           */}
          {/* ======================================================= */}
          <div className="space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-ink-soft">
              Select Portal Type
            </div>

            <div
              id="auth-role-toggle-container"
              className="grid grid-cols-2 p-1.5 rounded-2xl bg-paper border border-line shadow-sm gap-1.5"
            >
              {/* Citizen Segment */}
              <button
                id="toggle-role-citizen"
                type="button"
                onClick={() => {
                  setRoleMode('citizen');
                  setErrorMessage(null);
                  setAuthorityError(null);
                }}
                className={`py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  roleMode === 'citizen'
                    ? 'bg-teal-primary text-white shadow-md'
                    : 'text-ink-soft hover:text-ink hover:bg-limestone'
                }`}
              >
                <Car className="w-4 h-4" />
                <span>Citizen Driver</span>
              </button>

              {/* Authority Segment */}
              <button
                id="toggle-role-authority"
                type="button"
                onClick={() => {
                  setRoleMode('admin');
                  setErrorMessage(null);
                  setAuthorityError(null);
                }}
                className={`py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  roleMode === 'admin'
                    ? 'bg-[#075f57] text-white shadow-md border border-emerald-400/30'
                    : 'text-ink-soft hover:text-ink hover:bg-limestone'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Municipal Authority</span>
              </button>
            </div>

            {/* Authority Subtitle / Gated Notice */}
            {roleMode === 'admin' && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-pale border border-teal-primary/30 text-teal-dark text-[11px] font-semibold"
              >
                <Lock className="w-3 h-3 text-teal-dark shrink-0" />
                <span>Restricted access · Coimbatore City Municipal Corporation staff only</span>
              </motion.div>
            )}
          </div>

          {/* Form Card Container */}
          <div className="bg-paper rounded-3xl border border-line shadow-curb p-6 sm:p-8 space-y-5">
            {/* Global Error Banner */}
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-clay/10 border border-clay/30 text-clay text-xs font-semibold flex items-start gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="flex-1">{errorMessage}</span>
                <button onClick={() => setErrorMessage(null)} className="text-clay/60 hover:text-clay">✕</button>
              </div>
            )}

            {/* ===================================================== */}
            {/* CITIZEN MODE FORMS                                    */}
            {/* ===================================================== */}
            {roleMode === 'citizen' && (
              <div>
                {/* 1. CITIZEN SIGN IN */}
                {citizenView === 'signin' && (
                  <form onSubmit={handleCitizenSignIn} className="space-y-4">
                    <div>
                      <h2 className="font-serif text-2xl font-bold text-ink">
                        Citizen Sign In
                      </h2>
                      <p className="text-xs text-ink-soft mt-0.5">
                        Access real-time parking holds, FASTag vehicle passes & navigation.
                      </p>
                    </div>

                    {/* Official Google OAuth Button */}
                    <button
                      type="button"
                      id="btn-google-oauth-signin"
                      onClick={handleGoogleSignIn}
                      disabled={isLoading}
                      className="w-full py-3 px-4 rounded-2xl border border-line bg-paper hover:bg-limestone text-ink text-xs sm:text-sm font-semibold flex items-center justify-center gap-3 shadow-xs hover:shadow-sm transition-all cursor-pointer active:scale-[0.99]"
                    >
                      {/* Official Google Multicolor G SVG Icon */}
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      <span>Continue with Google</span>
                    </button>

                    {/* Divider */}
                    <div className="relative flex items-center justify-center">
                      <div className="border-t border-line w-full" />
                      <span className="bg-paper px-3 text-[11px] text-ink-soft uppercase font-bold tracking-wider">
                        Or with credentials
                      </span>
                    </div>

                    {/* Email / Phone Field */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-3">
                        <label htmlFor="input-citizen-display-name" className="text-xs font-bold text-ink">Display name</label>
                        <span className="text-[10px] font-medium text-ink-soft">Optional · shown on your passes</span>
                      </div>
                      <div className="relative">
                        <input
                          id="input-citizen-display-name"
                          type="text"
                          value={citizenDisplayName}
                          onChange={(e) => setCitizenDisplayName(e.target.value)}
                          placeholder="How should we address you?"
                          maxLength={48}
                          className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-line bg-limestone text-ink text-xs sm:text-sm font-medium focus:outline-none focus:border-teal-primary transition-colors"
                        />
                        <UserIcon className="w-4 h-4 text-ink-soft absolute left-3.5 top-3" />
                      </div>
                    </div>

                    {/* Email / Phone Field */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-ink">
                        Email Address or Mobile Number
                      </label>
                      <div className="relative">
                        <input
                          id="input-citizen-email"
                          type="text"
                          value={citizenEmail}
                          onChange={(e) => setCitizenEmail(e.target.value)}
                          placeholder="ananya.r@coimbatore.in or 9842100000"
                          className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-line bg-limestone text-ink text-xs sm:text-sm font-medium focus:outline-none focus:border-teal-primary transition-colors"
                        />
                        <Mail className="w-4 h-4 text-ink-soft absolute left-3.5 top-3" />
                      </div>
                    </div>

                    {/* Password Field */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-ink">Password</label>
                        <button
                          type="button"
                          onClick={() => {
                            setCitizenView('forgot_password');
                            setErrorMessage(null);
                          }}
                          className="text-xs text-teal-primary hover:underline font-semibold"
                        >
                          Forgot password?
                        </button>
                      </div>
                      <div className="relative">
                        <input
                          id="input-citizen-password"
                          type={showPassword ? 'text' : 'password'}
                          value={citizenPassword}
                          onChange={(e) => setCitizenPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-10 pr-10 py-2.5 rounded-2xl border border-line bg-limestone text-ink text-xs sm:text-sm font-medium focus:outline-none focus:border-teal-primary transition-colors"
                        />
                        <KeyRound className="w-4 h-4 text-ink-soft absolute left-3.5 top-3" />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-3 text-ink-soft hover:text-ink"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Remember me Checkbox */}
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="citizen-remember-me"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-line text-teal-primary focus:ring-teal-primary"
                      />
                      <label htmlFor="citizen-remember-me" className="text-xs text-ink-soft select-none">
                        Keep me signed in on this device
                      </label>
                    </div>

                    {/* Sign In Submit Button */}
                    <button
                      type="submit"
                      id="btn-citizen-submit"
                      disabled={isLoading}
                      className="w-full py-3.5 px-4 rounded-2xl bg-teal-primary hover:bg-teal-dark text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.99]"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Signing In...</span>
                        </div>
                      ) : (
                        <>
                          <span>Sign In to CurbSense</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    {/* Switch to Sign Up */}
                    <div className="text-center pt-2">
                      <span className="text-xs text-ink-soft">New here? </span>
                      <button
                        type="button"
                        id="btn-goto-signup"
                        onClick={() => {
                          setCitizenView('signup');
                          setErrorMessage(null);
                        }}
                        className="text-xs text-teal-primary hover:underline font-bold"
                      >
                        Create an account
                      </button>
                    </div>
                  </form>
                )}

                {/* 2. CITIZEN SIGN UP */}
                {citizenView === 'signup' && (
                  <form onSubmit={handleCitizenSignUp} className="space-y-4">
                    <div>
                      <h2 className="font-serif text-2xl font-bold text-ink">
                        Create Citizen Account
                      </h2>
                      <p className="text-xs text-ink-soft mt-0.5">
                        Register for real-time parking holds, FastPay & FASTag vehicle mapping.
                      </p>
                    </div>

                    {/* Full Name */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-ink">Full Name</label>
                      <input
                        type="text"
                        required
                        value={signUpName}
                        onChange={(e) => setSignUpName(e.target.value)}
                        placeholder="e.g. Ananya Ramanathan"
                        className="w-full px-3.5 py-2.5 rounded-2xl border border-line bg-limestone text-ink text-xs sm:text-sm font-medium focus:outline-none focus:border-teal-primary"
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-ink">Email Address</label>
                      <input
                        type="email"
                        required
                        value={signUpEmail}
                        onChange={(e) => setSignUpEmail(e.target.value)}
                        placeholder="e.g. ananya.r@coimbatore.in"
                        className="w-full px-3.5 py-2.5 rounded-2xl border border-line bg-limestone text-ink text-xs sm:text-sm font-medium focus:outline-none focus:border-teal-primary"
                      />
                    </div>

                    {/* Vehicle Plate & Type Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-ink">License Plate</label>
                        <input
                          type="text"
                          value={signUpPlate}
                          onChange={(e) => setSignUpPlate(e.target.value.toUpperCase())}
                          placeholder="TN 38 CY 8842"
                          className="w-full px-3 py-2.5 rounded-2xl border border-line bg-limestone text-ink text-xs sm:text-sm font-bold tracking-wider focus:outline-none focus:border-teal-primary uppercase"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-ink">Primary Vehicle</label>
                        <select
                          value={signUpVehicleType}
                          onChange={(e) => setSignUpVehicleType(e.target.value as VehicleType)}
                          className="w-full px-3 py-2.5 rounded-2xl border border-line bg-limestone text-ink text-xs sm:text-sm font-medium focus:outline-none focus:border-teal-primary"
                        >
                          <option value="hatchback">Car / Hatchback</option>
                          <option value="two_wheeler">Two-Wheeler</option>
                          <option value="ev">Electric Vehicle (EV)</option>
                        </select>
                      </div>
                    </div>

                    {/* Passwords */}
                    <div className="space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-ink">Password</label>
                          <input
                            type="password"
                            required
                            value={signUpPassword}
                            onChange={(e) => setSignUpPassword(e.target.value)}
                            placeholder="Min 6 characters"
                            className="w-full px-3 py-2.5 rounded-2xl border border-line bg-limestone text-ink text-xs sm:text-sm font-medium focus:outline-none focus:border-teal-primary"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-ink">Confirm Password</label>
                          <input
                            type="password"
                            required
                            value={signUpConfirmPassword}
                            onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                            placeholder="Re-enter password"
                            className={`w-full px-3 py-2.5 rounded-2xl border bg-limestone text-ink text-xs sm:text-sm font-medium focus:outline-none ${
                              signUpConfirmPassword && signUpConfirmPassword !== signUpPassword
                                ? 'border-clay'
                                : 'border-line focus:border-teal-primary'
                            }`}
                          />
                        </div>
                      </div>

                      {/* Password Strength Indicator */}
                      {signUpPassword && (
                        <div className="space-y-1 pt-1">
                          <div className="flex items-center justify-between text-[10px] text-ink-soft">
                            <span>Password Strength:</span>
                            <span className="font-bold">{passwordStrength.label}</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-sand-200 dark:bg-graphite-light overflow-hidden">
                            <div
                              style={{ width: `${passwordStrength.score}%` }}
                              className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Disability Permit Option */}
                    <div className="p-3 rounded-2xl bg-limestone border border-line space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="signup-permit"
                          checked={signUpHasPermit}
                          onChange={(e) => setSignUpHasPermit(e.target.checked)}
                          className="rounded border-line text-teal-primary"
                        />
                        <label htmlFor="signup-permit" className="text-xs font-semibold text-ink cursor-pointer">
                          I possess a Disability / Accessible Parking Permit (UDID)
                        </label>
                      </div>
                      {signUpHasPermit && (
                        <input
                          type="text"
                          value={signUpPermitNumber}
                          onChange={(e) => setSignUpPermitNumber(e.target.value)}
                          placeholder="e.g. CBE-PWD-2026-9081"
                          className="w-full px-3 py-2 rounded-xl border border-line bg-paper text-ink text-xs"
                        />
                      )}
                    </div>

                    {/* Submit Registration */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3.5 px-4 rounded-2xl bg-teal-primary hover:bg-teal-dark text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Registering Account...</span>
                        </div>
                      ) : (
                        <>
                          <span>Create Account & Sign In</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    {/* Back to Sign In */}
                    <div className="text-center pt-1">
                      <span className="text-xs text-ink-soft">Already registered? </span>
                      <button
                        type="button"
                        onClick={() => {
                          setCitizenView('signin');
                          setErrorMessage(null);
                        }}
                        className="text-xs text-teal-primary hover:underline font-bold"
                      >
                        Sign in here
                      </button>
                    </div>
                  </form>
                )}

                {/* 3. CITIZEN FORGOT PASSWORD */}
                {citizenView === 'forgot_password' && (
                  <div className="space-y-4">
                    <div>
                      <h2 className="font-serif text-2xl font-bold text-ink">
                        Reset Password
                      </h2>
                      <p className="text-xs text-ink-soft mt-0.5">
                        Enter your registered email address to receive password reset instructions.
                      </p>
                    </div>

                    {!forgotSent ? (
                      <form onSubmit={handleForgotPassword} className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-ink">
                            Registered Email Address
                          </label>
                          <div className="relative">
                            <input
                              type="email"
                              required
                              value={forgotEmail}
                              onChange={(e) => setForgotEmail(e.target.value)}
                              placeholder="ananya.r@coimbatore.in"
                              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-line bg-limestone text-ink text-xs sm:text-sm font-medium focus:outline-none focus:border-teal-primary"
                            />
                            <Mail className="w-4 h-4 text-ink-soft absolute left-3.5 top-3" />
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={isLoading}
                          className="w-full py-3.5 px-4 rounded-2xl bg-teal-primary hover:bg-teal-dark text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                        >
                          {isLoading ? 'Sending instructions...' : 'Send Reset Link'}
                        </button>
                      </form>
                    ) : (
                      <div className="p-4 rounded-2xl bg-teal-pale border border-teal-primary/30 text-teal-dark space-y-3 text-center">
                        <CheckCircle2 className="w-8 h-8 text-teal-primary mx-auto" />
                        <div>
                          <div className="font-bold text-sm">Check your inbox</div>
                          <p className="text-xs text-teal-dark/80 mt-1">
                            We have dispatched password recovery instructions to{' '}
                            <strong className="text-teal-dark">{forgotEmail}</strong>.
                          </p>
                        </div>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setCitizenView('signin');
                        setForgotSent(false);
                        setErrorMessage(null);
                      }}
                      className="w-full py-2.5 px-4 rounded-2xl border border-line hover:bg-limestone text-xs font-bold text-ink transition-colors flex items-center justify-center gap-1.5"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Citizen Sign In</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ===================================================== */}
            {/* AUTHORITY MODE FORMS                                  */}
            {/* ===================================================== */}
            {roleMode === 'admin' && (
              <div>
                {/* 1. AUTHORITY 3-FACTOR SIGN IN */}
                {authorityView === 'signin' && (
                  <form onSubmit={handleAuthoritySignIn} className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-teal-dark" />
                        <h2 className="font-serif text-2xl font-bold text-ink">
                          Municipal Operations Sign In
                        </h2>
                      </div>
                      <p className="text-xs text-ink-soft mt-0.5">
                        Coimbatore City Corporation Mobility & Traffic Command Console
                      </p>
                    </div>

                    {/* Lockout or Authentication Error Banner */}
                    {lockoutSeconds > 0 ? (
                      <div
                        id="authority-lockout-banner"
                        className="p-3.5 rounded-2xl bg-clay/15 border border-clay/30 text-clay text-xs space-y-1"
                      >
                        <div className="flex items-center gap-2 font-bold">
                          <AlertCircle className="w-4 h-4 text-clay shrink-0" />
                          <span>Too many attempts. Try again in {lockoutSeconds} seconds.</span>
                        </div>
                        <p className="text-[11px] opacity-90 pl-6">
                          Account access is temporarily suspended for security compliance.
                        </p>
                      </div>
                    ) : authorityError ? (
                      <div
                        id="authority-error-banner"
                        className="p-3.5 rounded-2xl bg-clay/15 border border-clay/30 text-clay text-xs flex items-start gap-2 font-semibold"
                      >
                        <AlertCircle className="w-4 h-4 text-clay shrink-0 mt-0.5" />
                        <span>{authorityError}</span>
                      </div>
                    ) : null}

                    {/* Field 1: Municipal Staff ID */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-ink flex items-center justify-between">
                        <span>Municipal Staff ID</span>
                        <span className="text-[10px] text-ink-soft font-normal">Fixed Authority ID</span>
                      </label>
                      <div className="relative">
                        <input
                          id="input-authority-staff-id"
                          type="text"
                          disabled={lockoutSeconds > 0 || isVerifying || isLoading}
                          value={authorityStaffId}
                          onChange={(e) => {
                            setAuthorityStaffId(e.target.value.toUpperCase());
                            setAuthorityError(null);
                          }}
                          placeholder="e.g. ADMIN01"
                          className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-line bg-limestone text-ink text-xs sm:text-sm font-mono font-bold tracking-wider uppercase focus:outline-none focus:border-teal-dark disabled:opacity-50"
                        />
                        <Shield className="w-4 h-4 text-teal-dark absolute left-3.5 top-3" />
                      </div>
                    </div>

                    {/* Field 2: Municipal Security Password */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-ink">
                        Municipal Security Password
                      </label>
                      <div className="relative">
                        <input
                          id="input-authority-password"
                          type={showAuthorityPassword ? 'text' : 'password'}
                          disabled={lockoutSeconds > 0 || isVerifying || isLoading}
                          value={authorityPassword}
                          onChange={(e) => {
                            setAuthorityPassword(e.target.value);
                            setAuthorityError(null);
                          }}
                          placeholder="••••••••"
                          className="w-full pl-10 pr-10 py-2.5 rounded-2xl border border-line bg-limestone text-ink text-xs sm:text-sm font-medium focus:outline-none focus:border-teal-dark disabled:opacity-50"
                        />
                        <KeyRound className="w-4 h-4 text-teal-dark absolute left-3.5 top-3" />
                        <button
                          type="button"
                          onClick={() => setShowAuthorityPassword(!showAuthorityPassword)}
                          className="absolute right-3.5 top-3 text-ink-soft hover:text-ink cursor-pointer"
                        >
                          {showAuthorityPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Field 3: Station Badge Code */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-ink">Station Badge Code</label>
                        <span className="text-[10px] text-teal-dark font-semibold">3FA Hardware Token</span>
                      </div>
                      <input
                        id="input-authority-badge-code"
                        type="text"
                        disabled={lockoutSeconds > 0 || isVerifying || isLoading}
                        value={authorityBadgeCode}
                        onChange={(e) => {
                          setAuthorityBadgeCode(e.target.value.toUpperCase());
                          setAuthorityError(null);
                        }}
                        placeholder="e.g. CBE-01"
                        className="w-full px-3.5 py-2.5 rounded-2xl border border-line bg-limestone text-ink text-xs font-mono font-bold tracking-widest uppercase focus:outline-none focus:border-teal-dark disabled:opacity-50"
                      />
                      <p className="text-[11px] text-ink-soft pl-1">
                        Printed on your municipal staff badge.
                      </p>
                    </div>

                    {/* Authority Submit Button */}
                    <button
                      type="submit"
                      id="btn-authority-submit"
                      disabled={
                        !authorityStaffId.trim() ||
                        !authorityPassword ||
                        !authorityBadgeCode.trim() ||
                        lockoutSeconds > 0 ||
                        isLoading ||
                        isVerifying
                      }
                      className="w-full py-3.5 px-4 rounded-2xl bg-teal-dark hover:bg-teal-primary disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.99]"
                    >
                      {isVerifying ? (
                        <div className="flex items-center gap-2">
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Verifying station credentials…</span>
                        </div>
                      ) : isLoading ? (
                        <div className="flex items-center gap-2">
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Authenticating 3-Factor Clearance...</span>
                        </div>
                      ) : (
                        <>
                          <Shield className="w-4 h-4" />
                          <span>Sign In to Municipal Operations</span>
                        </>
                      )}
                    </button>

                    {/* Request Access Link */}
                    <div className="pt-2 text-center border-t border-line">
                      <span className="text-xs text-ink-soft">New CCMC field engineer or warden? </span>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthorityView('request_access');
                          setAuthorityError(null);
                        }}
                        className="text-xs text-teal-dark hover:underline font-bold cursor-pointer"
                      >
                        Request authority access
                      </button>
                    </div>
                  </form>
                )}

                {/* 2. AUTHORITY REQUEST ACCESS FORM */}
                {authorityView === 'request_access' && (
                  <div className="space-y-4">
                    <div>
                      <h2 className="font-serif text-2xl font-bold text-ink">
                        Request Authority Clearance
                      </h2>
                      <p className="text-xs text-ink-soft mt-0.5">
                        Submit credentials for review by the Chief Mobility Commissioner.
                      </p>
                    </div>

                    {!requestSubmittedRef ? (
                      <form onSubmit={handleAuthorityRequestSubmit} className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-ink">Full Name</label>
                          <input
                            type="text"
                            required
                            value={reqFullName}
                            onChange={(e) => setReqFullName(e.target.value)}
                            placeholder="e.g. Ramesh Chandran"
                            className="w-full px-3 py-2 rounded-xl border border-line bg-limestone text-ink text-xs"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-ink">Department</label>
                          <select
                            value={reqDepartment}
                            onChange={(e) => setReqDepartment(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-line bg-limestone text-ink text-xs"
                          >
                            <option value="CCMC Traffic & Mobility Wing">CCMC Traffic & Mobility Wing</option>
                            <option value="Smart City Operations Control">Smart City Operations Control</option>
                            <option value="Ward Parking Enforcement">Ward Parking Enforcement</option>
                            <option value="Urban Transport Infrastructure">Urban Transport Infrastructure</option>
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-ink">Govt Email</label>
                            <input
                              type="email"
                              required
                              value={reqGovEmail}
                              onChange={(e) => setReqGovEmail(e.target.value)}
                              placeholder="ramesh@ccmc.gov.in"
                              className="w-full px-3 py-2 rounded-xl border border-line bg-limestone text-ink text-xs"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-bold text-ink">Badge / Staff ID</label>
                            <input
                              type="text"
                              value={reqBadgeId}
                              onChange={(e) => setReqBadgeId(e.target.value)}
                              placeholder="CCMC-ENG-089"
                              className="w-full px-3 py-2 rounded-xl border border-line bg-limestone text-ink text-xs uppercase font-mono"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-ink">Reason / Clearance Purpose</label>
                          <textarea
                            rows={2}
                            required
                            value={reqReason}
                            onChange={(e) => setReqReason(e.target.value)}
                            placeholder="e.g. Assigned to West Zone parking sensor telemetry monitoring and dynamic tariff audit."
                            className="w-full p-2.5 rounded-xl border border-line bg-limestone text-ink text-xs resize-none"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={isLoading}
                          className="w-full py-3 px-4 rounded-xl bg-teal-dark hover:bg-teal-primary text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
                        >
                          {isLoading ? 'Submitting clearance request...' : 'Submit Request for Commissioner Review'}
                        </button>
                      </form>
                    ) : (
                      <div className="p-4 rounded-2xl bg-teal-pale border border-teal-primary/30 text-teal-dark space-y-3 text-center">
                        <CheckCircle2 className="w-8 h-8 text-teal-dark mx-auto" />
                        <div>
                          <div className="font-bold text-sm">Request Received · Pending Approval</div>
                          <div className="text-xs font-mono font-bold bg-white/60 py-1 px-2.5 rounded-lg inline-block my-1.5 border border-teal-primary/20">
                            Reference: {requestSubmittedRef}
                          </div>
                          <p className="text-xs text-teal-dark/80">
                            Your clearance request has been forwarded to Chief Engineer Karthik Subramanian for administrative sign-off.
                          </p>
                        </div>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setAuthorityView('signin');
                        setRequestSubmittedRef(null);
                        setAuthorityError(null);
                      }}
                      className="w-full py-2 px-3 rounded-xl border border-line hover:bg-limestone text-xs font-bold text-ink transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Authority Sign In</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ========================================================= */}
          {/* DEMO ACCESS COLLAPSIBLE DISCLOSURE (FOR JUDGES/REVIEWERS) */}
          {/* ========================================================= */}
          <div className="rounded-2xl bg-paper border border-line shadow-xs overflow-hidden">
            <button
              type="button"
              id="btn-toggle-demo-disclosure"
              onClick={() => setIsDemoDisclosureOpen(!isDemoDisclosureOpen)}
              className="w-full p-4 flex items-center justify-between hover:bg-limestone transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-custom" />
                <span className="text-xs font-bold text-ink">
                  Demo access (for judges/reviewers)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-ink-soft font-semibold">
                  {isDemoDisclosureOpen ? 'Hide demo helper' : 'Show pre-set accounts'}
                </span>
                <ChevronRight
                  className={`w-3.5 h-3.5 text-ink-soft transition-transform duration-200 ${
                    isDemoDisclosureOpen ? 'rotate-90' : ''
                  }`}
                />
              </div>
            </button>

            {isDemoDisclosureOpen && (
              <div className="px-4 pb-4 pt-1 border-t border-line space-y-3 bg-limestone/50 animate-in fade-in duration-200">
                <p className="text-[11px] text-ink-soft leading-relaxed">
                  Select a persona below to populate fixed evaluation credentials into the active form without auto-submitting.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Fill Demo Citizen Button */}
                  <div className="p-3 rounded-xl border border-line bg-paper flex flex-col justify-between gap-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-teal-pale text-teal-dark font-bold text-[10px] flex items-center justify-center">
                          AR
                        </div>
                        <span className="text-xs font-bold text-ink">Citizen Driver</span>
                      </div>
                      <div className="text-[10px] text-ink-soft font-mono mt-1.5 space-y-0.5">
                        <div>ID: citizen@curbsense.city</div>
                        <div>Pass: coimbatore2026</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      id="btn-fill-demo-citizen"
                      onClick={fillCitizenDemoCredentials}
                      className="w-full py-1.5 px-2.5 rounded-lg bg-teal-pale hover:bg-teal-primary hover:text-white text-teal-dark font-bold text-[11px] transition-colors cursor-pointer text-center"
                    >
                      Fill demo citizen credentials
                    </button>
                  </div>

                  {/* Fill Demo Authority Button */}
                  <div className="p-3 rounded-xl border border-line bg-paper flex flex-col justify-between gap-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-clay/15 text-clay font-bold text-[10px] flex items-center justify-center">
                          AD
                        </div>
                        <span className="text-xs font-bold text-ink">Municipal Authority</span>
                      </div>
                      <div className="text-[10px] text-ink-soft font-mono mt-1.5 space-y-0.5">
                        <div>Staff ID: ADMIN01</div>
                        <div>Pass: SMARTCBE2026</div>
                        <div>Badge: CBE-01</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      id="btn-fill-demo-authority"
                      onClick={fillAuthorityDemoCredentials}
                      className="w-full py-1.5 px-2.5 rounded-lg bg-clay/15 hover:bg-clay hover:text-white text-clay font-bold text-[11px] transition-colors cursor-pointer text-center"
                    >
                      Fill demo authority credentials
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
