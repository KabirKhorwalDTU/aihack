import { useState, useEffect } from 'react';
import { reviewService, TopicAnalytics } from '../../lib/reviewService';

const TopTopicsBar = () => {
  const [topics, setTopics] = useState<TopicAnalytics[]>([]);

  useEffect(() => {
    const loadTopics = async () => {
      try {
        const analytics = await reviewService.getTopicAnalytics(7);
        setTopics(analytics.slice(0, 5));
      } catch (error) {
        console.error('Failed to load topic analytics:', error);
      }
    };

    loadTopics();
  }, []);

  if (topics.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-200 flex items-center justify-center h-80">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  const maxVolume = Math.max(...topics.map(t => t.volume));
  const colors = ['#FF3B30', '#FF9500', '#0B5FFF', '#34C759', '#AF52DE'];

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Top 5 Topics (This Week)</h3>
      <div className="space-y-4">
        {topics.map((topic, index) => {
          const percentage = (topic.volume / maxVolume) * 100;
          const color = colors[index % colors.length];
          return (
            <div key={topic.id}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">{topic.name}</span>
                <span className="text-sm font-semibold text-gray-900">{topic.volume}</span>
              </div>
              <div className="relative w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-all duration-500 hover:opacity-80"
                  style={{
                    width: `${percentage}%`,
                    background: `linear-gradient(90deg, ${color} 0%, ${color}CC 100%)`,
                  }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TopTopicsBar;
