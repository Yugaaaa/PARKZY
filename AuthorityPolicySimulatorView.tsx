import React, { useState } from 'react';
import {
  Sliders,
  Sparkles,
  TrendingUp,
  RotateCcw,
  CheckCircle2,
  DollarSign,
  Activity,
  Smile,
  Info,
  Scale,
  ShieldCheck,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from 'recharts';
import { PolicySettings, ParkingZone } from '../../types';

interface AuthorityPolicySimulatorViewProps {
  policySettings: PolicySettings;
  zones: ParkingZone[];
  updatePolicySettings: (newSettings: Partial<PolicySettings>) => void;
  onShowToast: (msg: string) => void;
}

export const AuthorityPolicySimulatorView: React.FC<AuthorityPolicySimulatorViewProps> = ({
  policySettings,
  zones,
  updatePolicySettings,
  onShowToast,
}) => {
  // Local simulator state
  const [elasticity, setElasticity] = useState<number>(policySettings.priceElasticity);
  const [targetOccupancy, setTargetOccupancy] = useState<number>(policySettings.targetOccupancy);
  const [surgeCap, setSurgeCap] = useState<number>(policySettings.capMultiplier);
  const [floorMultiplier, setFloorMultiplier] = useState<number>(policySettings.floorMultiplier);
  const [maxStep, setMaxStep] = useState<number>(policySettings.maxStepPercent);
  const [sensitivity, setSensitivity] = useState<'low' | 'medium' | 'aggressive'>(policySettings.sensitivity);

  // Compute Simulated Outcomes based on parameters
  const baselineRevenue = 28500;
  // If surge cap and elasticity are high, revenue increases and peak congestion decreases
  const surgeBoost = (surgeCap - 1.0) * 0.25;
  const elasticityDampening = (elasticity - 0.8) * 0.15;
  const sensitivityMultiplier = sensitivity === 'aggressive' ? 1.15 : sensitivity === 'medium' ? 1.05 : 0.95;

  const simulatedRevenueDeltaPercent = Math.round(
    ((surgeBoost - elasticityDampening) * sensitivityMultiplier + 0.12) * 100
  );
  const simulatedRevenue = Math.round(baselineRevenue * (1 + simulatedRevenueDeltaPercent / 100));

  const congestionReduction = Math.min(
    28,
    Math.round(8 + (surgeCap - 1.0) * 12 + (elasticity * 6))
  );

  // Citizen satisfaction: if price is too aggressive, satisfaction drops; if congestion is low, satisfaction rises
  const citizenSatisfaction = Math.min(
    95,
    Math.max(45, Math.round(82 + (congestionReduction * 0.4) - (surgeCap > 1.8 ? (surgeCap - 1.8) * 20 : 0)))
  );

  // Zone by zone simulation comparison chart
  const simulationComparisonData = zones.map((zone) => {
    const currentRate = zone.hourlyRate;
    const simulatedRate = Math.round(
      (currentRate * Math.min(surgeCap, Math.max(floorMultiplier, 1.0 + (sensitivity === 'aggressive' ? 0.35 : 0.2)))) / 5
    ) * 5;

    return {
      name: zone.name.split(' ')[0],
      currentRate,
      simulatedRate,
    };
  });

  const handleApplyToEngine = () => {
    updatePolicySettings({
      priceElasticity: elasticity,
      targetOccupancy,
      capMultiplier: surgeCap,
      floorMultiplier,
      maxStepPercent: maxStep,
      sensitivity,
    });
    onShowToast('Policy parameters applied to live dynamic tariff engine.');
  };

  const handleResetDefaults = () => {
    setElasticity(0.8);
    setTargetOccupancy(85);
    setSurgeCap(1.8);
    setFloorMultiplier(0.7);
    setMaxStep(15);
    setSensitivity('medium');
    onShowToast('Simulator reset to municipal pilot baseline defaults.');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-graphite dark:text-sand-100 flex items-center gap-2">
            Curbside Policy Sandbox & Tariff Simulator
          </h1>
          <p className="text-xs text-graphite-muted dark:text-sand-400">
            Model city-wide elasticity, target occupancy equilibrium, and tariff caps before applying to live corridors.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetDefaults}
            className="px-3.5 py-2 rounded-xl bg-sand-200 dark:bg-graphite-light text-graphite dark:text-sand-100 hover:bg-sand-300 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-sand-300 dark:border-graphite-light"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={handleApplyToEngine}
            className="px-4 py-2 rounded-xl bg-teal text-sand-50 font-bold text-xs shadow-md hover:bg-teal-light transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Apply Policy to Live Engine</span>
          </button>
        </div>
      </div>

      {/* Simulated Outcomes KPI Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Metric 1: Revenue Impact */}
        <div className="p-4 rounded-2xl bg-sand-50 dark:bg-graphite border border-sand-300 dark:border-graphite-light shadow-sm">
          <div className="flex items-center justify-between text-graphite-muted dark:text-sand-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Projected Daily Revenue</span>
            <DollarSign className="w-4 h-4 text-moss" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-serif font-bold text-graphite dark:text-sand-100">
              ₹{simulatedRevenue.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-moss">
              +{simulatedRevenueDeltaPercent}% (₹{(simulatedRevenue - baselineRevenue).toLocaleString()})
            </span>
          </div>
          <p className="text-[11px] text-graphite-muted dark:text-sand-400 mt-2">
            Compared to static flat tariff baseline (₹{baselineRevenue.toLocaleString()}/day)
          </p>
        </div>

        {/* Metric 2: Peak Congestion Reduction */}
        <div className="p-4 rounded-2xl bg-sand-50 dark:bg-graphite border border-sand-300 dark:border-graphite-light shadow-sm">
          <div className="flex items-center justify-between text-graphite-muted dark:text-sand-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Peak Congestion Drop</span>
            <Activity className="w-4 h-4 text-teal" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-serif font-bold text-teal">
              -{congestionReduction}%
            </span>
            <span className="text-xs font-semibold text-graphite-muted">
              cruising vehicle reduction
            </span>
          </div>
          <p className="text-[11px] text-graphite-muted dark:text-sand-400 mt-2">
            Estimated 8.5 minutes saved per parking search in commercial hubs
          </p>
        </div>

        {/* Metric 3: Citizen Satisfaction Score */}
        <div className="p-4 rounded-2xl bg-sand-50 dark:bg-graphite border border-sand-300 dark:border-graphite-light shadow-sm">
          <div className="flex items-center justify-between text-graphite-muted dark:text-sand-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Citizen Public Acceptance</span>
            <Smile className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-serif font-bold text-graphite dark:text-sand-100">
              {citizenSatisfaction} / 100
            </span>
            <span className="text-xs font-semibold text-moss">
              Healthy balance
            </span>
          </div>
          <p className="text-[11px] text-graphite-muted dark:text-sand-400 mt-2">
            Predictive sentiment based on availability vs tariff perception
          </p>
        </div>
      </div>

      {/* Simulator Tuning Controls + Visual Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 cols: Sliders & Controls */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-sand-50 dark:bg-graphite border border-sand-300 dark:border-graphite-light shadow-sm space-y-5">
          <div>
            <h2 className="font-serif font-bold text-graphite dark:text-sand-100 text-base">
              Municipal Policy Parameters
            </h2>
            <p className="text-[11px] text-graphite-muted dark:text-sand-400">
              Adjust levers to modulate how aggressively the AI algorithm reacts to real-time curbside demand.
            </p>
          </div>

          {/* Slider 1: Price Elasticity */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-graphite dark:text-sand-100">Price Elasticity Coefficient</span>
              <span className="text-teal font-mono font-bold">{elasticity.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.3"
              max="1.5"
              step="0.05"
              value={elasticity}
              onChange={(e) => setElasticity(parseFloat(e.target.value))}
              className="w-full h-2 bg-sand-200 dark:bg-graphite-light rounded-lg appearance-none cursor-pointer accent-teal"
            />
            <div className="flex justify-between text-[10px] text-graphite-muted dark:text-sand-400">
              <span>0.30 (Inelastic / Essential)</span>
              <span>1.50 (Highly Elastic)</span>
            </div>
          </div>

          {/* Slider 2: Target Occupancy Equilibrium */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-graphite dark:text-sand-100">Target Occupancy Equilibrium</span>
              <span className="text-teal font-mono font-bold">{targetOccupancy}%</span>
            </div>
            <input
              type="range"
              min="65"
              max="95"
              step="5"
              value={targetOccupancy}
              onChange={(e) => setTargetOccupancy(parseInt(e.target.value))}
              className="w-full h-2 bg-sand-200 dark:bg-graphite-light rounded-lg appearance-none cursor-pointer accent-teal"
            />
            <div className="flex justify-between text-[10px] text-graphite-muted dark:text-sand-400">
              <span>65% (High bay availability)</span>
              <span>85% (Shoup optimal)</span>
              <span>95% (Maximum utilization)</span>
            </div>
          </div>

          {/* Slider 3: Surge Multiplier Cap */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-graphite dark:text-sand-100">Surge Multiplier Cap</span>
              <span className="text-teal font-mono font-bold">{surgeCap.toFixed(1)}× Base Rate</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="2.5"
              step="0.1"
              value={surgeCap}
              onChange={(e) => setSurgeCap(parseFloat(e.target.value))}
              className="w-full h-2 bg-sand-200 dark:bg-graphite-light rounded-lg appearance-none cursor-pointer accent-teal"
            />
            <div className="flex justify-between text-[10px] text-graphite-muted dark:text-sand-400">
              <span>1.0× (No dynamic surge)</span>
              <span>1.8× (Pilot standard)</span>
              <span>2.5× (Aggressive peak damping)</span>
            </div>
          </div>

          {/* Slider 4: Floor Tariff Multiplier */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-graphite dark:text-sand-100">Off-Peak Floor Discount Multiplier</span>
              <span className="text-teal font-mono font-bold">{floorMultiplier.toFixed(2)}× Base Rate</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="1.0"
              step="0.05"
              value={floorMultiplier}
              onChange={(e) => setFloorMultiplier(parseFloat(e.target.value))}
              className="w-full h-2 bg-sand-200 dark:bg-graphite-light rounded-lg appearance-none cursor-pointer accent-teal"
            />
            <div className="flex justify-between text-[10px] text-graphite-muted dark:text-sand-400">
              <span>0.50× (50% off-peak discount)</span>
              <span>1.00× (Never discount below base)</span>
            </div>
          </div>

          {/* Slider 5: Max Rate Step Per Review */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-graphite dark:text-sand-100">Max Tariff Step Change Per Review</span>
              <span className="text-teal font-mono font-bold">±{maxStep}% Max Δ</span>
            </div>
            <input
              type="range"
              min="5"
              max="30"
              step="5"
              value={maxStep}
              onChange={(e) => setMaxStep(parseInt(e.target.value))}
              className="w-full h-2 bg-sand-200 dark:bg-graphite-light rounded-lg appearance-none cursor-pointer accent-teal"
            />
            <div className="flex justify-between text-[10px] text-graphite-muted dark:text-sand-400">
              <span>±5% (Gentle price shifts)</span>
              <span>±15% (Recommended)</span>
              <span>±30% (Rapid response)</span>
            </div>
          </div>

          {/* Sensitivity Segmented Buttons */}
          <div className="space-y-2 pt-2 border-t border-sand-200 dark:border-graphite-light">
            <label className="block text-xs font-semibold text-graphite dark:text-sand-100">
              Algorithmic Sensitivity Mode
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['low', 'medium', 'aggressive'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setSensitivity(mode)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold capitalize transition-all border ${
                    sensitivity === mode
                      ? 'bg-teal text-sand-50 border-teal shadow-sm'
                      : 'bg-sand-100 dark:bg-graphite-dark text-graphite dark:text-sand-300 border-sand-300 dark:border-graphite-light hover:bg-sand-200'
                  }`}
                >
                  {mode} Response
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right 5 cols: Projected Zone-by-Zone Tariff Comparison */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-sand-50 dark:bg-graphite border border-sand-300 dark:border-graphite-light shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h2 className="font-serif font-bold text-graphite dark:text-sand-100 text-base">
              Projected Peak Tariff Comparison
            </h2>
            <p className="text-[11px] text-graphite-muted dark:text-sand-400">
              Base tariff vs. simulated peak dynamic rate (₹/hr) across commercial corridors
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={simulationComparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#8e8982" fontSize={10} tickLine={false} />
                <YAxis stroke="#8e8982" fontSize={10} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-sand-50 dark:bg-graphite p-2.5 rounded-xl border border-sand-300 dark:border-graphite-light shadow-lg text-xs space-y-1">
                          <div className="font-bold text-graphite dark:text-sand-100">
                            {payload[0].payload.name} Corridor
                          </div>
                          <div className="text-graphite-muted">
                            Base: ₹{payload[0].payload.currentRate}/hr
                          </div>
                          <div className="text-teal font-bold">
                            Simulated Peak: ₹{payload[0].payload.simulatedRate}/hr
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  formatter={(value) => (value === 'currentRate' ? 'Base Tariff' : 'Simulated Peak Tariff')}
                />
                <Bar dataKey="currentRate" fill="#c2beb4" radius={[4, 4, 0, 0]} />
                <Bar dataKey="simulatedRate" fill="#0a7d73" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 rounded-xl bg-teal/10 border border-teal/20 text-xs text-graphite dark:text-sand-200">
            <div className="font-bold text-teal flex items-center gap-1 mb-1">
              <Sparkles className="w-3.5 h-3.5" /> Policy Impact Assessment
            </div>
            <p className="text-[11px] text-graphite-muted dark:text-sand-400">
              This policy setup maintains standard rates during normal hours while applying a bounded {surgeCap}× ceiling during peak shopping and evening office dispersal hours.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
