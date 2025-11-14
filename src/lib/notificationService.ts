import { supabase, Notification } from './supabase';

export interface NotificationFilters {
  type?: 'alert' | 'review' | 'system' | 'mention' | 'update';
  isRead?: boolean;
  isSnoozed?: boolean;
  priority?: number;
}

export const notificationService = {
  async getNotifications(filters: NotificationFilters = {}): Promise<Notification[]> {
    let query = supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (filters.type) {
      query = query.eq('type', filters.type);
    }

    if (filters.isRead !== undefined) {
      query = query.eq('is_read', filters.isRead);
    }

    if (filters.isSnoozed !== undefined) {
      query = query.eq('is_snoozed', filters.isSnoozed);
    }

    if (filters.priority) {
      query = query.gte('priority', filters.priority);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch notifications: ${error.message}`);
    }

    return data || [];
  },

  async markAsRead(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) {
      throw new Error(`Failed to mark notification as read: ${error.message}`);
    }
  },

  async snoozeNotification(notificationId: string, until: Date): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({
        is_snoozed: true,
        snoozed_until: until.toISOString(),
      })
      .eq('id', notificationId);

    if (error) {
      throw new Error(`Failed to snooze notification: ${error.message}`);
    }
  },

  async getUnreadCount(): Promise<number> {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false)
      .eq('is_snoozed', false);

    if (error) {
      throw new Error(`Failed to count unread notifications: ${error.message}`);
    }

    return count || 0;
  },

  subscribeToNotifications(
    callback: (notification: Notification) => void
  ): () => void {
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
          callback(payload.new as Notification);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};
