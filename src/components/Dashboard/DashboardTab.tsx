import { MessageSquare, AlertTriangle, TrendingUp, Hash, MapPin } from 'lucide-react';
import MetricCard from '../MetricCard';
import SentimentLineChart from './SentimentLineChart';
import SentimentDonut from './SentimentDonut';
import TopTopicsBar from './TopTopicsBar';
import AlertsPanel from './AlertsPanel';

const DashboardTab = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          title="Total Reviews (This Week)"
          value="12,847"
          icon={MessageSquare}
          trend={{ value: 12.5, isPositive: true }}
          color="#0B5FFF"
        />
        <MetricCard
          title="High-Priority Issues"
          value="342"
          icon={AlertTriangle}
          trend={{ value: 8.2, isPositive: false }}
          color="#FF3B30"
        />
        <MetricCard
          title="Avg. Priority Score"
          value="3.2"
          icon={TrendingUp}
          color="#34C759"
        />
        <MetricCard
          title="Most Mentioned Topic"
          value="Delivery"
          icon={Hash}
          color="#FF9500"
        />
        <MetricCard
          title="Worst Sentiment Region"
          value="Mumbai"
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
