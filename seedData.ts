import {
  ParkingZone,
  ParkingSpace,
  AuthorityAlert,
  CommunityReport,
  AvailabilityEvent,
  AuthorityAction,
  NotificationItem,
  User,
  StaffMember,
  AccessibilityPermit,
  PolicySettings,
  NotificationPreferences,
  CitizenTrustStat,
} from '../types';

export const INITIAL_ZONES: ParkingZone[] = [
  {
    id: 'zone-townhall',
    name: 'Town Hall North',
    area: 'Heritage & Municipal Core',
    lat: 11.0018,
    lng: 76.9628,
    mapX: 42,
    mapY: 62,
    hourlyRate: 30,
    sourceLabel: 'CurbSense pilot IoT + camera node TH-04',
    confidenceScore: 94,
    lastVerifiedMinutesAgo: 2,
    description: 'Curbside bays along Big Bazaar St. & Town Hall Clock Tower circle.',
    compatibleVehicleKinds: ['standard', 'two_wheeler', 'accessible'],
    featuredStreet: 'Big Bazaar Street',
    landmark: 'Opposite Victoria Town Hall',
  },
  {
    id: 'zone-rspuram',
    name: 'R.S. Puram Market Edge',
    area: 'West Commercial Zone',
    lat: 11.0096,
    lng: 76.9482,
    mapX: 25,
    mapY: 48,
    hourlyRate: 35,
    sourceLabel: 'CurbSense pilot sensor mesh RSP-W',
    confidenceScore: 91,
    lastVerifiedMinutesAgo: 4,
    description: 'High-turnover diagonal parking parallel to flower bazaar & Diwan Bahadur Rd.',
    compatibleVehicleKinds: ['standard', 'ev', 'accessible', 'two_wheeler'],
    featuredStreet: 'Diwan Bahadur Road',
    landmark: 'Near Flower Market & Post Office',
  },
  {
    id: 'zone-racecourse',
    name: 'Race Course East',
    area: 'Promenade & Government Hub',
    lat: 11.0035,
    lng: 76.9745,
    mapX: 68,
    mapY: 55,
    hourlyRate: 30,
    sourceLabel: 'CurbSense pilot acoustic loop RC-E',
    confidenceScore: 96,
    lastVerifiedMinutesAgo: 1,
    description: 'Tree-shaded walking promenade curb bays with dual EV quick-chargers.',
    compatibleVehicleKinds: ['standard', 'ev', 'accessible', 'two_wheeler'],
    featuredStreet: 'Race Course Road',
    landmark: 'Near Thomas Park & Collectorate',
  },
  {
    id: 'zone-gandhipuram',
    name: 'Gandhipuram Transit Corner',
    area: 'Central Bus Terminal Sector',
    lat: 11.0188,
    lng: 76.9678,
    mapX: 55,
    mapY: 32,
    hourlyRate: 40,
    sourceLabel: 'CurbSense pilot transit camera hub GP-01',
    confidenceScore: 89,
    lastVerifiedMinutesAgo: 3,
    description: 'Intense short-dwell bays outside Central Bus Stand and Cross Cut junction.',
    compatibleVehicleKinds: ['standard', 'ev', 'accessible', 'two_wheeler'],
    featuredStreet: 'Cross Cut Junction',
    landmark: 'Adjacent to SETC Central Terminal',
  },
  {
    id: 'zone-dbroad',
    name: 'DB Road Commercial Hub',
    area: 'R.S. Puram Retail Corridor',
    lat: 11.0125,
    lng: 76.9445,
    mapX: 18,
    mapY: 38,
    hourlyRate: 35,
    sourceLabel: 'CurbSense pilot ground magnetometer DB-C',
    confidenceScore: 92,
    lastVerifiedMinutesAgo: 5,
    description: 'Premium retail curb bays with smart tariff enforcement and quick turnover.',
    compatibleVehicleKinds: ['standard', 'ev', 'two_wheeler'],
    featuredStreet: 'D.B. Road',
    landmark: 'Opposite Thulasi Pharmacy & Nilgiris',
  },
  {
    id: 'zone-avinashi',
    name: 'Avinashi Road Gateway',
    area: 'Eastern Arterial Corridor',
    lat: 11.0142,
    lng: 76.9895,
    mapX: 82,
    mapY: 40,
    hourlyRate: 25,
    sourceLabel: 'CurbSense pilot radar cluster AR-East',
    confidenceScore: 95,
    lastVerifiedMinutesAgo: 2,
    description: 'Linear curbside parking beneath flyover approaches and hospital lane.',
    compatibleVehicleKinds: ['standard', 'accessible', 'two_wheeler'],
    featuredStreet: 'Avinashi Road',
    landmark: 'Near PSG Tech / Anna Silai junction',
  },
  {
    id: 'zone-crosscut',
    name: 'Cross Cut Road Bazaar',
    area: 'Textile & Electronics District',
    lat: 11.0215,
    lng: 76.9612,
    mapX: 45,
    mapY: 22,
    hourlyRate: 35,
    sourceLabel: 'CurbSense pilot optical grid CC-Textile',
    confidenceScore: 87,
    lastVerifiedMinutesAgo: 6,
    description: 'Dense commercial street curb spaces with high two-wheeler and delivery ratio.',
    compatibleVehicleKinds: ['standard', 'two_wheeler', 'accessible'],
    featuredStreet: 'Cross Cut Road',
    landmark: 'Near Lakshmi Complex & Sri Krishna Sweets',
  },
  {
    id: 'zone-saibaba',
    name: 'Saibaba Colony Promenade',
    area: 'North-West Civic Belt',
    lat: 11.0315,
    lng: 76.9465,
    mapX: 28,
    mapY: 15,
    hourlyRate: 20,
    sourceLabel: 'CurbSense pilot community anchor SC-02',
    confidenceScore: 93,
    lastVerifiedMinutesAgo: 4,
    description: 'Relaxed neighborhood curbside spaces with green verge and two-wheeler slots.',
    compatibleVehicleKinds: ['standard', 'two_wheeler', 'accessible'],
    featuredStreet: 'NSR Road',
    landmark: 'Opposite Saibaba Temple Arch',
  },
];

