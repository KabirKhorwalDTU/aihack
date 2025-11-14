import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Topic {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Review {
  row_id: number;
  fdb_source: string | null;
  fdb_date: string | null;
  state: string | null;
  phone: string | null;
  review_text: string | null;
  rating: string | null;
  tags: string[];
  sentiment: 'positive' | 'negative' | null;
  priority: 'high' | 'medium' | 'low' | null;
  topic_id: string | null;
  resolution_status: 'resolved' | 'unresolved' | 'in_progress';
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  processed_at: string | null;
  topic?: Topic;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  specialization: string[];
  priority_threshold: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  type: 'alert' | 'review' | 'system' | 'mention' | 'update';
  title: string;
  description: string | null;
  priority: number;
  is_read: boolean;
  is_snoozed: boolean;
  snoozed_until: string | null;
  created_at: string;
  updated_at: string;
  alert_type: 'spike' | 'anomaly' | 'trend' | null;
  metric_name: string | null;
  threshold_value: number | null;
  actual_value: number | null;
  reviews_list_row_id: number | null;
  assigned_team_id: string | null;
  secondary_team_ids: string[];
  agent_confidence: number | null;
  agent_reasoning: string | null;
  escalation_level: number;
  escalated_from: string | null;
  requires_human_review: boolean;
  assigned_team?: Team;
}

export type Database = {
  public: {
    Tables: {
      'Reviews List': {
        Row: Review;
        Insert: Omit<Review, 'row_id'>;
        Update: Partial<Review>;
      };
      topics: {
        Row: Topic;
        Insert: Omit<Topic, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Topic>;
      };
      notifications: {
        Row: Notification;
        Insert: Omit<Notification, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Notification>;
      };
      teams: {
        Row: Team;
        Insert: Omit<Team, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Team>;
      };
    };
  };
};
