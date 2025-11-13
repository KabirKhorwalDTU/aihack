export type SentimentType = 'positive' | 'neutral' | 'negative';

export type SourceType = 'playstore' | 'nps' | 'freshdesk' | 'whatsapp' | 'social';

export type ResolutionStatus = 'resolved' | 'unresolved' | 'in_progress';

export interface Review {
  id: string;
  source: SourceType;
  timestamp: string;
  sentiment: SentimentType;
  topics: string[];
  summary: string;
  fullText: string;
  priorityScore: number;
  resolutionStatus: ResolutionStatus;
  state: string;
  region: string;
}

export interface TopicInsight {
  id: string;
  name: string;
  volume: number;
  avgSentiment: number;
  avgPriority: number;
  weeklyTrend: number;
  sentimentDistribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

export interface Notification {
  id: string;
  type: 'escalation' | 'spike' | 'anomaly';
  title: string;
  description: string;
  priority: number;
  source: SourceType;
  timestamp: string;
  read: boolean;
  snoozed: boolean;
}

export interface DashboardMetrics {
  totalReviews: number;
  highPriorityIssues: number;
  avgPriorityScore: number;
  mostMentionedTopic: string;
  worstSentimentRegion: string;
}