// Helper to generate 112+ realistic space-level pins with exact lat/lng across Coimbatore
export function generateInitialSpaces(): ParkingSpace[] {
  const spaces: ParkingSpace[] = [];

  const zoneConfigs: Record<
    string,
    {
      prefix: string;
      total: number;
      baseLat: number;
      baseLng: number;
      latStep: number;
      lngStep: number;
      streetName: string;
      evIndices: number[];
      accIndices: number[];
      twoWIndices: number[];
      occupiedIndices: number[];
      conflictIndex?: number;
      oosIndex?: number;
      rate: number;
    }
  > = {
    'zone-townhall': {
      prefix: 'TH',
      total: 14,
      baseLat: 11.0018,
      baseLng: 76.9628,
      latStep: 0.00015,
      lngStep: 0.00032,
      streetName: 'Big Bazaar Street, Town Hall',
      evIndices: [3],
      accIndices: [2],
      twoWIndices: [9, 10, 11, 12, 13, 14],
      occupiedIndices: [1, 4, 6, 9, 10],
      conflictIndex: 5,
      rate: 30,
    },
    'zone-rspuram': {
      prefix: 'RS',
      total: 15,
      baseLat: 11.0096,
      baseLng: 76.9482,
      latStep: 0.00022,
      lngStep: -0.00018,
      streetName: 'DB Road West, R.S. Puram',
      evIndices: [3, 4],
      accIndices: [1],
      twoWIndices: [10, 11, 12, 13, 14, 15],
      occupiedIndices: [2, 3, 7, 8, 11, 12],
      rate: 35,
    },
    'zone-racecourse': {
      prefix: 'RC',
      total: 14,
      baseLat: 11.0035,
      baseLng: 76.9745,
      latStep: -0.00018,
      lngStep: 0.00028,
      streetName: 'Race Course Promenade East',
      evIndices: [1, 2],
      accIndices: [3],
      twoWIndices: [9, 10, 11, 12, 13, 14],
      occupiedIndices: [4, 6, 10],
      rate: 30,
    },
    'zone-gandhipuram': {
      prefix: 'GP',
      total: 15,
      baseLat: 11.0188,
      baseLng: 76.9678,
      latStep: 0.00025,
      lngStep: 0.00019,
      streetName: 'Cross Cut Junction, Gandhipuram',
      evIndices: [4, 5],
      accIndices: [2],
      twoWIndices: [10, 11, 12, 13, 14, 15],
      occupiedIndices: [1, 3, 4, 6, 7, 8, 11, 12, 13],
      oosIndex: 5, // GP-05 EV charger out of service
      rate: 40,
    },
    'zone-dbroad': {
      prefix: 'DB',
      total: 14,
      baseLat: 11.0125,
      baseLng: 76.9445,
      latStep: 0.00019,
      lngStep: 0.00024,
      streetName: 'D.B. Road North Corridor',
      evIndices: [2, 3],
      accIndices: [1],
      twoWIndices: [9, 10, 11, 12, 13, 14],
      occupiedIndices: [1, 5, 6, 8, 10, 11],
      rate: 35,
    },
    'zone-avinashi': {
      prefix: 'AV',
      total: 14,
      baseLat: 11.0142,
      baseLng: 76.9895,
      latStep: 0.00012,
      lngStep: 0.00035,
      streetName: 'Avinashi Road Flyover Approach',
      evIndices: [3],
      accIndices: [1],
      twoWIndices: [8, 9, 10, 11, 12, 13, 14],
      occupiedIndices: [2, 4, 7, 9, 10],
      rate: 25,
    },
    'zone-crosscut': {
      prefix: 'CC',
      total: 14,
      baseLat: 11.0215,
      baseLng: 76.9612,
      latStep: -0.00021,
      lngStep: 0.00026,
      streetName: 'Cross Cut Road Textile Belt',
      evIndices: [4],
      accIndices: [2],
      twoWIndices: [9, 10, 11, 12, 13, 14],
      occupiedIndices: [1, 3, 6, 7, 9, 10, 11],
      conflictIndex: 4, // CC-04 conflicting signals
      rate: 35,
    },
    'zone-saibaba': {
      prefix: 'SC',
      total: 14,
      baseLat: 11.0315,
      baseLng: 76.9465,
      latStep: 0.00017,
      lngStep: -0.00022,
      streetName: 'NSR Road Promenade, Saibaba Colony',
      evIndices: [2],
      accIndices: [1],
      twoWIndices: [8, 9, 10, 11, 12, 13, 14],
      occupiedIndices: [2, 6, 8],
      rate: 20,
    },
  };

  Object.entries(zoneConfigs).forEach(([zoneId, cfg]) => {
    for (let i = 1; i <= cfg.total; i++) {
      const spaceNum = i < 10 ? `0${i}` : `${i}`;
      const label = `${cfg.prefix}-${spaceNum}`;
      const spaceId = `sp-${cfg.prefix.toLowerCase()}-${spaceNum}`;

      let kind: ParkingSpace['kind'] = 'standard';
      if (cfg.evIndices.includes(i)) kind = 'ev';
      else if (cfg.accIndices.includes(i)) kind = 'accessible';
      else if (cfg.twoWIndices.includes(i)) kind = 'two_wheeler';

      let status: ParkingSpace['status'] = 'available';
      if (cfg.oosIndex === i) {
        status = 'out_of_service';
      } else if (cfg.conflictIndex === i) {
        status = 'conflict';
      } else if (cfg.occupiedIndices.includes(i)) {
        status = 'occupied';
      }

      // Distribute bays in a deterministic staggered street pattern around each
      // zone centre, avoiding the artificial single-file diagonal seen at overview.
      const radialAngle = i * 2.399963229728653;
      const radialDistance = 0.000055 + (i % 5) * 0.000045;
      const streetPosition = i - (cfg.total + 1) / 2;
      const latOffset = Math.sin(radialAngle) * radialDistance + streetPosition * cfg.latStep * 0.22;
      const lngOffset = Math.cos(radialAngle) * radialDistance + streetPosition * cfg.lngStep * 0.22;
      const spaceLat = Number((cfg.baseLat + latOffset).toFixed(6));
      const spaceLng = Number((cfg.baseLng + lngOffset).toFixed(6));

      spaces.push({
        id: spaceId,
        zoneId,
        label,
        kind,
        status,
        lat: spaceLat,
        lng: spaceLng,
        address: `Bay ${label}, ${cfg.streetName}, Coimbatore`,
        lastVerifiedAt: `${Math.floor(Math.random() * 8) + 1}m ago`,
        hourlyRate: cfg.rate,
        sensorId: `SN-${cfg.prefix}-${spaceNum}`,
      });
    }
  });

  return spaces;
}

