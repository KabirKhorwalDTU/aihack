import { useState, useEffect } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { filterService } from '../lib/filterService';

interface FilterBarProps {
  onFilterChange?: (filters: {
    source?: string;
    state?: string;
    dateRange?: string;
  }) => void;
}

const FilterBar = ({ onFilterChange }: FilterBarProps) => {
  const [sources, setSources] = useState<string[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [selectedSource, setSelectedSource] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedDateRange, setSelectedDateRange] = useState<string>('last7days');

  useEffect(() => {
    const loadFilterOptions = async () => {
      const [sourcesData, statesData] = await Promise.all([
        filterService.getDistinctSources(),
        filterService.getDistinctStates(),
      ]);
      setSources(sourcesData);
      setStates(statesData);
    };

    loadFilterOptions();
  }, []);

  useEffect(() => {
    if (onFilterChange) {
      onFilterChange({
        source: selectedSource || undefined,
        state: selectedState || undefined,
        dateRange: selectedDateRange,
      });
    }
  }, [selectedSource, selectedState, selectedDateRange, onFilterChange]);

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-gray-600 mb-1">Source</label>
          <div className="relative">
            <select
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0B5FFF] focus:border-transparent"
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
            >
              <option value="">All Sources</option>
              {sources.map((source) => (
                <option key={source} value={source}>
                  {source.charAt(0).toUpperCase() + source.slice(1)}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
          </div>
        </div>

        <div className="flex-1 min-w-[250px]">
          <label className="block text-xs font-medium text-gray-600 mb-1">Date Range</label>
          <div className="relative">
            <select
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0B5FFF] focus:border-transparent"
              value={selectedDateRange}
              onChange={(e) => setSelectedDateRange(e.target.value)}
            >
              <option value="last7days">Last 7 days</option>
              <option value="last30days">Last 30 days</option>
              <option value="last90days">Last 90 days</option>
            </select>
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
          </div>
        </div>

        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs font-medium text-gray-600 mb-1">State</label>
          <div className="relative">
            <select
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0B5FFF] focus:border-transparent"
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
            >
              <option value="">All States</option>
              {states.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
