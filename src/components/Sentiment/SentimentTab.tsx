import { useState, useEffect } from 'react';
import { reviewService, RegionSentiment } from '../../lib/reviewService';

const SentimentTab = () => {
  const [stateData, setStateData] = useState<RegionSentiment[]>([]);
  const [weeklyData, setWeeklyData] = useState<Array<{ week: string; score: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [regions, sentimentTrend] = await Promise.all([
        reviewService.getRegionSentiment(),
        reviewService.getSentimentTrend(),
      ]);

      setStateData(regions);

      const weeklyScores = sentimentTrend.slice(-7).map((item) => ({
        week: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }),
        score: item.sentiment,
      }));

      setWeeklyData(weeklyScores);
    } catch (error) {
      console.error('Failed to load sentiment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSentimentColor = (sentiment: number) => {
    if (sentiment >= 60) return '#22C55E';
    if (sentiment >= 40) return '#EAB308';
    return '#EF4444';
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-96">
        <div className="text-gray-500">Loading sentiment data...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Sentiment Trends</h2>
            <p className="text-sm text-gray-500 mt-1">
              Analyze sentiment patterns across states
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              State Sentiment Heatmap
            </h3>
            {stateData.length > 0 ? (
              <div className="space-y-2">
                {stateData.slice(0, 8).map((state, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-32 text-sm font-medium text-gray-700">{state.state}</div>
                    <div className="flex-1 relative h-10 bg-gray-100 rounded-xl overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 rounded-xl flex items-center justify-end pr-3 transition-all"
                        style={{
                          width: `${state.sentiment}%`,
                          backgroundColor: getSentimentColor(state.sentiment),
                        }}
                      >
                        <span className="text-xs font-semibold text-white">{state.sentiment}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">No state data available</div>
            )}
            <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
              <span>0% (Negative)</span>
              <span>50% (Neutral)</span>
              <span>100% (Positive)</span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              Net Sentiment Score (Week-over-Week)
            </h3>
            {weeklyData.length > 0 ? (
              <div className="h-64 relative">
                <div className="absolute inset-0 flex items-end justify-between gap-2">
                  {weeklyData.map((item, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div className="w-full h-full flex flex-col justify-end">
                        <div
                          className="w-full bg-gradient-to-t from-[#0B5FFF] to-[#0B5FFF]CC rounded-t-xl transition-all hover:opacity-80 relative group cursor-pointer"
                          style={{ height: `${item.score}%` }}
                        >
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded">
                            {item.score}%
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 mt-2">{item.week}</span>
                    </div>
                  ))}
                </div>

                <div className="absolute left-0 top-0 bottom-10 flex flex-col justify-between text-xs text-gray-400 -ml-8">
                  <span>100%</span>
                  <span>75%</span>
                  <span>50%</span>
                  <span>25%</span>
                  <span>0%</span>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">No trend data available</div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Top Performing States</h3>
          {stateData.length > 0 ? (
            <div className="space-y-3">
              {stateData
                .sort((a, b) => b.sentiment - a.sentiment)
                .slice(0, 5)
                .map((state, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-500 text-white rounded-lg flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{state.state}</span>
                    </div>
                    <span className="text-sm font-bold text-green-600">{state.sentiment}%</span>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">No data available</div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">States Needing Attention</h3>
          {stateData.length > 0 ? (
            <div className="space-y-3">
              {stateData
                .sort((a, b) => a.sentiment - b.sentiment)
                .slice(0, 5)
                .map((state, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-red-500 text-white rounded-lg flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{state.state}</span>
                    </div>
                    <span className="text-sm font-bold text-red-600">{state.sentiment}%</span>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">No data available</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SentimentTab;