export const INITIAL_ALERTS: AuthorityAlert[] = [
  {
    id: 'alert-1',
    type: 'conflict',
    severity: 'clay',
    title: 'Conflicting Availability Signals',
    message: 'Space CC-04 in Cross Cut Road Bazaar shows Optical Sensor "Occupied" vs 2 Citizen reports "Available". On-ground verification required.',
    zoneId: 'zone-crosscut',
    zoneName: 'Cross Cut Road Bazaar',
    spaceId: 'sp-cc-04',
    spaceLabel: 'CC-04',
    timestamp: '12 mins ago',
    epochMs: Date.now() - 12 * 60 * 1000,
    status: 'open',
  },
  {
    id: 'alert-2',
    type: 'out_of_service',
    severity: 'amber',
    title: 'EV Fast Charger Trip Offline',
    message: 'Space GP-05 22kW charging station reported power fault by TANGEDCO telemetry. Slot temporarily marked out of service.',
    zoneId: 'zone-gandhipuram',
    zoneName: 'Gandhipuram Transit Corner',
    spaceId: 'sp-gp-05',
    spaceLabel: 'GP-05',
    timestamp: '34 mins ago',
    epochMs: Date.now() - 34 * 60 * 1000,
    status: 'acknowledged',
    acknowledgedBy: 'Karthik Subramanian, CE',
  },
  {
    id: 'alert-3',
    type: 'no_show',
    severity: 'teal',
    title: 'Hold Expired & Auto-Released',
    message: 'Citizen reservation #HLD-7819 on Race Course East (RC-02) reached the 15-second demonstration timeout without check-in. Space returned to pool.',
    zoneId: 'zone-racecourse',
    zoneName: 'Race Course East',
    spaceId: 'sp-rc-02',
    spaceLabel: 'RC-02',
    timestamp: '45 mins ago',
    epochMs: Date.now() - 45 * 60 * 1000,
    status: 'resolved',
    resolvedBy: 'System Auto-Janitor',
  },
  {
    id: 'alert-4',
    type: 'contradicting_reports',
    severity: 'amber',
    title: 'Contradicting Citizen Reports',
    message: 'Gandhipuram Transit Corner received 3 contradictory crowd signals in last 15m (2 report full, 1 reports empty accessible slot).',
    zoneId: 'zone-gandhipuram',
    zoneName: 'Gandhipuram Transit Corner',
    timestamp: '1 hour ago',
    epochMs: Date.now() - 60 * 60 * 1000,
    status: 'open',
  },
];

