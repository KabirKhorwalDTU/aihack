import { useState, useEffect } from 'react';
import { MessageSquare, AlertTriangle, TrendingUp, Hash, MapPin } from 'lucide-react';
import MetricCard from '../MetricCard';
import SentimentLineChart from './SentimentLineChart';
import SentimentDonut from './SentimentDonut';
import TopTopicsBar from './TopTopicsBar';
import AlertsPanel from './AlertsPanel';
import { reviewService, DashboardMetrics } from '../../lib/reviewService';

const DashboardTab = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const data = await reviewService.getDashboardMetrics();
        setMetrics(data);
      } catch (error) {
        console.error('Failed to load dashboard metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMetrics();
  }, []);

  if (loading || !metrics) {
    return (
      <div className="p-6 flex items-center justify-center h-96">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          title="Total Reviews"
          value={metrics.totalReviews.toLocaleString()}
          icon={MessageSquare}
          color="#0B5FFF"
        />
        <MetricCard
          title="High-Priority Issues"
          value={metrics.highPriorityCount.toLocaleString()}
          icon={AlertTriangle}
          color="#FF3B30"
        />
        <MetricCard
          title="Avg. Priority Score"
          value={metrics.avgPriorityScore.toFixed(1)}
          icon={TrendingUp}
          color="#34C759"
        />
        <MetricCard
          title="Most Mentioned Topic"
          value={metrics.mostMentionedTopic}
          icon={Hash}
          color="#FF9500"
        />
        <MetricCard
          title="Top Region by Volume"
          value={metrics.worstSentimentRegion}
          icon={MapPin}
          color="#AF52DE"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SentimentLineChart />
        </div>
        <div>
          <SentimentDonut />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TopTopicsBar />
        </div>
        <div>
          <AlertsPanel />
        </div>
      </div>
    </div>
  );
};

export default DashboardTab;
