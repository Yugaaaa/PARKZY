import React, { useState } from 'react';
import {
  Settings,
  Shield,
  UserPlus,
  Users,
  Bell,
  CheckCircle2,
  Lock,
  Building,
  Clock,
  DollarSign,
  Smartphone,
  Mail,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { StaffMember, NotificationPreferences } from '../../types';

interface AuthoritySettingsViewProps {
  staffMembers: StaffMember[];
  notificationPreferences: NotificationPreferences;
  addStaffMember: (staff: Omit<StaffMember, 'id'>) => void;
  toggleStaffStatus: (staffId: string) => void;
  onShowToast: (msg: string) => void;
}

export const AuthoritySettingsView: React.FC<AuthoritySettingsViewProps> = ({
  staffMembers,
  notificationPreferences,
  addStaffMember,
  toggleStaffStatus,
  onShowToast,
}) => {
  // Local city config state
  const [cityName, setCityName] = useState('Coimbatore City Municipal Corporation (CCMC)');
  const [pilotSector, setPilotSector] = useState('Pilot Sector 1 - Commercial Corridors');
  const [holdWindowMinutes, setHoldWindowMinutes] = useState(10);
  const [currencySymbol, setCurrencySymbol] = useState('₹ (INR)');

  // Local notification toggles
  const [smsAlerts, setSmsAlerts] = useState(notificationPreferences.smsAlerts);
  const [emailDigest, setEmailDigest] = useState(notificationPreferences.emailDigest);
  const [criticalConflictPush, setCriticalConflictPush] = useState(notificationPreferences.criticalConflictPush);
  const [fastTagSync, setFastTagSync] = useState(notificationPreferences.fastTagSync);

  // Onboard modal
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<'admin' | 'field_warden' | 'traffic_analyst'>('field_warden');
  const [newStaffDept, setNewStaffDept] = useState('CCMC Field Enforcement');
  const [newStaffPhone, setNewStaffPhone] = useState('+91 98401 23456');

  const handleSaveCityConfig = (e: React.FormEvent) => {
    e.preventDefault();
    onShowToast('Pilot city configuration saved successfully.');
  };

  const handleOnboardOfficer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName.trim() || !newStaffEmail.trim()) return;

    addStaffMember({
      name: newStaffName,
      email: newStaffEmail,
      role: newStaffRole,
      department: newStaffDept,
      phone: newStaffPhone,
      active: true,
      lastActive: 'Just now',
    });

    onShowToast(`Onboarded officer ${newStaffName} (${newStaffRole}).`);
    setIsOnboardModalOpen(false);
    setNewStaffName('');
    setNewStaffEmail('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-graphite dark:text-sand-100 flex items-center gap-2">
            System Settings & Officer Roster
          </h1>
          <p className="text-xs text-graphite-muted dark:text-sand-400">
            Municipal pilot deployment parameters, role-based access delegation, and automated telemetry triggers.
          </p>
        </div>

        <button
          onClick={() => setIsOnboardModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-teal text-sand-50 font-bold text-xs shadow-md hover:bg-teal-light transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Onboard New Officer</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 cols: Pilot Configuration Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-2xl bg-sand-50 dark:bg-graphite border border-sand-300 dark:border-graphite-light shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-sand-300 dark:border-graphite-light">
              <Building className="w-5 h-5 text-teal" />
              <h2 className="font-serif font-bold text-graphite dark:text-sand-100 text-base">
                Smart City Pilot Configuration
              </h2>
            </div>

            <form onSubmit={handleSaveCityConfig} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-graphite dark:text-sand-200 mb-1">
                  Municipal Authority / Corporation Name
                </label>
                <input
                  type="text"
                  value={cityName}
                  onChange={(e) => setCityName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-sand-300 dark:border-graphite-light bg-sand-100 dark:bg-graphite-dark text-graphite dark:text-sand-100 focus:outline-none focus:border-teal"
                />
              </div>

              <div>
                <label className="block font-semibold text-graphite dark:text-sand-200 mb-1">
                  Active Pilot Sector
                </label>
                <input
                  type="text"
                  value={pilotSector}
                  onChange={(e) => setPilotSector(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-sand-300 dark:border-graphite-light bg-sand-100 dark:bg-graphite-dark text-graphite dark:text-sand-100 focus:outline-none focus:border-teal"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-graphite dark:text-sand-200 mb-1">
                    Hold Window Duration (mins)
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={30}
                    value={holdWindowMinutes}
                    onChange={(e) => setHoldWindowMinutes(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-sand-300 dark:border-graphite-light bg-sand-100 dark:bg-graphite-dark text-graphite dark:text-sand-100 focus:outline-none focus:border-teal font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-graphite dark:text-sand-200 mb-1">
                    Currency & Standard
                  </label>
                  <input
                    type="text"
                    disabled
                    value={currencySymbol}
                    className="w-full p-2.5 rounded-xl border border-sand-300 dark:border-graphite-light bg-sand-200/60 dark:bg-graphite-light/60 text-graphite-muted cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal text-sand-50 font-bold shadow-md hover:bg-teal-light transition-all"
                >
                  Save Parameters
                </button>
              </div>
            </form>
          </div>

          {/* Automated Notification & FastTag Integration Toggles */}
          <div className="p-6 rounded-2xl bg-sand-50 dark:bg-graphite border border-sand-300 dark:border-graphite-light shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-sand-300 dark:border-graphite-light">
              <Bell className="w-5 h-5 text-teal" />
              <h2 className="font-serif font-bold text-graphite dark:text-sand-100 text-base">
                Automated Gateway & Alert Triggers
              </h2>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-sand-100 dark:bg-graphite-dark">
                <div>
                  <div className="font-semibold text-graphite dark:text-sand-100">
                    NPCI FASTag Real-Time Reconciliation
                  </div>
                  <div className="text-[11px] text-graphite-muted dark:text-sand-400">
                    Sync automatic exit debit directly with national vehicle registry
                  </div>
                </div>
                <button
                  onClick={() => {
                    setFastTagSync(!fastTagSync);
                    onShowToast(`FASTag Auto-Sync ${!fastTagSync ? 'Enabled' : 'Disabled'}.`);
                  }}
                  className="text-teal"
                >
                  {fastTagSync ? <ToggleRight className="w-7 h-7 text-teal" /> : <ToggleLeft className="w-7 h-7 text-graphite-muted" />}
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-sand-100 dark:bg-graphite-dark">
                <div>
                  <div className="font-semibold text-graphite dark:text-sand-100">
                    SMS Escalation for Critical Incidents
                  </div>
                  <div className="text-[11px] text-graphite-muted dark:text-sand-400">
                    Direct SMS dispatch to field warden mobile on physical bay conflicts
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSmsAlerts(!smsAlerts);
                    onShowToast(`SMS Escalation ${!smsAlerts ? 'Enabled' : 'Disabled'}.`);
                  }}
                  className="text-teal"
                >
                  {smsAlerts ? <ToggleRight className="w-7 h-7 text-teal" /> : <ToggleLeft className="w-7 h-7 text-graphite-muted" />}
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-sand-100 dark:bg-graphite-dark">
                <div>
                  <div className="font-semibold text-graphite dark:text-sand-100">
                    Morning Municipal Executive Digest
                  </div>
                  <div className="text-[11px] text-graphite-muted dark:text-sand-400">
                    Automated 07:00 AM CSV revenue & turnover brief to Commissioner's office
                  </div>
                </div>
                <button
                  onClick={() => {
                    setEmailDigest(!emailDigest);
                    onShowToast(`Morning Digest ${!emailDigest ? 'Enabled' : 'Disabled'}.`);
                  }}
                  className="text-teal"
                >
                  {emailDigest ? <ToggleRight className="w-7 h-7 text-teal" /> : <ToggleLeft className="w-7 h-7 text-graphite-muted" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right 5 cols: Municipal Staff & Officers Roster */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-sand-50 dark:bg-graphite border border-sand-300 dark:border-graphite-light shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-sand-300 dark:border-graphite-light">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-teal" />
              <h2 className="font-serif font-bold text-graphite dark:text-sand-100 text-base">
                Authorized Officers
              </h2>
            </div>
            <span className="text-[11px] font-bold text-teal">
              {staffMembers.filter((s) => s.active).length} On Duty
            </span>
          </div>

          <div className="space-y-3">
            {staffMembers.map((staff) => (
              <div
                key={staff.id}
                className="p-3 rounded-xl bg-sand-100 dark:bg-graphite-dark border border-sand-200 dark:border-graphite-light flex items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-graphite dark:text-sand-100">
                      {staff.name}
                    </span>
                    <span
                      className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded ${
                        staff.role === 'admin'
                          ? 'bg-clay/15 text-clay'
                          : staff.role === 'field_warden'
                          ? 'bg-amber-500/15 text-amber-600'
                          : 'bg-teal/15 text-teal'
                      }`}
                    >
                      {staff.role.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="text-[11px] text-graphite-muted dark:text-sand-400">
                    {staff.department} • {staff.phone}
                  </div>

                  <div className="text-[10px] text-graphite-muted dark:text-sand-400">
                    Last active: {staff.lastActive}
                  </div>
                </div>

                <button
                  onClick={() => {
                    toggleStaffStatus(staff.id);
                    onShowToast(`Toggled duty status for ${staff.name}.`);
                  }}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase transition-colors shrink-0 ${
                    staff.active
                      ? 'bg-moss/15 text-moss hover:bg-moss/25'
                      : 'bg-sand-200 text-graphite-muted hover:bg-sand-300'
                  }`}
                >
                  {staff.active ? 'On Duty' : 'Off Duty'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Onboard Officer Modal */}
      {isOnboardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-graphite-dark/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-sand-50 dark:bg-graphite rounded-3xl border border-sand-300 dark:border-graphite-light p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-graphite dark:text-sand-100 text-base">
                Onboard Municipal Officer
              </h3>
              <button onClick={() => setIsOnboardModalOpen(false)} className="text-graphite-muted text-sm">
                ✕
              </button>
            </div>

            <form onSubmit={handleOnboardOfficer} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-graphite dark:text-sand-200 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Officer K. Muthuswamy"
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl border border-sand-300 dark:border-graphite-light bg-sand-100 dark:bg-graphite-dark text-graphite dark:text-sand-100 focus:outline-none focus:border-teal"
                />
              </div>

              <div>
                <label className="block font-semibold text-graphite dark:text-sand-200 mb-1">
                  Gov Email ID
                </label>
                <input
                  type="email"
                  placeholder="e.g. muthuswamy@coimbatorecorp.gov.in"
                  value={newStaffEmail}
                  onChange={(e) => setNewStaffEmail(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl border border-sand-300 dark:border-graphite-light bg-sand-100 dark:bg-graphite-dark text-graphite dark:text-sand-100 focus:outline-none focus:border-teal"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-graphite dark:text-sand-200 mb-1">
                    Role Clearance
                  </label>
                  <select
                    value={newStaffRole}
                    onChange={(e) => setNewStaffRole(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-sand-300 dark:border-graphite-light bg-sand-100 dark:bg-graphite-dark text-graphite dark:text-sand-100 font-semibold focus:outline-none focus:border-teal"
                  >
                    <option value="field_warden">Field Warden</option>
                    <option value="traffic_analyst">Traffic Analyst</option>
                    <option value="admin">Operations Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-graphite dark:text-sand-200 mb-1">
                    Mobile Phone
                  </label>
                  <input
                    type="text"
                    value={newStaffPhone}
                    onChange={(e) => setNewStaffPhone(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-sand-300 dark:border-graphite-light bg-sand-100 dark:bg-graphite-dark text-graphite dark:text-sand-100 focus:outline-none focus:border-teal"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-graphite dark:text-sand-200 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={newStaffDept}
                  onChange={(e) => setNewStaffDept(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl border border-sand-300 dark:border-graphite-light bg-sand-100 dark:bg-graphite-dark text-graphite dark:text-sand-100 focus:outline-none focus:border-teal"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsOnboardModalOpen(false)}
                  className="px-4 py-2 rounded-xl font-semibold text-graphite-muted hover:bg-sand-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal text-sand-50 font-bold shadow-md hover:bg-teal-light transition-all"
                >
                  Grant Officer Access
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
