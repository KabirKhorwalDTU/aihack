import { useState } from 'react';
import { Search, ChevronDown, MoreVertical } from 'lucide-react';
import ReviewModal from './ReviewModal';

interface Review {
  id: string;
  source: string;
  timestamp: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  topics: string[];
  summary: string;
  priorityScore: number;
  status: 'resolved' | 'unresolved' | 'in_progress';
  fullText?: string;
}

const ReviewsTab = () => {
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  const reviews: Review[] = [
    {
      id: '1',
      source: 'playstore',
      timestamp: '2 hours ago',
      sentiment: 'negative',
      topics: ['Delivery', 'Customer Support'],
      summary: 'Order was delayed by 3 days, customer support was unhelpful in resolving the issue.',
      priorityScore: 5,
      status: 'unresolved',
      fullText: 'My order was supposed to arrive on Monday but it came on Thursday. When I contacted customer support, they were not helpful at all and kept giving me generic responses. Very disappointed with the service.',
    },
    {
      id: '2',
      source: 'freshdesk',
      timestamp: '4 hours ago',
      sentiment: 'neutral',
      topics: ['Product Quality', 'Refund'],
      summary: 'Product received was damaged, requesting refund or replacement.',
      priorityScore: 3,
      status: 'in_progress',
      fullText: 'The product I received was damaged. The packaging was intact but the item inside was broken. I would like a refund or replacement.',
    },
    {
      id: '3',
      source: 'nps',
      timestamp: '5 hours ago',
      sentiment: 'positive',
      topics: ['App Experience', 'Pricing'],
      summary: 'Great deals and easy to use app. Satisfied with the overall experience.',
      priorityScore: 1,
      status: 'resolved',
      fullText: 'Love the app! Great deals and very easy to navigate. The prices are competitive and the checkout process is smooth.',
    },
    {
      id: '4',
      source: 'whatsapp',
      timestamp: '6 hours ago',
      sentiment: 'negative',
      topics: ['Payment', 'Technical Issues'],
      summary: 'Payment was deducted but order was not placed. Money not refunded yet.',
      priorityScore: 5,
      status: 'unresolved',
      fullText: 'My payment of Rs. 2,500 was deducted from my account but the order was not placed. It has been 3 days and I have not received my refund yet. This is unacceptable.',
    },
    {
      id: '5',
      source: 'playstore',
      timestamp: '8 hours ago',
      sentiment: 'neutral',
      topics: ['App Performance', 'UI/UX'],
      summary: 'App crashes frequently on Android 13. Otherwise good selection of products.',
      priorityScore: 3,
      status: 'in_progress',
      fullText: 'The app keeps crashing on my Samsung phone running Android 13. It happens when I try to view product details. Good product selection though.',
    },
  ];

  const getSourceIcon = (source: string) => {
    const icons: Record<string, string> = {
      playstore: '📱',
      freshdesk: '🎫',
      nps: '📊',
      whatsapp: '💬',
      social: '🌐',
    };
    return icons[source] || '📝';
  };

  const getSentimentColor = (sentiment: string) => {
    const colors: Record<string, string> = {
      positive: 'bg-green-100 text-green-700 border-green-200',
      neutral: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      negative: 'bg-red-100 text-red-700 border-red-200',
    };
    return colors[sentiment] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      resolved: 'bg-green-100 text-green-700',
      unresolved: 'bg-red-100 text-red-700',
      in_progress: 'bg-blue-100 text-blue-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="p-6">
      <div className="bg-white rounded-2xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Customer Reviews</h2>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 bg-[#0B5FFF] text-white rounded-xl font-medium hover:bg-[#0950CC] transition-colors">
                Export
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search reviews..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B5FFF] focus:border-transparent"
              />
            </div>

            <div className="relative">
              <select className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0B5FFF] pr-10">
                <option>All Sentiments</option>
                <option>Positive</option>
                <option>Neutral</option>
                <option>Negative</option>
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

            <div className="relative">
              <select className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0B5FFF] pr-10">
                <option>All Status</option>
                <option>Resolved</option>
                <option>Unresolved</option>
                <option>In Progress</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Sentiment
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Topics
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Summary
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {reviews.map((review) => (
                <tr
                  key={review.id}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => setSelectedReview(review)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-2xl">{getSourceIcon(review.source)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">{review.timestamp}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getSentimentColor(
                        review.sentiment
                      )}`}
                    >
                      {review.sentiment}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {review.topics.map((topic, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 max-w-md">
                    <p className="text-sm text-gray-700 line-clamp-2">{review.summary}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 rounded-full ${
                            i < review.priorityScore ? 'bg-red-500' : 'bg-gray-300'
                          }`}
                        ></div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        review.status
                      )}`}
                    >
                      {review.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <MoreVertical size={18} className="text-gray-600" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-gray-200 flex items-center justify-between">
          <span className="text-sm text-gray-600">Showing 1-5 of 12,847 reviews</span>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              Previous
            </button>
            <button className="px-4 py-2 bg-[#0B5FFF] text-white rounded-lg hover:bg-[#0950CC] transition-colors">
              Next
            </button>
          </div>
        </div>
      </div>

      {selectedReview && (
        <ReviewModal review={selectedReview} onClose={() => setSelectedReview(null)} />
      )}
    </div>
  );
};

export default ReviewsTab;
