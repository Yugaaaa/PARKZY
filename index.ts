export type SpaceKind = 'standard' | 'ev' | 'accessible' | 'two_wheeler';
export type SpaceStatus = 'available' | 'held' | 'reserved' | 'occupied' | 'conflict' | 'out_of_service';
export type VehicleType = 'two_wheeler' | 'hatchback' | 'ev';

export type ReservationStatus =
  | 'held'
  | 'confirmed'
  | 'checked_in'
  | 'active_session'
  | 'completed'
  | 'cancelled'
  | 'expired'
  | 'no_show'
  | 'conflict';

export interface ParkingSpace {
  id: string;
  zoneId: string;
  label: string; // e.g. "TH-01", "RS-04"
  kind: SpaceKind;
  status: SpaceStatus;
  lat: number;
  lng: number;
  address?: string;
  lastVerifiedAt: string; // ISO or relative
  heldUntil?: number | null; // epoch ms
  heldByUserId?: string;
  currentVehicleType?: VehicleType;
  hourlyRate: number;
  sensorId?: string;
}

export interface ParkingZone {
  id: string;
  name: string;
  area: string; // e.g. "Central Business District", "West Zone"
  lat: number;
  lng: number;
  mapX: number; // 0-100 relative SVG coordinate
  mapY: number; // 0-100 relative SVG coordinate
  hourlyRate: number;
  sourceLabel: string; // e.g. "CurbSense pilot availability service"
  confidenceScore: number; // 0-100
  lastVerifiedMinutesAgo: number;
  description: string;
  compatibleVehicleKinds: SpaceKind[];
  featuredStreet: string;
  landmark: string;
}

export interface Reservation {
  id: string;
  spaceId: string;
  spaceLabel: string;
  zoneId: string;
  zoneName: string;
  vehicleType: VehicleType;
  vehiclePlate: string;
  status: ReservationStatus;
  createdAt: number; // epoch ms
  heldUntil: number; // epoch ms (10 min after creation)
  durationHours: number;
  hourlyRate: number;
  totalAmount: number;
  passCode: string;
  qrPayload: string;
  checkedInAt?: number;
  sessionExpiresAt?: number;
  completedAt?: number;
  permitReference?: string;
}

export interface AvailabilityEvent {
  id: string;
  timestamp: string;
  epochMs: number;
  spaceId: string;
  spaceLabel: string;
  zoneId: string;
  zoneName: string;
  previousStatus: SpaceStatus;
  nextStatus: SpaceStatus;
  source: string;
  notes?: string;
  type: 'system_event';
}

export interface AuthorityAction {
  id: string;
  timestamp: string;
  epochMs: number;
  actionType: 'price_override' | 'price_approval' | 'alert_acknowledge' | 'alert_resolve' | 'alert_dismiss' | 'space_maintenance' | 'policy_update';
  adminName: string;
  zoneId?: string;
  zoneName?: string;
  details: string;
  previousValue?: string | number;
  newValue?: string | number;
  type: 'authority_action';
}

export type AuditEntry = (AvailabilityEvent | AuthorityAction) & {
  type: 'system_event' | 'authority_action';
};

export type ReportType = 'free_space' | 'spaces_occupied' | 'accessibility_note';
export type ReportStatus = 'pending' | 'corroborated' | 'dismissed' | 'expired';

export interface CommunityReport {
  id: string;
  zoneId: string;
  zoneName: string;
  spaceLabel?: string;
  type: ReportType;
  description: string;
  photoUrl?: string;
  confidenceScore: number;
  status: ReportStatus;
  submittedAt: string;
  submittedBy: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'citizen' | 'admin';
  title?: string;
  avatarInitials: string;
  vehiclePlate: string;
  defaultVehicle: VehicleType;
  permitStatus: 'none' | 'pending' | 'verified' | 'rejected';
  permitId?: string;
}

export type AlertSeverity = 'clay' | 'amber' | 'teal';
export type AlertStatus = 'open' | 'acknowledged' | 'investigating' | 'resolved' | 'dismissed';

export interface AuthorityAlert {
  id: string;
  type: 'conflict' | 'out_of_service' | 'no_show' | 'contradicting_reports';
  severity: AlertSeverity;
  title: string;
  message: string;
  zoneId: string;
  zoneName: string;
  spaceId?: string;
  spaceLabel?: string;
  timestamp: string;
  epochMs: number;
  status: AlertStatus;
  acknowledgedBy?: string;
  resolvedBy?: string;
  assignedTo?: string;
  resolutionNote?: string;
  relatedReportId?: string;
}

export interface ZonePricingRecommendation {
  zoneId: string;
  zoneName: string;
  area: string;
  baseRate: number;
  currentRate: number;
  recommendedRate: number;
  occupancyPressureCurrent: number; // 0-100%
  occupancyPressureForecast: number; // 0-100%
  combinedPressure: number; // 0.6*curr + 0.4*forecast
  rateMultiplier: number; // bounded 0.85x - 1.6x
  changePercent: number; // capped at +-15%
  explanation: string;
  status: 'pending' | 'approved' | 'held';
  approvedRate?: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'alert' | 'success' | 'permit';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

export interface AccessibilityPermit {
  permitNumber: string;
  holderName: string;
  applicantEmail?: string;
  vehiclePlate?: string;
  disabilityId: string;
  issueAuthority: string;
  validUntil: string;
  status: 'pending' | 'verified' | 'rejected';
  documentName?: string;
  submittedAt: string;
  rejectionReason?: string;
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: 'Traffic Engineer' | 'Chief Engineer' | 'Enforcement Warden' | 'Sensor Technician' | 'Policy Analyst';
  department: string;
  status: 'active' | 'inactive';
  avatarInitials: string;
}

export interface PolicySettings {
  floorMultiplier: number;
  capMultiplier: number;
  maxStepPercent: number;
  sensitivity: 'low' | 'normal' | 'aggressive';
}

export interface NotificationPreferences {
  criticalAlertsDashboard: boolean;
  criticalAlertsEmail: boolean;
  priceSurgeDashboard: boolean;
  priceSurgeEmail: boolean;
  permitSubmissionsDashboard: boolean;
  permitSubmissionsEmail: boolean;
  sensorFaultsDashboard: boolean;
  sensorFaultsEmail: boolean;
}

export interface CitizenTrustStat {
  name: string;
  totalReports: number;
  corroboratedReports: number;
  trustScore: number; // 0-100
}
