import { supabase } from './supabase';

export interface FilterOptions {
  sources: string[];
  states: string[];
}

export interface DateRange {
  startDate: string;
  endDate: string;
}

export const filterService = {
  async getDistinctSources(): Promise<string[]> {
    const { data, error } = await supabase
      .from('Reviews List')
      .select('fdb_source')
      .not('fdb_source', 'is', null);

    if (error) {
      console.error('Failed to fetch sources:', error);
      return [];
    }

    const sources = [...new Set(data.map((row) => row.fdb_source).filter(Boolean))];
    return sources.sort();
  },

  async getDistinctStates(): Promise<string[]> {
    const { data, error } = await supabase
      .from('Reviews List')
      .select('state')
      .not('state', 'is', null);

    if (error) {
      console.error('Failed to fetch states:', error);
      return [];
    }

    const states = [...new Set(data.map((row) => row.state).filter(Boolean))];
    return states.sort();
  },

  getDateRange(preset: 'last7days' | 'last30days' | 'last90days' | 'custom', customStart?: string, customEnd?: string): DateRange {
    const today = new Date();
    let startDate: Date;
    let endDate: Date = today;

    switch (preset) {
      case 'last7days':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 7);
        break;
      case 'last30days':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 30);
        break;
      case 'last90days':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 90);
        break;
      case 'custom':
        if (customStart && customEnd) {
          return {
            startDate: customStart,
            endDate: customEnd,
          };
        }
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 7);
        break;
    }

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    };
  },
};