export const INITIAL_COMMUNITY_REPORTS: CommunityReport[] = [
  {
    id: 'rep-1',
    zoneId: 'zone-rspuram',
    zoneName: 'R.S. Puram Market Edge',
    spaceLabel: 'RS-08',
    type: 'free_space',
    description: 'Vehicle just moved out near post office gate, slot completely clear.',
    confidenceScore: 78,
    status: 'corroborated',
    submittedAt: '18m ago',
    submittedBy: 'Citizen Suresh K.',
  },
  {
    id: 'rep-2',
    zoneId: 'zone-crosscut',
    zoneName: 'Cross Cut Road Bazaar',
    spaceLabel: 'CC-04',
    type: 'free_space',
    description: 'No car here, only delivery boxes on the curb edge.',
    confidenceScore: 45,
    status: 'pending',
    submittedAt: '12m ago',
    submittedBy: 'Citizen Vignesh P.',
  },
  {
    id: 'rep-3',
    zoneId: 'zone-townhall',
    zoneName: 'Town Hall North',
    spaceLabel: 'TH-02',
    type: 'accessibility_note',
    description: 'Accessible ramp has temporary merchant cardboard obstruction.',
    confidenceScore: 88,
    status: 'corroborated',
    submittedAt: '40m ago',
    submittedBy: 'Citizen Meenakshi S.',
  },
];

