import React from 'react';
import { Bell, CheckCheck, Info, AlertTriangle, CheckCircle, ShieldCheck } from 'lucide-react';
import { useCurb } from '../../context/CurbContext';

export const NotificationsView: React.FC = () => {
  const { notifications, markAllNotificationsRead, unreadNotificationsCount } = useCurb();

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'alert':
        return <AlertTriangle className="w-4 h-4 text-amber-custom" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'permit':
        return <ShieldCheck className="w-4 h-4 text-teal-dark" />;
      default:
        return <Info className="w-4 h-4 text-teal-primary" />;
    }
  };

  return (
    <div id="citizen-notifications-view" className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-bold text-ink">Notifications & Alerts</h2>
          <p className="text-xs text-ink-soft">Telemetry, hold updates, and municipal permit notices.</p>
        </div>

        {unreadNotificationsCount > 0 && (
          <button
            id="btn-mark-all-read"
            onClick={markAllNotificationsRead}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-paper hover:bg-teal-pale text-teal-dark border border-line text-xs font-bold transition-colors cursor-pointer"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark all as read</span>
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="p-8 rounded-3xl border border-line bg-paper text-center">
          <Bell className="w-8 h-8 text-ink-soft mx-auto mb-2" />
          <div className="font-bold text-ink text-sm">All caught up!</div>
          <p className="text-xs text-ink-soft mt-0.5">No pending notifications at this moment.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              id={`notif-card-${n.id}`}
              className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                n.read
                  ? 'bg-paper border-line'
                  : 'bg-paper border-teal-500/30 shadow-curb ring-1 ring-teal-500/10'
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-limestone border border-line flex items-center justify-center shrink-0 mt-0.5">
                {getNotifIcon(n.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className={`text-sm ${n.read ? 'font-semibold text-ink' : 'font-bold text-ink'}`}>
                    {n.title}
                  </h3>
                  <span className="text-[10px] text-ink-soft shrink-0">{n.timestamp}</span>
                </div>
                <p className="text-xs text-ink-soft mt-1 leading-relaxed">{n.message}</p>
              </div>

              {!n.read && (
                <div className="w-2 h-2 rounded-full bg-teal-primary shrink-0 mt-2" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
