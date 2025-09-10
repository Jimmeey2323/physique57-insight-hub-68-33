
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Calendar, 
  Filter, 
  RotateCcw, 
  MapPin, 
  Users, 
  Target, 
  ChevronDown, 
  ChevronUp, 
  CreditCard, 
  Package,
  Clock,
  UserCheck,
  Percent,
  DollarSign,
  Search
} from 'lucide-react';
import { DatePickerWithRange } from '@/components/ui/date-picker';
import { NewClientFilterOptions } from '@/types/dashboard';

interface EnhancedClientConversionFilterSectionProps {
  filters: NewClientFilterOptions;
  onFiltersChange: (filters: NewClientFilterOptions) => void;
  locations: string[];
  trainers: string[];
  membershipTypes: string[];
}

export const EnhancedClientConversionFilterSection: React.FC<EnhancedClientConversionFilterSectionProps> = ({
  filters,
  onFiltersChange,
  locations,
  trainers,
  membershipTypes
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleArrayFilterChange = (filterKey: keyof NewClientFilterOptions, value: string) => {
    const currentValues = [...(filters[filterKey] as string[])];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    onFiltersChange({ ...filters, [filterKey]: newValues });
  };

  const handleDateRangeChange = (range: { from?: Date; to?: Date }) => {
    // Helper function to format date without timezone offset
    const formatDateForFilter = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    onFiltersChange({
      ...filters,
      dateRange: {
        start: range.from ? formatDateForFilter(range.from) : '',
        end: range.to ? formatDateForFilter(range.to) : ''
      }
    });
  };

  const resetFilters = () => {
    onFiltersChange({
      dateRange: { start: '', end: '' },
      location: [],
      homeLocation: [],
      trainer: [],
      paymentMethod: [],
      retentionStatus: [],
      conversionStatus: [],
      isNew: [],
      minLTV: undefined,
      maxLTV: undefined
    });
    setSearchTerm('');
  };

  const activeFiltersCount = filters.location.length + filters.trainer.length + 
    filters.retentionStatus.length + filters.conversionStatus.length + 
    filters.paymentMethod.length + filters.isNew.length +
    (filters.dateRange.start || filters.dateRange.end ? 1 : 0) +
    (filters.minLTV ? 1 : 0) + (filters.maxLTV ? 1 : 0);

  // Use only 3 main locations as in sales tab
  const mainLocations = ['Kwality House, Kemps Corner', 'Supreme HQ, Bandra', 'Kenkere House, Bengaluru'];
  const availableLocations = locations.filter(loc => mainLocations.includes(loc));

  const filterSections = [
    {
      title: 'Location & Geography',
      icon: MapPin,
      filters: [
        {
          key: 'location' as keyof NewClientFilterOptions,
          label: 'Visit Locations',
          options: availableLocations,
          values: filters.location
        }
      ]
    },
    {
      title: 'Trainer & Service',
      icon: Users,
      filters: [
        {
          key: 'trainer' as keyof NewClientFilterOptions,
          label: 'Trainers',
          options: trainers.slice(0, 12),
          values: filters.trainer
        }
      ]
    },
    {
      title: 'Conversion & Status',
      icon: Target,
      filters: [
        {
          key: 'conversionStatus' as keyof NewClientFilterOptions,
          label: 'Conversion Status',
          options: ['Converted', 'Not Converted', 'Pending'],
          values: filters.conversionStatus
        },
        {
          key: 'retentionStatus' as keyof NewClientFilterOptions,
          label: 'Retention Status',
          options: ['Retained', 'Not Retained', 'At Risk'],
          values: filters.retentionStatus
        },
        {
          key: 'isNew' as keyof NewClientFilterOptions,
          label: 'Client Type',
          options: ['New', 'Existing', 'Returning'],
          values: filters.isNew
        }
      ]
    },
    {
      title: 'Payment & Membership',
      icon: CreditCard,
      filters: [
        {
          key: 'paymentMethod' as keyof NewClientFilterOptions,
          label: 'Payment Methods',
          options: ['Online', 'Cash', 'Card', 'UPI', 'Bank Transfer'],
          values: filters.paymentMethod
        }
      ]
    }
  ];

  if (!isExpanded) {
    return (
      <Card className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/20 border-0 shadow-xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                <Filter className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Advanced Filters</h3>
                <p className="text-sm text-slate-600">Refine your client analysis</p>
              </div>
              {activeFiltersCount > 0 && (
                <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                  {activeFiltersCount} active
                </Badge>
              )}
            </div>
            <Button
              variant="outline"
              onClick={() => setIsExpanded(true)}
              className="gap-2 border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              <ChevronDown className="w-4 h-4" />
              Expand Filters
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/20 border-0 shadow-xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Filter className="w-6 h-6" />
            <div>
              <h3 className="text-xl font-bold">Advanced Client Filters</h3>
              <p className="text-blue-100 text-sm">Customize your analysis view</p>
            </div>
            <Badge className="bg-white/20 text-white border-white/30">
              {activeFiltersCount} Active
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={resetFilters}
              disabled={activeFiltersCount === 0}
              className="bg-white/10 border-white/30 text-white hover:bg-white/20"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Reset
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(false)}
              className="text-white hover:bg-white/20"
            >
              <ChevronUp className="w-4 h-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-8 space-y-8">
        {/* Date Range and Search */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Date Range
            </label>
            <DatePickerWithRange
              value={{
                from: filters.dateRange.start ? new Date(filters.dateRange.start) : undefined,
                to: filters.dateRange.end ? new Date(filters.dateRange.end) : undefined
              }}
              onChange={handleDateRangeChange}
            />
          </div>
          
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Search className="w-5 h-5 text-blue-600" />
              Quick Search
            </label>
            <Input
              placeholder="Search trainers, locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white border-slate-200"
            />
          </div>
        </div>

        {/* LTV Range */}
        <div className="space-y-4">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
            Lifetime Value Range
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="number"
              placeholder="Min LTV (₹)"
              value={filters.minLTV || ''}
              onChange={(e) => onFiltersChange({
                ...filters,
                minLTV: e.target.value ? parseFloat(e.target.value) : undefined
              })}
              className="bg-white border-slate-200"
            />
            <Input
              type="number"
              placeholder="Max LTV (₹)"
              value={filters.maxLTV || ''}
              onChange={(e) => onFiltersChange({
                ...filters,
                maxLTV: e.target.value ? parseFloat(e.target.value) : undefined
              })}
              className="bg-white border-slate-200"
            />
          </div>
        </div>

        {/* Filter Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filterSections.map((section) => (
            <Card key={section.title} className="bg-white/70 border-slate-200 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <section.icon className="w-5 h-5 text-blue-600" />
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {section.filters.map((filter) => (
                  <div key={filter.key} className="space-y-3">
                    <label className="text-sm font-medium text-slate-700">
                      {filter.label}
                      {filter.values.length > 0 && (
                        <Badge variant="secondary" className="ml-2 text-xs bg-blue-100 text-blue-700">
                          {filter.values.length} selected
                        </Badge>
                      )}
                    </label>
                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                      {filter.options.filter(option => 
                        !searchTerm || option.toLowerCase().includes(searchTerm.toLowerCase())
                      ).map(option => (
                        <Button
                          key={option}
                          variant={filter.values.includes(option) ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleArrayFilterChange(filter.key, option)}
                          className={`text-xs transition-all duration-200 ${
                            filter.values.includes(option)
                              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                              : 'hover:bg-blue-50 border-slate-200 hover:border-blue-300'
                          }`}
                        >
                          {option}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
