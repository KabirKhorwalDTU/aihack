import { useState, useEffect } from 'react';
import { reviewService } from '../../lib/reviewService';

const SentimentLineChart = () => {
  const [data, setData] = useState<Array<{ date: string; sentiment: number }>>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const trendData = await reviewService.getSentimentTrend(7);
        setData(trendData);
      } catch (error) {
        console.error('Failed to load sentiment trend:', error);
      }
    };

    loadData();
  }, []);

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-200 flex items-center justify-center h-80">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  const maxValue = 100;

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Sentiment Over Time</h3>
      <div className="space-y-4">
        <div className="flex gap-6 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#0B5FFF]"></div>
            <span className="text-sm text-gray-600">Sentiment Score</span>
          </div>
        </div>

        <div className="relative h-64">
          <div className="absolute inset-0 flex items-end justify-between gap-2">
            {data.map((item, index) => {
              const displayDate = new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' });
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="w-full flex flex-col-reverse h-full justify-start">
                    <div
                      className="w-full bg-gradient-to-t from-[#0B5FFF] to-[#0B5FFF]CC rounded-t-lg transition-all hover:opacity-80"
                      style={{ height: `${(item.sentiment / maxValue) * 100}%` }}
                      title={`${item.sentiment}%`}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 mt-2">{displayDate}</span>
                </div>
              );
            })}
          </div>

          <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-xs text-gray-400 -ml-8">
            <span>100%</span>
            <span>75%</span>
            <span>50%</span>
            <span>25%</span>
            <span>0%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SentimentLineChart;
