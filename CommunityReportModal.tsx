import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Camera, AlertCircle, CheckCircle2, ShieldAlert, Sparkles, Upload } from 'lucide-react';
import { useCurb } from '../../context/CurbContext';
import { ParkingZone, ParkingSpace, ReportType } from '../../types';

interface CommunityReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  zone: ParkingZone | null;
  space?: ParkingSpace | null;
}

export const CommunityReportModal: React.FC<CommunityReportModalProps> = ({
  isOpen,
  onClose,
  zone,
  space,
}) => {
  const { zones, submitCommunityReport } = useCurb();
  const [selectedZoneId, setSelectedZoneId] = useState<string>(zone ? zone.id : zones[0]?.id || '');
  const [spaceLabel, setSpaceLabel] = useState<string>(space?.label || '');
  const [reportType, setReportType] = useState<ReportType>('free_space');
  const [description, setDescription] = useState('');
  const [hasPhoto, setHasPhoto] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const currentZone = zones.find((z) => z.id === selectedZoneId) || zones[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    submitCommunityReport({
      zoneId: currentZone.id,
      zoneName: currentZone.name,
      spaceLabel: spaceLabel.trim() || undefined,
      type: reportType,
      description: description.trim(),
      photoUrl: hasPhoto ? 'https://curbsense.ccmc.gov.in/telemetry/evidence-mock.jpg' : undefined,
    });

    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setDescription('');
      setHasPhoto(false);
      onClose();
    }, 1800);
  };

  return (
    <AnimatePresence>
      <div id="community-report-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
            <div>
              <div className="curb-label text-[10px] text-teal-dark bg-teal-pale px-2 py-0.5 rounded-full border border-teal-500/20 inline-block mb-1">
                Citizen Signal Telemetry
              </div>
              <h2 className="font-serif text-xl font-bold text-ink">Report Ground Observation</h2>
              <p className="text-xs text-ink-soft mt-0.5">
                Crowdsourced data informs municipal verification loops — never directly overwrites official slot availability.
              </p>
            </div>
            <button
              id="btn-close-report-modal"
              onClick={onClose}
              className="w-8 h-8 rounded-xl border border-line bg-limestone text-ink flex items-center justify-center hover:bg-teal-pale hover:text-teal-dark transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {isSubmitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 text-center space-y-3"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-ink">Observation Logged</h3>
              <p className="text-xs text-ink-soft">
                Your report has been stamped with confidence score (65%) and queued for pilot sensor corroboration.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Zone Picker */}
              <div>
                <label className="curb-label text-[10px] block mb-1">Target Parking Zone</label>
                <select
                  id="report-select-zone"
                  value={selectedZoneId}
                  onChange={(e) => setSelectedZoneId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-line bg-limestone text-xs font-semibold text-ink focus:outline-none focus:border-teal-primary"
                >
                  {zones.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.name} ({z.area})
                    </option>
                  ))}
                </select>
              </div>

              {/* Optional Space Tag */}
              <div>
                <label className="curb-label text-[10px] block mb-1">Curb Bay Number (Optional)</label>
                <input
                  id="report-input-bay"
                  type="text"
                  placeholder="e.g. TH-04, RS-02"
                  value={spaceLabel}
                  onChange={(e) => setSpaceLabel(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-line bg-limestone text-xs text-ink focus:outline-none focus:border-teal-primary"
                />
              </div>

              {/* Observation Type Pills */}
              <div>
                <label className="curb-label text-[10px] block mb-1.5">Observation Signal Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { type: 'free_space' as ReportType, label: 'Free Space', desc: 'Slot is empty' },
                    { type: 'spaces_occupied' as ReportType, label: 'Occupied', desc: 'Slot blocked' },
                    { type: 'accessibility_note' as ReportType, label: 'Accessibility', desc: 'Ramp/Bay issue' },
                  ].map((item) => (
                    <button
                      key={item.type}
                      type="button"
                      id={`report-type-${item.type}`}
                      onClick={() => setReportType(item.type)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        reportType === item.type
                          ? 'bg-teal-pale border-teal-primary text-teal-dark ring-1 ring-teal-primary'
                          : 'bg-limestone border-line text-ink hover:bg-paper'
                      }`}
                    >
                      <div className="text-xs font-bold">{item.label}</div>
                      <div className="text-[10px] text-ink-soft">{item.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Description Input */}
              <div>
                <label className="curb-label text-[10px] block mb-1">Details & Context</label>
                <textarea
                  id="report-input-details"
                  rows={3}
                  required
                  placeholder="e.g. Delivery van just vacated bay near flower market arch..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 rounded-xl border border-line bg-limestone text-xs text-ink focus:outline-none focus:border-teal-primary resize-none"
                />
              </div>

              {/* Photo Evidence Affordance */}
              <div className="p-3 rounded-xl border border-line bg-limestone flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-teal-dark" />
                  <span className="text-xs font-semibold text-ink">
                    {hasPhoto ? 'Photo Attached (evidence_telemetry_01.jpg)' : 'Attach Curbside Photo (Optional)'}
                  </span>
                </div>
                <button
                  type="button"
                  id="btn-toggle-photo-attach"
                  onClick={() => setHasPhoto(!hasPhoto)}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-paper border border-line hover:bg-teal-pale text-teal-dark transition-colors"
                >
                  {hasPhoto ? 'Remove' : 'Simulate Photo'}
                </button>
              </div>

              {/* Evidence Disclaimer Banner */}
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-200 text-[11px] flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-custom shrink-0 mt-0.5" />
                <p>
                  <strong>Civic Evidence Standard:</strong> Community signals are stamped with a baseline 65% confidence weight and compared with IoT telemetry.
                </p>
              </div>

              {/* Submit CTA */}
              <button
                id="btn-submit-community-report"
                type="submit"
                className="w-full py-3 rounded-xl bg-teal-primary hover:bg-teal-dark text-white font-bold text-sm shadow-md shadow-teal-800/20 transition-colors cursor-pointer"
              >
                Submit Citizen Report
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
