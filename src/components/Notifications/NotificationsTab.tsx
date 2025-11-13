import { AlertTriangle, TrendingUp, AlertCircle, Bell, ChevronDown } from 'lucide-react';

const NotificationsTab = () => {
  const notifications = [
    {
      id: '1',
      type: 'escalation',
      title: 'Payment failure spike in Karnataka',
      description: '47 users reported payment deduction without order confirmation in the last 3 hours',
      priority: 5,
      source: 'whatsapp',
      timestamp: '10 minutes ago',
      read: false,
      snoozed: false,
      unresolved: true,
      daysOld: 0,
    },
    {
      id: '2',
      type: 'spike',
      title: 'Delivery complaints increased by 67%',
      description: 'Mumbai West region showing significant spike in delivery delay complaints',
      priority: 5,
      source: 'playstore',
      timestamp: '1 hour ago',
      read: false,
      snoozed: false,
      unresolved: true,
      daysOld: 0,
    },
    {
      id: '3',
      type: 'anomaly',
      title: 'Sudden drop in app ratings',
      description: 'Play Store rating dropped from 4.2 to 2.8 stars in the last 24 hours',
      priority: 4,
      source: 'playstore',
      timestamp: '2 hours ago',
      read: true,
      snoozed: false,
      unresolved: true,
      daysOld: 0,
    },
    {
      id: '4',
      type: 'escalation',
      title: 'Product quality issues - Electronics',
      description: '23 complaints about defective electronics received in the last week',
      priority: 4,
      source: 'freshdesk',
      timestamp: '4 hours ago',
      read: true,
      snoozed: false,
      unresolved: true,
      daysOld: 4,
    },
    {
      id: '5',
      type: 'spike',
      title: 'Customer support wait time spike',
      description: 'Average response time increased to 45 minutes, up from 12 minutes',
      priority: 3,
      source: 'freshdesk',
      timestamp: '6 hours ago',
      read: true,
      snoozed: false,
      unresolved: true,
      daysOld: 1,
    },
    {
      id: '6',
      type: 'anomaly',
      title: 'Negative sentiment spike in Gujarat',
      description: 'Region showing 85% negative sentiment, up from 15% baseline',
      priority: 4,
      source: 'nps',
      timestamp: '8 hours ago',
      read: false,
      snoozed: false,
      unresolved: true,
      daysOld: 5,
    },
  ];

  const getTypeIcon = (type: string) => {
    const icons: Record<string, any> = {
      escalation: AlertTriangle,
      spike: TrendingUp,
      anomaly: AlertCircle,
    };
    return icons[type] || Bell;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      escalation: '#FF3B30',
      spike: '#FF9500',
      anomaly: '#0B5FFF',
    };
    return colors[type] || '#6B7280';
  };

  const getSourceIcon = (source: string) => {
    const icons: Record<string, string> = {
      playstore: '📱',
      freshdesk: '🎫',
      nps: '📊',
      whatsapp: '💬',
      social: '🌐',
    };
    return icons[source] || '📝';
  };

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
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">
                Mark All Read
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <select className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0B5FFF] pr-10">
                <option>All Types</option>
                <option>Escalations</option>
                <option>Spikes</option>
                <option>Anomalies</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
            </div>

            <div className="relative">
              <select className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0B5FFF] pr-10">
                <option>All Sources</option>
                <option>Playstore</option>
                <option>Freshdesk</option>
                <option>WhatsApp</option>
                <option>NPS</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
            </div>

            <div className="relative">
              <select className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0B5FFF] pr-10">
                <option>All Priorities</option>
                <option>Priority 5</option>
                <option>Priority 4</option>
                <option>Priority 3</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
            </div>

            <div className="relative">
              <select className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0B5FFF] pr-10">
                <option>All Status</option>
                <option>Unresolved</option>
                <option>Resolved</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {notifications.map((notification) => {
            const Icon = getTypeIcon(notification.type);
            const color = getTypeColor(notification.type);

            return (
              <div
                key={notification.id}
                className={`p-6 hover:bg-gray-50 transition-colors cursor-pointer ${
                  !notification.read ? 'bg-blue-50/30' : ''
                }`}
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
                          {!notification.read && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                          {notification.daysOld >= 3 && (
                            <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                              {notification.daysOld}d old
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{notification.description}</p>

                        <div className="flex items-center gap-4 flex-wrap">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">Source:</span>
                            <span className="text-sm">{getSourceIcon(notification.source)}</span>
                            <span className="text-xs font-medium text-gray-700 capitalize">
                              {notification.source}
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
                            <span className="text-xs text-gray-500">{notification.timestamp}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                          Snooze
                        </button>
                        <button className="px-4 py-2 bg-[#0B5FFF] text-white rounded-lg text-sm font-medium hover:bg-[#0950CC] transition-colors">
                          Assign
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-4 border-t border-gray-200 flex items-center justify-between">
          <span className="text-sm text-gray-600">Showing 6 active notifications</span>
          <button className="text-sm text-[#0B5FFF] font-medium hover:underline">
            View Archive
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationsTab;
