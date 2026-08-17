import React, { useState, useMemo } from 'react';
import {
  FileText,
  Search,
  Filter,
  Shield,
  Activity,
  UserCheck,
  Clock,
  ChevronLeft,
  ChevronRight,
  Eye,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { AuditEntry } from '../../types';

interface AuthorityAuditLogViewProps {
  auditLog: AuditEntry[];
  onShowToast: (msg: string) => void;
}

export const AuthorityAuditLogView: React.FC<AuthorityAuditLogViewProps> = ({
  auditLog,
  onShowToast,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'system' | 'authority'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<AuditEntry | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const filteredLogs = useMemo(() => {
    return auditLog.filter((entry) => {
      if (filterType !== 'all' && entry.type !== filterType) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          entry.action.toLowerCase().includes(q) ||
          entry.details.toLowerCase().includes(q) ||
          (entry.actor && entry.actor.toLowerCase().includes(q)) ||
          (entry.zoneName && entry.zoneName.toLowerCase().includes(q)) ||
          (entry.spaceLabel && entry.spaceLabel.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [auditLog, filterType, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize));
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-graphite dark:text-sand-100 flex items-center gap-2">
            Municipal Audit Log & Telemetry Ledger
          </h1>
          <p className="text-xs text-graphite-muted dark:text-sand-400">
            Immutable timeline of sensor events, dynamic tariff mutations, warden overrides, and enforcement actions.
          </p>
        </div>

        <div className="text-xs font-semibold text-graphite-muted dark:text-sand-400">
          Total Logged Transactions: <strong className="text-teal font-mono">{auditLog.length}</strong>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="p-4 rounded-2xl bg-sand-50 dark:bg-graphite border border-sand-300 dark:border-graphite-light shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Type Filter Tabs */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setFilterType('all');
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterType === 'all'
                ? 'bg-teal text-sand-50 shadow-sm'
                : 'text-graphite-muted dark:text-sand-400 hover:bg-sand-200 dark:hover:bg-graphite-light'
            }`}
          >
            All Events ({auditLog.length})
          </button>

          <button
            onClick={() => {
              setFilterType('authority');
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              filterType === 'authority'
                ? 'bg-teal text-sand-50 shadow-sm'
                : 'text-graphite-muted dark:text-sand-400 hover:bg-sand-200 dark:hover:bg-graphite-light'
            }`}
          >
            <Shield className="w-3 h-3" />
            <span>Authority Actions ({auditLog.filter((l) => l.type === 'authority').length})</span>
          </button>

          <button
            onClick={() => {
              setFilterType('system');
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              filterType === 'system'
                ? 'bg-teal text-sand-50 shadow-sm'
                : 'text-graphite-muted dark:text-sand-400 hover:bg-sand-200 dark:hover:bg-graphite-light'
            }`}
          >
            <Activity className="w-3 h-3" />
            <span>System Telemetry ({auditLog.filter((l) => l.type === 'system').length})</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search action, officer, bay, zone..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-64 pl-8 pr-3 py-1.5 rounded-xl border border-sand-300 dark:border-graphite-light bg-sand-100 dark:bg-graphite-dark text-xs text-graphite dark:text-sand-100 focus:outline-none focus:border-teal"
          />
          <Search className="w-3.5 h-3.5 text-graphite-muted dark:text-sand-400 absolute left-2.5 top-2" />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-sand-50 dark:bg-graphite rounded-2xl border border-sand-300 dark:border-graphite-light shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-sand-150 dark:bg-graphite-dark text-[11px] font-bold text-graphite-muted dark:text-sand-400 uppercase tracking-wider border-b border-sand-300 dark:border-graphite-light">
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Type</th>
                <th className="p-3.5">Action</th>
                <th className="p-3.5">Actor / Officer</th>
                <th className="p-3.5">Target Location</th>
                <th className="p-3.5">Audit Summary</th>
                <th className="p-3.5 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-200 dark:divide-graphite-light">
              {paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-graphite-muted dark:text-sand-400">
                    No audit records match your query.
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((entry) => {
                  const isAuthority = entry.type === 'authority';

                  return (
                    <tr
                      key={entry.id}
                      onClick={() => setSelectedEntry(entry)}
                      className="hover:bg-sand-100 dark:hover:bg-graphite-dark transition-colors cursor-pointer"
                    >
                      <td className="p-3.5 font-mono text-[11px] text-graphite-muted dark:text-sand-400 whitespace-nowrap">
                        {entry.timestamp}
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] uppercase font-bold ${
                            isAuthority
                              ? 'bg-clay/15 text-clay border border-clay/20'
                              : 'bg-teal/15 text-teal border border-teal/20'
                          }`}
                        >
                          {entry.type}
                        </span>
                      </td>

                      <td className="p-3.5 font-bold text-graphite dark:text-sand-100">
                        {entry.action}
                      </td>

                      <td className="p-3.5 text-graphite-muted dark:text-sand-300">
                        {entry.actor}
                      </td>

                      <td className="p-3.5">
                        {entry.zoneName || entry.spaceLabel ? (
                          <div className="flex items-center gap-1">
                            {entry.spaceLabel && (
                              <span className="font-mono font-bold text-teal">
                                Bay {entry.spaceLabel}
                              </span>
                            )}
                            {entry.zoneName && (
                              <span className="text-[11px] text-graphite-muted dark:text-sand-400">
                                ({entry.zoneName})
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-graphite-muted dark:text-sand-400 italic">City-wide</span>
                        )}
                      </td>

                      <td className="p-3.5 max-w-sm">
                        <p className="text-[11px] text-graphite-muted dark:text-sand-400 truncate">
                          {entry.details}
                        </p>
                      </td>

                      <td className="p-3.5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEntry(entry);
                          }}
                          className="p-1.5 rounded-lg text-graphite-muted hover:text-teal hover:bg-sand-200 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-sand-300 dark:border-graphite-light text-xs">
            <span className="text-graphite-muted dark:text-sand-400">
              Showing {(currentPage - 1) * pageSize + 1} -{' '}
              {Math.min(currentPage * pageSize, filteredLogs.length)} of {filteredLogs.length} events
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-sand-300 dark:border-graphite-light disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-bold text-graphite dark:text-sand-100">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-sand-300 dark:border-graphite-light disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Entry Inspector Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-graphite-dark/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-sand-50 dark:bg-graphite rounded-3xl border border-sand-300 dark:border-graphite-light p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-sand-300 dark:border-graphite-light pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal" />
                <h3 className="font-serif font-bold text-graphite dark:text-sand-100 text-base">
                  Audit Transaction #{selectedEntry.id}
                </h3>
              </div>
              <button onClick={() => setSelectedEntry(null)} className="text-graphite-muted text-sm">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-sand-100 dark:bg-graphite-dark">
                  <span className="text-[10px] text-graphite-muted dark:text-sand-400 block uppercase font-bold">
                    Action Type
                  </span>
                  <span className="font-bold text-graphite dark:text-sand-100">
                    {selectedEntry.action}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-sand-100 dark:bg-graphite-dark">
                  <span className="text-[10px] text-graphite-muted dark:text-sand-400 block uppercase font-bold">
                    Timestamp
                  </span>
                  <span className="font-mono text-graphite dark:text-sand-100">
                    {selectedEntry.timestamp}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-sand-100 dark:bg-graphite-dark">
                <span className="text-[10px] text-graphite-muted dark:text-sand-400 block uppercase font-bold">
                  Actor / Authorizing Officer
                </span>
                <span className="font-semibold text-graphite dark:text-sand-100">
                  {selectedEntry.actor}
                </span>
              </div>

              {selectedEntry.zoneName && (
                <div className="p-3 rounded-xl bg-sand-100 dark:bg-graphite-dark">
                  <span className="text-[10px] text-graphite-muted dark:text-sand-400 block uppercase font-bold">
                    Corridor & Bay Location
                  </span>
                  <span className="text-graphite dark:text-sand-100">
                    {selectedEntry.zoneName} {selectedEntry.spaceLabel ? `(Bay ${selectedEntry.spaceLabel})` : ''}
                  </span>
                </div>
              )}

              <div className="p-3.5 rounded-xl bg-sand-100 dark:bg-graphite-dark space-y-1">
                <span className="text-[10px] text-graphite-muted dark:text-sand-400 block uppercase font-bold">
                  Immutable Audit Payload
                </span>
                <p className="text-xs text-graphite dark:text-sand-200 leading-relaxed">
                  {selectedEntry.details}
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedEntry(null)}
                className="px-4 py-2 rounded-xl bg-teal text-sand-50 font-bold text-xs shadow-md hover:bg-teal-light transition-all"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