export const INITIAL_AUDIT_LOG: (AvailabilityEvent | AuthorityAction)[] = [
  {
    id: 'aud-1',
    timestamp: '14:52:10',
    epochMs: Date.now() - 6 * 60 * 1000,
    spaceId: 'sp-th-04',
    spaceLabel: 'TH-04',
    zoneId: 'zone-townhall',
    zoneName: 'Town Hall North',
    previousStatus: 'available',
    nextStatus: 'held',
    source: 'Citizen mobile app (10-min hold)',
    notes: 'Reservation session created by user TN-37-CY-8842',
    type: 'system_event',
  },
  {
    id: 'aud-2',
    timestamp: '14:48:33',
    epochMs: Date.now() - 10 * 60 * 1000,
    actionType: 'price_approval',
    adminName: 'Karthik Subramanian, CE (Traffic)',
    zoneId: 'zone-gandhipuram',
    zoneName: 'Gandhipuram Transit Corner',
    details: 'Approved peak dynamic tariff adjust: ₹35/hr → ₹40/hr based on 86% occupancy pressure.',
    previousValue: '₹35/hr',
    newValue: '₹40/hr',
    type: 'authority_action',
  },
  {
    id: 'aud-3',
    timestamp: '14:40:02',
    epochMs: Date.now() - 18 * 60 * 1000,
    spaceId: 'sp-rc-02',
    spaceLabel: 'RC-02',
    zoneId: 'zone-racecourse',
    zoneName: 'Race Course East',
    previousStatus: 'held',
    nextStatus: 'available',
    source: 'Expired pilot hold auto-release',
    notes: 'Citizen did not arrive within the 15-second demonstration hold window. Hold auto-cleared.',
    type: 'system_event',
  },
  {
    id: 'aud-4',
    timestamp: '14:25:19',
    epochMs: Date.now() - 33 * 60 * 1000,
    actionType: 'alert_acknowledge',
    adminName: 'Karthik Subramanian, CE (Traffic)',
    zoneId: 'zone-gandhipuram',
    zoneName: 'Gandhipuram Transit Corner',
    details: 'Acknowledged EV charger fault telemetry on GP-05 and flagged municipal field electrician.',
    type: 'authority_action',
  },
  {
    id: 'aud-5',
    timestamp: '14:10:44',
    epochMs: Date.now() - 48 * 60 * 1000,
    spaceId: 'sp-db-03',
    spaceLabel: 'DB-03',
    zoneId: 'zone-dbroad',
    zoneName: 'DB Road Commercial Hub',
    previousStatus: 'occupied',
    nextStatus: 'available',
    source: 'Ground magnetometer departure event',
    notes: 'Optical and magnetic sensors corroborated clear space.',
    type: 'system_event',
  },
];

export const DEMO_USERS: Record<string, User> = {
  citizen: {
    id: 'usr-ananya',
    name: 'Ananya Ramanathan',
    email: 'citizen@curbsense.city',
    role: 'citizen',
    avatarInitials: 'AR',
    vehiclePlate: 'TN 38 CY 8842',
    defaultVehicle: 'hatchback',
    permitStatus: 'verified',
    permitId: 'CBE-PWD-2026-9081',
  },
  citizen_suresh: {
    id: 'usr-suresh',
    name: 'Suresh Kumar',
    email: 'suresh.k@gmail.com',
    role: 'citizen',
    avatarInitials: 'SK',
    vehiclePlate: 'TN 37 AB 1234',
    defaultVehicle: 'two_wheeler',
    permitStatus: 'none',
  },
  admin: {
    id: 'ADMIN01',
    name: 'Karthik Subramanian',
    title: 'Chief Engineer (Traffic & Mobility)',
    email: 'karthik.traffic@ccmc.gov.in',
    role: 'admin',
    avatarInitials: 'KS',
    vehiclePlate: 'TN 38 G 0014',
    defaultVehicle: 'hatchback',
    permitStatus: 'none',
  },
  admin_priya: {
    id: 'adm-priya',
    name: 'Priya Rajendran',
    title: 'Senior Municipal Systems Officer',
    email: 'priya.mobility@ccmc.gov.in',
    role: 'admin',
    avatarInitials: 'PR',
    vehiclePlate: 'TN 38 G 0088',
    defaultVehicle: 'ev',
    permitStatus: 'none',
  },
};

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Accessible Permit Verified',
    message: 'Your Coimbatore Municipal Disabled Parking Permit #CBE-PWD-2026-9081 is active and valid for all designated accessible bays.',
    type: 'permit',
    timestamp: '1 hour ago',
    read: false,
  },
  {
    id: 'notif-2',
    title: 'Low Availability Notice: R.S. Puram',
    message: 'High parking demand in R.S. Puram Market Edge (only 2 bays remaining). Reserve early to guarantee a spot.',
    type: 'alert',
    timestamp: '2 hours ago',
    read: false,
  },
  {
    id: 'notif-3',
    title: 'Session Completed: Race Course East',
    message: 'Your previous session on RC-08 completed smoothly. Receipt ₹60.00 generated.',
    type: 'success',
    timestamp: 'Yesterday',
    read: true,
  },
];

