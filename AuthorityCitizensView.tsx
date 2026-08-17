import React, { useState } from 'react';
import {
  Users,
  Award,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileCheck,
  Shield,
  Search,
  Eye,
  MessageSquare,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Accessibility,
} from 'lucide-react';
import { CommunityReport, AccessibilityPermit, CitizenTrustStat } from '../../types';

interface AuthorityCitizensViewProps {
  communityReports: CommunityReport[];
  citizenTrustStats: Record<string, CitizenTrustStat>;
  pendingPermits: AccessibilityPermit[];
  corroborateCommunityReport: (reportId: string) => void;
  dismissCommunityReport: (reportId: string) => void;
  reviewPermit: (permitNumber: string, status: 'verified' | 'rejected', reason?: string) => void;
  onShowToast: (msg: string) => void;
}

export const AuthorityCitizensView: React.FC<AuthorityCitizensViewProps> = ({
  communityReports,
  citizenTrustStats,
  pendingPermits,
  corroborateCommunityReport,
  dismissCommunityReport,
  reviewPermit,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'signals' | 'permits' | 'trust'>('signals');
  const [reportFilter, setReportFilter] = useState<'all' | 'pending' | 'corroborated' | 'dismissed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Reject permit modal
  const [rejectPermitModalData, setRejectPermitModalData] = useState<AccessibilityPermit | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Filtering Community Signals
  const filteredReports = communityReports.filter((r) => {
    if (reportFilter !== 'all' && r.status !== reportFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.type.toLowerCase().includes(q) ||
        r.zoneName.toLowerCase().includes(q) ||
        (r.spaceLabel && r.spaceLabel.toLowerCase().includes(q)) ||
        r.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCorroborate = (report: CommunityReport) => {
    corroborateCommunityReport(report.id);
    onShowToast(`Signal corroborated. Contributor awarded +15 Trust Points.`);
  };

  const handleDismiss = (report: CommunityReport) => {
    dismissCommunityReport(report.id);
    onShowToast(`Signal dismissed as unverified/spam.`);
  };

  const handleApprovePermit = (permit: AccessibilityPermit) => {
    reviewPermit(permit.permitNumber, 'verified');
    onShowToast(`Approved Accessible Bay permit for ${permit.holderName}.`);
  };

  const handleRejectPermitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectPermitModalData) return;
    reviewPermit(rejectPermitModalData.permitNumber, 'rejected', rejectionReason || 'UDID verification mismatch');
    onShowToast(`Rejected permit application for ${rejectPermitModalData.holderName}.`);
    setRejectPermitModalData(null);
    setRejectionReason('');
  };

  const trustStatList: CitizenTrustStat[] = Object.values(citizenTrustStats);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-graphite dark:text-sand-100 flex items-center gap-2">
            Citizens & Community Compliance
          </h1>
          <p className="text-xs text-graphite-muted dark:text-sand-400">
            Crowdsourced curbside signal moderation, accessible UDID permit verification, and citizen trust scoring.
          </p>
        </div>

        {/* View Switcher Pills */}
        <div className="flex items-center bg-sand-200 dark:bg-graphite-light p-1 rounded-2xl border border-sand-300 dark:border-graphite-light text-xs shrink-0">
          <button
            onClick={() => setActiveTab('signals')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'signals'
                ? 'bg-sand-50 dark:bg-graphite text-teal shadow-sm'
                : 'text-graphite-muted dark:text-sand-400 hover:text-graphite'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Community Signals ({communityReports.filter((r) => r.status === 'pending').length})</span>
          </button>

          <button
            onClick={() => setActiveTab('permits')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'permits'
                ? 'bg-sand-50 dark:bg-graphite text-teal shadow-sm'
                : 'text-graphite-muted dark:text-sand-400 hover:text-graphite'
            }`}
          >
            <Accessibility className="w-3.5 h-3.5" />
            <span>Accessibility Permits ({pendingPermits.filter((p) => p.status === 'pending').length})</span>
          </button>

          <button
            onClick={() => setActiveTab('trust')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'trust'
                ? 'bg-sand-50 dark:bg-graphite text-teal shadow-sm'
                : 'text-graphite-muted dark:text-sand-400 hover:text-graphite'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Trust Leaderboard</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Community Signals Queue */}
      {activeTab === 'signals' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-sand-50 dark:bg-graphite border border-sand-300 dark:border-graphite-light shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1">
              {(['all', 'pending', 'corroborated', 'dismissed'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setReportFilter(filter)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                    reportFilter === filter
                      ? 'bg-teal text-sand-50 shadow-sm'
                      : 'text-graphite-muted dark:text-sand-400 hover:bg-sand-200 dark:hover:bg-graphite-light'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Search signal reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-60 pl-8 pr-3 py-1.5 rounded-xl border border-sand-300 dark:border-graphite-light bg-sand-100 dark:bg-graphite-dark text-xs text-graphite dark:text-sand-100 focus:outline-none focus:border-teal"
              />
              <Search className="w-3.5 h-3.5 text-graphite-muted dark:text-sand-400 absolute left-2.5 top-2" />
            </div>
          </div>

          <div className="space-y-3">
            {filteredReports.length === 0 ? (
              <div className="p-12 text-center bg-sand-50 dark:bg-graphite rounded-2xl border border-sand-300 dark:border-graphite-light text-graphite-muted dark:text-sand-400 text-xs">
                No community signals found matching filters.
              </div>
            ) : (
              filteredReports.map((report) => (
                <div
                  key={report.id}
                  className="p-4 rounded-2xl bg-sand-50 dark:bg-graphite border border-sand-300 dark:border-graphite-light shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="px-2 py-0.5 rounded-md text-[10px] uppercase font-bold bg-teal/15 text-teal">
                        {report.type.replace('_', ' ')}
                      </span>

                      {report.spaceLabel && (
                        <span className="px-2 py-0.5 rounded-md bg-sand-200 dark:bg-graphite-light text-[10px] font-mono font-bold text-graphite dark:text-sand-100">
                          Bay {report.spaceLabel}
                        </span>
                      )}

                      <span className="text-xs font-semibold text-graphite dark:text-sand-100">
                        {report.zoneName}
                      </span>

                      <span className="text-[10px] text-graphite-muted dark:text-sand-400">
                        {report.submittedAt}
                      </span>
                    </div>

                    <p className="text-xs text-graphite dark:text-sand-200">
                      "{report.description}"
                    </p>

                    <div className="text-[11px] text-graphite-muted dark:text-sand-400 flex items-center gap-2">
                      <span>Reported by Citizen: <strong className="text-graphite dark:text-sand-100">{report.submittedBy}</strong></span>
                      <span>•</span>
                      <span>Confidence Score: <strong className="text-teal">{report.confidenceScore || 88}%</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {report.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => handleCorroborate(report)}
                          className="px-3 py-1.5 rounded-xl bg-moss text-sand-50 font-bold text-xs shadow-sm hover:bg-moss/90 transition-all flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Corroborate (+15 Pts)</span>
                        </button>

                        <button
                          onClick={() => handleDismiss(report)}
                          className="px-3 py-1.5 rounded-xl bg-sand-200 dark:bg-graphite-light hover:bg-clay/15 hover:text-clay text-graphite dark:text-sand-100 font-semibold text-xs transition-colors"
                        >
                          Dismiss
                        </button>
                      </>
                    ) : (
                      <span
                        className={`text-[11px] uppercase font-bold px-2.5 py-1 rounded-xl ${
                          report.status === 'corroborated'
                            ? 'bg-moss/15 text-moss'
                            : 'bg-sand-200 dark:bg-graphite-light text-graphite-muted'
                        }`}
                      >
                        {report.status}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Accessibility Permits Review Queue */}
      {activeTab === 'permits' && (
        <div className="space-y-4">
          <div className="bg-sand-50 dark:bg-graphite rounded-2xl border border-sand-300 dark:border-graphite-light p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="font-serif font-bold text-graphite dark:text-sand-100 text-sm sm:text-base">
                  UDID Accessibility Disability Permit Verification
                </h2>
                <p className="text-[11px] text-graphite-muted dark:text-sand-400">
                  Citizens applying for zero-tariff reserved accessible bays under Tamil Nadu Smart City Inclusion Scheme.
                </p>
              </div>
            </div>

            <div className="divide-y divide-sand-200 dark:divide-graphite-light">
              {pendingPermits.map((permit) => (
                <div
                  key={permit.permitNumber}
                  className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-sm text-graphite dark:text-sand-100">
                        {permit.holderName}
                      </span>
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-teal/15 text-teal font-bold">
                        UDID: {permit.disabilityId}
                      </span>
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                          permit.status === 'verified'
                            ? 'bg-moss/15 text-moss'
                            : permit.status === 'pending'
                            ? 'bg-amber-500/15 text-amber-600'
                            : 'bg-clay/15 text-clay'
                        }`}
                      >
                        {permit.status}
                      </span>
                    </div>

                    <div className="text-xs text-graphite-muted dark:text-sand-300 space-y-0.5">
                      <div>Permit #{permit.permitNumber} • Issuing Authority: {permit.issueAuthority}</div>
                      <div>Vehicle: <strong>{permit.vehiclePlate || 'Not specified'}</strong> • Valid Until: {permit.validUntil}</div>
                      <div>Contact: {permit.applicantEmail || 'On Record'} • Submitted: {permit.submittedAt}</div>
                    </div>

                    {permit.rejectionReason && (
                      <div className="text-[11px] text-clay font-medium pt-1">
                        Rejection Reason: {permit.rejectionReason}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {permit.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => handleApprovePermit(permit)}
                          className="px-3.5 py-1.5 rounded-xl bg-moss text-sand-50 font-bold text-xs shadow-sm hover:bg-moss/90 transition-all flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve & Unlock PWD</span>
                        </button>

                        <button
                          onClick={() => {
                            setRejectPermitModalData(permit);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-clay/15 text-clay hover:bg-clay/25 font-semibold text-xs transition-colors"
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <span className="text-xs text-graphite-muted">
                        Decision logged
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Citizen Trust Leaderboard */}
      {activeTab === 'trust' && (
        <div className="space-y-4">
          <div className="bg-sand-50 dark:bg-graphite rounded-2xl border border-sand-300 dark:border-graphite-light shadow-sm overflow-hidden">
            <div className="p-4 border-b border-sand-300 dark:border-graphite-light">
              <h2 className="font-serif font-bold text-graphite dark:text-sand-100 text-base">
                Citizen Curbside Trust & Reliability Leaderboard
              </h2>
              <p className="text-[11px] text-graphite-muted dark:text-sand-400">
                Civic reputation system rewarding timely check-ins, zero false holds, and accurate hazard reports.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-sand-150 dark:bg-graphite-dark text-[11px] font-bold text-graphite-muted dark:text-sand-400 uppercase tracking-wider border-b border-sand-300 dark:border-graphite-light">
                    <th className="p-3.5">Citizen Name</th>
                    <th className="p-3.5">Trust Score</th>
                    <th className="p-3.5">Accuracy Rate</th>
                    <th className="p-3.5">Signals Submitted</th>
                    <th className="p-3.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand-200 dark:divide-graphite-light">
                  {trustStatList.map((citizen) => {
                    const accuracy = citizen.totalReports > 0
                      ? Math.round((citizen.corroboratedReports / citizen.totalReports) * 100)
                      : 100;

                    return (
                      <tr key={citizen.name} className="hover:bg-sand-100 dark:hover:bg-graphite-dark transition-colors">
                        <td className="p-3.5">
                          <div className="font-bold text-graphite dark:text-sand-100">{citizen.name}</div>
                        </td>

                        <td className="p-3.5">
                          <span className="font-serif font-bold text-sm text-teal">
                            {citizen.trustScore} / 100
                          </span>
                        </td>

                        <td className="p-3.5 font-semibold text-graphite dark:text-sand-100">
                          {accuracy}%
                        </td>

                        <td className="p-3.5 text-graphite dark:text-sand-200">
                          {citizen.totalReports} submitted ({citizen.corroboratedReports} corroborated)
                        </td>

                        <td className="p-3.5 text-right">
                          <span className="inline-flex items-center gap-1 text-moss font-semibold text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Verified Contributor
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Reject Permit Modal */}
      {rejectPermitModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-graphite-dark/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-sand-50 dark:bg-graphite rounded-3xl border border-sand-300 dark:border-graphite-light p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-graphite dark:text-sand-100 text-base">
                Reject Permit Application
              </h3>
              <button onClick={() => setRejectPermitModalData(null)} className="text-graphite-muted text-sm">
                ✕
              </button>
            </div>

            <p className="text-xs text-graphite-muted dark:text-sand-400">
              Provide a valid municipal reason for rejecting the disability permit for{' '}
              <strong>{rejectPermitModalData.holderName}</strong> (UDID: {rejectPermitModalData.disabilityId}).
            </p>

            <form onSubmit={handleRejectPermitSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-graphite dark:text-sand-200 mb-1.5">
                  Rejection Reason
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. UDID certificate expired or vehicle plate number does not match registered owner."
                  rows={3}
                  required
                  className="w-full p-3 rounded-xl border border-sand-300 dark:border-graphite-light bg-sand-100 dark:bg-graphite-dark text-graphite dark:text-sand-100 focus:outline-none focus:border-teal"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectPermitModalData(null)}
                  className="px-4 py-2 rounded-xl font-semibold text-graphite-muted hover:bg-sand-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-clay text-sand-50 font-bold shadow-md hover:bg-clay/90 transition-all"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
