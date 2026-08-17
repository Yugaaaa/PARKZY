import React from 'react';
import { History, Calendar, Clock, MapPin, Receipt, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useCurb } from '../../context/CurbContext';
import { ReservationStatus } from '../../types';

export const HistoryView: React.FC = () => {
  const { reservationHistory } = useCurb();

  const getStatusChip = (status: ReservationStatus) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
            <CheckCircle className="w-3 h-3" /> Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-500/10 text-stone-700 dark:text-stone-300 border border-stone-500/20">
            <XCircle className="w-3 h-3" /> Cancelled
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
            <Clock className="w-3 h-3" /> Hold Expired
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-pale text-teal-dark border border-teal-500/20">
            {status}
          </span>
        );
    }
  };

  return (
    <div id="citizen-history-view" className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-bold text-ink">Recent Curbside Bookings</h2>
          <p className="text-xs text-ink-soft">Archive of completed, cancelled, and expired parking holds.</p>
        </div>
        <span className="text-xs font-bold text-ink-soft px-2.5 py-1 rounded-xl bg-paper border border-line">
          {reservationHistory.length} Sessions
        </span>
      </div>

      {reservationHistory.length === 0 ? (
        <div className="p-8 rounded-3xl border border-line bg-paper text-center">
          <History className="w-8 h-8 text-ink-soft mx-auto mb-2" />
          <div className="font-bold text-ink text-sm">No Past Sessions Yet</div>
          <p className="text-xs text-ink-soft mt-0.5">Your completed parking transactions will show up here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reservationHistory.map((item) => (
            <div
              key={item.id}
              id={`history-item-${item.id}`}
              className="p-4 sm:p-5 rounded-2xl border border-line bg-paper shadow-curb hover:shadow-curb-hover transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-teal-pale text-teal-dark flex items-center justify-center font-bold font-serif text-sm border border-teal-500/20 shrink-0">
                  {item.spaceLabel}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif font-bold text-base text-ink">{item.zoneName}</h3>
                    {getStatusChip(item.status)}
                  </div>
                  <div className="text-xs text-ink-soft flex items-center gap-3 mt-1">
                    <span>Bay: <strong>{item.spaceLabel}</strong></span>
                    <span>•</span>
                    <span>Plate: <strong>{item.vehiclePlate}</strong></span>
                    <span>•</span>
                    <span>{item.durationHours} hr(s)</span>
                  </div>
                  <div className="text-[11px] text-ink-soft mt-1 font-mono">
                    Receipt #{item.passCode}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:flex-col sm:items-end border-t sm:border-t-0 pt-2 sm:pt-0 border-line">
                <div className="font-serif text-lg font-bold text-teal-dark">
                  ₹{item.totalAmount}.00
                </div>
                <div className="text-[11px] text-ink-soft flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(item.createdAt).toLocaleDateString('en-GB')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
