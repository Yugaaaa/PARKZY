import React from 'react';
import {
  LayoutDashboard,
  MapPin,
  TrendingUp,
  AlertTriangle,
  Layers,
  Users,
  Sliders,
  BarChart3,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
  ExternalLink,
} from 'lucide-react';
import { useLocation } from 'wouter';

export type AuthoritySection =
  | 'overview'
  | 'map'
  | 'pricing'
  | 'alerts'
  | 'zones'
  | 'citizens'
  | 'simulator'
  | 'reports'
  | 'audit'
  | 'settings';

interface AuthoritySidebarProps {
  activeSection: AuthoritySection;
  onSelectSection: (section: AuthoritySection) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  openAlertsCount: number;
  pendingPermitsCount: number;
}

export const AuthoritySidebar: React.FC<AuthoritySidebarProps> = ({
  activeSection,
  onSelectSection,
  isCollapsed,
  onToggleCollapse,
  openAlertsCount,
  pendingPermitsCount,
}) => {
  const [, setLocation] = useLocation();

  const navItems: {
    id: AuthoritySection;
    label: string;
    icon: React.ElementType;
    badge?: number;
    badgeColor?: string;
  }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'map', label: 'Live Map', icon: MapPin },
    { id: 'pricing', label: 'Pricing & Forecast', icon: TrendingUp },
    {
      id: 'alerts',
      label: 'Alerts & Incidents',
      icon: AlertTriangle,
      badge: openAlertsCount > 0 ? openAlertsCount : undefined,
      badgeColor: 'bg-clay text-sand-50',
    },
    { id: 'zones', label: 'Zones & Inventory', icon: Layers },
    {
      id: 'citizens',
      label: 'Citizens & Compliance',
      icon: Users,
      badge: pendingPermitsCount > 0 ? pendingPermitsCount : undefined,
      badgeColor: 'bg-teal text-sand-50',
    },
    { id: 'simulator', label: 'Policy Simulator', icon: Sliders },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'audit', label: 'Audit Log', icon: FileText },
    { id: 'settings', label: 'Settings & Officers', icon: Settings },
  ];

  return (
    <aside
      className={`relative flex flex-col bg-sand-50 dark:bg-graphite border-r border-sand-300 dark:border-graphite-light transition-all duration-300 ease-in-out z-30 select-none ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Header / Brand */}
      <div className="h-16 flex items-center px-4 border-b border-sand-300 dark:border-graphite-light justify-between">
        {!isCollapsed ? (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-teal text-sand-50 flex items-center justify-center shadow-md shrink-0 font-serif font-bold text-lg">
              CS
            </div>
            <div className="leading-tight truncate">
              <div className="font-serif font-bold text-graphite dark:text-sand-100 text-base tracking-tight flex items-center gap-1.5">
                CurbSense
                <span className="text-[10px] uppercase font-sans font-extrabold px-1.5 py-0.5 rounded bg-clay/15 text-clay border border-clay/30">
                  CCMC
                </span>
              </div>
              <p className="text-[11px] text-graphite-muted dark:text-sand-400 truncate">
                Municipal Ops Console
              </p>
            </div>
          </div>
        ) : (
          <div className="w-full flex justify-center">
            <div className="w-9 h-9 rounded-xl bg-teal text-sand-50 flex items-center justify-center shadow-md font-serif font-bold text-lg">
              CS
            </div>
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="p-1.5 rounded-lg text-graphite-muted dark:text-sand-400 hover:text-graphite dark:hover:text-sand-100 hover:bg-sand-200 dark:hover:bg-graphite-light transition-colors"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 py-4 px-2 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectSection(item.id)}
              title={isCollapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group relative ${
                isActive
                  ? 'bg-teal text-sand-50 shadow-sm'
                  : 'text-graphite-muted dark:text-sand-400 hover:text-graphite dark:hover:text-sand-100 hover:bg-sand-200/70 dark:hover:bg-graphite-light/70'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-transform ${
                  isActive ? 'text-sand-50' : 'group-hover:scale-110'
                }`}
              />

              {!isCollapsed && <span className="truncate">{item.label}</span>}

              {/* Alert Badge */}
              {item.badge !== undefined && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                    item.badgeColor || 'bg-clay text-sand-50'
                  } ${isCollapsed ? 'absolute -top-1 -right-1 ring-2 ring-sand-50 dark:ring-graphite' : 'ml-auto'}`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Switch to Citizen View */}
      <div className="p-3 border-t border-sand-300 dark:border-graphite-light">
        <button
          onClick={() => setLocation('/')}
          title={isCollapsed ? 'Switch to Citizen View' : undefined}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-graphite-muted dark:text-sand-400 hover:text-teal hover:bg-sand-200 dark:hover:bg-graphite-light transition-colors ${
            isCollapsed ? 'justify-center px-0' : ''
          }`}
        >
          <ExternalLink className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Citizen App</span>}
        </button>
      </div>
    </aside>
  );
};
