import { ChevronDown } from 'lucide-react';

const SentimentTab = () => {
  const stateData = [
    { name: 'Maharashtra', sentiment: 45, color: '#FCA5A5' },
    { name: 'Karnataka', sentiment: 72, color: '#86EFAC' },
    { name: 'Tamil Nadu', sentiment: 58, color: '#FDE047' },
    { name: 'Gujarat', sentiment: 38, color: '#FCA5A5' },
    { name: 'Delhi', sentiment: 65, color: '#86EFAC' },
    { name: 'West Bengal', sentiment: 52, color: '#FDE047' },
    { name: 'Rajasthan', sentiment: 68, color: '#86EFAC' },
    { name: 'Uttar Pradesh', sentiment: 42, color: '#FCA5A5' },
  ];

  const weeklyData = [
    { week: 'Week 1', score: 62 },
    { week: 'Week 2', score: 58 },
    { week: 'Week 3', score: 54 },
    { week: 'Week 4', score: 48 },
    { week: 'Week 5', score: 52 },
    { week: 'Week 6', score: 58 },
    { week: 'Week 7', score: 65 },
  ];

  const bubbleData = [
    { topic: 'Delivery', region: 'Mumbai', sentiment: 35, size: 80 },
    { topic: 'Product Quality', region: 'Bangalore', sentiment: 72, size: 60 },
    { topic: 'Support', region: 'Delhi', sentiment: 58, size: 50 },
    { topic: 'Payment', region: 'Mumbai', sentiment: 28, size: 70 },
    { topic: 'App Performance', region: 'Chennai', sentiment: 78, size: 45 },
    { topic: 'Pricing', region: 'Pune', sentiment: 65, size: 40 },
    { topic: 'UI/UX', region: 'Bangalore', sentiment: 82, size: 35 },
    { topic: 'Availability', region: 'Delhi', sentiment: 48, size: 55 },
  ];

  const getSentimentColor = (sentiment: number) => {
    if (sentiment >= 60) return '#22C55E';
    if (sentiment >= 40) return '#EAB308';
    return '#EF4444';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Sentiment Trends</h2>
            <p className="text-sm text-gray-500 mt-1">
              Analyze sentiment patterns across regions and topics
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <select className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0B5FFF] pr-10">
                <option>Last 30 days</option>
                <option>Last 7 days</option>
                <option>Last 90 days</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
            </div>

            <div className="relative">
              <select className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0B5FFF] pr-10">
                <option>All Topics</option>
                <option>Delivery</option>
                <option>Product Quality</option>
                <option>Customer Support</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              State/Region Sentiment Heatmap
            </h3>
            <div className="space-y-2">
              {stateData.map((state, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-32 text-sm font-medium text-gray-700">{state.name}</div>
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
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            Topic × Region × Sentiment Clusters
          </h3>
          <div className="bg-gray-50 rounded-xl p-8 min-h-[400px] relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-full relative">
                {bubbleData.map((bubble, index) => {
                  const left = ((index * 13) % 85) + 5;
                  const top = ((index * 17) % 70) + 10;

                  return (
                    <div
                      key={index}
                      className="absolute cursor-pointer transition-all hover:scale-110 group"
                      style={{
                        left: `${left}%`,
                        top: `${top}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                    >
                      <div
                        className="rounded-full flex items-center justify-center shadow-lg"
                        style={{
                          width: `${bubble.size}px`,
                          height: `${bubble.size}px`,
                          backgroundColor: `${getSentimentColor(bubble.sentiment)}CC`,
                        }}
                      >
                        <div className="text-center">
                          <div className="text-white font-bold text-xs">{bubble.sentiment}%</div>
                        </div>
                      </div>
                      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap z-10">
                        <div className="font-semibold">{bubble.topic}</div>
                        <div className="text-gray-300">{bubble.region}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="absolute bottom-4 left-4 bg-white rounded-xl p-3 shadow-md">
              <div className="text-xs font-semibold text-gray-900 mb-2">Legend</div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-500"></div>
                  <span className="text-xs text-gray-600">Positive (&gt;60%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                  <span className="text-xs text-gray-600">Neutral (40-60%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-red-500"></div>
                  <span className="text-xs text-gray-600">Negative (&lt;40%)</span>
                </div>
                <div className="text-xs text-gray-500 mt-2">Bubble size = volume</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Top Performing Regions</h3>
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
                    <span className="text-sm font-medium text-gray-900">{state.name}</span>
                  </div>
                  <span className="text-sm font-bold text-green-600">{state.sentiment}%</span>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Regions Needing Attention</h3>
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
                    <span className="text-sm font-medium text-gray-900">{state.name}</span>
                  </div>
                  <span className="text-sm font-bold text-red-600">{state.sentiment}%</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SentimentTab;
