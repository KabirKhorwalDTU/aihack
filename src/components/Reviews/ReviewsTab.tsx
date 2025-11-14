import { useState, useEffect } from 'react';
import { Search, ChevronDown, MoreVertical } from 'lucide-react';
import ReviewModal from './ReviewModal';
import { reviewService, ReviewFilters } from '../../lib/reviewService';
import { Review as DatabaseReview } from '../../lib/supabase';

const ReviewsTab = () => {
  const [selectedReview, setSelectedReview] = useState<DatabaseReview | null>(null);
  const [reviews, setReviews] = useState<DatabaseReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<ReviewFilters>({});
  const [searchQuery, setSearchQuery] = useState('');

  const loadReviews = async () => {
    setLoading(true);
    try {
      const result = await reviewService.getReviews(
        { ...filters, searchQuery: searchQuery || undefined },
        page,
        20
      );
      setReviews(result.reviews);
      setTotalPages(result.totalPages);
    } catch (error) {
      console.error('Failed to load reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [page, filters]);

  const handleSearch = () => {
    setPage(1);
    loadReviews();
  };

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

  if (loading && reviews.length === 0) {
    return (
      <div className="p-6 flex items-center justify-center h-96">
        <div className="text-gray-500">Loading reviews...</div>
      </div>
    );
  }

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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B5FFF] focus:border-transparent"
              />
            </div>

            <div className="relative">
              <select
                className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0B5FFF] pr-10"
                value={filters.sentiment || ''}
                onChange={(e) => {
                  setFilters({ ...filters, sentiment: e.target.value as any || undefined });
                  setPage(1);
                }}
              >
                <option value="">All Sentiments</option>
                <option value="positive">Positive</option>
                <option value="negative">Negative</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
            </div>

            <div className="relative">
              <select
                className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0B5FFF] pr-10"
                value={filters.priority || ''}
                onChange={(e) => {
                  setFilters({ ...filters, priority: e.target.value as any || undefined });
                  setPage(1);
                }}
              >
                <option value="">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
            </div>

            <div className="relative">
              <select
                className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0B5FFF] pr-10"
                value={filters.resolutionStatus || ''}
                onChange={(e) => {
                  setFilters({ ...filters, resolutionStatus: e.target.value as any || undefined });
                  setPage(1);
                }}
              >
                <option value="">All Status</option>
                <option value="resolved">Resolved</option>
                <option value="unresolved">Unresolved</option>
                <option value="in_progress">In Progress</option>
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
              {reviews.map((review) => {
                const priorityMap = { high: 5, medium: 3, low: 1 };
                const priorityScore = priorityMap[review.priority as keyof typeof priorityMap] || 3;
                const timeAgo = review.fdb_date
                  ? new Date(review.fdb_date).toLocaleDateString()
                  : 'N/A';
                return (
                  <tr
                    key={review.row_id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedReview(review)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-2xl">{getSourceIcon(review.fdb_source || 'unknown')}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{timeAgo}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${getSentimentColor(
                          review.sentiment || 'negative'
                        )}`}
                      >
                        {review.sentiment || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {review.topic?.name && (
                          <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium">
                            {review.topic.name}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-md">
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {review.review_text || 'No review text'}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full ${
                              i < priorityScore ? 'bg-red-500' : 'bg-gray-300'
                            }`}
                          ></div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          review.resolution_status
                        )}`}
                      >
                        {review.resolution_status.replace('_', ' ')}
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
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-gray-200 flex items-center justify-between">
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-[#0B5FFF] text-white rounded-lg hover:bg-[#0950CC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
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
