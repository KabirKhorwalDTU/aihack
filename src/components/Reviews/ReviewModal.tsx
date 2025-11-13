import { X, User, Calendar, MapPin } from 'lucide-react';

interface ReviewModalProps {
  review: {
    id: string;
    source: string;
    timestamp: string;
    sentiment: 'positive' | 'neutral' | 'negative';
    topics: string[];
    summary: string;
    priorityScore: number;
    status: 'resolved' | 'unresolved' | 'in_progress';
    fullText?: string;
  };
  onClose: () => void;
}

const ReviewModal = ({ review, onClose }: ReviewModalProps) => {
  const getSentimentColor = (sentiment: string) => {
    const colors: Record<string, string> = {
      positive: 'bg-green-100 text-green-700 border-green-200',
      neutral: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      negative: 'bg-red-100 text-red-700 border-red-200',
    };
    return colors[sentiment] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Review Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${getSentimentColor(
                    review.sentiment
                  )}`}
                >
                  {review.sentiment}
                </span>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${
                        i < review.priorityScore ? 'bg-red-500' : 'bg-gray-300'
                      }`}
                    ></div>
                  ))}
                  <span className="text-xs text-gray-500 ml-1">Priority {review.priorityScore}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {review.topics.map((topic, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Customer Feedback</h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              {review.fullText || review.summary}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <Calendar size={18} className="text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Received</p>
                <p className="text-sm font-medium text-gray-900">{review.timestamp}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <User size={18} className="text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Source</p>
                <p className="text-sm font-medium text-gray-900 capitalize">{review.source}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <MapPin size={18} className="text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Location</p>
                <p className="text-sm font-medium text-gray-900">Mumbai, Maharashtra</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                A
              </div>
              <div>
                <p className="text-xs text-gray-500">Customer ID</p>
                <p className="text-sm font-medium text-gray-900">USR-{review.id}</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">AI-Generated Insights</h3>
            <p className="text-sm text-gray-700 leading-relaxed mb-3">{review.summary}</p>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <span className="text-xs font-medium text-blue-700">Recommendation:</span>
                <span className="text-xs text-gray-600">
                  {review.priorityScore >= 4
                    ? 'Immediate action required. Assign to senior support team.'
                    : 'Standard resolution process. Monitor for pattern.'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">
              Assign
            </button>
            <button className="flex-1 px-4 py-3 bg-[#FF9500] text-white rounded-xl font-medium hover:bg-[#E08600] transition-colors">
              Escalate
            </button>
            <button className="flex-1 px-4 py-3 bg-[#0B5FFF] text-white rounded-xl font-medium hover:bg-[#0950CC] transition-colors">
              Mark Resolved
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
