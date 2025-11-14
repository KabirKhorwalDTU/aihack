import { supabase, Review, Topic } from './supabase';

export interface ReviewFilters {
  sentiment?: 'positive' | 'negative';
  priority?: 'high' | 'medium' | 'low';
  source?: string;
  topicId?: string;
  resolutionStatus?: 'resolved' | 'unresolved' | 'in_progress';
  state?: string;
  searchQuery?: string;
  startDate?: string;
  endDate?: string;
}

export interface PaginatedReviews {
  reviews: Review[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface DashboardMetrics {
  totalReviews: number;
  highPriorityCount: number;
  avgPriorityScore: number;
  mostMentionedTopic: string;
  worstSentimentRegion: string;
  sentimentDistribution: {
    positive: number;
    negative: number;
  };
}

export interface TopicAnalytics {
  id: string;
  name: string;
  volume: number;
  avgSentiment: number;
  avgPriority: number;
  weeklyTrend: number;
  sentimentDistribution: {
    positive: number;
    negative: number;
  };
}

export interface RegionSentiment {
  state: string;
  sentiment: number;
  positiveCount: number;
  negativeCount: number;
  totalCount: number;
}

export const reviewService = {
  async getReviews(
    filters: ReviewFilters = {},
    page = 1,
    pageSize = 20
  ): Promise<PaginatedReviews> {
    let query = supabase
      .from('Reviews List')
      .select('*, topic:topics(*)', { count: 'exact' });

    if (filters.sentiment) {
      query = query.eq('sentiment', filters.sentiment);
    }

    if (filters.priority) {
      query = query.eq('priority', filters.priority);
    }

    if (filters.source) {
      query = query.eq('fdb_source', filters.source);
    }

    if (filters.topicId) {
      query = query.eq('topic_id', filters.topicId);
    }

    if (filters.resolutionStatus) {
      query = query.eq('resolution_status', filters.resolutionStatus);
    }

    if (filters.state) {
      query = query.eq('state', filters.state);
    }

    if (filters.searchQuery) {
      query = query.ilike('review_text', `%${filters.searchQuery}%`);
    }

    if (filters.startDate) {
      query = query.gte('fdb_date', filters.startDate);
    }

    if (filters.endDate) {
      query = query.lte('fdb_date', filters.endDate);
    }

    query = query.eq('processing_status', 'completed');

    const start = (page - 1) * pageSize;
    const end = start + pageSize - 1;

    query = query.range(start, end).order('fdb_date', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to fetch reviews: ${error.message}`);
    }

    return {
      reviews: (data as Review[]) || [],
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    };
  },

  async getDashboardMetrics(daysBack = 7): Promise<DashboardMetrics> {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - daysBack);
    const dateStr = dateThreshold.toISOString().split('T')[0];

    const { data: reviews, error } = await supabase
      .from('Reviews List')
      .select('*, topic:topics(name)')
      .eq('processing_status', 'completed')
      .gte('fdb_date', dateStr);

    if (error) {
      throw new Error(`Failed to fetch metrics: ${error.message}`);
    }

    const totalReviews = reviews?.length || 0;
    const highPriorityCount = reviews?.filter((r) => r.priority === 'high').length || 0;

    const priorityMap = { high: 5, medium: 3, low: 1 };
    const avgPriority =
      reviews?.reduce((sum, r) => sum + (priorityMap[r.priority as keyof typeof priorityMap] || 3), 0) /
        (totalReviews || 1) || 0;

    const topicCounts: Record<string, number> = {};
    reviews?.forEach((r) => {
      const topicName = (r.topic as any)?.name || 'Unknown';
      topicCounts[topicName] = (topicCounts[topicName] || 0) + 1;
    });

    const mostMentionedTopic =
      Object.entries(topicCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A';

    const stateSentiment: Record<string, { positive: number; negative: number }> = {};
    reviews?.forEach((r) => {
      if (r.state && r.sentiment) {
        if (!stateSentiment[r.state]) {
          stateSentiment[r.state] = { positive: 0, negative: 0 };
        }
        stateSentiment[r.state][r.sentiment]++;
      }
    });

    const worstState = Object.entries(stateSentiment)
      .map(([state, counts]) => ({
        state,
        negativePercent: (counts.negative / (counts.positive + counts.negative)) * 100,
      }))
      .sort((a, b) => b.negativePercent - a.negativePercent)[0];

    const sentimentCounts = reviews?.reduce(
      (acc, r) => {
        if (r.sentiment === 'positive') acc.positive++;
        if (r.sentiment === 'negative') acc.negative++;
        return acc;
      },
      { positive: 0, negative: 0 }
    ) || { positive: 0, negative: 0 };

    return {
      totalReviews,
      highPriorityCount,
      avgPriorityScore: Math.round(avgPriority * 10) / 10,
      mostMentionedTopic,
      worstSentimentRegion: worstState?.state || 'N/A',
      sentimentDistribution: sentimentCounts,
    };
  },

  async getTopicAnalytics(daysBack = 7): Promise<TopicAnalytics[]> {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - daysBack);
    const dateStr = dateThreshold.toISOString().split('T')[0];

    const { data: topics } = await supabase.from('topics').select('*').eq('is_active', true);

    const { data: reviews } = await supabase
      .from('Reviews List')
      .select('*')
      .eq('processing_status', 'completed')
      .gte('fdb_date', dateStr);

    const analytics: TopicAnalytics[] = [];
    const priorityMap = { high: 5, medium: 3, low: 1 };

    for (const topic of topics || []) {
      const topicReviews = reviews?.filter((r) => r.topic_id === topic.id) || [];
      const volume = topicReviews.length;

      if (volume === 0) continue;

      const positiveCount = topicReviews.filter((r) => r.sentiment === 'positive').length;
      const negativeCount = topicReviews.filter((r) => r.sentiment === 'negative').length;

      const avgSentiment = (positiveCount / volume) * 100;

      const avgPriority =
        topicReviews.reduce(
          (sum, r) => sum + (priorityMap[r.priority as keyof typeof priorityMap] || 3),
          0
        ) / volume;

      analytics.push({
        id: topic.id,
        name: topic.name,
        volume,
        avgSentiment: Math.round(avgSentiment),
        avgPriority: Math.round(avgPriority * 10) / 10,
        weeklyTrend: 0,
        sentimentDistribution: {
          positive: Math.round((positiveCount / volume) * 100),
          negative: Math.round((negativeCount / volume) * 100),
        },
      });
    }

    return analytics.sort((a, b) => b.volume - a.volume);
  },

  async getRegionSentiment(daysBack = 7): Promise<RegionSentiment[]> {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - daysBack);
    const dateStr = dateThreshold.toISOString().split('T')[0];

    const { data: reviews } = await supabase
      .from('Reviews List')
      .select('state, sentiment')
      .eq('processing_status', 'completed')
      .gte('fdb_date', dateStr)
      .not('state', 'is', null)
      .not('sentiment', 'is', null);

    const regionData: Record<string, { positive: number; negative: number }> = {};

    reviews?.forEach((r) => {
      if (r.state && r.sentiment) {
        if (!regionData[r.state]) {
          regionData[r.state] = { positive: 0, negative: 0 };
        }
        regionData[r.state][r.sentiment]++;
      }
    });

    return Object.entries(regionData)
      .map(([state, counts]) => {
        const total = counts.positive + counts.negative;
        return {
          state,
          sentiment: Math.round((counts.positive / total) * 100),
          positiveCount: counts.positive,
          negativeCount: counts.negative,
          totalCount: total,
        };
      })
      .sort((a, b) => b.totalCount - a.totalCount);
  },

  async getSentimentTrend(days = 7): Promise<Array<{ date: string; sentiment: number }>> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const dateStr = startDate.toISOString().split('T')[0];

    const { data: reviews } = await supabase
      .from('Reviews List')
      .select('fdb_date, sentiment')
      .eq('processing_status', 'completed')
      .gte('fdb_date', dateStr)
      .not('sentiment', 'is', null);

    const dailyData: Record<string, { positive: number; negative: number }> = {};

    reviews?.forEach((r) => {
      if (r.fdb_date && r.sentiment) {
        const date = r.fdb_date.split('T')[0];
        if (!dailyData[date]) {
          dailyData[date] = { positive: 0, negative: 0 };
        }
        dailyData[date][r.sentiment]++;
      }
    });

    return Object.entries(dailyData)
      .map(([date, counts]) => ({
        date,
        sentiment: Math.round((counts.positive / (counts.positive + counts.negative)) * 100),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  },

  async updateReviewStatus(
    rowId: number,
    status: 'resolved' | 'unresolved' | 'in_progress'
  ): Promise<void> {
    const { error } = await supabase
      .from('Reviews List')
      .update({ resolution_status: status })
      .eq('row_id', rowId);

    if (error) {
      throw new Error(`Failed to update review status: ${error.message}`);
    }
  },

  async getAllTopics(): Promise<Topic[]> {
    const { data, error } = await supabase
      .from('topics')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      throw new Error(`Failed to fetch topics: ${error.message}`);
    }

    return data || [];
  },

  async processBatch(batchSize = 50, offset = 0): Promise<any> {
    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/batch-process-reviews`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ batchSize, offset }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to process batch');
    }

    return response.json();
  },

  async getPendingReviewsCount(): Promise<number> {
    const { count, error } = await supabase
      .from('Reviews List')
      .select('*', { count: 'exact', head: true })
      .or('processing_status.eq.pending,processing_status.is.null')
      .not('review_text', 'is', null);

    if (error) {
      throw new Error(`Failed to count pending reviews: ${error.message}`);
    }

    return count || 0;
  },

  async getTopicReviews(topicId: string, limit = 5): Promise<any[]> {
    const { data, error } = await supabase
      .from('Reviews List')
      .select('row_id, review_text, sentiment, state')
      .eq('topic_id', topicId)
      .eq('processing_status', 'completed')
      .not('review_text', 'is', null)
      .order('fdb_date', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch topic reviews: ${error.message}`);
    }

    return data || [];
  },

  async getTopicTopState(topicId: string): Promise<string> {
    const { data, error } = await supabase
      .from('Reviews List')
      .select('state')
      .eq('topic_id', topicId)
      .eq('processing_status', 'completed')
      .not('state', 'is', null);

    if (error) {
      return 'N/A';
    }

    const stateCounts: Record<string, number> = {};
    data?.forEach((r) => {
      if (r.state) {
        stateCounts[r.state] = (stateCounts[r.state] || 0) + 1;
      }
    });

    const topState = Object.entries(stateCounts).sort(([, a], [, b]) => b - a)[0];
    return topState ? topState[0] : 'N/A';
  },
};
