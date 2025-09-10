
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CalendarIcon, 
  Filter, 
  X, 
  MapPin,
  Tag,
  Users,
  Building,
  Activity,
  Clock,
  Target,
  Phone,
  UserCheck,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { LeadsFilterOptions } from '@/types/leads';
import { getPreviousMonthDateRange } from '@/utils/dateUtils';

interface FunnelLeadsFilterSectionProps {
  filters: LeadsFilterOptions;
  onFiltersChange: (filters: LeadsFilterOptions) => void;
  uniqueValues: {
    locations: string[];
    sources: string[];
    stages: string[];
    statuses: string[];
    associates: string[];
    channels: string[];
    trialStatuses: string[];
    conversionStatuses: string[];
    retentionStatuses: string[];
  };
}

export const FunnelLeadsFilterSection: React.FC<FunnelLeadsFilterSectionProps> = ({
  filters,
  onFiltersChange,
  uniqueValues
}) => {
  const handleArrayFilterChange = (filterKey: keyof LeadsFilterOptions, value: string) => {
    const currentValues = [...(filters[filterKey] as string[])];
    const newValues = currentValues.includes(value) 
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    
    onFiltersChange({ 
      ...filters, 
      [filterKey]: newValues 
    });
  };

  const handleDateRangeChange = (range: { from?: Date; to?: Date }) => {
    onFiltersChange({
      ...filters,
      dateRange: {
        start: range.from ? range.from.toISOString() : '',
        end: range.to ? range.to.toISOString() : ''
      }
    });
  };

  const getPreviousMonthRange = () => {
    const now = new Date();
    const firstDayPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    return {
      start: formatDate(firstDayPreviousMonth),
      end: formatDate(lastDayPreviousMonth)
    };
  };

  const clearAllFilters = () => {
    const now = new Date();
    const firstDayPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    const previousMonth = {
      start: formatDate(firstDayPreviousMonth),
      end: formatDate(lastDayPreviousMonth)
    };
    
    onFiltersChange({
      dateRange: previousMonth,
      location: [],
      source: [],
      stage: [],
      status: [],
      associate: [],
      channel: [],
      trialStatus: [],
      conversionStatus: [],
      retentionStatus: [],
      minLTV: undefined,
      maxLTV: undefined
    });
  };

  const activeFilterCount = (filters.location?.length || 0) + 
    (filters.source?.length || 0) + 
    (filters.stage?.length || 0) + 
    (filters.status?.length || 0) + 
    (filters.associate?.length || 0) + 
    (filters.channel?.length || 0) + 
    (filters.trialStatus?.length || 0) + 
    (filters.conversionStatus?.length || 0) + 
    (filters.retentionStatus?.length || 0) + 
    (filters.minLTV ? 1 : 0) + 
    (filters.maxLTV ? 1 : 0);

  const filterConfigs = [
    {
      key: 'location' as keyof LeadsFilterOptions,
      label: 'Location',
      icon: MapPin,
      options: uniqueValues.locations,
      values: filters.location
    },
    {
      key: 'source' as keyof LeadsFilterOptions,
      label: 'Source',
      icon: Tag,
      options: uniqueValues.sources,
      values: filters.source
    },
    {
      key: 'stage' as keyof LeadsFilterOptions,
      label: 'Stage',
      icon: Activity,
      options: uniqueValues.stages,
      values: filters.stage
    },
    {
      key: 'status' as keyof LeadsFilterOptions,
      label: 'Status',
      icon: Clock,
      options: uniqueValues.statuses,
      values: filters.status
    },
    {
      key: 'associate' as keyof LeadsFilterOptions,
      label: 'Associate',
      icon: Users,
      options: uniqueValues.associates,
      values: filters.associate
    },
    {
      key: 'channel' as keyof LeadsFilterOptions,
      label: 'Channel',
      icon: Phone,
      options: uniqueValues.channels,
      values: filters.channel
    },
    {
      key: 'trialStatus' as keyof LeadsFilterOptions,
      label: 'Trial Status',
      icon: Target,
      options: uniqueValues.trialStatuses,
      values: filters.trialStatus
    },
    {
      key: 'conversionStatus' as keyof LeadsFilterOptions,
      label: 'Conversion',
      icon: UserCheck,
      options: uniqueValues.conversionStatuses,
      values: filters.conversionStatus
    },
    {
      key: 'retentionStatus' as keyof LeadsFilterOptions,
      label: 'Retention',
      icon: TrendingUp,
      options: uniqueValues.retentionStatuses,
      values: filters.retentionStatus
    }
  ];

  return (
    <Card className="bg-white/95 backdrop-blur-sm border border-slate-200 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-white">
            <Filter className="w-5 h-5" />
            Lead Filters
            {activeFilterCount > 0 && (
              <Badge className="bg-white/20 text-white border-white/30">
                {activeFilterCount} Active
              </Badge>
            )}
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearAllFilters}
            disabled={activeFilterCount === 0}
            className="bg-white/10 border-white/30 text-white hover:bg-white/20"
          >
            <X className="w-4 h-4 mr-1" />
            Clear All
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        {/* Date Range Filter */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-blue-600" />
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

        {/* Multi-select Filters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filterConfigs.map((config) => (
            <div key={config.key} className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <config.icon className="w-4 h-4 text-blue-600" />
                {config.label}
                {config.values.length > 0 && (
                  <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                    {config.values.length}
                  </Badge>
                )}
              </label>
              <Select
                value=""
                onValueChange={(value) => handleArrayFilterChange(config.key, value)}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder={`Select ${config.label.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent className="bg-white z-50 max-h-48">
                  {config.options.map((option) => (
                    <SelectItem key={option} value={option} className="text-sm">
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* Show selected values */}
              {config.values.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {config.values.slice(0, 3).map((value) => (
                    <Badge 
                      key={value} 
                      variant="secondary" 
                      className="text-xs cursor-pointer hover:bg-red-100 bg-slate-100 text-slate-700"
                      onClick={() => handleArrayFilterChange(config.key, value)}
                    >
                      {value}
                      <X className="w-3 h-3 ml-1" />
                    </Badge>
                  ))}
                  {config.values.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{config.values.length - 3} more
                    </Badge>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* LTV Range Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-200">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-blue-600" />
              Min LTV
            </label>
            <Input
              type="number"
              placeholder="₹0"
              value={filters.minLTV || ''}
              onChange={(e) => onFiltersChange({
                ...filters,
                minLTV: e.target.value ? parseFloat(e.target.value) : undefined
              })}
              className="h-9"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-blue-600" />
              Max LTV
            </label>
            <Input
              type="number"
              placeholder="₹100000"
              value={filters.maxLTV || ''}
              onChange={(e) => onFiltersChange({
                ...filters,
                maxLTV: e.target.value ? parseFloat(e.target.value) : undefined
              })}
              className="h-9"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
