import { useState, useEffect } from 'react';
import { reviewService } from '../../lib/reviewService';

const SentimentDonut = () => {
  const [data, setData] = useState<{ positive: number; negative: number } | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const metrics = await reviewService.getDashboardMetrics(7);
        setData(metrics.sentimentDistribution);
      } catch (error) {
        console.error('Failed to load sentiment data:', error);
      }
    };

    loadData();
  }, []);

  if (!data) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-200 h-full flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  const total = data.positive + data.negative;
  const positivePercentage = total > 0 ? (data.positive / total) * 100 : 50;
  const negativePercentage = total > 0 ? (data.negative / total) * 100 : 50;

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 h-full">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Current Sentiment Distribution</h3>

      <div className="flex flex-col items-center justify-center">
        <div className="relative w-48 h-48 mb-6">
          <svg viewBox="0 0 100 100" className="transform -rotate-90">
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#EF4444"
              strokeWidth="20"
              strokeDasharray={`${negativePercentage * 2.51} ${(100 - negativePercentage) * 2.51}`}
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#22C55E"
              strokeWidth="20"
              strokeDasharray={`${positivePercentage * 2.51} ${(100 - positivePercentage) * 2.51}`}
              strokeDashoffset={`-${negativePercentage * 2.51}`}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{positivePercentage.toFixed(0)}%</div>
              <div className="text-xs text-gray-500">Positive</div>
            </div>
          </div>
        </div>

        <div className="w-full space-y-3">
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm font-medium text-gray-700">Positive</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">{positivePercentage.toFixed(0)}%</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-sm font-medium text-gray-700">Negative</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">{negativePercentage.toFixed(0)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SentimentDonut;
