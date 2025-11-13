import { useState } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface Topic {
  id: string;
  name: string;
  volume: number;
  avgSentiment: number;
  avgPriority: number;
  trend: number;
  sentimentDistribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

const TopicsTab = () => {
  const topics: Topic[] = [
    {
      id: '1',
      name: 'Delivery Issues',
      volume: 2847,
      avgSentiment: 35,
      avgPriority: 4.2,
      trend: -12,
      sentimentDistribution: { positive: 15, neutral: 20, negative: 65 },
    },
    {
      id: '2',
      name: 'Product Quality',
      volume: 2156,
      avgSentiment: 58,
      avgPriority: 3.5,
      trend: 5,
      sentimentDistribution: { positive: 45, neutral: 28, negative: 27 },
    },
    {
      id: '3',
      name: 'Customer Support',
      volume: 1923,
      avgSentiment: 42,
      avgPriority: 3.8,
      trend: -8,
      sentimentDistribution: { positive: 25, neutral: 35, negative: 40 },
    },
    {
      id: '4',
      name: 'App Performance',
      volume: 1654,
      avgSentiment: 72,
      avgPriority: 2.1,
      trend: 15,
      sentimentDistribution: { positive: 68, neutral: 22, negative: 10 },
    },
    {
      id: '5',
      name: 'Payment Problems',
      volume: 1342,
      avgSentiment: 28,
      avgPriority: 4.5,
      trend: -22,
      sentimentDistribution: { positive: 8, neutral: 20, negative: 72 },
    },
    {
      id: '6',
      name: 'Pricing',
      volume: 1089,
      avgSentiment: 65,
      avgPriority: 2.3,
      trend: 8,
      sentimentDistribution: { positive: 55, neutral: 30, negative: 15 },
    },
    {
      id: '7',
      name: 'User Interface',
      volume: 892,
      avgSentiment: 78,
      avgPriority: 1.8,
      trend: 12,
      sentimentDistribution: { positive: 75, neutral: 18, negative: 7 },
    },
    {
      id: '8',
      name: 'Product Availability',
      volume: 756,
      avgSentiment: 45,
      avgPriority: 3.2,
      trend: -5,
      sentimentDistribution: { positive: 32, neutral: 38, negative: 30 },
    },
  ];

  const [selectedTopic, setSelectedTopic] = useState<Topic>(topics[0]);

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
              onClick={() => setSelectedTopic(topic)}
              className={`p-4 border-b border-gray-100 cursor-pointer transition-all ${
                selectedTopic.id === topic.id
                  ? 'bg-blue-50 border-l-4 border-l-[#0B5FFF]'
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-sm font-semibold text-gray-900">{topic.name}</h4>
                {getTrendIcon(topic.trend)}
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">{topic.volume} mentions</span>
                <span className={`font-medium ${getSentimentColor(topic.avgSentiment)}`}>
                  {topic.avgSentiment}% sentiment
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto">
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedTopic.name}</h2>
              <p className="text-sm text-gray-600">
                Analyzing {selectedTopic.volume} feedback entries from the last 7 days
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
                {getTrendIcon(selectedTopic.trend)}
                <span
                  className={`text-xs font-medium ${
                    selectedTopic.trend >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {Math.abs(selectedTopic.trend)}%
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
              <p className="text-xs text-gray-600 mb-1">Top Region</p>
              <p className="text-2xl font-bold text-gray-900">MH</p>
              <p className="text-xs text-gray-500 mt-1">Maharashtra</p>
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
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span className="text-sm text-gray-700">Neutral</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {selectedTopic.sentimentDistribution.neutral}%
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-500 rounded-full transition-all"
                    style={{ width: `${selectedTopic.sentimentDistribution.neutral}%` }}
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

          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Weekly Trend</h3>
            <div className="h-48 flex items-end gap-2">
              {[45, 52, 48, 55, 62, 58, 65].map((value, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="w-full flex flex-col-reverse h-full justify-start">
                    <div
                      className="w-full bg-gradient-to-t from-[#0B5FFF] to-[#0B5FFF]CC rounded-t-lg transition-all hover:opacity-80"
                      style={{ height: `${value}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 mt-2">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">AI Summary</h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              {selectedTopic.avgSentiment < 40
                ? `${selectedTopic.name} is showing concerning trends with ${selectedTopic.sentimentDistribution.negative}% negative sentiment. Primary complaints center around delays and poor communication. Immediate intervention recommended in Mumbai and Bangalore regions where issues are most concentrated.`
                : `${selectedTopic.name} maintains healthy sentiment levels at ${selectedTopic.avgSentiment}%. Users appreciate recent improvements, though monitoring should continue for the ${selectedTopic.sentimentDistribution.negative}% negative feedback segment.`}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Recent Feedback Excerpts</h3>
          <div className="space-y-3">
            {[
              {
                text: 'Order delayed by 4 days without proper notification. Very frustrating experience.',
                sentiment: 'negative',
                region: 'Mumbai',
              },
              {
                text: 'Support team was helpful but resolution took too long. Could be improved.',
                sentiment: 'neutral',
                region: 'Bangalore',
              },
              {
                text: 'Payment failed twice but money was deducted. Still waiting for refund.',
                sentiment: 'negative',
                region: 'Delhi',
              },
            ].map((excerpt, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-sm text-gray-700 mb-2">{excerpt.text}</p>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      excerpt.sentiment === 'positive'
                        ? 'bg-green-100 text-green-700'
                        : excerpt.sentiment === 'neutral'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {excerpt.sentiment}
                  </span>
                  <span className="text-xs text-gray-500">{excerpt.region}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopicsTab;
