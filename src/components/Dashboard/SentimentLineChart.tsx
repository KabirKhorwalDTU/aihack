const SentimentLineChart = () => {
  const data = [
    { date: 'Mon', positive: 65, neutral: 25, negative: 10 },
    { date: 'Tue', positive: 70, neutral: 20, negative: 10 },
    { date: 'Wed', positive: 62, neutral: 28, negative: 10 },
    { date: 'Thu', positive: 68, neutral: 22, negative: 10 },
    { date: 'Fri', positive: 75, neutral: 18, negative: 7 },
    { date: 'Sat', positive: 72, neutral: 20, negative: 8 },
    { date: 'Sun', positive: 78, neutral: 15, negative: 7 },
  ];

  const maxValue = 100;

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Sentiment Over Time</h3>
      <div className="space-y-4">
        <div className="flex gap-6 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-sm text-gray-600">Positive</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-sm text-gray-600">Neutral</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-sm text-gray-600">Negative</span>
          </div>
        </div>

        <div className="relative h-64">
          <div className="absolute inset-0 flex items-end justify-between gap-2">
            {data.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full flex flex-col-reverse h-full justify-start">
                  <div
                    className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t-lg transition-all hover:opacity-80"
                    style={{ height: `${(item.positive / maxValue) * 100}%` }}
                  ></div>
                  <div
                    className="w-full bg-gradient-to-t from-yellow-500 to-yellow-400 transition-all hover:opacity-80"
                    style={{ height: `${(item.neutral / maxValue) * 100}%` }}
                  ></div>
                  <div
                    className="w-full bg-gradient-to-t from-red-500 to-red-400 transition-all hover:opacity-80"
                    style={{ height: `${(item.negative / maxValue) * 100}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-500 mt-2">{item.date}</span>
              </div>
            ))}
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
