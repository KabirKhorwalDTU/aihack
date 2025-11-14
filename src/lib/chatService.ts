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
  answer: string;
}

const n8nWebhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL;

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

      const response = await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: N8nResponse = await response.json();
      return data.answer || 'No answer received from the AI agent.';
    } catch (error) {
      console.error('Error calling n8n webhook:', error);
      throw new Error('Failed to get response from the AI agent. Please try again.');
    }
  },

  generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },
};
