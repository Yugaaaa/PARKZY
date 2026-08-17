import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Sparkles,
  Check,
  X,
  Sliders,
  Scale,
  RefreshCw,
  Info,
  Clock,
  ArrowRight,
  ShieldAlert,
  Edit2,
  CheckCircle2,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from 'recharts';
import { ZonePricingRecommendation, PolicySettings } from '../../types';

interface AuthorityPricingViewProps {
  pricingRecommendations: ZonePricingRecommendation[];
  policySettings: PolicySettings;
  approveZonePricing: (zoneId: string, newRate: number) => void;
  holdCurrentZonePricing: (zoneId: string) => void;
  onNavigateToSimulator: () => void;
  onShowToast: (msg: string) => void;
}

export const AuthorityPricingView: React.FC<AuthorityPricingViewProps> = ({
  pricingRecommendations,
  policySettings,
  approveZonePricing,
  holdCurrentZonePricing,
  onNavigateToSimulator,
  onShowToast,
}) => {
  const [selectedZoneId, setSelectedZoneId] = useState<string>(pricingRecommendations[0]?.zoneId || 'zone-gandhipuram');
  const [customRateModalZone, setCustomRateModalZone] = useState<ZonePricingRecommendation | null>(null);
  const [customRateInput, setCustomRateInput] = useState<number>(30);

  // 24-hour predictive simulation curve data
  const hours = [
    '00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00',
  ];

  const activeRec = pricingRecommendations.find((r) => r.zoneId === selectedZoneId) || pricingRecommendations[0];

  const forecast24hData = hours.map((hour, idx) => {
    // Curbside peak curve in Coimbatore commercial sectors (10am-1pm, 5pm-8pm)
    let occ = 20;
    if (idx >= 4 && idx <= 6) occ = 75 + (idx % 2 === 0 ? 10 : 15);
    else if (idx >= 7 && idx <= 9) occ = 88 - (idx % 2 === 0 ? 5 : 0);
    else if (idx >= 10) occ = 45;

    const base = activeRec.baseRate;
    const dynamicRate = Math.round((base * (occ > 70 ? 1.0 + ((occ - 70) / 30) * 0.5 : 1.0)) / 5) * 5;

    return {
      hour,
      occupancy: occ,
      dynamicTariff: dynamicRate,
      flatTariff: base,
    };
  });

  const handleApprove = (rec: ZonePricingRecommendation) => {
    approveZonePricing(rec.zoneId, rec.recommendedRate);
    onShowToast(`Approved tariff revision for ${rec.zoneName}: ₹${rec.recommendedRate}/hr.`);
  };

  const handleHold = (rec: ZonePricingRecommendation) => {
    holdCurrentZonePricing(rec.zoneId);
    onShowToast(`Maintained current base tariff for ${rec.zoneName}.`);
  };

  const handleCustomRateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customRateModalZone) return;
    approveZonePricing(customRateModalZone.zoneId, customRateInput);
    onShowToast(`Custom tariff of ₹${customRateInput}/hr applied to ${customRateModalZone.zoneName}.`);
    setCustomRateModalZone(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-graphite dark:text-sand-100 flex items-center gap-2">
            Dynamic Pricing & Algorithmic Tariff Engine
          </h1>
          <p className="text-xs text-graphite-muted dark:text-sand-400">
            Demand-responsive curbside rates with policy guardrails, 15-minute review intervals, and authority approval.
          </p>
        </div>

        <button
          onClick={onNavigateToSimulator}
          className="px-3.5 py-2 rounded-xl bg-sand-200 dark:bg-graphite-light text-graphite dark:text-sand-100 hover:bg-sand-300 dark:hover:bg-graphite-dark text-xs font-bold flex items-center gap-2 border border-sand-300 dark:border-graphite-light transition-all shadow-sm shrink-0"
        >
          <Sliders className="w-3.5 h-3.5 text-teal" />
          <span>Tune Policy Simulator</span>
        </button>
      </div>

      {/* Policy Guardrails Indicator Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-teal/5 dark:bg-teal/10 border border-teal/20 text-xs">
        <div>
          <div className="text-graphite-muted dark:text-sand-400 text-[11px] font-semibold">
            Floor Tariff Multiplier
          </div>
          <div className="text-base font-serif font-bold text-teal">
            {policySettings.floorMultiplier}× Base Rate
          </div>
        </div>

        <div>
          <div className="text-graphite-muted dark:text-sand-400 text-[11px] font-semibold">
            Surge Cap Multiplier
          </div>
          <div className="text-base font-serif font-bold text-teal">
            {policySettings.capMultiplier}× Max Cap
          </div>
        </div>

        <div>
          <div className="text-graphite-muted dark:text-sand-400 text-[11px] font-semibold">
            Max Step Per Review
          </div>
          <div className="text-base font-serif font-bold text-teal">
            ±{policySettings.maxStepPercent}% Max Δ
          </div>
        </div>

        <div>
          <div className="text-graphite-muted dark:text-sand-400 text-[11px] font-semibold">
            Algorithm Sensitivity
          </div>
          <div className="text-base font-serif font-bold text-teal capitalize">
            {policySettings.sensitivity} Response
          </div>
        </div>
      </div>

      {/* Dynamic Tariff Recommendation Table */}
      <div className="bg-sand-50 dark:bg-graphite rounded-2xl border border-sand-300 dark:border-graphite-light shadow-sm overflow-hidden">
        <div className="p-4 border-b border-sand-300 dark:border-graphite-light flex items-center justify-between">
          <div>
            <h2 className="font-serif font-bold text-graphite dark:text-sand-100 text-sm sm:text-base">
              Corridor Tariff Review Queue
            </h2>
            <p className="text-[11px] text-graphite-muted dark:text-sand-400">
              Autonomous recommendations awaiting municipal officer sign-off
            </p>
          </div>
          <span className="text-[11px] font-semibold text-teal flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Auto-refreshes every 15m
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-sand-150 dark:bg-graphite-dark text-[11px] font-bold text-graphite-muted dark:text-sand-400 uppercase tracking-wider border-b border-sand-300 dark:border-graphite-light">
                <th className="p-3.5">Zone & Sector</th>
                <th className="p-3.5">Current Rate</th>
                <th className="p-3.5">Rec. Rate</th>
                <th className="p-3.5">Pressure Index</th>
                <th className="p-3.5">Surge Factor</th>
                <th className="p-3.5">Algorithm Logic</th>
                <th className="p-3.5 text-right">Officer Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-200 dark:divide-graphite-light">
              {pricingRecommendations.map((rec) => {
                const isPositive = rec.changePercent > 0;
                const isSelected = rec.zoneId === selectedZoneId;

                return (
                  <tr
                    key={rec.zoneId}
                    onClick={() => setSelectedZoneId(rec.zoneId)}
                    className={`hover:bg-sand-100 dark:hover:bg-graphite-dark transition-colors cursor-pointer ${
                      isSelected ? 'bg-teal/5 dark:bg-teal/10' : ''
                    }`}
                  >
                    <td className="p-3.5">
                      <div className="font-bold text-graphite dark:text-sand-100">{rec.zoneName}</div>
                      <div className="text-[11px] text-graphite-muted dark:text-sand-400">{rec.area}</div>
                    </td>

                    <td className="p-3.5 font-bold text-graphite dark:text-sand-100">
                      ₹{rec.currentRate}/hr
                    </td>

                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5 font-bold text-sm text-teal">
                        <span>₹{rec.recommendedRate}/hr</span>
                        {rec.changePercent !== 0 && (
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                              isPositive ? 'bg-amber-500/15 text-amber-600' : 'bg-moss/15 text-moss'
                            }`}
                          >
                            {isPositive ? `+${rec.changePercent}%` : `${rec.changePercent}%`}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-graphite dark:text-sand-100">
                          {rec.combinedPressure}%
                        </span>
                        <div className="w-16 bg-sand-200 dark:bg-graphite-light rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              rec.combinedPressure > 75
                                ? 'bg-clay'
                                : rec.combinedPressure > 50
                                ? 'bg-amber-500'
                                : 'bg-teal'
                            }`}
                            style={{ width: `${rec.combinedPressure}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-[10px] text-graphite-muted dark:text-sand-400">
                        Curr: {rec.occupancyPressureCurrent}% | Fcst: {rec.occupancyPressureForecast}%
                      </div>
                    </td>

                    <td className="p-3.5 font-bold text-graphite dark:text-sand-100">
                      {rec.rateMultiplier}×
                    </td>

                    <td className="p-3.5 max-w-xs">
                      <p className="text-[11px] text-graphite-muted dark:text-sand-400 line-clamp-2 leading-relaxed">
                        {rec.explanation}
                      </p>
                    </td>

                    <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                      {rec.status === 'approved' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-moss/15 text-moss font-bold text-[11px]">
                          <CheckCircle2 className="w-3 h-3" /> Approved
                        </span>
                      ) : (
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApprove(rec);
                            }}
                            title="Approve dynamic recommendation"
                            className="px-2.5 py-1.5 rounded-xl bg-teal text-sand-50 font-bold hover:bg-teal-light transition-all shadow-sm cursor-pointer"
                          >
                            Approve
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleHold(rec);
                            }}
                            title="Hold base tariff"
                            className="px-2.5 py-1.5 rounded-xl bg-sand-200 dark:bg-graphite-light text-graphite dark:text-sand-100 font-semibold hover:bg-sand-300 transition-colors"
                          >
                            Hold
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setCustomRateModalZone(rec);
                              setCustomRateInput(rec.recommendedRate);
                            }}
                            title="Custom tariff override"
                            className="p-1.5 rounded-xl bg-sand-200 dark:bg-graphite-light text-graphite-muted hover:text-teal transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 24-Hour Predictive Demand vs Dynamic Tariff Simulation */}
      <div className="p-5 rounded-2xl bg-sand-50 dark:bg-graphite border border-sand-300 dark:border-graphite-light shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-serif font-bold text-graphite dark:text-sand-100 text-base">
              24-Hour Tariff vs Occupancy Predictive Simulation
            </h2>
            <p className="text-[11px] text-graphite-muted dark:text-sand-400">
              Correlating projected vehicular surge with automated tariff modulation for <strong>{activeRec.zoneName}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1 text-teal font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-teal" /> Dynamic Rate (₹/hr)
            </span>
            <span className="flex items-center gap-1 text-amber-500 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Occupancy %
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={forecast24hData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="hour" stroke="#8e8982" fontSize={10} tickLine={false} />
              <YAxis stroke="#8e8982" fontSize={10} tickLine={false} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-sand-50 dark:bg-graphite p-3 rounded-xl border border-sand-300 dark:border-graphite-light shadow-lg text-xs space-y-1">
                        <div className="font-bold text-graphite dark:text-sand-100">
                          Hour: {payload[0].payload.hour}
                        </div>
                        <div className="text-teal font-semibold">
                          Dynamic Tariff: ₹{payload[0].payload.dynamicTariff}/hr
                        </div>
                        <div className="text-amber-600 font-semibold">
                          Forecast Occupancy: {payload[0].payload.occupancy}%
                        </div>
                        <div className="text-graphite-muted text-[10px]">
                          Flat Baseline: ₹{payload[0].payload.flatTariff}/hr
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="dynamicTariff"
                stroke="#0a7d73"
                strokeWidth={2.5}
                dot={{ r: 3 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="occupancy"
                stroke="#d97706"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Custom Rate Modal */}
      {customRateModalZone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-graphite-dark/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-sand-50 dark:bg-graphite rounded-3xl border border-sand-300 dark:border-graphite-light p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-graphite dark:text-sand-100 text-base">
                Custom Tariff for {customRateModalZone.zoneName}
              </h3>
              <button
                onClick={() => setCustomRateModalZone(null)}
                className="text-graphite-muted hover:text-graphite text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCustomRateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-graphite dark:text-sand-200 mb-1.5">
                  Set Explicit Hourly Tariff (₹ INR)
                </label>
                <input
                  type="number"
                  min={10}
                  max={200}
                  step={5}
                  value={customRateInput}
                  onChange={(e) => setCustomRateInput(Number(e.target.value))}
                  required
                  className="w-full p-2.5 rounded-xl border border-sand-300 dark:border-graphite-light bg-sand-100 dark:bg-graphite-dark text-graphite dark:text-sand-100 font-bold text-base focus:outline-none focus:border-teal"
                />
              </div>

              <div className="p-3 rounded-xl bg-sand-100 dark:bg-graphite-dark text-graphite-muted dark:text-sand-400 text-[11px]">
                Base rate: ₹{customRateModalZone.baseRate}/hr | Algorithmic rec: ₹{customRateModalZone.recommendedRate}/hr
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCustomRateModalZone(null)}
                  className="px-4 py-2 rounded-xl font-semibold text-graphite-muted hover:bg-sand-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal text-sand-50 font-bold shadow-md hover:bg-teal-light transition-all"
                >
                  Commit Tariff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
