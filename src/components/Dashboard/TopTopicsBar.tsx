const TopTopicsBar = () => {
  const topics = [
    { name: 'Delivery Issues', value: 2847, percentage: 85, color: '#FF3B30' },
    { name: 'Product Quality', value: 2156, percentage: 68, color: '#FF9500' },
    { name: 'Customer Support', value: 1923, percentage: 62, color: '#0B5FFF' },
    { name: 'App Performance', value: 1654, percentage: 52, color: '#34C759' },
    { name: 'Payment Problems', value: 1342, percentage: 45, color: '#AF52DE' },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Top 5 Topics (This Week)</h3>
      <div className="space-y-4">
        {topics.map((topic, index) => (
          <div key={index}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">{topic.name}</span>
              <span className="text-sm font-semibold text-gray-900">{topic.value}</span>
            </div>
            <div className="relative w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 rounded-full transition-all duration-500 hover:opacity-80"
                style={{
                  width: `${topic.percentage}%`,
                  background: `linear-gradient(90deg, ${topic.color} 0%, ${topic.color}CC 100%)`,
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopTopicsBar;
