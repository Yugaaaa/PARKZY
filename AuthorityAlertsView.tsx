import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Clock,
  UserCheck,
  Search,
  Filter,
  XCircle,
  MessageSquare,
  Wrench,
  Check,
  ChevronLeft,
  ChevronRight,
  User,
} from 'lucide-react';
import { AuthorityAlert, AlertSeverity, AlertStatus, StaffMember } from '../../types';

interface AuthorityAlertsViewProps {
  alerts: AuthorityAlert[];
  staffMembers: StaffMember[];
  acknowledgeAlert: (alertId: string) => void;
  assignAlert: (alertId: string, staffName: string) => void;
  resolveAlertWithNote: (alertId: string, resolutionNote: string, staffName?: string) => void;
  dismissAlert: (alertId: string) => void;
  onShowToast: (msg: string) => void;
}

export const AuthorityAlertsView: React.FC<AuthorityAlertsViewProps> = ({
  alerts,
  staffMembers,
  acknowledgeAlert,
  assignAlert,
  resolveAlertWithNote,
  dismissAlert,
  onShowToast,
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'investigating' | 'resolved' | 'dismissed'>('all');
  const [severityFilter, setSeverityFilter] = useState<'all' | AlertSeverity>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Modals
  const [assignModalAlert, setAssignModalAlert] = useState<AuthorityAlert | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<string>(staffMembers[0]?.name || 'Officer Suresh Kumar');

  const [resolveModalAlert, setResolveModalAlert] = useState<AuthorityAlert | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      if (statusFilter !== 'all' && alert.status !== statusFilter) return false;
      if (severityFilter !== 'all' && alert.severity !== severityFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          alert.title.toLowerCase().includes(q) ||
          alert.zoneName.toLowerCase().includes(q) ||
          (alert.spaceLabel && alert.spaceLabel.toLowerCase().includes(q)) ||
          alert.description.toLowerCase().includes(q) ||
          (alert.assignedTo && alert.assignedTo.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [alerts, statusFilter, severityFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredAlerts.length / pageSize));
  const paginatedAlerts = filteredAlerts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignModalAlert) return;
    assignAlert(assignModalAlert.id, selectedStaff);
    onShowToast(`Assigned incident "${assignModalAlert.title}" to ${selectedStaff}.`);
    setAssignModalAlert(null);
  };

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolveModalAlert) return;
    resolveAlertWithNote(resolveModalAlert.id, resolutionNote || 'Resolved on-ground by warden inspection.');
    onShowToast(`Resolved incident "${resolveModalAlert.title}".`);
    setResolveModalAlert(null);
    setResolutionNote('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-graphite dark:text-sand-100 flex items-center gap-2">
            Curbside Incidents & Anomaly Triage
          </h1>
          <p className="text-xs text-graphite-muted dark:text-sand-400">
            Automated sensor dispute detection, physical occupancy conflicts, and field warden dispatch.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold">
          <span className="px-3 py-1.5 rounded-xl bg-clay/15 text-clay border border-clay/20">
            {alerts.filter((a) => a.status === 'open').length} Open
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-amber-500/15 text-amber-600 border border-amber-500/20">
            {alerts.filter((a) => a.status === 'investigating').length} In Progress
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-moss/15 text-moss border border-moss/20">
            {alerts.filter((a) => a.status === 'resolved').length} Resolved
          </span>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="p-4 rounded-2xl bg-sand-50 dark:bg-graphite border border-sand-300 dark:border-graphite-light shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar pb-1 md:pb-0">
          {(['all', 'open', 'investigating', 'resolved', 'dismissed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => {
                setStatusFilter(status);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize shrink-0 transition-all ${
                statusFilter === status
                  ? 'bg-teal text-sand-50 shadow-sm'
                  : 'text-graphite-muted dark:text-sand-400 hover:text-graphite hover:bg-sand-200 dark:hover:bg-graphite-light'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Severity & Search */}
        <div className="flex items-center gap-3">
          <select
            value={severityFilter}
            onChange={(e) => {
              setSeverityFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 rounded-xl border border-sand-300 dark:border-graphite-light bg-sand-100 dark:bg-graphite-dark text-xs text-graphite dark:text-sand-100 font-medium focus:outline-none focus:border-teal"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical Only</option>
            <option value="warning">Warnings</option>
            <option value="info">Info Notices</option>
          </select>

          <div className="relative">
            <input
              type="text"
              placeholder="Search incidents, bays, zones..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-48 sm:w-60 pl-8 pr-3 py-1.5 rounded-xl border border-sand-300 dark:border-graphite-light bg-sand-100 dark:bg-graphite-dark text-xs text-graphite dark:text-sand-100 focus:outline-none focus:border-teal"
            />
            <Search className="w-3.5 h-3.5 text-graphite-muted dark:text-sand-400 absolute left-2.5 top-2" />
          </div>
        </div>
      </div>

      {/* Incidents List */}
      <div className="space-y-3">
        {paginatedAlerts.length === 0 ? (
          <div className="p-12 text-center bg-sand-50 dark:bg-graphite rounded-2xl border border-sand-300 dark:border-graphite-light text-graphite-muted dark:text-sand-400 text-xs">
            No incidents match your selected filters.
          </div>
        ) : (
          paginatedAlerts.map((alert) => {
            const isCritical = alert.severity === 'critical';
            const isWarning = alert.severity === 'warning';

            return (
              <div
                key={alert.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  alert.status === 'resolved' || alert.status === 'dismissed'
                    ? 'bg-sand-50/60 dark:bg-graphite/60 border-sand-300 dark:border-graphite-light opacity-80'
                    : isCritical
                    ? 'bg-clay/5 dark:bg-clay/10 border-clay/30 shadow-sm'
                    : 'bg-sand-50 dark:bg-graphite border-sand-300 dark:border-graphite-light shadow-sm'
                }`}
              >
                {/* Alert Information */}
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] uppercase font-bold ${
                        isCritical
                          ? 'bg-clay text-sand-50'
                          : isWarning
                          ? 'bg-amber-500 text-sand-50'
                          : 'bg-teal text-sand-50'
                      }`}
                    >
                      {alert.severity}
                    </span>

                    <h3 className="font-serif font-bold text-graphite dark:text-sand-100 text-sm">
                      {alert.title}
                    </h3>

                    {alert.spaceLabel && (
                      <span className="px-2 py-0.5 rounded-md bg-sand-200 dark:bg-graphite-light text-[10px] font-bold font-mono text-graphite dark:text-sand-200">
                        Bay {alert.spaceLabel}
                      </span>
                    )}

                    <span className="text-[11px] text-graphite-muted dark:text-sand-400">
                      {alert.zoneName}
                    </span>

                    <span className="text-[10px] text-graphite-muted dark:text-sand-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {alert.timestamp}
                    </span>
                  </div>

                  <p className="text-xs text-graphite-muted dark:text-sand-300">
                    {alert.description}
                  </p>

                  {/* Field Officer Assignment / Resolution Notes */}
                  <div className="flex items-center gap-3 text-[11px] pt-1">
                    {alert.assignedTo ? (
                      <span className="text-teal font-semibold flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5" /> Assigned to {alert.assignedTo}
                      </span>
                    ) : (
                      <span className="text-graphite-muted dark:text-sand-400 italic">
                        Unassigned
                      </span>
                    )}

                    {alert.resolutionNote && (
                      <span className="text-moss font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {alert.resolutionNote}
                      </span>
                    )}
                  </div>
                </div>

                {/* Workflow Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {alert.status !== 'resolved' && alert.status !== 'dismissed' && (
                    <>
                      <button
                        onClick={() => {
                          setAssignModalAlert(alert);
                          setSelectedStaff(alert.assignedTo || staffMembers[0]?.name || '');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-sand-200 dark:bg-graphite-light hover:bg-sand-300 dark:hover:bg-graphite-dark text-xs font-semibold text-graphite dark:text-sand-100 flex items-center gap-1 transition-colors"
                      >
                        <User className="w-3.5 h-3.5 text-teal" />
                        <span>Assign</span>
                      </button>

                      {alert.status === 'open' && (
                        <button
                          onClick={() => {
                            acknowledgeAlert(alert.id);
                            onShowToast(`Acknowledged incident "${alert.title}".`);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-sand-200 dark:bg-graphite-light hover:bg-sand-300 text-xs font-semibold text-graphite dark:text-sand-100 transition-colors"
                        >
                          Ack
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setResolveModalAlert(alert);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-moss text-sand-50 text-xs font-bold shadow-sm hover:bg-moss/90 transition-all flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Resolve</span>
                      </button>

                      <button
                        onClick={() => {
                          dismissAlert(alert.id);
                          onShowToast(`Dismissed alert "${alert.title}".`);
                        }}
                        className="p-1.5 rounded-xl text-graphite-muted hover:text-clay transition-colors"
                        title="Dismiss alert"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  {(alert.status === 'resolved' || alert.status === 'dismissed') && (
                    <span className="text-[11px] font-bold uppercase px-2.5 py-1 rounded-xl bg-sand-200 dark:bg-graphite-light text-graphite-muted">
                      {alert.status}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-4 bg-sand-50 dark:bg-graphite rounded-2xl border border-sand-300 dark:border-graphite-light text-xs">
          <span className="text-graphite-muted dark:text-sand-400">
            Showing {(currentPage - 1) * pageSize + 1} -{' '}
            {Math.min(currentPage * pageSize, filteredAlerts.length)} of {filteredAlerts.length} incidents
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-sand-300 dark:border-graphite-light disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-graphite dark:text-sand-100">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-sand-300 dark:border-graphite-light disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {assignModalAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-graphite-dark/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-sand-50 dark:bg-graphite rounded-3xl border border-sand-300 dark:border-graphite-light p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-graphite dark:text-sand-100 text-base">
                Dispatch Field Officer
              </h3>
              <button onClick={() => setAssignModalAlert(null)} className="text-graphite-muted text-sm">
                ✕
              </button>
            </div>

            <p className="text-xs text-graphite-muted dark:text-sand-400">
              Assign an on-duty municipal traffic warden to investigate <strong>{assignModalAlert.title}</strong> in{' '}
              {assignModalAlert.zoneName}.
            </p>

            <form onSubmit={handleAssignSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-graphite dark:text-sand-200 mb-1.5">
                  Select Field Officer
                </label>
                <select
                  value={selectedStaff}
                  onChange={(e) => setSelectedStaff(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-sand-300 dark:border-graphite-light bg-sand-100 dark:bg-graphite-dark text-graphite dark:text-sand-100 font-semibold focus:outline-none focus:border-teal"
                >
                  {staffMembers.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name} ({s.role} - {s.department})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAssignModalAlert(null)}
                  className="px-4 py-2 rounded-xl font-semibold text-graphite-muted hover:bg-sand-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal text-sand-50 font-bold shadow-md hover:bg-teal-light transition-all"
                >
                  Dispatch Officer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resolve Incident Modal */}
      {resolveModalAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-graphite-dark/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-sand-50 dark:bg-graphite rounded-3xl border border-sand-300 dark:border-graphite-light p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-graphite dark:text-sand-100 text-base">
                Resolve Incident
              </h3>
              <button onClick={() => setResolveModalAlert(null)} className="text-graphite-muted text-sm">
                ✕
              </button>
            </div>

            <p className="text-xs text-graphite-muted dark:text-sand-400">
              Confirm resolution for <strong>{resolveModalAlert.title}</strong>. This will clear the curbside dispute telemetry.
            </p>

            <form onSubmit={handleResolveSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-graphite dark:text-sand-200 mb-1.5">
                  Resolution Note / Action Taken
                </label>
                <textarea
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  placeholder="e.g. Unauthorized vehicle towed / Obstruction cleared by road safety team."
                  rows={3}
                  required
                  className="w-full p-3 rounded-xl border border-sand-300 dark:border-graphite-light bg-sand-100 dark:bg-graphite-dark text-graphite dark:text-sand-100 focus:outline-none focus:border-teal"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResolveModalAlert(null)}
                  className="px-4 py-2 rounded-xl font-semibold text-graphite-muted hover:bg-sand-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-moss text-sand-50 font-bold shadow-md hover:bg-moss/90 transition-all"
                >
                  Mark Resolved
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
