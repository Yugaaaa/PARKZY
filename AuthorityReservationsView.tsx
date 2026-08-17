/**
 * CurbSense Civic Operations: operators need one quiet queue for live holds and
 * one accountable place to verify accessibility evidence before a bay is confirmed.
 */
import React, { useMemo, useState } from 'react';
import { Accessibility, CheckCircle2, Clock3, FileCheck2, MapPin, ShieldCheck, XCircle } from 'lucide-react';
import { AccessibilityPermit, Reservation } from '../../types';

interface AuthorityReservationsViewProps {
  reservations: Reservation[];
  pendingPermits: AccessibilityPermit[];
  reviewPermit: (permitNumber: string, status: 'verified' | 'rejected', reason?: string) => void;
  onShowToast: (message: string) => void;
}

const activeStatuses = new Set(['held', 'confirmed', 'active_session']);

export const AuthorityReservationsView: React.FC<AuthorityReservationsViewProps> = ({
  reservations,
  pendingPermits,
  reviewPermit,
  onShowToast,
}) => {
  const [permitSearch, setPermitSearch] = useState('');
  const [rejectingPermit, setRejectingPermit] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const activeReservations = useMemo(
    () => reservations.filter((reservation) => activeStatuses.has(reservation.status)),
    [reservations]
  );
  const pending = pendingPermits.filter((permit) => permit.status === 'pending');
  const filteredPermits = pending.filter((permit) => {
    const query = permitSearch.trim().toLowerCase();
    return !query || `${permit.holderName} ${permit.permitNumber} ${permit.disabilityId}`.toLowerCase().includes(query);
  });

  const approvePermit = (permit: AccessibilityPermit) => {
    reviewPermit(permit.permitNumber, 'verified');
    onShowToast(`Verified permit ${permit.permitNumber} for ${permit.holderName}.`);
  };

  const rejectPermit = (permit: AccessibilityPermit) => {
    const reason = rejectionReason.trim() || 'Document evidence requires manual follow-up.';
    reviewPermit(permit.permitNumber, 'rejected', reason);
    onShowToast(`Rejected permit ${permit.permitNumber}.`);
    setRejectingPermit(null);
    setRejectionReason('');
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-teal">Municipal operations queue</p>
          <h2 className="mt-1 font-serif text-2xl font-bold text-graphite dark:text-sand-100">Reservations & permit verification</h2>
          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-graphite-muted dark:text-sand-400">Monitor active curb holds, inspect the evidence attached to each reservation, and verify accessibility documents before accessible-space use is confirmed.</p>
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-teal/20 bg-teal/5 px-3 py-2 text-xs font-bold text-teal dark:bg-teal/10">
          <ShieldCheck className="h-4 w-4" /> Operator-only review surface
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-3xl border border-sand-300 bg-sand-50 p-4 shadow-sm dark:border-graphite-light dark:bg-graphite">
          <p className="text-[11px] font-bold uppercase tracking-wide text-graphite-muted dark:text-sand-400">Active reservations</p>
          <p className="mt-2 text-3xl font-bold text-teal">{activeReservations.length}</p>
          <p className="mt-1 text-xs text-graphite-muted dark:text-sand-400">Held, confirmed, or checked in</p>
        </div>
        <div className="rounded-3xl border border-sand-300 bg-sand-50 p-4 shadow-sm dark:border-graphite-light dark:bg-graphite">
          <p className="text-[11px] font-bold uppercase tracking-wide text-graphite-muted dark:text-sand-400">Permit queue</p>
          <p className="mt-2 text-3xl font-bold text-amber-600">{pending.length}</p>
          <p className="mt-1 text-xs text-graphite-muted dark:text-sand-400">Documents awaiting review</p>
        </div>
        <div className="rounded-3xl border border-sand-300 bg-sand-50 p-4 shadow-sm dark:border-graphite-light dark:bg-graphite">
          <p className="text-[11px] font-bold uppercase tracking-wide text-graphite-muted dark:text-sand-400">Evidence policy</p>
          <p className="mt-2 text-sm font-bold text-graphite dark:text-sand-100">Verify before confirm</p>
          <p className="mt-1 text-xs text-graphite-muted dark:text-sand-400">No permit request bypasses operator review.</p>
        </div>
      </div>

      <section className="overflow-hidden rounded-3xl border border-sand-300 bg-sand-50 shadow-sm dark:border-graphite-light dark:bg-graphite" aria-labelledby="active-reservations-heading">
        <div className="flex items-center justify-between border-b border-sand-200 px-4 py-4 dark:border-graphite-light">
          <div>
            <h3 id="active-reservations-heading" className="flex items-center gap-2 font-serif text-lg font-bold text-graphite dark:text-sand-100"><Clock3 className="h-4 w-4 text-teal" />Active reservations</h3>
            <p className="mt-1 text-xs text-graphite-muted dark:text-sand-400">Live hold inventory and the evidence operators need at a glance.</p>
          </div>
        </div>
        <div className="divide-y divide-sand-200 dark:divide-graphite-light">
          {activeReservations.length === 0 ? (
            <div className="p-8 text-center text-xs text-graphite-muted dark:text-sand-400">No active reservations are currently in the operator queue.</div>
          ) : activeReservations.map((reservation) => (
            <div key={reservation.id} className="flex flex-col justify-between gap-4 p-4 lg:flex-row lg:items-center">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-teal/10 px-2 py-1 text-[10px] font-extrabold uppercase tracking-wide text-teal">{reservation.status.replace('_', ' ')}</span>
                  <span className="font-mono text-xs font-bold text-graphite dark:text-sand-100">{reservation.passCode}</span>
                </div>
                <p className="mt-2 text-sm font-bold text-graphite dark:text-sand-100">{reservation.spaceLabel} · {reservation.zoneName}</p>
                <p className="mt-1 text-xs text-graphite-muted dark:text-sand-400">{reservation.userName} · {reservation.vehiclePlate} · {reservation.durationHours}h · ₹{reservation.totalAmount}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="flex items-center gap-1 rounded-xl border border-sand-300 px-2.5 py-2 font-semibold text-graphite-muted dark:border-graphite-light dark:text-sand-300"><MapPin className="h-3.5 w-3.5 text-teal" />{reservation.spaceId}</span>
                {reservation.permitReference ? <span className="flex items-center gap-1 rounded-xl bg-amber-500/10 px-2.5 py-2 font-bold text-amber-700"><Accessibility className="h-3.5 w-3.5" />Permit attached</span> : <span className="rounded-xl bg-sand-200 px-2.5 py-2 font-semibold text-graphite-muted dark:bg-graphite-light dark:text-sand-400">No permit request</span>}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-sand-300 bg-sand-50 shadow-sm dark:border-graphite-light dark:bg-graphite" aria-labelledby="permit-review-heading">
        <div className="flex flex-col justify-between gap-3 border-b border-sand-200 px-4 py-4 sm:flex-row sm:items-center dark:border-graphite-light">
          <div>
            <h3 id="permit-review-heading" className="flex items-center gap-2 font-serif text-lg font-bold text-graphite dark:text-sand-100"><FileCheck2 className="h-4 w-4 text-teal" />Permit document review</h3>
            <p className="mt-1 text-xs text-graphite-muted dark:text-sand-400">Open the document metadata, then approve or reject with an auditable reason.</p>
          </div>
          <input value={permitSearch} onChange={(event) => setPermitSearch(event.target.value)} placeholder="Search permit queue" className="rounded-2xl border border-sand-300 bg-sand-50 px-3 py-2 text-xs font-semibold text-graphite outline-none focus:border-teal dark:border-graphite-light dark:bg-graphite dark:text-sand-100" aria-label="Search permit queue" />
        </div>
        <div className="divide-y divide-sand-200 dark:divide-graphite-light">
          {filteredPermits.length === 0 ? (
            <div className="p-8 text-center text-xs text-graphite-muted dark:text-sand-400">No permit documents match the current queue.</div>
          ) : filteredPermits.map((permit) => (
            <div key={permit.permitNumber} className="p-4">
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-2"><span className="text-sm font-bold text-graphite dark:text-sand-100">{permit.holderName}</span><span className="rounded-full bg-teal/10 px-2 py-1 font-mono text-[10px] font-bold text-teal">{permit.permitNumber}</span></div>
                  <p className="mt-1 text-xs text-graphite-muted dark:text-sand-400">{permit.issueAuthority} · Valid until {permit.validUntil}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-graphite dark:text-sand-200"><FileCheck2 className="h-3.5 w-3.5 text-teal" />{permit.documentName || 'Document metadata not supplied'} · UDID {permit.disabilityId}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => approvePermit(permit)} className="flex items-center gap-1.5 rounded-2xl bg-teal px-3 py-2 text-xs font-extrabold text-white shadow-sm transition-transform hover:bg-teal-hover active:scale-[0.97]"><CheckCircle2 className="h-3.5 w-3.5" />Verify document</button>
                  <button type="button" onClick={() => setRejectingPermit(permit.permitNumber)} className="flex items-center gap-1.5 rounded-2xl bg-clay/10 px-3 py-2 text-xs font-extrabold text-clay transition-colors hover:bg-clay/20"><XCircle className="h-3.5 w-3.5" />Reject</button>
                </div>
              </div>
              {rejectingPermit === permit.permitNumber && (
                <div className="mt-4 flex flex-col gap-2 rounded-2xl border border-clay/20 bg-clay/5 p-3 sm:flex-row sm:items-center">
                  <input value={rejectionReason} onChange={(event) => setRejectionReason(event.target.value)} placeholder="Reason for rejection" className="min-w-0 flex-1 rounded-xl border border-sand-300 bg-sand-50 px-3 py-2 text-xs text-graphite outline-none focus:border-clay dark:border-graphite-light dark:bg-graphite dark:text-sand-100" aria-label="Permit rejection reason" />
                  <button type="button" onClick={() => rejectPermit(permit)} className="rounded-xl bg-clay px-3 py-2 text-xs font-bold text-white">Confirm rejection</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
