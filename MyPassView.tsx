import React from 'react';
import { motion } from 'motion/react';
import {
  Ticket,
  Clock,
  MapPin,
  Car,
  QrCode,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Zap,
  Bike,
  XCircle,
  Navigation,
  Download,
  Share2,
  Copy,
} from 'lucide-react';
import { useCurb } from '../../context/CurbContext';
import { useLocation } from 'wouter';

export const MyPassView: React.FC = () => {
  const {
    activeReservation,
    holdFormattedTime,
    holdSecondsRemaining,
    sessionFormattedTime,
    sessionSecondsRemaining,
    checkInReservation,
    endActiveSession,
    cancelHold,
    setSelectedZoneId,
  } = useCurb();
  const [, setLocation] = useLocation();
  const [receiptAction, setReceiptAction] = React.useState<string | null>(null);

  if (!activeReservation) {
    return (
      <div id="my-pass-empty-state" className="p-8 sm:p-12 text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-3xl bg-teal-pale border border-teal-500/20 text-teal-dark flex items-center justify-center mx-auto mb-4 shadow-sm">
          <Ticket className="w-8 h-8" />
        </div>
        <h3 className="font-serif text-2xl font-bold text-ink mb-2">No Active Parking Pass</h3>
        <p className="text-sm text-ink-soft mb-6 leading-relaxed">
          You don't have any active curbside hold or ongoing parking session. Reserve a space in real-time or use our vehicle-first booking flow.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            id="btn-empty-pass-find"
            onClick={() => {
              const findBtn = document.getElementById('tab-btn-find');
              if (findBtn) findBtn.click();
            }}
            className="px-5 py-2.5 rounded-xl bg-paper hover:bg-limestone border border-line text-ink font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            Explore Map Zones
          </button>
          <button
            id="btn-empty-pass-selector"
            onClick={() => setLocation('/vehicle-selector')}
            className="px-5 py-2.5 rounded-xl bg-teal-primary hover:bg-teal-dark text-white font-bold text-xs shadow-md shadow-teal-800/20 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Car className="w-4 h-4" />
            <span>Book by Vehicle</span>
          </button>
        </div>
      </div>
    );
  }

  const isHeld = activeReservation.status === 'held';
  const isConfirmed = activeReservation.status === 'confirmed';
  const isActiveSession = activeReservation.status === 'active_session';

  const receiptText = `CurbSense Municipal Parking Pass\nBay: ${activeReservation.spaceLabel}\nZone: ${activeReservation.zoneName}\nVehicle: ${activeReservation.vehiclePlate}\nPass code: ${activeReservation.passCode}\nRate: ₹${activeReservation.hourlyRate}/hr\nDemo hold: 15 seconds\nPost-check-in demo limit: 60 seconds`;

  const downloadReceipt = () => {
    const blob = new Blob([receiptText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `curbsense-pass-${activeReservation.passCode}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
    setReceiptAction('Receipt downloaded');
  };

  const shareReceipt = async () => {
    if (navigator.share) {
      await navigator.share({ title: 'CurbSense parking pass', text: receiptText });
      setReceiptAction('Pass shared');
      return;
    }
    await navigator.clipboard?.writeText(receiptText);
    setReceiptAction('Pass details copied');
  };

  return (
    <div id="my-pass-active-container" className="max-w-xl mx-auto space-y-6">
      {/* Status Notice Banner */}
      {isHeld && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-amber-50 dark:bg-[#3a2a0a] border border-amber-500/30 text-amber-900 dark:text-amber-200 flex items-center justify-between shadow-xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-custom shrink-0">
              <Clock className="w-5 h-5 animate-spin" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                15-Second Demo Hold Active
              </div>
              <div className="text-xs text-ink-soft">
                Navigate to curbside bay <strong className="text-ink">{activeReservation.spaceLabel}</strong> and check in before the demo timer reaches zero.
              </div>
            </div>
          </div>

          <div className="text-right pl-2 shrink-0">
            <div className="font-mono text-xl font-extrabold text-amber-700 dark:text-amber-300">
              {holdFormattedTime}
            </div>
            <div className="text-[10px] text-ink-soft">demo seconds remaining</div>
          </div>
        </motion.div>
      )}

      {isActiveSession && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-emerald-50 dark:bg-[#0d3025] border border-emerald-500/30 text-emerald-900 dark:text-emerald-200 flex items-center justify-between shadow-xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-700 dark:text-emerald-300 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                Active Parking Session
              </div>
              <div className="text-xs text-ink-soft">Vehicle physically docked at curb. Session verified. Demo limit: 60 seconds after check-in.</div>
            </div>
          </div>

          <div className="text-right pl-2 shrink-0">
            <div className="font-mono text-xl font-extrabold text-emerald-700 dark:text-emerald-300">{sessionFormattedTime}</div>
            <div className="text-[10px] text-ink-soft">demo limit remaining</div>
          </div>
        </motion.div>
      )}

      {/* Boarding Pass Style Card */}
      <div className="rounded-3xl border border-line bg-paper shadow-curb overflow-hidden relative">
        {/* Pass Top Section: Header & Bay Label */}
        <div className="p-6 sm:p-7 bg-limestone border-b border-line">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="curb-label text-[10px] bg-teal-pale text-teal-dark px-2.5 py-0.5 rounded-full border border-teal-500/20">
                  Coimbatore Municipal Curbside Pass
                </span>
              </div>
              <h2 className="font-serif text-3xl font-bold text-ink leading-tight">
                {activeReservation.zoneName}
              </h2>
              <div className="flex items-center gap-2 text-xs text-ink-soft mt-1">
                <MapPin className="w-3.5 h-3.5 text-teal-dark" />
                <span>Slot code verified on pilot IoT mesh</span>
              </div>
            </div>

            {/* Giant Space Code Stamp */}
            <div className="text-right">
              <div className="curb-label text-[10px]">Assigned Bay</div>
              <div className="font-serif text-4xl font-extrabold text-teal-primary tracking-tight">
                {activeReservation.spaceLabel}
              </div>
            </div>
          </div>
        </div>

        {/* Perforated Divider simulation */}
        <div className="relative flex items-center justify-between px-4 py-1">
          <div className="w-4 h-8 bg-limestone rounded-r-full -ml-6 border-r border-t border-b border-line" />
          <div className="w-full border-t-2 border-dashed border-line mx-2" />
          <div className="w-4 h-8 bg-limestone rounded-l-full -mr-6 border-l border-t border-b border-line" />
        </div>

        {/* Pass Center Details Grid */}
        <div className="p-6 sm:p-7 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <div className="curb-label text-[10px]">Vehicle Plate</div>
              <div className="text-sm font-bold text-ink mt-0.5">{activeReservation.vehiclePlate}</div>
              <div className="text-[10px] text-ink-soft capitalize flex items-center gap-1 mt-0.5">
                {activeReservation.vehicleType === 'two_wheeler' ? (
                  <Bike className="w-3 h-3 text-purple-600" />
                ) : activeReservation.vehicleType === 'ev' ? (
                  <Zap className="w-3 h-3 text-teal-primary" />
                ) : (
                  <Car className="w-3 h-3 text-ink-soft" />
                )}
                <span>{activeReservation.vehicleType.replace('_', ' ')}</span>
              </div>
            </div>

            <div>
              <div className="curb-label text-[10px]">Duration</div>
              <div className="text-sm font-bold text-ink mt-0.5">{activeReservation.durationHours} Hour(s)</div>
              <div className="text-[10px] text-ink-soft">₹{activeReservation.hourlyRate}/hr rate</div>
            </div>

            <div>
              <div className="curb-label text-[10px]">Total Tariff</div>
              <div className="text-sm font-bold text-teal-dark mt-0.5">₹{activeReservation.totalAmount}.00</div>
              <div className="text-[10px] text-ink-soft">Paid via Fastag/UPI</div>
            </div>

            <div>
              <div className="curb-label text-[10px]">Digital Code</div>
              <div className="text-sm font-mono font-bold text-ink mt-0.5">{activeReservation.passCode}</div>
              <div className="text-[10px] text-ink-soft">Idempotent token</div>
            </div>
          </div>

          {/* QR Code & Barcode Section */}
          <div className="p-4 rounded-2xl bg-limestone border border-line flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-20 h-20 bg-white rounded-xl p-2 border border-line flex items-center justify-center shrink-0 shadow-xs">
                {/* SVG Mock QR Code */}
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <rect x="0" y="0" width="30" height="30" fill="#075f57" />
                  <rect x="5" y="5" width="20" height="20" fill="white" />
                  <rect x="10" y="10" width="10" height="10" fill="#075f57" />

                  <rect x="70" y="0" width="30" height="30" fill="#075f57" />
                  <rect x="75" y="5" width="20" height="20" fill="white" />
                  <rect x="80" y="10" width="10" height="10" fill="#075f57" />

                  <rect x="0" y="70" width="30" height="30" fill="#075f57" />
                  <rect x="5" y="75" width="20" height="20" fill="white" />
                  <rect x="10" y="80" width="10" height="10" fill="#075f57" />

                  <rect x="38" y="12" width="8" height="8" fill="#1f2a2a" />
                  <rect x="52" y="12" width="8" height="8" fill="#1f2a2a" />
                  <rect x="38" y="38" width="24" height="24" fill="#075f57" />
                  <rect x="70" y="50" width="10" height="10" fill="#1f2a2a" />
                  <rect x="12" y="45" width="10" height="10" fill="#1f2a2a" />
                  <rect x="50" y="75" width="10" height="15" fill="#1f2a2a" />
                  <rect x="75" y="75" width="15" height="15" fill="#075f57" />
                </svg>
              </div>

              <div>
                <div className="text-xs font-bold text-ink">Scan at Curb Sensor / Warden Tablet</div>
                <p className="text-[11px] text-ink-soft mt-0.5">
                  Shows instant cryptographic verification for CCMC traffic marshals.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-[#0d3025] px-2.5 py-1 rounded-full border border-emerald-500/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                Govt Verified Pass
              </span>
            </div>
          </div>

          {/* Receipt Actions */}
          <div className="flex flex-col sm:flex-row gap-2">
            <button id="btn-download-receipt" type="button" onClick={downloadReceipt} className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-paper px-3 py-2.5 text-xs font-bold text-ink transition-colors hover:border-teal hover:text-teal">
              <Download className="h-4 w-4" /> Download receipt
            </button>
            <button id="btn-share-receipt" type="button" onClick={() => void shareReceipt()} className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-teal/30 bg-teal-pale px-3 py-2.5 text-xs font-bold text-teal-dark transition-colors hover:bg-teal hover:text-white">
              <Share2 className="h-4 w-4" /> Share / copy pass
            </button>
          </div>
          {receiptAction && <p role="status" className="text-center text-xs font-semibold text-teal-dark">{receiptAction}</p>}

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            {isHeld && (
              <>
                <button
                  id="btn-checkin-pass"
                  onClick={checkInReservation}
                  className="flex-1 py-3 px-4 rounded-xl bg-teal-primary hover:bg-teal-dark text-white font-bold text-sm shadow-md shadow-teal-800/20 flex items-center justify-center gap-2 transition-all transform active:scale-98 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Check In (Parked at Bay)</span>
                </button>
                <button
                  id="btn-cancel-hold"
                  onClick={cancelHold}
                  className="py-3 px-4 rounded-xl bg-paper hover:bg-rose-500/10 border border-line hover:border-rose-500/30 text-clay font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Release Hold</span>
                </button>
              </>
            )}

            {isActiveSession && (
              <button
                id="btn-end-active-session"
                onClick={endActiveSession}
                className="w-full py-3.5 px-4 rounded-xl bg-teal-primary hover:bg-teal-dark text-white font-bold text-sm shadow-md shadow-teal-800/20 flex items-center justify-center gap-2 transition-all transform active:scale-98 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>End Parking Session & Settle</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
