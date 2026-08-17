import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  Car,
  Bike,
  Zap,
  CreditCard,
  FileSpreadsheet,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { ParkingZone, ParkingSpace } from '../../types';

interface AuthorityReportsViewProps {
  zones: ParkingZone[];
  spaces: ParkingSpace[];
  getZoneStats: (zoneId: string) => any;
  dateRange: 'today' | '7d' | '30d' | 'custom';
  onShowToast: (msg: string) => void;
}

export const AuthorityReportsView: React.FC<AuthorityReportsViewProps> = ({
  zones,
  spaces,
  getZoneStats,
  dateRange,
  onShowToast,
}) => {
  const [selectedReportMetric, setSelectedReportMetric] = useState<'revenue' | 'turnover' | 'dwell'>('revenue');

  // Revenue by Zone Data
  const zoneRevenueData = zones.map((zone) => {
    const stats = getZoneStats(zone.id);
    const multiplier = dateRange === 'today' ? 1 : dateRange === '7d' ? 6.8 : 28.5;
    const estRevenue = Math.round((stats.occupied + stats.held) * zone.hourlyRate * 3.5 * multiplier);

    return {
      name: zone.name.split(' ')[0],
      fullName: zone.name,
      revenue: estRevenue,
      occupancy: stats.occupancyRate,
    };
  });

  // Average Dwell Time by Vehicle Type
  const dwellByVehicleData = [
    { type: 'Two-Wheeler', avgMinutes: 32, rate: '₹10/hr', count: 1840 },
    { type: 'Hatchback / Sedan', avgMinutes: 54, rate: '₹30/hr', count: 2150 },
    { type: 'EV Fast Charge', avgMinutes: 42, rate: '₹35/hr', count: 480 },
    { type: 'Accessible (PWD)', avgMinutes: 68, rate: '₹0 (Subsidized)', count: 110 },
  ];

  // Payment Breakdown
  const paymentBreakdown = [
    { name: 'FASTag Auto-Debit', value: 58, color: '#0a7d73' },
    { name: 'UPI (GPay / PhonePe)', value: 32, color: '#2a9d8f' },
    { name: 'Cards / NetBanking', value: 7, color: '#e76f51' },
    { name: 'Pre-loaded Wallet', value: 3, color: '#f4a261' },
  ];

  const handleDownloadFullReportCSV = () => {
    const headers = ['Corridor', 'Sector', 'Est. Revenue (INR)', 'Occupancy Pressure (%)', 'Turnover Rate', 'Sensor Accuracy'];
    const rows = zoneRevenueData.map((d) => [
      `"${d.fullName}"`,
      'Coimbatore Smart Pilot',
      d.revenue,
      `${d.occupancy}%`,
      '4.2x/day',
      '99.4%',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `curbsense_municipal_report_${dateRange}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast(`Exported comprehensive municipal analytics report (${dateRange}) to CSV.`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-graphite dark:text-sand-100 flex items-center gap-2">
            Curbside Analytics & Municipal Reports
          </h1>
          <p className="text-xs text-graphite-muted dark:text-sand-400">
            Historical curbside utilization trends, digital tariff reconciliation, and turnover diagnostics for CCMC mobility planning.
          </p>
        </div>

        <button
          onClick={handleDownloadFullReportCSV}
          className="px-4 py-2 rounded-xl bg-teal text-sand-50 font-bold text-xs shadow-md hover:bg-teal-light transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download Analytics CSV</span>
        </button>
      </div>

      {/* Primary KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-sand-50 dark:bg-graphite border border-sand-300 dark:border-graphite-light shadow-sm">
          <div className="flex items-center justify-between text-graphite-muted dark:text-sand-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Gross Tariff Collections</span>
            <DollarSign className="w-4 h-4 text-moss" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xs font-bold text-graphite-muted">₹</span>
            <span className="text-2xl font-serif font-bold text-graphite dark:text-sand-100">
              {zoneRevenueData.reduce((acc, curr) => acc + curr.revenue, 0).toLocaleString()}
            </span>
          </div>
          <div className="text-[11px] text-moss font-semibold mt-2 flex items-center">
            <ArrowUpRight className="w-3 h-3" /> 100% digital contactless
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-sand-50 dark:bg-graphite border border-sand-300 dark:border-graphite-light shadow-sm">
          <div className="flex items-center justify-between text-graphite-muted dark:text-sand-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Vehicle Sessions</span>
            <Car className="w-4 h-4 text-teal" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-serif font-bold text-graphite dark:text-sand-100">
              {dateRange === 'today' ? '1,420' : dateRange === '7d' ? '9,840' : '41,200'}
            </span>
            <span className="text-[11px] text-graphite-muted dark:text-sand-400">
              parked sessions
            </span>
          </div>
          <div className="text-[11px] text-teal font-semibold mt-2">
            Avg dwell: 48 mins
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-sand-50 dark:bg-graphite border border-sand-300 dark:border-graphite-light shadow-sm">
          <div className="flex items-center justify-between text-graphite-muted dark:text-sand-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">FASTag Penetration</span>
            <CreditCard className="w-4 h-4 text-teal" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-serif font-bold text-teal">
              58%
            </span>
            <span className="text-[11px] text-graphite-muted dark:text-sand-400">
              frictionless dockings
            </span>
          </div>
          <div className="text-[11px] text-moss font-semibold mt-2">
            Instant exit auto-debit
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-sand-50 dark:bg-graphite border border-sand-300 dark:border-graphite-light shadow-sm">
          <div className="flex items-center justify-between text-graphite-muted dark:text-sand-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Sensor Uptime & Telemetry</span>
            <Clock className="w-4 h-4 text-moss" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-serif font-bold text-moss">
              99.4%
            </span>
            <span className="text-[11px] text-graphite-muted dark:text-sand-400">
              magnetic sensor health
            </span>
          </div>
          <div className="text-[11px] text-graphite-muted dark:text-sand-400 mt-2">
            0 dead battery alerts
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 cols: Revenue by Zone Chart */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-sand-50 dark:bg-graphite border border-sand-300 dark:border-graphite-light shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif font-bold text-graphite dark:text-sand-100 text-base">
                Corridor Revenue Yield
              </h2>
              <p className="text-[11px] text-graphite-muted dark:text-sand-400">
                Tariff collections across Coimbatore commercial and medical sectors ({dateRange})
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={zoneRevenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#8e8982" fontSize={10} tickLine={false} />
                <YAxis stroke="#8e8982" fontSize={10} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-sand-50 dark:bg-graphite p-2.5 rounded-xl border border-sand-300 dark:border-graphite-light shadow-lg text-xs space-y-1">
                          <div className="font-bold text-graphite dark:text-sand-100">
                            {payload[0].payload.fullName}
                          </div>
                          <div className="text-teal font-bold">
                            Total Yield: ₹{payload[0].value?.toLocaleString()}
                          </div>
                          <div className="text-graphite-muted text-[10px]">
                            Avg Occupancy: {payload[0].payload.occupancy}%
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="revenue" fill="#0a7d73" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 5 cols: Payment Gateway Share */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-sand-50 dark:bg-graphite border border-sand-300 dark:border-graphite-light shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h2 className="font-serif font-bold text-graphite dark:text-sand-100 text-base">
              Digital Payment Channel Mix
            </h2>
            <p className="text-[11px] text-graphite-muted dark:text-sand-400">
              FASTag auto-debit vs UPI QR checkouts
            </p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {paymentBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-sand-50 dark:bg-graphite p-2 rounded-xl border border-sand-300 dark:border-graphite-light shadow-md text-xs">
                          <span className="font-bold">{payload[0].name}: </span>
                          <span className="text-teal font-bold">{payload[0].value}%</span>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] border-t border-sand-200 dark:border-graphite-light pt-3">
            {paymentBreakdown.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-graphite-muted dark:text-sand-400 truncate">{item.name} ({item.value}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Average Dwell Time & Turnover Table */}
      <div className="bg-sand-50 dark:bg-graphite rounded-2xl border border-sand-300 dark:border-graphite-light shadow-sm overflow-hidden">
        <div className="p-4 border-b border-sand-300 dark:border-graphite-light">
          <h2 className="font-serif font-bold text-graphite dark:text-sand-100 text-base">
            Curbside Dwell Time & Turnover Breakdown
          </h2>
          <p className="text-[11px] text-graphite-muted dark:text-sand-400">
            Distribution of stay lengths and turnover frequencies by vehicle classification
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-sand-150 dark:bg-graphite-dark text-[11px] font-bold text-graphite-muted dark:text-sand-400 uppercase tracking-wider border-b border-sand-300 dark:border-graphite-light">
                <th className="p-3.5">Vehicle Classification</th>
                <th className="p-3.5">Average Dwell Duration</th>
                <th className="p-3.5">Standard Base Tariff</th>
                <th className="p-3.5">Total Completed Sessions</th>
                <th className="p-3.5 text-right">Turnover Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-200 dark:divide-graphite-light">
              {dwellByVehicleData.map((d) => (
                <tr key={d.type} className="hover:bg-sand-100 dark:hover:bg-graphite-dark transition-colors">
                  <td className="p-3.5 font-bold text-graphite dark:text-sand-100">
                    {d.type}
                  </td>
                  <td className="p-3.5 text-teal font-semibold">
                    {d.avgMinutes} minutes
                  </td>
                  <td className="p-3.5 text-graphite dark:text-sand-200">
                    {d.rate}
                  </td>
                  <td className="p-3.5 text-graphite dark:text-sand-200">
                    {d.count.toLocaleString()} sessions
                  </td>
                  <td className="p-3.5 text-right font-bold text-moss">
                    {(1440 / (d.avgMinutes + 12)).toFixed(1)}× / bay / day
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