export const INITIAL_STAFF_MEMBERS: StaffMember[] = [
  {
    id: 'stf-1',
    name: 'Karthik Subramanian',
    email: 'karthik.traffic@ccmc.gov.in',
    role: 'Chief Engineer',
    department: 'Traffic & Urban Mobility Wing',
    status: 'active',
    avatarInitials: 'KS',
  },
  {
    id: 'stf-2',
    name: 'Priya Rajendran',
    email: 'priya.mobility@ccmc.gov.in',
    role: 'Traffic Engineer',
    department: 'Smart City Operations',
    status: 'active',
    avatarInitials: 'PR',
  },
  {
    id: 'stf-3',
    name: 'Warden R. Murugan',
    email: 'murugan.warden@ccmc.gov.in',
    role: 'Enforcement Warden',
    department: 'West Zone Field Enforcement',
    status: 'active',
    avatarInitials: 'RM',
  },
  {
    id: 'stf-4',
    name: 'Field Officer S. Selvam',
    email: 'selvam.ops@ccmc.gov.in',
    role: 'Enforcement Warden',
    department: 'Central Core Patrol',
    status: 'active',
    avatarInitials: 'SS',
  },
  {
    id: 'stf-5',
    name: 'Vignesh Balaji',
    email: 'vignesh.iot@ccmc.gov.in',
    role: 'Sensor Technician',
    department: 'Curb Telemetry & Sensor Mesh',
    status: 'active',
    avatarInitials: 'VB',
  },
];

export const INITIAL_PENDING_PERMITS: AccessibilityPermit[] = [
  {
    permitNumber: 'CBE-UDID-2026-4412',
    holderName: 'M. Senthilkumar',
    applicantEmail: 'senthil.m@gmail.com',
    vehiclePlate: 'TN 38 BE 7712',
    disabilityId: 'UDID-TN-12-887410-09',
    issueAuthority: 'District Disability Rehabilitation Office, Coimbatore',
    validUntil: '2028-12-31',
    status: 'pending',
    documentName: 'UDID_Smart_Card_Front_Scan.pdf',
    submittedAt: 'Today, 09:30 AM',
  },
  {
    permitNumber: 'CBE-UDID-2026-8921',
    holderName: 'Dr. Radhika Viswanathan',
    applicantEmail: 'dr.radhika.v@outlook.com',
    vehiclePlate: 'TN 37 AF 4409',
    disabilityId: 'UDID-TN-14-300912-77',
    issueAuthority: 'Government Medical College Hospital, Coimbatore',
    validUntil: '2029-06-30',
    status: 'pending',
    documentName: 'Disability_Medical_Certificate_Scan.pdf',
    submittedAt: 'Yesterday, 04:15 PM',
  },
  {
    permitNumber: 'CBE-UDID-2026-1049',
    holderName: 'K. Balakrishnan',
    applicantEmail: 'bala.krishnan@yahoo.co.in',
    vehiclePlate: 'TN 38 DF 2020',
    disabilityId: 'UDID-TN-09-551209-14',
    issueAuthority: 'Dept of Empowerment of Persons with Disabilities, TN',
    validUntil: '2027-08-15',
    status: 'pending',
    documentName: 'TN_State_Accessible_Parking_Proof.pdf',
    submittedAt: '2 days ago',
  },
];

export const INITIAL_POLICY_SETTINGS: PolicySettings = {
  floorMultiplier: 0.85,
  capMultiplier: 1.6,
  maxStepPercent: 15,
  sensitivity: 'normal',
};

export const INITIAL_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  criticalAlertsDashboard: true,
  criticalAlertsEmail: true,
  priceSurgeDashboard: true,
  priceSurgeEmail: false,
  permitSubmissionsDashboard: true,
  permitSubmissionsEmail: true,
  sensorFaultsDashboard: true,
  sensorFaultsEmail: false,
};

export const INITIAL_CITIZEN_TRUST_STATS: Record<string, CitizenTrustStat> = {
  'Citizen Suresh K.': {
    name: 'Citizen Suresh K.',
    totalReports: 18,
    corroboratedReports: 17,
    trustScore: 94,
  },
  'Citizen Vignesh P.': {
    name: 'Citizen Vignesh P.',
    totalReports: 7,
    corroboratedReports: 4,
    trustScore: 57,
  },
  'Citizen Meenakshi S.': {
    name: 'Citizen Meenakshi S.',
    totalReports: 22,
    corroboratedReports: 21,
    trustScore: 98,
  },
  'Ananya Ramanathan': {
    name: 'Ananya Ramanathan',
    totalReports: 14,
    corroboratedReports: 13,
    trustScore: 93,
  },
};
