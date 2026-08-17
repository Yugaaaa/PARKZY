import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  ParkingZone,
  ParkingSpace,
  SpaceStatus,
  SpaceKind,
  Reservation,
  AvailabilityEvent,
  AuthorityAction,
  AuditEntry,
  CommunityReport,
  AuthorityAlert,
  NotificationItem,
  User,
  VehicleType,
  ZonePricingRecommendation,
  AccessibilityPermit,
  StaffMember,
  PolicySettings,
  NotificationPreferences,
  CitizenTrustStat,
} from '../types';
import {
  INITIAL_ZONES,
  generateInitialSpaces,
  INITIAL_ALERTS,
  INITIAL_COMMUNITY_REPORTS,
  INITIAL_AUDIT_LOG,
  DEMO_USERS,
  INITIAL_NOTIFICATIONS,
  INITIAL_STAFF_MEMBERS,
  INITIAL_PENDING_PERMITS,
  INITIAL_POLICY_SETTINGS,
  INITIAL_NOTIFICATION_PREFERENCES,
  INITIAL_CITIZEN_TRUST_STATS,
} from '../data/seedData';
import { Coordinates, COIMBATORE_CENTER } from '../utils/geoUtils';

interface CurbContextType {
  // Theme
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  surfaceMode: 'opaque' | 'translucent';
  toggleSurfaceMode: () => void;

  // Auth / Persona
  currentUser: User;
  isAuthenticated: boolean;
  welcomeToast: string | null;
  setWelcomeToast: (msg: string | null) => void;
  switchUserRole: (role: 'citizen' | 'admin') => void;
  loginAsUser: (user: User) => void;
  loginWithCredentials: (
    email: string,
    role: 'citizen' | 'admin',
    name?: string,
    vehiclePlate?: string,
    password?: string
  ) => { success: boolean; code?: string; message?: string; user?: User };
  loginAuthority3Factor: (
    staffId: string,
    password: string,
    badgeCode: string
  ) => {
    success: boolean;
    errorType?: 'UNKNOWN_STAFF' | 'WRONG_PASSWORD' | 'WRONG_BADGE';
    message?: string;
    user?: User;
  };
  submitAuthorityAccessRequest: (data: {
    fullName: string;
    department: string;
    email: string;
    badgeId: string;
    reason: string;
  }) => { success: boolean; refId: string; message: string };
  logoutUser: () => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalInitialRole: 'citizen' | 'admin';
  openAuthModal: (role?: 'citizen' | 'admin') => void;

  // Map & Geolocation
  userLocation: Coordinates | null;
  setUserLocation: (loc: Coordinates | null) => void;
  destinationLocation: { lat: number; lng: number; name?: string } | null;
  setDestinationLocation: (loc: { lat: number; lng: number; name?: string } | null) => void;
  activeNavSpace: ParkingSpace | null;
  setActiveNavSpace: (space: ParkingSpace | null) => void;
  isNavigating: boolean;
  setIsNavigating: (nav: boolean) => void;

  // Zones & Spaces
  zones: ParkingZone[];
  spaces: ParkingSpace[];
  selectedZoneId: string | null;
  setSelectedZoneId: (id: string | null) => void;
  selectedVehicleFilter: VehicleType | 'all';
  setSelectedVehicleFilter: (filter: VehicleType | 'all') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  getZoneSpaces: (zoneId: string) => ParkingSpace[];
  getZoneStats: (zoneId: string) => {
    total: number;
    available: number;
    held: number;
    occupied: number;
    conflict: number;
    outOfService: number;
    occupancyRate: number;
    twoWheelerAvailable: number;
    evAvailable: number;
    accessibleAvailable: number;
    standardAvailable: number;
  };

  // Authority Zone & Space CRUD Operations
  updateSpaceStatus: (spaceId: string, newStatus: SpaceStatus, reason?: string) => void;
  updateZone: (zoneId: string, updates: Partial<ParkingZone>) => void;
  addZone: (zoneData: Omit<ParkingZone, 'id'>, initialSpacesCount?: number) => void;
  bulkUpdateZoneAvailability: (zoneId: string, status: 'available' | 'out_of_service', reason: string, autoRestoreAt?: string) => void;
  addSpaceToZone: (zoneId: string, spaceData: { label: string; kind: SpaceKind; hourlyRate: number }) => void;
  removeSpace: (spaceId: string) => void;

  // Active Hold & Reservation
  activeReservation: Reservation | null;
  reservationHistory: Reservation[];
  holdSecondsRemaining: number;
  holdFormattedTime: string;
  sessionSecondsRemaining: number;
  sessionFormattedTime: string;
  createHold: (spaceId: string, vehicleType: VehicleType, durationHours?: number) => { success: boolean; message?: string };
  confirmReservation: () => void;
  checkInReservation: () => void;
  endActiveSession: () => void;
  cancelHold: () => void;

  // Community Signals & Trust
  communityReports: CommunityReport[];
  submitCommunityReport: (report: {
    zoneId: string;
    zoneName: string;
    spaceLabel?: string;
    type: CommunityReport['type'];
    description: string;
    photoUrl?: string;
  }) => void;
  corroborateCommunityReport: (reportId: string) => void;
  dismissCommunityReport: (reportId: string) => void;
  citizenTrustStats: Record<string, CitizenTrustStat>;

  // Authority Admin Alerts & Incident Management
  alerts: AuthorityAlert[];
  openAlertsCount: number;
  acknowledgeAlert: (alertId: string) => void;
  assignAlert: (alertId: string, staffName: string) => void;
  resolveAlert: (alertId: string) => void;
  resolveAlertWithNote: (alertId: string, resolutionNote: string, staffName?: string) => void;
  dismissAlert: (alertId: string) => void;

  // Dynamic Pricing & Policy Settings
  pricingRecommendations: ZonePricingRecommendation[];
  approveZonePricing: (zoneId: string, newRate: number) => void;
  holdCurrentZonePricing: (zoneId: string) => void;
  policySettings: PolicySettings;
  updatePolicySettings: (settings: Partial<PolicySettings>) => void;
  resetPolicySettings: () => void;

  // Audit Log
  auditLog: AuditEntry[];

  // Staff & Settings
  staffMembers: StaffMember[];
  addStaffMember: (staff: { name: string; email: string; role: StaffMember['role']; department: string }) => void;
  toggleStaffStatus: (staffId: string) => void;
  notificationPreferences: NotificationPreferences;
  updateNotificationPreferences: (prefs: Partial<NotificationPreferences>) => void;

  // Notifications & Permits
  notifications: NotificationItem[];
  unreadNotificationsCount: number;
  markAllNotificationsRead: () => void;
  permitApplication: AccessibilityPermit | null;
  pendingPermits: AccessibilityPermit[];
  reviewPermit: (permitNumber: string, status: 'verified' | 'rejected', reason?: string) => void;
  submitPermitApplication: (data: { permitNumber: string; holderName: string; disabilityId: string; documentName?: string }) => void;
}

const CurbContext = createContext<CurbContextType | undefined>(undefined);

export const DEMO_HOLD_SECONDS = 15;
export const DEMO_SESSION_SECONDS = 60;

const withDisplayName = (user: User, displayName?: string): User => {
  const name = displayName?.trim();
  if (!name) return user;
  const avatarInitials = name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  return { ...user, name, avatarInitials: avatarInitials || user.avatarInitials };
};

const makeCommonAuthorityUser = (): User => ({
  ...DEMO_USERS.admin,
  name: 'CCMC Authority',
  title: 'Municipal Authority',
  avatarInitials: 'CA',
});

