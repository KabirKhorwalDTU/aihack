import { useState, useEffect } from 'react';
import { AlertTriangle, TrendingUp, AlertCircle, ChevronDown, Users, AlertOctagon } from 'lucide-react';
import { notificationService } from '../../lib/notificationService';
import { Notification } from '../../lib/supabase';

const NotificationsTab = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<number | undefined>();

  useEffect(() => {
    loadNotifications();
  }, [typeFilter, priorityFilter]);

  const loadNotifications = async () => {
    try {
      const data = await notificationService.getNotifications({
        type: typeFilter as any || undefined,
        priority: priorityFilter,
      });
      setNotifications(data);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(notifications.map((n) =>
        n.id === id ? { ...n, is_read: true } : n
      ));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      for (const notification of notifications.filter((n) => !n.is_read)) {
        await notificationService.markAsRead(notification.id);
      }
      setNotifications(notifications.map((n) => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const getTypeIcon = (type: string, alertType: string | null) => {
    if (type === 'alert') {
      if (alertType === 'spike') return TrendingUp;
      if (alertType === 'anomaly') return AlertCircle;
      return AlertTriangle;
    }
    return AlertCircle;
  };

  const getTypeColor = (type: string, alertType: string | null) => {
    if (type === 'alert') {
      if (alertType === 'spike') return '#FF9500';
      if (alertType === 'anomaly') return '#0B5FFF';
      return '#FF3B30';
    }
    return '#6B7280';
  };

  const getDaysOld = (createdAt: string): number => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-96">
        <div className="text-gray-500">Loading notifications...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="bg-white rounded-2xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
              <p className="text-sm text-gray-500 mt-1">
                Monitor critical issues and anomalies in real-time
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleMarkAllAsRead}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Mark All Read
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0B5FFF] pr-10"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="">All Types</option>
                <option value="alert">Alerts</option>
                <option value="system">System</option>
                <option value="review">Reviews</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
            </div>

            <div className="relative">
              <select
                className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0B5FFF] pr-10"
                value={priorityFilter || ''}
                onChange={(e) => setPriorityFilter(e.target.value ? Number(e.target.value) : undefined)}
              >
                <option value="">All Priorities</option>
                <option value="5">Priority 5</option>
                <option value="4">Priority 4</option>
                <option value="3">Priority 3</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
            </div>
          </div>
        </div>

        {notifications.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No notifications found
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {notifications.map((notification) => {
              const Icon = getTypeIcon(notification.type, notification.alert_type);
              const color = getTypeColor(notification.type, notification.alert_type);
              const daysOld = getDaysOld(notification.created_at);

              return (
                <div
                  key={notification.id}
                  className={`p-6 hover:bg-gray-50 transition-colors cursor-pointer ${
                    !notification.is_read ? 'bg-blue-50/30' : ''
                  }`}
                  onClick={() => handleMarkAsRead(notification.id)}
                >
                  <div className="flex gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${color}15` }}
                    >
                      <Icon size={22} style={{ color }} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-base font-semibold text-gray-900">
                              {notification.title}
                            </h3>
                            {!notification.is_read && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            )}
                            {daysOld >= 3 && (
                              <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                                {daysOld}d old
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{notification.description}</p>

                          {notification.assigned_team && (
                            <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                              <div className="flex items-center gap-2 mb-1">
                                <Users size={14} className="text-blue-600" />
                                <span className="text-xs font-semibold text-blue-900">Assigned Team:</span>
                                <span className="text-xs font-medium text-blue-700">{notification.assigned_team.name}</span>
                                {notification.agent_confidence && (
                                  <span className="text-xs text-blue-600">({Math.round(notification.agent_confidence * 100)}% confidence)</span>
                                )}
                              </div>
                              {notification.agent_reasoning && (
                                <p className="text-xs text-blue-700 leading-relaxed">{notification.agent_reasoning}</p>
                              )}
                            </div>
                          )}

                          {notification.requires_human_review && (
                            <div className="mb-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                              <div className="flex items-center gap-2 mb-1">
                                <AlertOctagon size={14} className="text-amber-600" />
                                <span className="text-xs font-semibold text-amber-900">Requires Human Review</span>
                              </div>
                              {notification.agent_reasoning && (
                                <p className="text-xs text-amber-700 leading-relaxed">{notification.agent_reasoning}</p>
                              )}
                            </div>
                          )}

                          {notification.escalation_level > 0 && (
                            <div className="mb-3 px-3 py-2 bg-red-50 rounded-lg border border-red-200">
                              <span className="text-xs font-semibold text-red-900">Escalation Level {notification.escalation_level}</span>
                            </div>
                          )}

                          <div className="flex items-center gap-4 flex-wrap">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">Type:</span>
                              <span className="text-xs font-medium text-gray-700 capitalize">
                                {notification.type}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">Priority:</span>
                              <div className="flex gap-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <div
                                    key={i}
                                    className={`w-2 h-2 rounded-full ${
                                      i < notification.priority ? 'bg-red-500' : 'bg-gray-300'
                                    }`}
                                  ></div>
                                ))}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">
                                {new Date(notification.created_at).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {notification.is_snoozed && (
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-xs font-medium">
                              Snoozed
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="p-4 border-t border-gray-200 flex items-center justify-between">
          <span className="text-sm text-gray-600">Showing {notifications.length} notifications</span>
        </div>
      </div>
    </div>
  );
};

export default NotificationsTab;
