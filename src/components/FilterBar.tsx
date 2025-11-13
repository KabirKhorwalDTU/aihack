import { Calendar, ChevronDown } from 'lucide-react';

interface FilterBarProps {
  showRegionFilter?: boolean;
}

const FilterBar = ({ showRegionFilter = true }: FilterBarProps) => {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-gray-600 mb-1">Source</label>
          <div className="relative">
            <select className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0B5FFF] focus:border-transparent">
              <option>All Sources</option>
              <option>Playstore</option>
              <option>NPS</option>
              <option>Freshdesk</option>
              <option>WhatsApp</option>
              <option>Social</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
          </div>
        </div>

        <div className="flex-1 min-w-[250px]">
          <label className="block text-xs font-medium text-gray-600 mb-1">Date Range</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Select date range"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B5FFF] focus:border-transparent"
              defaultValue="Last 7 days"
            />
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
          </div>
        </div>

        {showRegionFilter && (
          <>
            <div className="flex-1 min-w-[180px]">
              <label className="block text-xs font-medium text-gray-600 mb-1">State</label>
              <div className="relative">
                <select className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0B5FFF] focus:border-transparent">
                  <option>All States</option>
                  <option>Maharashtra</option>
                  <option>Karnataka</option>
                  <option>Tamil Nadu</option>
                  <option>Gujarat</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
              </div>
            </div>

            <div className="flex-1 min-w-[180px]">
              <label className="block text-xs font-medium text-gray-600 mb-1">Region</label>
              <div className="relative">
                <select className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0B5FFF] focus:border-transparent">
                  <option>All Regions</option>
                  <option>Mumbai</option>
                  <option>Bangalore</option>
                  <option>Chennai</option>
                  <option>Ahmedabad</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