export const CurbProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('curbsense_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('curbsense_theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const [surfaceMode, setSurfaceMode] = useState<'opaque' | 'translucent'>(() => {
    const saved = localStorage.getItem('curbsense_surface_mode');
    return saved === 'translucent' ? 'translucent' : 'opaque';
  });

  useEffect(() => {
    document.documentElement.dataset.surfaceMode = surfaceMode;
    localStorage.setItem('curbsense_surface_mode', surfaceMode);
  }, [surfaceMode]);

  const toggleSurfaceMode = useCallback(() => {
    setSurfaceMode((prev) => (prev === 'opaque' ? 'translucent' : 'opaque'));
  }, []);

  // 2. Persona & Auth State - Starts on Login Page by default
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const [welcomeToast, setWelcomeToast] = useState<string | null>(null);

  const [currentUser, setCurrentUser] = useState<User>(() => {
    return DEMO_USERS.citizen;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalInitialRole, setAuthModalInitialRole] = useState<'citizen' | 'admin'>('citizen');

  const openAuthModal = useCallback((role: 'citizen' | 'admin' = 'citizen') => {
    setAuthModalInitialRole(role);
    setIsAuthModalOpen(true);
  }, []);

  const switchUserRole = useCallback((role: 'citizen' | 'admin') => {
    const targetUser = role === 'admin' ? makeCommonAuthorityUser() : DEMO_USERS.citizen;
    setCurrentUser(targetUser);
    setIsAuthenticated(true);
    localStorage.setItem('curbsense_authenticated', 'true');
    localStorage.setItem('curbsense_user', JSON.stringify(targetUser));
  }, []);

  const loginAsUser = useCallback((user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('curbsense_authenticated', 'true');
    localStorage.setItem('curbsense_user', JSON.stringify(user));
    setWelcomeToast(`Welcome back, ${user.name}! You are signed in as ${user.role === 'admin' ? 'Municipal Authority' : 'Citizen'}.`);
    setIsAuthModalOpen(false);
  }, []);

  const loginAuthority3Factor = useCallback(
    (staffId: string, password: string, badgeCode: string) => {
      const cleanStaffId = staffId.trim().toUpperCase();
      const cleanBadgeCode = badgeCode.trim().toUpperCase();

      // Check Staff ID
      if (cleanStaffId !== 'ADMIN01' && cleanStaffId !== 'ADMIN@DEMO' && cleanStaffId !== 'PRIYA.MOBILITY@CCMC.GOV.IN') {
        return {
          success: false,
          errorType: 'UNKNOWN_STAFF' as const,
          message: "We couldn't find that Staff ID. Contact your municipal IT administrator if you believe this is an error.",
        };
      }

      // Check Password
      if (password !== 'SMARTCBE2026' && password !== 'coimbatore2026') {
        return {
          success: false,
          errorType: 'WRONG_PASSWORD' as const,
          message: 'Incorrect security password.',
        };
      }

      // Check Station Badge Code
      if (cleanBadgeCode !== 'CBE-01' && cleanBadgeCode !== 'CCMC-2026' && cleanBadgeCode !== 'CBE-02') {
        return {
          success: false,
          errorType: 'WRONG_BADGE' as const,
          message: 'Station badge not recognized for this account. Check the code on your badge and try again.',
        };
      }

      const user = makeCommonAuthorityUser();
      setCurrentUser(user);
      setIsAuthenticated(true);
      localStorage.setItem('curbsense_authenticated', 'true');
      localStorage.setItem('curbsense_user', JSON.stringify(user));
      setWelcomeToast(`Welcome back, ${user.name}! Authenticated for CCMC Traffic Console.`);
      setIsAuthModalOpen(false);
      return { success: true, user };
    },
    []
  );

  const loginWithCredentials = useCallback(
    (
      email: string,
      role: 'citizen' | 'admin',
      name?: string,
      vehiclePlate?: string,
      password?: string
    ) => {
      const cleanEmail = email.trim().toLowerCase();

      // Aliases handling
      if (role === 'admin') {
        // Check if user entered a citizen-only demo email or known citizen email
        if (
          cleanEmail === 'citizen@demo' ||
          cleanEmail === 'citizen@curbsense.city' ||
          cleanEmail === 'citizen@curbsense.in' ||
          cleanEmail === 'ananya.r@coimbatore.in' ||
          cleanEmail === 'suresh.k@gmail.com'
        ) {
          return {
            success: false,
            code: 'NOT_ADMIN',
            message: "This account doesn't have authority access. Switch to Citizen sign-in below.",
          };
        }

        if (cleanEmail === 'admin01' || cleanEmail === 'admin@demo' || cleanEmail === 'admin@curbsense.in') {
          const user = makeCommonAuthorityUser();
          setCurrentUser(user);
          setIsAuthenticated(true);
          localStorage.setItem('curbsense_authenticated', 'true');
          localStorage.setItem('curbsense_user', JSON.stringify(user));
          setWelcomeToast(`Welcome back, ${user.name}! Authenticated for CCMC Traffic Console.`);
          setIsAuthModalOpen(false);
          return { success: true, user };
        }

        if (cleanEmail === 'priya.mobility@ccmc.gov.in') {
          const user = makeCommonAuthorityUser();
          setCurrentUser(user);
          setIsAuthenticated(true);
          localStorage.setItem('curbsense_authenticated', 'true');
          localStorage.setItem('curbsense_user', JSON.stringify(user));
          setWelcomeToast(`Welcome back, ${user.name}! Authenticated for CCMC Traffic Console.`);
          setIsAuthModalOpen(false);
          return { success: true, user };
        }

        // Match existing admin user
        let foundAdmin = Object.values(DEMO_USERS).find(
          (u) => (u.email.toLowerCase() === cleanEmail || u.id.toLowerCase() === cleanEmail) && u.role === 'admin'
        );

        if (!foundAdmin) {
          // Generate new Officer profile
          const userName = name || 'Officer ' + (cleanEmail.split('@')[0] || 'Admin');
          const initials = userName
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);

          foundAdmin = {
            id: `adm-${Date.now()}`,
            name: userName,
            email: cleanEmail,
            role: 'admin',
            title: 'Municipal Traffic Operations Officer',
            avatarInitials: initials || 'CC',
            vehiclePlate: vehiclePlate || 'TN 38 G 0991',
            defaultVehicle: 'hatchback',
            permitStatus: 'none',
          };
        }

        const authorityUser = makeCommonAuthorityUser();
        setCurrentUser(authorityUser);
        setIsAuthenticated(true);
        localStorage.setItem('curbsense_authenticated', 'true');
        localStorage.setItem('curbsense_user', JSON.stringify(authorityUser));
        setWelcomeToast(`Welcome back, ${authorityUser.name}! Municipal clearance active.`);
        setIsAuthModalOpen(false);
        return { success: true, user: authorityUser };
      }

      // Citizen Sign In
      if (
        cleanEmail === 'citizen@demo' ||
        cleanEmail === 'citizen@curbsense.city' ||
        cleanEmail === 'citizen@curbsense.in' ||
        cleanEmail === 'ananya.r@coimbatore.in'
      ) {
        const user = withDisplayName(DEMO_USERS.citizen, name);
        setCurrentUser(user);
        setIsAuthenticated(true);
        localStorage.setItem('curbsense_authenticated', 'true');
        localStorage.setItem('curbsense_user', JSON.stringify(user));
        setWelcomeToast(`Welcome back, ${user.name}! You're signed in to Coimbatore Curbside.`);
        setIsAuthModalOpen(false);
        return { success: true, user };
      }

      if (cleanEmail === 'suresh.k@gmail.com') {
        const user = withDisplayName(DEMO_USERS.citizen_suresh, name);
        setCurrentUser(user);
        setIsAuthenticated(true);
        localStorage.setItem('curbsense_authenticated', 'true');
        localStorage.setItem('curbsense_user', JSON.stringify(user));
        setWelcomeToast(`Welcome back, ${user.name}! You're signed in to Coimbatore Curbside.`);
        setIsAuthModalOpen(false);
        return { success: true, user };
      }

      // Find or create citizen user
      let foundCitizen = Object.values(DEMO_USERS).find(
        (u) => u.email.toLowerCase() === cleanEmail && u.role === 'citizen'
      );

      if (!foundCitizen) {
        const userName = name || 'Citizen ' + (cleanEmail.split('@')[0] || 'Driver');
        const initials = userName
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);

        foundCitizen = {
          id: `usr-${Date.now()}`,
          name: userName,
          email: cleanEmail,
          role: 'citizen',
          avatarInitials: initials || 'CD',
          vehiclePlate: vehiclePlate || 'TN 38 BZ 4410',
          defaultVehicle: 'hatchback',
          permitStatus: 'none',
        };
      } else if (name?.trim()) {
        foundCitizen = withDisplayName(foundCitizen, name);
      }

      setCurrentUser(foundCitizen);
      setIsAuthenticated(true);
      localStorage.setItem('curbsense_authenticated', 'true');
      localStorage.setItem('curbsense_user', JSON.stringify(foundCitizen));
      setWelcomeToast(`Welcome, ${foundCitizen.name}! You're signed in to Coimbatore Curbside.`);
      setIsAuthModalOpen(false);
      return { success: true, user: foundCitizen };
    },
    []
  );

  const submitAuthorityAccessRequest = useCallback((data: {
    fullName: string;
    department: string;
    email: string;
    badgeId: string;
    reason: string;
  }) => {
    const refId = `CCMC-REQ-${Math.floor(1000 + Math.random() * 9000)}`;
    return {
      success: true,
      refId,
      message: `Your clearance request #${refId} has been logged with the CCMC Mobility Commissioner's Office.`,
    };
  }, []);

  const logoutUser = useCallback(() => {
    setIsAuthenticated(false);
    localStorage.setItem('curbsense_authenticated', 'false');
    localStorage.removeItem('curbsense_user');
  }, []);

  // 3. Map Geolocation & Destination State
  const [userLocation, setUserLocation] = useState<Coordinates | null>(COIMBATORE_CENTER);
  const [destinationLocation, setDestinationLocation] = useState<{ lat: number; lng: number; name?: string } | null>(null);
  const [activeNavSpace, setActiveNavSpace] = useState<ParkingSpace | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  // Automatically request browser geolocation on mount with graceful fallback
  useEffect(() => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (err) => {
          // Graceful fallback to Coimbatore Center
          setUserLocation(COIMBATORE_CENTER);
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    }
  }, []);

  // 4. Inventory State
  const [zones, setZones] = useState<ParkingZone[]>(INITIAL_ZONES);
  const [spaces, setSpaces] = useState<ParkingSpace[]>(() => generateInitialSpaces());
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [selectedVehicleFilter, setSelectedVehicleFilter] = useState<VehicleType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 5. Reservation State
  const [activeReservation, setActiveReservation] = useState<Reservation | null>(() => {
    const saved = localStorage.getItem('curbsense_active_res');
    if (saved) {
      try {
        const parsed: Reservation = JSON.parse(saved);
        const deadline = parsed.status === 'active_session' ? parsed.sessionExpiresAt : parsed.heldUntil;
        if (deadline && deadline > Date.now()) {
          return parsed;
        }
      } catch (e) {
        // ignore
      }
    }
    return null;
  });

  const [reservationHistory, setReservationHistory] = useState<Reservation[]>([
    {
      id: 'res-prev-1',
      spaceId: 'sp-rc-08',
      spaceLabel: 'RC-08',
      zoneId: 'zone-racecourse',
      zoneName: 'Race Course East',
      vehicleType: 'hatchback',
      vehiclePlate: 'TN 38 CY 8842',
      status: 'completed',
      createdAt: Date.now() - 26 * 60 * 60 * 1000,
      heldUntil: Date.now() - 26 * 60 * 60 * 1000 + DEMO_HOLD_SECONDS * 1000,
      durationHours: 2,
      hourlyRate: 30,
      totalAmount: 60,
      passCode: 'CS-8842-RC',
      qrPayload: 'https://curbsense.ccmc.gov.in/verify?code=CS-8842-RC',
      checkedInAt: Date.now() - 25 * 60 * 60 * 1000,
      completedAt: Date.now() - 23 * 60 * 60 * 1000,
    },
  ]);
  const [holdSecondsRemaining, setHoldSecondsRemaining] = useState<number>(0);
  const [sessionSecondsRemaining, setSessionSecondsRemaining] = useState<number>(0);

  // 6. Audit & Authority State
  const [auditLog, setAuditLog] = useState<AuditEntry[]>(INITIAL_AUDIT_LOG as AuditEntry[]);
  const [alerts, setAlerts] = useState<AuthorityAlert[]>(INITIAL_ALERTS);
  const [communityReports, setCommunityReports] = useState<CommunityReport[]>(INITIAL_COMMUNITY_REPORTS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [pricingActions, setPricingActions] = useState<Record<string, { status: 'approved' | 'held'; approvedRate?: number }>>({});
  const [policySettings, setPolicySettings] = useState<PolicySettings>(INITIAL_POLICY_SETTINGS);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>(INITIAL_STAFF_MEMBERS);
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences>(INITIAL_NOTIFICATION_PREFERENCES);
  const [citizenTrustStats, setCitizenTrustStats] = useState<Record<string, CitizenTrustStat>>(INITIAL_CITIZEN_TRUST_STATS);
  const [pendingPermits, setPendingPermits] = useState<AccessibilityPermit[]>(INITIAL_PENDING_PERMITS);

  // 7. Accessibility Permit
  const [permitApplication, setPermitApplication] = useState<AccessibilityPermit | null>({
    permitNumber: 'CBE-PWD-2026-9081',
    holderName: 'Ananya Ramanathan',
    disabilityId: 'TN-DIS-091244',
    issueAuthority: 'Coimbatore District Welfare Department',
    validUntil: '31 Dec 2027',
    status: 'verified',
    documentName: 'Govt_UDID_Card_Verified.pdf',
    submittedAt: '12 Aug 2026',
  });

  // Calculate Zone Statistics
  const getZoneSpaces = useCallback(
    (zoneId: string) => {
      return spaces.filter((s) => s.zoneId === zoneId);
    },
    [spaces]
  );

  const getZoneStats = useCallback(
    (zoneId: string) => {
      const zoneSpaces = spaces.filter((s) => s.zoneId === zoneId);
      const total = zoneSpaces.length;
      let available = 0;
      let held = 0;
      let occupied = 0;
      let conflict = 0;
      let outOfService = 0;
      let twoWheelerAvailable = 0;
      let evAvailable = 0;
      let accessibleAvailable = 0;
      let standardAvailable = 0;

      zoneSpaces.forEach((s) => {
        if (s.status === 'available') {
          available++;
          if (s.kind === 'two_wheeler') twoWheelerAvailable++;
          if (s.kind === 'ev') evAvailable++;
          if (s.kind === 'accessible') accessibleAvailable++;
          if (s.kind === 'standard') standardAvailable++;
        } else if (s.status === 'held') {
          held++;
        } else if (s.status === 'occupied' || s.status === 'reserved') {
          occupied++;
        } else if (s.status === 'conflict') {
          conflict++;
        } else if (s.status === 'out_of_service') {
          outOfService++;
        }
      });

      const inUseCount = held + occupied;
      const occupancyRate = total > 0 ? Math.round((inUseCount / total) * 100) : 0;

      return {
        total,
        available,
        held,
        occupied,
        conflict,
        outOfService,
        occupancyRate,
        twoWheelerAvailable,
        evAvailable,
        accessibleAvailable,
        standardAvailable,
      };
    },
    [spaces]
  );

  // Dynamic Pricing Recommendations Computation with Policy Settings Integration
  const pricingRecommendations = useMemo<ZonePricingRecommendation[]>(() => {
    const { floorMultiplier, capMultiplier, maxStepPercent, sensitivity } = policySettings;

    // Weight coefficients based on sensitivity setting
    let currWeight = 0.6;
    let foreWeight = 0.4;
    let surgeFactor = 0.6;
    if (sensitivity === 'low') {
      currWeight = 0.75;
      foreWeight = 0.25;
      surgeFactor = 0.4;
    } else if (sensitivity === 'aggressive') {
      currWeight = 0.5;
      foreWeight = 0.5;
      surgeFactor = 0.8;
    }

    return zones.map((zone) => {
      const stats = getZoneStats(zone.id);
      const currentPressure = stats.occupancyRate; // 0-100%
      const forecastPressure = Math.min(
        100,
        Math.max(10, Math.round(currentPressure * 1.08 + (zone.id === 'zone-gandhipuram' ? 8 : -2)))
      );

      // Combined pressure index
      const combinedPressure = Math.round(currWeight * currentPressure + foreWeight * forecastPressure);

      // Target dynamic multiplier bounded by floorMultiplier and capMultiplier
      let targetMultiplier = 1.0;
      if (combinedPressure > 70) {
        targetMultiplier = 1.0 + ((combinedPressure - 70) / 30) * surgeFactor;
      } else if (combinedPressure < 40) {
        targetMultiplier = 1.0 - ((40 - combinedPressure) / 40) * (1.0 - floorMultiplier);
      }

      // Bound to policy floor and cap
      targetMultiplier = Math.min(capMultiplier, Math.max(floorMultiplier, targetMultiplier));

      // Max step per review restriction (e.g. +-15%)
      const maxMultiplier = 1.0 + maxStepPercent / 100;
      const minMultiplier = Math.max(floorMultiplier, 1.0 - maxStepPercent / 100);
      const effectiveMultiplier = Math.min(maxMultiplier, Math.max(minMultiplier, targetMultiplier));

      const rawRecRate = zone.hourlyRate * effectiveMultiplier;
      const recommendedRate = Math.round(rawRecRate / 5) * 5; // rounded to nearest 5 INR
      const changePercent = Math.round(((recommendedRate - zone.hourlyRate) / zone.hourlyRate) * 100);

      const override = pricingActions[zone.id];

      const explanation = `Occupancy pressure is ${combinedPressure}% (${Math.round(currWeight * 100)}% curr: ${currentPressure}% + ${Math.round(foreWeight * 100)}% fcst: ${forecastPressure}%). Recommendation is ₹${recommendedRate}/hr (${effectiveMultiplier.toFixed(2)}× base), bounded by ±${maxStepPercent}% max-change rule.`;

      return {
        zoneId: zone.id,
        zoneName: zone.name,
        area: zone.area,
        baseRate: zone.hourlyRate,
        currentRate: override?.status === 'approved' && override.approvedRate ? override.approvedRate : zone.hourlyRate,
        recommendedRate,
        occupancyPressureCurrent: currentPressure,
        occupancyPressureForecast: forecastPressure,
        combinedPressure,
        rateMultiplier: Number(effectiveMultiplier.toFixed(2)),
        changePercent,
        explanation,
        status: override ? override.status : 'pending',
        approvedRate: override?.approvedRate,
      };
    });
  }, [zones, getZoneStats, pricingActions, policySettings]);

  // Demo hold and post-check-in session timers.
  useEffect(() => {
    if (!activeReservation || !['held', 'active_session'].includes(activeReservation.status)) {
      setHoldSecondsRemaining(0);
      setSessionSecondsRemaining(0);
      return;
    }

    const isSession = activeReservation.status === 'active_session';
    const deadline = isSession ? activeReservation.sessionExpiresAt : activeReservation.heldUntil;
    if (!deadline) return;

    const interval = setInterval(() => {
      const remainingSec = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      if (isSession) setSessionSecondsRemaining(remainingSec);
      else setHoldSecondsRemaining(remainingSec);

      if (remainingSec <= 0) {
        clearInterval(interval);
        if (isSession) {
          const completed: Reservation = { ...activeReservation, status: 'completed', completedAt: Date.now() };
          setSpaces((prev) => prev.map((s) => (s.id === activeReservation.spaceId ? { ...s, status: 'available', heldUntil: null } : s)));
          setActiveReservation(null);
          localStorage.removeItem('curbsense_active_res');
          setReservationHistory((prev) => [completed, ...prev]);
          setNotifications((prev) => [{ id: `notif-session-${Date.now()}`, title: 'Demo session ended', message: `The ${DEMO_SESSION_SECONDS}-second demo parking limit for ${activeReservation.spaceLabel} has ended.`, type: 'info', timestamp: 'Just now', read: false }, ...prev]);
        } else {
          setSpaces((prev) => prev.map((s) => (s.id === activeReservation.spaceId ? { ...s, status: 'available', heldUntil: null } : s)));
          const expiredRes: Reservation = { ...activeReservation, status: 'expired' };
          setActiveReservation(null);
          localStorage.removeItem('curbsense_active_res');
          setReservationHistory((prev) => [expiredRes, ...prev]);
          setNotifications((prev) => [{ id: `notif-exp-${Date.now()}`, title: 'Demo hold expired', message: `Your ${DEMO_HOLD_SECONDS}-second hold for ${activeReservation.spaceLabel} has expired.`, type: 'alert', timestamp: 'Just now', read: false }, ...prev]);
        }
      }
    }, 250);

    return () => clearInterval(interval);
  }, [activeReservation]);

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const holdFormattedTime = useMemo(() => formatCountdown(holdSecondsRemaining), [holdSecondsRemaining]);
  const sessionFormattedTime = useMemo(() => formatCountdown(sessionSecondsRemaining), [sessionSecondsRemaining]);

  // Create Hold Handler
  const createHold = useCallback(
    (spaceId: string, vehicleType: VehicleType, durationHours = 1) => {
      const targetSpace = spaces.find((s) => s.id === spaceId);
      if (!targetSpace) return { success: false, message: 'Space not found.' };
      if (targetSpace.status !== 'available') return { success: false, message: 'Space is no longer available.' };

      if (targetSpace.kind === 'accessible' && currentUser.permitStatus !== 'verified') {
        return { success: false, message: 'Designated Accessible space requires a verified disability permit.' };
      }

      const targetZone = zones.find((z) => z.id === targetSpace.zoneId) || zones[0];
      const now = Date.now();
      const heldUntil = now + DEMO_HOLD_SECONDS * 1000; // short demo hold

      const rate = targetSpace.hourlyRate || targetZone.hourlyRate;
      const totalAmount = Math.round(rate * durationHours);
      const randomCode = `CS-${currentUser.vehiclePlate.replace(/\s+/g, '').slice(-4)}-${targetSpace.label}`;

      const reservation: Reservation = {
        id: `res-${now}`,
        spaceId: targetSpace.id,
        spaceLabel: targetSpace.label,
        zoneId: targetZone.id,
        zoneName: targetZone.name,
        vehicleType,
        vehiclePlate: currentUser.vehiclePlate,
        status: 'held',
        createdAt: now,
        heldUntil,
        durationHours,
        hourlyRate: rate,
        totalAmount,
        passCode: randomCode,
        qrPayload: `https://curbsense.ccmc.gov.in/verify?pass=${randomCode}&space=${targetSpace.id}`,
      };

      // Mutate Space
      setSpaces((prev) =>
        prev.map((s) => (s.id === spaceId ? { ...s, status: 'held', heldUntil, currentVehicleType: vehicleType } : s))
      );

      setActiveReservation(reservation);
      setActiveNavSpace(targetSpace);
      localStorage.setItem('curbsense_active_res', JSON.stringify(reservation));

      // Append Audit Log
      const auditEvent: AvailabilityEvent = {
        id: `aud-${now}`,
        timestamp: new Date().toLocaleTimeString('en-GB'),
        epochMs: now,
        spaceId: targetSpace.id,
        spaceLabel: targetSpace.label,
        zoneId: targetZone.id,
        zoneName: targetZone.name,
        previousStatus: 'available',
        nextStatus: 'held',
        source: `Citizen Mobile App (${DEMO_HOLD_SECONDS}-second demo hold)`,
        notes: `Guaranteed hold locked for vehicle ${currentUser.vehiclePlate}`,
        type: 'system_event',
      };
      setAuditLog((prev) => [auditEvent, ...prev]);

      // Add Notification
      setNotifications((prev) => [
        {
          id: `notif-${now}`,
          title: `${DEMO_HOLD_SECONDS}-Second Demo Hold Active`,
          message: `Bay ${targetSpace.label} in ${targetZone.name} is held for ${DEMO_HOLD_SECONDS} seconds for this demo.`,
          type: 'success',
          timestamp: 'Just now',
          read: false,
        },
        ...prev,
      ]);

      return { success: true };
    },
    [spaces, zones, currentUser]
  );

  const confirmReservation = useCallback(() => {
    if (!activeReservation) return;
    const updated: Reservation = { ...activeReservation, status: 'confirmed' };
    setActiveReservation(updated);
    localStorage.setItem('curbsense_active_res', JSON.stringify(updated));
  }, [activeReservation]);

  const checkInReservation = useCallback(() => {
    if (!activeReservation) return;
    const updated: Reservation = {
      ...activeReservation,
      status: 'active_session',
      checkedInAt: Date.now(),
      sessionExpiresAt: Date.now() + DEMO_SESSION_SECONDS * 1000,
    };
    setActiveReservation(updated);
    localStorage.setItem('curbsense_active_res', JSON.stringify(updated));

    // Update space to occupied
    setSpaces((prev) =>
      prev.map((s) => (s.id === activeReservation.spaceId ? { ...s, status: 'occupied' } : s))
    );

    // Audit
    const auditEvent: AvailabilityEvent = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('en-GB'),
      epochMs: Date.now(),
      spaceId: activeReservation.spaceId,
      spaceLabel: activeReservation.spaceLabel,
      zoneId: activeReservation.zoneId,
      zoneName: activeReservation.zoneName,
      previousStatus: 'held',
      nextStatus: 'occupied',
      source: 'Physical dock verified / Check-in',
      notes: `Vehicle ${activeReservation.vehiclePlate} docked at curb ${activeReservation.spaceLabel}.`,
      type: 'system_event',
    };
    setAuditLog((prev) => [auditEvent, ...prev]);
  }, [activeReservation]);

  const endActiveSession = useCallback(() => {
    if (!activeReservation) return;
    const completed: Reservation = {
      ...activeReservation,
      status: 'completed',
      completedAt: Date.now(),
    };

    setSpaces((prev) =>
      prev.map((s) => (s.id === activeReservation.spaceId ? { ...s, status: 'available', heldUntil: null } : s))
    );

    setActiveReservation(null);
    localStorage.removeItem('curbsense_active_res');
    setReservationHistory((prev) => [completed, ...prev]);

    // Audit
    const auditEvent: AvailabilityEvent = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('en-GB'),
      epochMs: Date.now(),
      spaceId: activeReservation.spaceId,
      spaceLabel: activeReservation.spaceLabel,
      zoneId: activeReservation.zoneId,
      zoneName: activeReservation.zoneName,
      previousStatus: 'occupied',
      nextStatus: 'available',
      source: 'Session completion / Payment settlement',
      notes: `Parking session concluded. ₹${completed.totalAmount} collected via FASTag/UPI.`,
      type: 'system_event',
    };
    setAuditLog((prev) => [auditEvent, ...prev]);

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: 'Parking Session Completed',
        message: `Your parking in ${completed.zoneName} has settled. Thank you for using CurbSense.`,
        type: 'success',
        timestamp: 'Just now',
        read: false,
      },
      ...prev,
    ]);
  }, [activeReservation]);

  const cancelHold = useCallback(() => {
    if (!activeReservation) return;
    const cancelled: Reservation = { ...activeReservation, status: 'cancelled' };

    setSpaces((prev) =>
      prev.map((s) => (s.id === activeReservation.spaceId ? { ...s, status: 'available', heldUntil: null } : s))
    );

    setActiveReservation(null);
    localStorage.removeItem('curbsense_active_res');
    setReservationHistory((prev) => [cancelled, ...prev]);

    const auditEvent: AvailabilityEvent = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('en-GB'),
      epochMs: Date.now(),
      spaceId: activeReservation.spaceId,
      spaceLabel: activeReservation.spaceLabel,
      zoneId: activeReservation.zoneId,
      zoneName: activeReservation.zoneName,
      previousStatus: 'held',
      nextStatus: 'available',
      source: 'Citizen voluntary cancellation',
      notes: 'User released hold prior to arrival.',
      type: 'system_event',
    };
    setAuditLog((prev) => [auditEvent, ...prev]);
  }, [activeReservation]);

  // Community Signal Handler
  const submitCommunityReport = useCallback(
    (reportData: {
      zoneId: string;
      zoneName: string;
      spaceLabel?: string;
      type: CommunityReport['type'];
      description: string;
      photoUrl?: string;
    }) => {
      const newReport: CommunityReport = {
        id: `rep-${Date.now()}`,
        zoneId: reportData.zoneId,
        zoneName: reportData.zoneName,
        spaceLabel: reportData.spaceLabel,
        type: reportData.type,
        description: reportData.description,
        photoUrl: reportData.photoUrl,
        confidenceScore: 65,
        status: 'pending',
        submittedAt: 'Just now',
        submittedBy: currentUser.name,
      };

      setCommunityReports((prev) => [newReport, ...prev]);

      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          title: 'Citizen Report Logged',
          message: `Your observation for ${reportData.zoneName} has been queued for municipal verification.`,
          type: 'info',
          timestamp: 'Just now',
          read: false,
        },
        ...prev,
      ]);
    },
    [currentUser]
  );

  // Authority Admin Handlers
  const acknowledgeAlert = useCallback(
    (alertId: string) => {
      setAlerts((prev) =>
        prev.map((a) =>
          a.id === alertId
            ? {
                ...a,
                status: 'acknowledged',
                acknowledgedBy: currentUser.name,
              }
            : a
        )
      );

      const targetAlert = alerts.find((a) => a.id === alertId);
      if (targetAlert) {
        const action: AuthorityAction = {
          id: `act-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString('en-GB'),
          epochMs: Date.now(),
          actionType: 'alert_acknowledge',
          adminName: currentUser.name,
          zoneId: targetAlert.zoneId,
          zoneName: targetAlert.zoneName,
          details: `Acknowledged alert "${targetAlert.title}" in ${targetAlert.zoneName}.`,
          type: 'authority_action',
        };
        setAuditLog((prev) => [action, ...prev]);
      }
    },
    [alerts, currentUser]
  );

  const assignAlert = useCallback(
    (alertId: string, staffName: string) => {
      setAlerts((prev) =>
        prev.map((a) =>
          a.id === alertId
            ? {
                ...a,
                assignedTo: staffName,
                status: a.status === 'open' ? 'investigating' : a.status,
              }
            : a
        )
      );

      const targetAlert = alerts.find((a) => a.id === alertId);
      if (targetAlert) {
        const action: AuthorityAction = {
          id: `act-assign-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString('en-GB'),
          epochMs: Date.now(),
          actionType: 'policy_update',
          adminName: currentUser.name,
          zoneId: targetAlert.zoneId,
          zoneName: targetAlert.zoneName,
          details: `Assigned incident "${targetAlert.title}" to field officer ${staffName}.`,
          type: 'authority_action',
        };
        setAuditLog((prev) => [action, ...prev]);
      }
    },
    [alerts, currentUser]
  );

  const resolveAlert = useCallback(
    (alertId: string) => {
      setAlerts((prev) =>
        prev.map((a) =>
          a.id === alertId
            ? {
                ...a,
                status: 'resolved',
                resolvedBy: currentUser.name,
              }
            : a
        )
      );

      const targetAlert = alerts.find((a) => a.id === alertId);
      if (targetAlert) {
        if (targetAlert.spaceId) {
          setSpaces((prev) =>
            prev.map((s) => (s.id === targetAlert.spaceId ? { ...s, status: 'available' } : s))
          );
        }

        const action: AuthorityAction = {
          id: `act-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString('en-GB'),
          epochMs: Date.now(),
          actionType: 'alert_resolve',
          adminName: currentUser.name,
          zoneId: targetAlert.zoneId,
          zoneName: targetAlert.zoneName,
          details: `Resolved alert "${targetAlert.title}". Curbside telemetry cleared.`,
          type: 'authority_action',
        };
        setAuditLog((prev) => [action, ...prev]);
      }
    },
    [alerts, currentUser]
  );

  const resolveAlertWithNote = useCallback(
    (alertId: string, resolutionNote: string, staffName?: string) => {
      const resolver = staffName || currentUser.name;
      setAlerts((prev) =>
        prev.map((a) =>
          a.id === alertId
            ? {
                ...a,
                status: 'resolved',
                resolvedBy: resolver,
                resolutionNote,
              }
            : a
        )
      );

      const targetAlert = alerts.find((a) => a.id === alertId);
      if (targetAlert) {
        if (targetAlert.spaceId) {
          setSpaces((prev) =>
            prev.map((s) => (s.id === targetAlert.spaceId ? { ...s, status: 'available' } : s))
          );
        }

        const action: AuthorityAction = {
          id: `act-res-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString('en-GB'),
          epochMs: Date.now(),
          actionType: 'alert_resolve',
          adminName: resolver,
          zoneId: targetAlert.zoneId,
          zoneName: targetAlert.zoneName,
          details: `Resolved incident "${targetAlert.title}". Resolution: ${resolutionNote}`,
          type: 'authority_action',
        };
        setAuditLog((prev) => [action, ...prev]);
      }
    },
    [alerts, currentUser]
  );

  const dismissAlert = useCallback(
    (alertId: string) => {
      setAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, status: 'dismissed' } : a)));

      const targetAlert = alerts.find((a) => a.id === alertId);
      if (targetAlert) {
        const action: AuthorityAction = {
          id: `act-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString('en-GB'),
          epochMs: Date.now(),
          actionType: 'alert_dismiss',
          adminName: currentUser.name,
          zoneId: targetAlert.zoneId,
          zoneName: targetAlert.zoneName,
          details: `Dismissed alert "${targetAlert.title}" without on-ground intervention.`,
          type: 'authority_action',
        };
        setAuditLog((prev) => [action, ...prev]);
      }
    },
    [alerts, currentUser]
  );

  // Authority Space Force Override Handler
  const updateSpaceStatus = useCallback(
    (spaceId: string, newStatus: SpaceStatus, reason?: string) => {
      const targetSpace = spaces.find((s) => s.id === spaceId);
      if (!targetSpace) return;
      const prevStatus = targetSpace.status;

      setSpaces((prev) =>
        prev.map((s) =>
          s.id === spaceId
            ? {
                ...s,
                status: newStatus,
                lastVerifiedAt: 'Just now',
                heldUntil: newStatus === 'available' ? null : s.heldUntil,
              }
            : s
        )
      );

      const zone = zones.find((z) => z.id === targetSpace.zoneId);

      const availabilityEvent: AvailabilityEvent = {
        id: `aud-sp-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString('en-GB'),
        epochMs: Date.now(),
        spaceId: targetSpace.id,
        spaceLabel: targetSpace.label,
        zoneId: targetSpace.zoneId,
        zoneName: zone?.name || targetSpace.zoneId,
        previousStatus: prevStatus,
        nextStatus: newStatus,
        source: `Municipal Override by ${currentUser.name}`,
        notes: reason || `Manual status update to ${newStatus}`,
        type: 'system_event',
      };

      const authorityAction: AuthorityAction = {
        id: `act-sp-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString('en-GB'),
        epochMs: Date.now(),
        actionType: 'space_maintenance',
        adminName: currentUser.name,
        zoneId: targetSpace.zoneId,
        zoneName: zone?.name || targetSpace.zoneId,
        details: `Updated bay ${targetSpace.label} status: ${prevStatus} → ${newStatus}. Note: ${reason || 'Physical inspection complete'}`,
        previousValue: prevStatus,
        newValue: newStatus,
        type: 'authority_action',
      };

      setAuditLog((prev) => [authorityAction, availabilityEvent, ...prev]);
    },
    [spaces, zones, currentUser]
  );

  // Zone CRUD operations
  const updateZone = useCallback(
    (zoneId: string, updates: Partial<ParkingZone>) => {
      const targetZone = zones.find((z) => z.id === zoneId);
      if (!targetZone) return;

      setZones((prev) => prev.map((z) => (z.id === zoneId ? { ...z, ...updates } : z)));

      // If hourly rate was updated, sync to spaces
      if (updates.hourlyRate !== undefined) {
        setSpaces((prev) =>
          prev.map((s) => (s.zoneId === zoneId ? { ...s, hourlyRate: updates.hourlyRate! } : s))
        );
      }

      const action: AuthorityAction = {
        id: `act-zone-edit-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString('en-GB'),
        epochMs: Date.now(),
        actionType: 'policy_update',
        adminName: currentUser.name,
        zoneId,
        zoneName: targetZone.name,
        details: `Edited parameters for zone ${targetZone.name}: ${Object.keys(updates).join(', ')}`,
        type: 'authority_action',
      };
      setAuditLog((prev) => [action, ...prev]);
    },
    [zones, currentUser]
  );

  const addZone = useCallback(
    (zoneData: Omit<ParkingZone, 'id'>, initialSpacesCount: number = 12) => {
      const newZoneId = `zone-${zoneData.name.toLowerCase().replace(/[^a-z0-9]/g, '')}-${Date.now().toString().slice(-4)}`;
      const newZone: ParkingZone = {
        ...zoneData,
        id: newZoneId,
      };

      setZones((prev) => [...prev, newZone]);

      // Seed initial spaces for the new zone
      const prefix = (zoneData.name.split(' ').map((w) => w[0]).join('') || 'ZN').toUpperCase().slice(0, 3);
      const newSpaces: ParkingSpace[] = [];
      for (let i = 1; i <= initialSpacesCount; i++) {
        const spaceNum = i < 10 ? `0${i}` : `${i}`;
        let kind: SpaceKind = 'standard';
        if (i === 1) kind = 'accessible';
        else if (i === 2 && zoneData.compatibleVehicleKinds.includes('ev')) kind = 'ev';
        else if (i >= initialSpacesCount - 3 && zoneData.compatibleVehicleKinds.includes('two_wheeler')) kind = 'two_wheeler';

        newSpaces.push({
          id: `sp-${prefix.toLowerCase()}-${spaceNum}-${Date.now().toString().slice(-4)}`,
          zoneId: newZoneId,
          label: `${prefix}-${spaceNum}`,
          kind,
          status: 'available',
          lat: Number((zoneData.lat + (i - 6) * 0.00015).toFixed(6)),
          lng: Number((zoneData.lng + (i - 6) * 0.0002).toFixed(6)),
          address: `Bay ${prefix}-${spaceNum}, ${zoneData.featuredStreet || zoneData.name}, Coimbatore`,
          lastVerifiedAt: 'Just added',
          hourlyRate: zoneData.hourlyRate,
          sensorId: `SN-${prefix}-${spaceNum}`,
        });
      }

      setSpaces((prev) => [...prev, ...newSpaces]);

      const action: AuthorityAction = {
        id: `act-zone-add-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString('en-GB'),
        epochMs: Date.now(),
        actionType: 'policy_update',
        adminName: currentUser.name,
        zoneId: newZoneId,
        zoneName: newZone.name,
        details: `Provisioned new parking zone "${newZone.name}" with ${initialSpacesCount} telemetry bays at ₹${newZone.hourlyRate}/hr.`,
        type: 'authority_action',
      };
      setAuditLog((prev) => [action, ...prev]);
    },
    [currentUser]
  );

  const bulkUpdateZoneAvailability = useCallback(
    (zoneId: string, status: 'available' | 'out_of_service', reason: string, autoRestoreAt?: string) => {
      const zone = zones.find((z) => z.id === zoneId);
      if (!zone) return;

      setSpaces((prev) =>
        prev.map((s) => (s.zoneId === zoneId ? { ...s, status, lastVerifiedAt: 'Just now' } : s))
      );

      const action: AuthorityAction = {
        id: `act-bulk-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString('en-GB'),
        epochMs: Date.now(),
        actionType: 'space_maintenance',
        adminName: currentUser.name,
        zoneId,
        zoneName: zone.name,
        details: `Bulk zone action on ${zone.name}: Marked all bays as ${status}. Reason: ${reason}${autoRestoreAt ? ` (Auto-restore scheduled: ${autoRestoreAt})` : ''}`,
        previousValue: 'Mixed',
        newValue: status,
        type: 'authority_action',
      };
      setAuditLog((prev) => [action, ...prev]);
    },
    [zones, currentUser]
  );

  const addSpaceToZone = useCallback(
    (zoneId: string, spaceData: { label: string; kind: SpaceKind; hourlyRate: number }) => {
      const zone = zones.find((z) => z.id === zoneId);
      if (!zone) return;

      const newSpace: ParkingSpace = {
        id: `sp-${spaceData.label.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`,
        zoneId,
        label: spaceData.label,
        kind: spaceData.kind,
        status: 'available',
        lat: zone.lat + (Math.random() - 0.5) * 0.001,
        lng: zone.lng + (Math.random() - 0.5) * 0.001,
        address: `Bay ${spaceData.label}, ${zone.featuredStreet || zone.name}, Coimbatore`,
        lastVerifiedAt: 'Just added',
        hourlyRate: spaceData.hourlyRate || zone.hourlyRate,
        sensorId: `SN-${spaceData.label.replace(/[^a-zA-Z0-9]/g, '')}`,
      };

      setSpaces((prev) => [...prev, newSpace]);

      const action: AuthorityAction = {
        id: `act-space-add-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString('en-GB'),
        epochMs: Date.now(),
        actionType: 'space_maintenance',
        adminName: currentUser.name,
        zoneId,
        zoneName: zone.name,
        details: `Added new bay ${spaceData.label} (${spaceData.kind}) to ${zone.name}.`,
        type: 'authority_action',
      };
      setAuditLog((prev) => [action, ...prev]);
    },
    [zones, currentUser]
  );

  const removeSpace = useCallback(
    (spaceId: string) => {
      const target = spaces.find((s) => s.id === spaceId);
      if (!target) return;
      const zone = zones.find((z) => z.id === target.zoneId);

      setSpaces((prev) => prev.filter((s) => s.id !== spaceId));

      const action: AuthorityAction = {
        id: `act-space-rem-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString('en-GB'),
        epochMs: Date.now(),
        actionType: 'space_maintenance',
        adminName: currentUser.name,
        zoneId: target.zoneId,
        zoneName: zone?.name,
        details: `Decommissioned bay ${target.label} from ${zone?.name || 'inventory'}.`,
        type: 'authority_action',
      };
      setAuditLog((prev) => [action, ...prev]);
    },
    [spaces, zones, currentUser]
  );

  // Community Signal Moderation & Trust Scores
  const corroborateCommunityReport = useCallback(
    (reportId: string) => {
      const targetReport = communityReports.find((r) => r.id === reportId);
      if (!targetReport) return;

      setCommunityReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, status: 'corroborated' } : r))
      );

      // Update trust score for submitter
      const submitter = targetReport.submittedBy;
      setCitizenTrustStats((prev) => {
        const curr = prev[submitter] || {
          name: submitter,
          totalReports: 1,
          corroboratedReports: 0,
          trustScore: 70,
        };
        const newCorroborated = curr.corroboratedReports + 1;
        const newTotal = curr.totalReports;
        const newScore = Math.min(100, Math.round((newCorroborated / Math.max(1, newTotal)) * 100));
        return {
          ...prev,
          [submitter]: {
            ...curr,
            corroboratedReports: newCorroborated,
            trustScore: newScore,
          },
        };
      });

      // If report indicated free space and has spaceLabel, optimize space status
      if (targetReport.spaceLabel) {
        const matched = spaces.find((s) => s.label === targetReport.spaceLabel && s.zoneId === targetReport.zoneId);
        if (matched && matched.status === 'conflict') {
          setSpaces((prev) => prev.map((s) => (s.id === matched.id ? { ...s, status: 'available' } : s)));
        }
      }

      const action: AuthorityAction = {
        id: `act-rep-corrob-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString('en-GB'),
        epochMs: Date.now(),
        actionType: 'policy_update',
        adminName: currentUser.name,
        zoneId: targetReport.zoneId,
        zoneName: targetReport.zoneName,
        details: `Corroborated citizen report #${targetReport.id.slice(-4)} by ${targetReport.submittedBy}. Trust score elevated.`,
        type: 'authority_action',
      };
      setAuditLog((prev) => [action, ...prev]);
    },
    [communityReports, spaces, currentUser]
  );

  const dismissCommunityReport = useCallback(
    (reportId: string) => {
      const targetReport = communityReports.find((r) => r.id === reportId);
      if (!targetReport) return;

      setCommunityReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, status: 'dismissed' } : r))
      );

      // Slightly decrease trust score for false signal
      const submitter = targetReport.submittedBy;
      setCitizenTrustStats((prev) => {
        const curr = prev[submitter] || {
          name: submitter,
          totalReports: 1,
          corroboratedReports: 0,
          trustScore: 70,
        };
        const newScore = Math.max(20, curr.trustScore - 8);
        return {
          ...prev,
          [submitter]: {
            ...curr,
            trustScore: newScore,
          },
        };
      });

      const action: AuthorityAction = {
        id: `act-rep-dism-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString('en-GB'),
        epochMs: Date.now(),
        actionType: 'policy_update',
        adminName: currentUser.name,
        zoneId: targetReport.zoneId,
        zoneName: targetReport.zoneName,
        details: `Dismissed invalid citizen signal from ${targetReport.submittedBy} in ${targetReport.zoneName}.`,
        type: 'authority_action',
      };
      setAuditLog((prev) => [action, ...prev]);
    },
    [communityReports, currentUser]
  );

  // Accessibility Permits Review Queue
  const reviewPermit = useCallback(
    (permitNumber: string, status: 'verified' | 'rejected', reason?: string) => {
      setPendingPermits((prev) =>
        prev.map((p) =>
          p.permitNumber === permitNumber
            ? { ...p, status, rejectionReason: status === 'rejected' ? reason : undefined }
            : p
        )
      );

      const target = pendingPermits.find((p) => p.permitNumber === permitNumber);

      // If matches currentUser email or permitId, sync directly
      if (target && (target.applicantEmail === currentUser.email || target.holderName === currentUser.name)) {
        setCurrentUser((prev) => ({
          ...prev,
          permitStatus: status,
          permitId: status === 'verified' ? permitNumber : undefined,
        }));
      }

      const action: AuthorityAction = {
        id: `act-permit-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString('en-GB'),
        epochMs: Date.now(),
        actionType: 'policy_update',
        adminName: currentUser.name,
        details: `${status === 'verified' ? 'Approved' : 'Rejected'} accessibility permit #${permitNumber} for ${target?.holderName || 'applicant'}.${status === 'rejected' ? ` Reason: ${reason}` : ''}`,
        previousValue: 'pending',
        newValue: status,
        type: 'authority_action',
      };
      setAuditLog((prev) => [action, ...prev]);
    },
    [pendingPermits, currentUser]
  );

  // Policy Settings management
  const updatePolicySettings = useCallback(
    (settings: Partial<PolicySettings>) => {
      setPolicySettings((prev) => ({ ...prev, ...settings }));

      const action: AuthorityAction = {
        id: `act-pol-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString('en-GB'),
        epochMs: Date.now(),
        actionType: 'policy_update',
        adminName: currentUser.name,
        details: `Updated municipal dynamic tariff policy parameters: ${Object.entries(settings).map(([k, v]) => `${k}=${v}`).join(', ')}`,
        type: 'authority_action',
      };
      setAuditLog((prev) => [action, ...prev]);
    },
    [currentUser]
  );

  const resetPolicySettings = useCallback(() => {
    setPolicySettings(INITIAL_POLICY_SETTINGS);
    const action: AuthorityAction = {
      id: `act-pol-rst-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('en-GB'),
      epochMs: Date.now(),
      actionType: 'policy_update',
      adminName: currentUser.name,
      details: 'Reset municipal dynamic pricing policy parameters to regulatory defaults (0.85x - 1.6x, 15% step).',
      type: 'authority_action',
    };
    setAuditLog((prev) => [action, ...prev]);
  }, [currentUser]);

  // Staff Management
  const addStaffMember = useCallback(
    (staff: { name: string; email: string; role: StaffMember['role']; department: string }) => {
      const initials = staff.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
      const newStaff: StaffMember = {
        id: `stf-${Date.now().toString().slice(-4)}`,
        name: staff.name,
        email: staff.email,
        role: staff.role,
        department: staff.department,
        status: 'active',
        avatarInitials: initials || 'SO',
      };

      setStaffMembers((prev) => [newStaff, ...prev]);

      const action: AuthorityAction = {
        id: `act-staff-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString('en-GB'),
        epochMs: Date.now(),
        actionType: 'policy_update',
        adminName: currentUser.name,
        details: `Onboarded new municipal officer ${staff.name} (${staff.role}) to ${staff.department}.`,
        type: 'authority_action',
      };
      setAuditLog((prev) => [action, ...prev]);
    },
    [currentUser]
  );

  const toggleStaffStatus = useCallback(
    (staffId: string) => {
      const target = staffMembers.find((s) => s.id === staffId);
      if (!target) return;
      const nextStatus = target.status === 'active' ? 'inactive' : 'active';

      setStaffMembers((prev) =>
        prev.map((s) => (s.id === staffId ? { ...s, status: nextStatus } : s))
      );

      const action: AuthorityAction = {
        id: `act-staff-st-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString('en-GB'),
        epochMs: Date.now(),
        actionType: 'policy_update',
        adminName: currentUser.name,
        details: `Changed account status for officer ${target.name} to ${nextStatus}.`,
        type: 'authority_action',
      };
      setAuditLog((prev) => [action, ...prev]);
    },
    [staffMembers, currentUser]
  );

  // Notification preferences
  const updateNotificationPreferences = useCallback((prefs: Partial<NotificationPreferences>) => {
    setNotificationPreferences((prev) => ({ ...prev, ...prefs }));
  }, []);

  const approveZonePricing = useCallback(
    (zoneId: string, newRate: number) => {
      const zone = zones.find((z) => z.id === zoneId);
      const prevRate = zone?.hourlyRate || 30;

      setPricingActions((prev) => ({
        ...prev,
        [zoneId]: { status: 'approved', approvedRate: newRate },
      }));

      // Update zone rate
      setZones((prev) =>
        prev.map((z) => (z.id === zoneId ? { ...z, hourlyRate: newRate } : z))
      );
      // Update spaces in that zone
      setSpaces((prev) =>
        prev.map((s) => (s.zoneId === zoneId ? { ...s, hourlyRate: newRate } : s))
      );

      const action: AuthorityAction = {
        id: `act-price-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString('en-GB'),
        epochMs: Date.now(),
        actionType: 'price_approval',
        adminName: currentUser.name,
        zoneId,
        zoneName: zone?.name,
        details: `Approved dynamic tariff revision: ₹${prevRate}/hr → ₹${newRate}/hr for ${zone?.name}.`,
        previousValue: `₹${prevRate}/hr`,
        newValue: `₹${newRate}/hr`,
        type: 'authority_action',
      };
      setAuditLog((prev) => [action, ...prev]);
    },
    [zones, currentUser]
  );

  const holdCurrentZonePricing = useCallback(
    (zoneId: string) => {
      const zone = zones.find((z) => z.id === zoneId);
      setPricingActions((prev) => ({
        ...prev,
        [zoneId]: { status: 'held' },
      }));

      const action: AuthorityAction = {
        id: `act-hold-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString('en-GB'),
        epochMs: Date.now(),
        actionType: 'policy_update',
        adminName: currentUser.name,
        zoneId,
        zoneName: zone?.name,
        details: `Maintained base tariff ₹${zone?.hourlyRate}/hr for ${zone?.name}.`,
        type: 'authority_action',
      };
      setAuditLog((prev) => [action, ...prev]);
    },
    [zones, currentUser]
  );

  const openAlertsCount = useMemo(() => {
    return alerts.filter((a) => a.status === 'open' || a.status === 'investigating').length;
  }, [alerts]);

  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const submitPermitApplication = useCallback(
    (data: { permitNumber: string; holderName: string; disabilityId: string; documentName?: string }) => {
      const permit: AccessibilityPermit = {
        permitNumber: data.permitNumber,
        holderName: data.holderName,
        disabilityId: data.disabilityId,
        issueAuthority: 'Coimbatore District Welfare Department',
        validUntil: '31 Dec 2027',
        status: 'verified',
        documentName: data.documentName || 'Govt_UDID_Card.pdf',
        submittedAt: 'Just now',
      };

      setPermitApplication(permit);
      setCurrentUser((prev) => ({
        ...prev,
        permitStatus: 'verified',
        permitId: data.permitNumber,
      }));

      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          title: 'Accessible Parking Permit Verified',
          message: `Permit #${data.permitNumber} has been verified and registered with CCMC. Accessible parking bays are now unlocked.`,
          type: 'permit',
          timestamp: 'Just now',
          read: false,
        },
        ...prev,
      ]);
    },
    []
  );

  return (
    <CurbContext.Provider
      value={{
        theme,
        toggleTheme,
        surfaceMode,
        toggleSurfaceMode,
        currentUser,
        isAuthenticated,
        welcomeToast,
        setWelcomeToast,
        switchUserRole,
        loginAsUser,
        loginWithCredentials,
        loginAuthority3Factor,
        submitAuthorityAccessRequest,
        logoutUser,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalInitialRole,
        openAuthModal,
        userLocation,
        setUserLocation,
        destinationLocation,
        setDestinationLocation,
        activeNavSpace,
        setActiveNavSpace,
        isNavigating,
        setIsNavigating,
        zones,
        spaces,
        selectedZoneId,
        setSelectedZoneId,
        selectedVehicleFilter,
        setSelectedVehicleFilter,
        searchQuery,
        setSearchQuery,
        getZoneSpaces,
        getZoneStats,
        updateSpaceStatus,
        updateZone,
        addZone,
        bulkUpdateZoneAvailability,
        addSpaceToZone,
        removeSpace,
        activeReservation,
        reservationHistory,
        holdSecondsRemaining,
        holdFormattedTime,
        sessionSecondsRemaining,
        sessionFormattedTime,
        createHold,
        confirmReservation,
        checkInReservation,
        endActiveSession,
        cancelHold,
        communityReports,
        submitCommunityReport,
        corroborateCommunityReport,
        dismissCommunityReport,
        citizenTrustStats,
        alerts,
        openAlertsCount,
        acknowledgeAlert,
        assignAlert,
        resolveAlert,
        resolveAlertWithNote,
        dismissAlert,
        pricingRecommendations,
        approveZonePricing,
        holdCurrentZonePricing,
        policySettings,
        updatePolicySettings,
        resetPolicySettings,
        auditLog,
        staffMembers,
        addStaffMember,
        toggleStaffStatus,
        notificationPreferences,
        updateNotificationPreferences,
        notifications,
        unreadNotificationsCount,
        markAllNotificationsRead,
        permitApplication,
        pendingPermits,
        reviewPermit,
        submitPermitApplication,
      }}
    >
      {children}
    </CurbContext.Provider>
  );
};

export const useCurb = () => {
  const context = useContext(CurbContext);
  if (!context) {
    throw new Error('useCurb must be used within a CurbProvider');
  }
  return context;
};
