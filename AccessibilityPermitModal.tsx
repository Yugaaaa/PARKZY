import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Accessibility,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Upload,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { useCurb } from '../../context/CurbContext';

interface AccessibilityPermitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccessibilityPermitModal: React.FC<AccessibilityPermitModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { currentUser, permitApplication, submitPermitApplication } = useCurb();
  const [permitNumber, setPermitNumber] = useState(currentUser.permitId || '');
  const [holderName, setHolderName] = useState(currentUser.name);
  const [disabilityId, setDisabilityId] = useState('TN-DIS-091244');
  const [fileName, setFileName] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!permitNumber || !holderName) return;

    setIsSubmitting(true);
    setTimeout(() => {
      submitPermitApplication({
        permitNumber,
        holderName,
        disabilityId,
        documentName: fileName || 'Govt_UDID_Card.pdf',
      });
      setIsSubmitting(false);
      setSubmittedSuccess(true);
      setTimeout(() => {
        setSubmittedSuccess(false);
        onClose();
      }, 1600);
    }, 600);
  };

  return (
    <AnimatePresence>
      <div id="accessibility-permit-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#075f57]/50 backdrop-blur-xs"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-lg bg-paper border border-line rounded-3xl shadow-2xl p-6 z-10 overflow-hidden"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20">
                <Accessibility className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif text-xl font-bold text-ink">Accessible Parking Permit</h2>
                <p className="text-xs text-ink-soft">Govt UDID Disability Pass Registry</p>
              </div>
            </div>
            <button
              id="btn-close-permit-modal"
              onClick={onClose}
              className="w-8 h-8 rounded-xl border border-line bg-limestone text-ink flex items-center justify-center hover:bg-teal-pale hover:text-teal-dark transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Current Status Card */}
          <div className="p-4 rounded-2xl bg-limestone border border-line mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="curb-label text-[10px]">Your Current Status</span>
              {currentUser.permitStatus === 'verified' ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified & Active
                </span>
              ) : currentUser.permitStatus === 'pending' ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                  <Clock className="w-3.5 h-3.5" />
                  Under Review
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-ink-soft bg-paper px-2.5 py-0.5 rounded-full border border-line">
                  Not Registered
                </span>
              )}
            </div>

            {permitApplication && (
              <div className="text-xs text-ink space-y-1">
                <div>Permit No: <strong className="font-mono">{permitApplication.permitNumber}</strong></div>
                <div className="text-ink-soft text-[11px]">Valid until: {permitApplication.validUntil}</div>
              </div>
            )}
          </div>

          {submittedSuccess ? (
            <div className="p-6 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-ink">Permit Application Submitted</h3>
              <p className="text-xs text-ink-soft">
                Verified with Coimbatore Smart Mobility PWD database.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="curb-label text-[10px] block mb-1">Permit / UDID Number</label>
                <input
                  id="permit-input-number"
                  type="text"
                  required
                  placeholder="e.g. CBE-PWD-2026-9081"
                  value={permitNumber}
                  onChange={(e) => setPermitNumber(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-line bg-limestone text-xs font-mono font-bold text-ink focus:outline-none focus:border-teal-primary"
                />
              </div>

              <div>
                <label className="curb-label text-[10px] block mb-1">Pass Holder Full Name</label>
                <input
                  id="permit-input-holder"
                  type="text"
                  required
                  placeholder="Full name as on Govt ID"
                  value={holderName}
                  onChange={(e) => setHolderName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-line bg-limestone text-xs text-ink focus:outline-none focus:border-teal-primary"
                />
              </div>

              <div>
                <label className="curb-label text-[10px] block mb-1">Disability Certificate ID</label>
                <input
                  id="permit-input-disability"
                  type="text"
                  placeholder="e.g. TN-DIS-091244"
                  value={disabilityId}
                  onChange={(e) => setDisabilityId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-line bg-limestone text-xs font-mono text-ink focus:outline-none focus:border-teal-primary"
                />
              </div>

              {/* Upload simulation */}
              <div className="p-3 rounded-xl border border-dashed border-line bg-limestone text-center space-y-1.5">
                <Upload className="w-5 h-5 text-teal-dark mx-auto" />
                <div className="text-xs font-bold text-ink">
                  {fileName ? fileName : 'Upload Proof / UDID Smart Card'}
                </div>
                <div className="text-[10px] text-ink-soft">PDF, JPG, or PNG up to 5MB</div>
                <button
                  type="button"
                  id="btn-simulate-upload"
                  onClick={() => setFileName('Govt_UDID_Card_2026.pdf')}
                  className="mt-1 px-3 py-1 rounded-lg text-xs font-bold bg-paper border border-line text-teal-dark hover:bg-teal-pale"
                >
                  {fileName ? 'Replace File' : 'Select File'}
                </button>
              </div>

              <button
                id="btn-submit-permit"
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-teal-primary hover:bg-teal-dark text-white font-bold text-sm shadow-md shadow-teal-800/20 transition-colors cursor-pointer"
              >
                {isSubmitting ? 'Verifying with Municipal Registry...' : 'Update & Verify Permit'}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
