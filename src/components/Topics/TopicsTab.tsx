import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { reviewService, TopicAnalytics } from '../../lib/reviewService';

interface TopicWithDetails extends TopicAnalytics {
  topState: string;
  recentFeedback: Array<{
    text: string;
    sentiment: string;
    state: string;
  }>;
}

const TopicsTab = () => {
  const [topics, setTopics] = useState<TopicAnalytics[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<TopicWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    loadTopics();
  }, []);

  const loadTopics = async () => {
    try {
      const data = await reviewService.getTopicAnalytics();
      setTopics(data);
      if (data.length > 0 && !selectedTopic) {
        loadTopicDetails(data[0]);
      }
    } catch (error) {
      console.error('Failed to load topics:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTopicDetails = async (topic: TopicAnalytics) => {
    setLoadingDetails(true);
    try {
      const [topState, reviews] = await Promise.all([
        reviewService.getTopicTopState(topic.id),
        reviewService.getTopicReviews(topic.id, 3),
      ]);

      setSelectedTopic({
        ...topic,
        topState,
        recentFeedback: reviews.map((r) => ({
          text: r.review_text || 'No text',
          sentiment: r.sentiment || 'negative',
          state: r.state || 'Unknown',
        })),
      });
    } catch (error) {
      console.error('Failed to load topic details:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const getSentimentColor = (sentiment: number) => {
    if (sentiment >= 60) return 'text-green-600';
    if (sentiment >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp size={16} className="text-green-600" />;
    if (trend < 0) return <TrendingDown size={16} className="text-red-600" />;
    return <Minus size={16} className="text-gray-400" />;
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-96">
        <div className="text-gray-500">Loading topics...</div>
      </div>
    );
  }

  if (topics.length === 0) {
    return (
      <div className="p-6 flex items-center justify-center h-96">
        <div className="text-gray-500">No topics available. Process reviews first.</div>
      </div>
    );
  }

  return (
    <div className="p-6 flex gap-6 h-[calc(100vh-80px)]">
      <div className="w-80 bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Active Topics</h3>
          <p className="text-sm text-gray-500 mt-1">Sort by volume</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {topics.map((topic) => (
            <div
              key={topic.id}
              onClick={() => loadTopicDetails(topic)}
              className={`p-4 border-b border-gray-100 cursor-pointer transition-all ${
                selectedTopic?.id === topic.id
                  ? 'bg-blue-50 border-l-4 border-l-[#0B5FFF]'
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-sm font-semibold text-gray-900">{topic.name}</h4>
                {getTrendIcon(topic.weeklyTrend)}
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">{topic.volume} mentions</span>
                <span className={`font-medium ${getSentimentColor(topic.avgSentiment)}`}>
                  {topic.avgSentiment}% positive
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedTopic && (
        <div className="flex-1 space-y-6 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedTopic.name}</h2>
                <p className="text-sm text-gray-600">
                  Analyzing {selectedTopic.volume} feedback entries
                </p>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">
                  Export
                </button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-600 mb-1">Total Volume</p>
                <p className="text-2xl font-bold text-gray-900">{selectedTopic.volume}</p>
                <div className="flex items-center gap-1 mt-1">
                  {getTrendIcon(selectedTopic.weeklyTrend)}
                  <span
                    className={`text-xs font-medium ${
                      selectedTopic.weeklyTrend >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {Math.abs(selectedTopic.weeklyTrend)}%
                  </span>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-600 mb-1">Avg Sentiment</p>
                <p className={`text-2xl font-bold ${getSentimentColor(selectedTopic.avgSentiment)}`}>
                  {selectedTopic.avgSentiment}%
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {selectedTopic.avgSentiment >= 60
                    ? 'Positive'
                    : selectedTopic.avgSentiment >= 40
                    ? 'Neutral'
                    : 'Negative'}
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-600 mb-1">Avg Priority</p>
                <p className="text-2xl font-bold text-gray-900">
                  {selectedTopic.avgPriority.toFixed(1)}
                </p>
                <div className="flex gap-0.5 mt-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${
                        i < Math.round(selectedTopic.avgPriority) ? 'bg-red-500' : 'bg-gray-300'
                      }`}
                    ></div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-600 mb-1">Top State</p>
                <p className="text-2xl font-bold text-gray-900">
                  {selectedTopic.topState.slice(0, 2).toUpperCase()}
                </p>
                <p className="text-xs text-gray-500 mt-1">{selectedTopic.topState}</p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Sentiment Distribution</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-sm text-gray-700">Positive</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {selectedTopic.sentimentDistribution.positive}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all"
                      style={{ width: `${selectedTopic.sentimentDistribution.positive}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span className="text-sm text-gray-700">Negative</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {selectedTopic.sentimentDistribution.negative}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-500 rounded-full transition-all"
                      style={{ width: `${selectedTopic.sentimentDistribution.negative}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">AI Summary</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                {selectedTopic.avgSentiment < 40
                  ? `${selectedTopic.name} is showing concerning trends with ${selectedTopic.sentimentDistribution.negative}% negative sentiment. Immediate attention recommended for ${selectedTopic.topState} where issues are concentrated.`
                  : `${selectedTopic.name} maintains healthy sentiment levels at ${selectedTopic.avgSentiment}%. Continue monitoring the ${selectedTopic.sentimentDistribution.negative}% negative feedback segment.`}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Recent Feedback Excerpts</h3>
            {loadingDetails ? (
              <div className="text-center text-gray-500 py-8">Loading feedback...</div>
            ) : selectedTopic.recentFeedback.length > 0 ? (
              <div className="space-y-3">
                {selectedTopic.recentFeedback.map((excerpt, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-sm text-gray-700 mb-2">{excerpt.text}</p>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          excerpt.sentiment === 'positive'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {excerpt.sentiment}
                      </span>
                      <span className="text-xs text-gray-500">{excerpt.state}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">No recent feedback available</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TopicsTab;
