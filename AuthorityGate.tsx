import React from 'react';
import { useLocation } from 'wouter';
import { motion } from 'motion/react';
import { Shield, Lock, Building2, KeyRound, ArrowRight, UserCheck, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useCurb } from '../../context/CurbContext';
import { DEMO_USERS } from '../../data/seedData';

export const AuthorityGate: React.FC = () => {
  const { loginAsUser } = useCurb();
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-limestone text-ink flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg bg-paper rounded-3xl border border-line p-8 shadow-curb text-center space-y-6"
      >
        {/* Seal / Emblem */}
        <div className="w-20 h-20 mx-auto rounded-3xl bg-teal-pale text-teal-dark flex items-center justify-center border-2 border-teal-primary/30 shadow-inner">
          <Building2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-clay/10 text-clay text-xs font-semibold uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5" />
            Restricted Municipal Portal
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink">
            Coimbatore City Municipal Corporation
          </h1>
          <p className="text-xs sm:text-sm text-ink-soft max-w-md mx-auto">
            The CurbSense Municipal Authority Dashboard is reserved for authorized CCMC Traffic & Mobility officers, dynamic tariff planners, and field wardens.
          </p>
        </div>

        {/* Features preview */}
        <div className="p-4 rounded-2xl bg-limestone border border-line text-left space-y-2.5 text-xs text-ink">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-primary shrink-0" />
            <span>Real-time occupancy pressure & curbside sensor mesh telemetry</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-primary shrink-0" />
            <span>Dynamic tariff approval engine (0.85× - 1.6× bounded reviews)</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-primary shrink-0" />
            <span>Sensor vs citizen signal triage, warden dispatch & audit logging</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <button
            type="button"
            id="btn-gate-signin-portal"
            onClick={() => setLocation('/login?mode=authority')}
            className="w-full py-3.5 px-4 rounded-2xl bg-teal-dark hover:bg-[#054842] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <Shield className="w-4 h-4" />
            <span>Sign In with Municipal Staff Credentials</span>
          </button>

          <button
            type="button"
            id="btn-gate-quick-auth-demo"
            onClick={() => {
              loginAsUser(DEMO_USERS.admin);
              setLocation('/authority');
            }}
            className="w-full py-3 px-4 rounded-2xl border border-line hover:border-teal-primary bg-paper hover:bg-limestone text-ink text-xs font-semibold transition-all flex items-center justify-center gap-2"
          >
            <UserCheck className="w-4 h-4 text-teal-primary" />
            <span>Quick Demo: Authorize as Chief Engineer Karthik S.</span>
          </button>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={() => setLocation('/')}
            className="text-xs text-ink-soft hover:text-teal-primary transition-colors flex items-center justify-center gap-1.5 mx-auto font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Citizen Driver Dashboard</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
