import { AlertTriangle, TrendingUp, AlertCircle } from 'lucide-react';

const AlertsPanel = () => {
  const alerts = [
    {
      id: 1,
      type: 'spike',
      title: 'Delivery complaints spike',
      description: 'Mumbai region showing 45% increase',
      priority: 5,
      time: '2h ago',
      icon: TrendingUp,
      color: '#FF3B30',
    },
    {
      id: 2,
      type: 'escalation',
      title: 'High-priority escalation',
      description: 'Payment failure for 23 users',
      priority: 5,
      time: '4h ago',
      icon: AlertTriangle,
      color: '#FF9500',
    },
    {
      id: 3,
      type: 'anomaly',
      title: 'Sentiment drop detected',
      description: 'App rating dropped to 2.1 stars',
      priority: 4,
      time: '6h ago',
      icon: AlertCircle,
      color: '#0B5FFF',
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Recent Alerts</h3>
        <span className="text-xs font-medium text-[#0B5FFF] cursor-pointer hover:underline">
          View All
        </span>
      </div>
      <div className="space-y-3">
        {alerts.map((alert) => {
          const Icon = alert.icon;
          return (
            <div
              key={alert.id}
              className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition-all cursor-pointer"
            >
              <div className="flex gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${alert.color}15` }}
                >
                  <Icon size={18} style={{ color: alert.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-semibold text-gray-900 truncate">
                      {alert.title}
                    </h4>
                    <span className="text-xs text-gray-500 flex-shrink-0">{alert.time}</span>
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
    </div>
  );
};

export default AlertsPanel;
