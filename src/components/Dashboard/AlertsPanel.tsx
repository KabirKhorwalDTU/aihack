import { useState, useEffect } from 'react';
import { AlertTriangle, TrendingUp, AlertCircle } from 'lucide-react';
import { notificationService } from '../../lib/notificationService';
import { Notification } from '../../lib/supabase';

const AlertsPanel = () => {
  const [alerts, setAlerts] = useState<Notification[]>([]);

  useEffect(() => {
    loadAlerts();
    const interval = setInterval(loadAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadAlerts = async () => {
    try {
      const data = await notificationService.getNotifications({
        type: 'alert',
        priority: 4,
      });
      setAlerts(data.slice(0, 3));
    } catch (error) {
      console.error('Failed to load alerts:', error);
    }
  };

  const getTypeIcon = (alertType: string | null) => {
    if (alertType === 'spike') return TrendingUp;
    if (alertType === 'anomaly') return AlertCircle;
    return AlertTriangle;
  };

  const getTypeColor = (alertType: string | null) => {
    if (alertType === 'spike') return '#FF9500';
    if (alertType === 'anomaly') return '#0B5FFF';
    return '#FF3B30';
  };

  const getTimeAgo = (createdAt: string): string => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffInMs = now.getTime() - created.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

    if (diffInHours < 1) {
      const diffInMins = Math.floor(diffInMs / (1000 * 60));
      return `${diffInMins}m ago`;
    }
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Recent Alerts</h3>
        <span className="text-xs font-medium text-[#0B5FFF] cursor-pointer hover:underline">
          View All
        </span>
      </div>
      {alerts.length === 0 ? (
        <div className="text-center text-gray-500 py-8">No recent alerts</div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => {
            const Icon = getTypeIcon(alert.alert_type);
            const color = getTypeColor(alert.alert_type);
            return (
              <div
                key={alert.id}
                className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition-all cursor-pointer"
              >
                <div className="flex gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${color}15` }}
                  >
                    <Icon size={18} style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-semibold text-gray-900 truncate">
                        {alert.title}
                      </h4>
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        {getTimeAgo(alert.created_at)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{alert.description}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div
                            key={i}
                            className={`w-1.5 h-1.5 rounded-full ${
                              i < alert.priority ? 'bg-red-500' : 'bg-gray-300'
                            }`}
                          ></div>
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">Priority</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AlertsPanel;
