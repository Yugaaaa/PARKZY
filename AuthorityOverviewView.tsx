import React, { useState } from 'react';
import {
  TrendingUp,
  Activity,
  AlertTriangle,
  DollarSign,
  Car,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Bell,
  RefreshCw,
  Clock,
  Sparkles,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import { ParkingZone, ParkingSpace, ZonePricingRecommendation } from '../../types';

interface AuthorityOverviewViewProps {
  zones: ParkingZone[];
  spaces: ParkingSpace[];
  getZoneStats: (zoneId: string) => any;
  pricingRecommendations: ZonePricingRecommendation[];
  openAlertsCount: number;
  onNavigateToPricing: () => void;
  onNavigateToAlerts: () => void;
  onNavigateToLiveMap: (zoneId?: string) => void;
  onShowToast: (msg: string) => void;
}

export const AuthorityOverviewView: React.FC<AuthorityOverviewViewProps> = ({
  zones,
  spaces,
  getZoneStats,
  pricingRecommendations,
  openAlertsCount,
  onNavigateToPricing,
  onNavigateToAlerts,
  onNavigateToLiveMap,
  onShowToast,
}) => {
  const [selectedZoneId, setSelectedZoneId] = useState<string>(zones[0]?.id || 'zone-gandhipuram');
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Compute City-wide aggregates
  const totalSpaces = spaces.length;
  let totalOccupiedOrHeld = 0;
  let totalRevenueEst = 0;

  zones.forEach((z) => {
    const stats = getZoneStats(z.id);
    totalOccupiedOrHeld += stats.held + stats.occupied;
    totalRevenueEst += (stats.held + stats.occupied) * z.hourlyRate * 3.2; // approx 3.2h average dwell
  });

  const cityOccupancyPressure = totalSpaces > 0 ? Math.round((totalOccupiedOrHeld / totalSpaces) * 100) : 0;
  const avgTurnoverRate = 4.2; // times/day per space

  // Generate 12 15-minute demand trend buckets for selected zone
  const activeZone = zones.find((z) => z.id === selectedZoneId) || zones[0];
  const activeZoneStats = getZoneStats(activeZone.id);

  const trendBuckets = [
    { time: '-2h 45m', occupancy: Math.max(25, Math.round(activeZone.hourlyRate * 1.5)) },
    { time: '-2h 30m', occupancy: Math.max(30, Math.round(activeZone.hourlyRate * 1.7)) },
    { time: '-2h 15m', occupancy: Math.max(35, Math.round(activeZone.hourlyRate * 1.9)) },
    { time: '-2h 00m', occupancy: Math.max(40, Math.round(activeZone.hourlyRate * 2.1)) },
    { time: '-1h 45m', occupancy: Math.max(50, Math.round(activeZone.hourlyRate * 2.3)) },
    { time: '-1h 30m', occupancy: Math.max(62, Math.round(activeZone.hourlyRate * 2.5)) },
    { time: '-1h 15m', occupancy: Math.max(70, Math.round(activeZone.hourlyRate * 2.4)) },
    { time: '-1h 00m', occupancy: Math.max(65, Math.round(activeZone.hourlyRate * 2.2)) },
    { time: '-45m', occupancy: Math.max(75, Math.round(activeZone.hourlyRate * 2.6)) },
    { time: '-30m', occupancy: Math.max(82, Math.round(activeZone.hourlyRate * 2.7)) },
    { time: '-15m', occupancy: Math.max(78, Math.round(activeZone.hourlyRate * 2.5)) },
    { time: 'Now', occupancy: activeZoneStats.occupancyRate },
  ];

  const handleForceRecalculate = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      onShowToast('CurbSense AI dynamic tariff engine refreshed across all 6 zones.');
    }, 600);
  };

  const handleBroadcastNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeMessage.trim()) return;
    setIsNoticeModalOpen(false);
    setNoticeMessage('');
    onShowToast(`Municipal notice published to all active drivers in ${activeZone.name}.`);
  };

  const handleExportSummaryCSV = () => {
    const headers = ['Zone ID', 'Zone Name', 'Area', 'Base Tariff (INR)', 'Total Bays', 'Occupancy (%)', 'Available Bays'];
    const rows = zones.map((z) => {
      const s = getZoneStats(z.id);
      return [z.id, `"${z.name}"`, `"${z.area}"`, z.hourlyRate, s.total, `${s.occupancyRate}%`, s.available];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `curbsense_city_occupancy_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast('Daily occupancy & tariff summary CSV downloaded.');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-graphite dark:text-sand-100">
            Municipal Command Center
          </h1>
          <p className="text-xs text-graphite-muted dark:text-sand-400">
            Real-time curbside occupancy pressure, dynamic revenue pacing, and autonomous tariff optimization.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleForceRecalculate}
            disabled={isRefreshing}
            className="px-3 py-2 rounded-xl bg-sand-200 dark:bg-graphite-light text-graphite dark:text-sand-100 hover:bg-sand-300 dark:hover:bg-graphite-dark text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border border-sand-300 dark:border-graphite-light"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-teal' : ''}`} />
            <span>Recalculate Rates</span>
          </button>

          <button
            onClick={() => setIsNoticeModalOpen(true)}
            className="px-3 py-2 rounded-xl bg-sand-200 dark:bg-graphite-light text-graphite dark:text-sand-100 hover:bg-sand-300 dark:hover:bg-graphite-dark text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border border-sand-300 dark:border-graphite-light"
          >
            <Bell className="w-3.5 h-3.5 text-amber-500" />
            <span>Issue Zone Notice</span>
          </button>

          <button
            onClick={handleExportSummaryCSV}
            className="px-3 py-2 rounded-xl bg-teal text-sand-50 hover:bg-teal-light text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Metric 1: Occupancy Pressure */}
        <div className="p-4 rounded-2xl bg-sand-50 dark:bg-graphite border border-sand-300 dark:border-graphite-light shadow-sm">
          <div className="flex items-center justify-between text-graphite-muted dark:text-sand-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">City Occupancy</span>
            <Activity className="w-4 h-4 text-teal" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-serif font-bold text-graphite dark:text-sand-100">
              {cityOccupancyPressure}%
            </span>
            <span className="text-[11px] font-semibold text-amber-600 flex items-center">
              <ArrowUpRight className="w-3 h-3" /> +4.2% peak
            </span>
          </div>
          <div className="w-full bg-sand-200 dark:bg-graphite-light rounded-full h-1.5 mt-3 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                cityOccupancyPressure > 80 ? 'bg-clay' : cityOccupancyPressure > 60 ? 'bg-amber-500' : 'bg-teal'
              }`}
              style={{ width: `${cityOccupancyPressure}%` }}
            />
          </div>
        </div>

        {/* Metric 2: Active Telemetry Spaces */}
        <div className="p-4 rounded-2xl bg-sand-50 dark:bg-graphite border border-sand-300 dark:border-graphite-light shadow-sm">
          <div className="flex items-center justify-between text-graphite-muted dark:text-sand-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Inventory</span>
            <Car className="w-4 h-4 text-teal" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-serif font-bold text-graphite dark:text-sand-100">
              {totalSpaces}
            </span>
            <span className="text-[11px] text-graphite-muted dark:text-sand-400">
              bays mapped
            </span>
          </div>
          <div className="text-[11px] text-moss font-medium mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> 100% sensor accuracy
          </div>
        </div>

        {/* Metric 3: Estimated Revenue Today */}
        <div className="p-4 rounded-2xl bg-sand-50 dark:bg-graphite border border-sand-300 dark:border-graphite-light shadow-sm">
          <div className="flex items-center justify-between text-graphite-muted dark:text-sand-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Est. Revenue Today</span>
            <DollarSign className="w-4 h-4 text-moss" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xs font-bold text-graphite-muted">₹</span>
            <span className="text-2xl font-serif font-bold text-graphite dark:text-sand-100">
              {Math.round(totalRevenueEst).toLocaleString()}
            </span>
          </div>
          <div className="text-[11px] text-moss font-medium mt-2 flex items-center">
            <ArrowUpRight className="w-3 h-3" /> +18.4% vs flat rate
          </div>
        </div>

        {/* Metric 4: Active Alerts */}
        <div
          onClick={onNavigateToAlerts}
          className="p-4 rounded-2xl bg-sand-50 dark:bg-graphite border border-sand-300 dark:border-graphite-light shadow-sm hover:border-clay/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-graphite-muted dark:text-sand-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Incidents</span>
            <AlertTriangle className="w-4 h-4 text-clay group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-serif font-bold text-clay">
              {openAlertsCount}
            </span>
            <span className="text-[11px] text-clay font-semibold">
              require action
            </span>
          </div>
          <div className="text-[11px] text-graphite-muted dark:text-sand-400 mt-2 flex items-center gap-1 group-hover:text-clay">
            <span>View triage queue →</span>
          </div>
        </div>

        {/* Metric 5: Average Turnover Rate */}
        <div className="p-4 rounded-2xl bg-sand-50 dark:bg-graphite border border-sand-300 dark:border-graphite-light shadow-sm">
          <div className="flex items-center justify-between text-graphite-muted dark:text-sand-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Curbside Turnover</span>
            <Clock className="w-4 h-4 text-teal" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-serif font-bold text-graphite dark:text-sand-100">
              {avgTurnoverRate}×
            </span>
            <span className="text-[11px] text-graphite-muted dark:text-sand-400">
              per bay / day
            </span>
          </div>
          <div className="text-[11px] text-teal font-medium mt-2">
            Average dwell: 48 mins
          </div>
        </div>
      </div>

      {/* Main Content Grid: Zone Pressure Breakdown & 15m Demand Trend Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 cols: Zone Pressure Breakdown Table / Cards */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-sand-50 dark:bg-graphite border border-sand-300 dark:border-graphite-light shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif font-bold text-graphite dark:text-sand-100 text-base">
                Curbside Zone Pressure
              </h2>
              <p className="text-[11px] text-graphite-muted dark:text-sand-400">
                Live occupancy distribution across Coimbatore smart corridors
              </p>
            </div>
            <button
              onClick={() => onNavigateToLiveMap()}
              className="text-xs font-semibold text-teal hover:underline flex items-center gap-1"
            >
              Open Live Map →
            </button>
          </div>

          <div className="divide-y divide-sand-200 dark:divide-graphite-light">
            {zones.map((zone) => {
              const stats = getZoneStats(zone.id);
              const rec = pricingRecommendations.find((r) => r.zoneId === zone.id);
              const isSelected = zone.id === selectedZoneId;

              return (
                <div
                  key={zone.id}
                  onClick={() => setSelectedZoneId(zone.id)}
                  className={`py-3.5 px-3 rounded-xl transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-teal/10 dark:bg-teal/15 border-l-4 border-teal'
                      : 'hover:bg-sand-150 dark:hover:bg-graphite-light/50'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-graphite dark:text-sand-100">
                        {zone.name}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-sand-200 dark:bg-graphite-light text-graphite-muted dark:text-sand-300">
                        {zone.area}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-graphite-muted dark:text-sand-400">
                      <span>{stats.available} available</span>
                      <span>•</span>
                      <span>{stats.occupied + stats.held} occupied</span>
                      <span>•</span>
                      <span>{stats.total} total bays</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    {/* Mini Occupancy Bar */}
                    <div className="w-24 sm:w-28 text-right">
                      <div className="flex justify-between text-[11px] font-bold mb-1">
                        <span className="text-graphite-muted dark:text-sand-400">Pressure</span>
                        <span
                          className={
                            stats.occupancyRate > 80
                              ? 'text-clay'
                              : stats.occupancyRate > 60
                              ? 'text-amber-600'
                              : 'text-teal'
                          }
                        >
                          {stats.occupancyRate}%
                        </span>
                      </div>
                      <div className="w-full bg-sand-200 dark:bg-graphite-light rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            stats.occupancyRate > 80
                              ? 'bg-clay'
                              : stats.occupancyRate > 60
                              ? 'bg-amber-500'
                              : 'bg-teal'
                          }`}
                          style={{ width: `${stats.occupancyRate}%` }}
                        />
                      </div>
                    </div>

                    {/* Tariff & Recommendation */}
                    <div className="text-right min-w-[70px]">
                      <div className="text-xs font-bold text-graphite dark:text-sand-100">
                        ₹{zone.hourlyRate}/hr
                      </div>
                      {rec && rec.recommendedRate !== zone.hourlyRate && (
                        <div className="text-[10px] font-bold text-teal flex items-center justify-end gap-0.5">
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>Rec: ₹{rec.recommendedRate}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 5 cols: 15-Minute Demand Trend Chart for Selected Zone */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-sand-50 dark:bg-graphite border border-sand-300 dark:border-graphite-light shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-serif font-bold text-graphite dark:text-sand-100 text-base">
                15-Min Demand Curve
              </h2>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-teal/15 text-teal">
                {activeZone.name}
              </span>
            </div>
            <p className="text-[11px] text-graphite-muted dark:text-sand-400">
              Rolling 3-hour occupancy progression and inflection trajectory
            </p>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendBuckets} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="occupancyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0a7d73" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0a7d73" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="time"
                  stroke="#8e8982"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#8e8982"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 100]}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-sand-50 dark:bg-graphite p-2.5 rounded-xl border border-sand-300 dark:border-graphite-light shadow-lg text-xs">
                          <div className="font-bold text-graphite dark:text-sand-100">
                            {payload[0].payload.time}
                          </div>
                          <div className="text-teal font-semibold">
                            Occupancy: {payload[0].value}%
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="occupancy"
                  stroke="#0a7d73"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#occupancyGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 border-t border-sand-200 dark:border-graphite-light flex items-center justify-between">
            <div className="text-[11px] text-graphite-muted dark:text-sand-400">
              Current Peak: <strong className="text-graphite dark:text-sand-100">{activeZoneStats.occupancyRate}%</strong>
            </div>
            <button
              onClick={onNavigateToPricing}
              className="text-xs font-semibold text-teal hover:underline flex items-center gap-1"
            >
              Review Pricing Decisions →
            </button>
          </div>
        </div>
      </div>

      {/* Broadcast Zone Notice Modal */}
      {isNoticeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-graphite-dark/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-sand-50 dark:bg-graphite rounded-3xl border border-sand-300 dark:border-graphite-light p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-500" />
                <h3 className="font-serif font-bold text-graphite dark:text-sand-100 text-base">
                  Issue Advisory Notice
                </h3>
              </div>
              <button
                onClick={() => setIsNoticeModalOpen(false)}
                className="text-graphite-muted hover:text-graphite dark:text-sand-400 text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-graphite-muted dark:text-sand-400">
              Send an official curbside advisory to drivers navigating to or holding spaces in{' '}
              <strong>{activeZone.name}</strong>.
            </p>

            <form onSubmit={handleBroadcastNotice} className="space-y-3">
              <textarea
                value={noticeMessage}
                onChange={(e) => setNoticeMessage(e.target.value)}
                placeholder="e.g. Heavy procession on Cross Cut Road. Please consider parking at DB Road corridor."
                rows={3}
                required
                className="w-full p-3 rounded-xl border border-sand-300 dark:border-graphite-light bg-sand-100/50 dark:bg-graphite-dark text-xs text-graphite dark:text-sand-100 focus:outline-none focus:border-teal"
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNoticeModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-graphite-muted hover:bg-sand-200 dark:hover:bg-graphite-light transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal text-sand-50 text-xs font-bold shadow-md hover:bg-teal-light transition-all"
                >
                  Publish Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
