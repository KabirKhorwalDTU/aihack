import { useState } from 'react';
import Sidebar from './components/Sidebar';
import FilterBar from './components/FilterBar';
import DashboardTab from './components/Dashboard/DashboardTab';
import ReviewsTab from './components/Reviews/ReviewsTab';
import NotificationsTab from './components/Notifications/NotificationsTab';
import TopicsTab from './components/Topics/TopicsTab';
import SentimentTab from './components/Sentiment/SentimentTab';
import ChatAgentTab from './components/ChatAgent/ChatAgentTab';
import BulkProcessingPanel from './components/Admin/BulkProcessingPanel';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardTab />;
      case 'reviews':
        return <ReviewsTab />;
      case 'notifications':
        return <NotificationsTab />;
      case 'topics':
        return <TopicsTab />;
      case 'sentiment':
        return <SentimentTab />;
      case 'chat':
        return <ChatAgentTab />;
      case 'admin':
        return <BulkProcessingPanel />;
      default:
        return <DashboardTab />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 flex flex-col overflow-hidden">
        {activeTab !== 'topics' && activeTab !== 'chat' && <FilterBar showRegionFilter={activeTab === 'dashboard'} />}
        <div className="flex-1 overflow-y-auto">{renderContent()}</div>
      </div>
    </div>
  );
}

export default App;
