import { supabase, Topic } from './supabase';

export interface ChatMessage {
  id: string;
  question: string;
  answer: string;
  topicId: string;
  topicName: string;
  timestamp: string;
}

export interface N8nRequest {
  topic_id: string;
  question: string;
}

export interface N8nResponse {
  text?: string;
  answer?: string;
}

// Use proxy in development, Supabase Edge Function in production
const getN8nUrl = () => {
  if (import.meta.env.DEV) {
    // Use Vite proxy in development
    return '/api/n8n';
  } else {
    // Use Supabase Edge Function in production
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    return `${supabaseUrl}/functions/v1/chat-proxy`;
  }
};

const n8nWebhookUrl = getN8nUrl();

if (!n8nWebhookUrl) {
  console.error('N8N webhook URL is not configured');
}

export const chatService = {
  async getActiveTopics(): Promise<Topic[]> {
    try {
      const { data, error } = await supabase
        .from('topics')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching topics:', error);
      throw error;
    }
  },

  async askQuestion(topicId: string, question: string): Promise<string> {
    try {
      const payload: N8nRequest = {
        topic_id: topicId,
        question: question,
      };

      // Add authorization header for production (Supabase Edge Function)
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (!import.meta.env.DEV) {
        headers['Authorization'] = `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`;
      }

      const response = await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('N8N webhook error:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: N8nResponse = await response.json();
      return data.text || data.answer || 'No answer received from the AI agent.';
    } catch (error) {
      console.error('Error calling n8n webhook:', error);
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error('Network error: Unable to reach the AI agent. Please check your connection.');
      }
      throw new Error('Failed to get response from the AI agent. Please try again.');
    }
  },

  generateMessageId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `msg_${timestamp}_${random}`;
  },
};
