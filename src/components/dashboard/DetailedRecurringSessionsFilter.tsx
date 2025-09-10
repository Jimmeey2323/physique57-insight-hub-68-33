import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-picker';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { 
  Calendar, 
  Filter, 
  RotateCcw, 
  MapPin, 
  Users, 
  Target, 
  ChevronDown, 
  ChevronUp, 
  Clock,
  Activity,
  BarChart3,
  Search,
  DollarSign,
  Percent
} from 'lucide-react';
import { RecurringSessionData } from '@/hooks/useRecurringSessionsData';

interface DetailedRecurringSessionsFilterProps {
  data: RecurringSessionData[];
  filters: any;
  onFiltersChange: (filters: any) => void;
}

export const DetailedRecurringSessionsFilter: React.FC<DetailedRecurringSessionsFilterProps> = ({
  data,
  filters,
  onFiltersChange
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Extract unique values from data
  const uniqueTrainers = [...new Set(data.map(session => session.trainer))].filter(Boolean);
  const uniqueClasses = [...new Set(data.map(session => session.class))].filter(Boolean);
  const uniqueLocations = [...new Set(data.map(session => session.location))].filter(Boolean);
  const uniqueDays = [...new Set(data.map(session => session.day))].filter(Boolean);
  const uniqueTimes = [...new Set(data.map(session => session.time))].filter(Boolean);
  const uniqueTypes = [...new Set(data.map(session => session.type))].filter(Boolean);

  const handleArrayFilterChange = (filterKey: string, value: string) => {
    const currentValues = [...(filters[filterKey] || [])];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    onFiltersChange({ ...filters, [filterKey]: newValues });
  };

  const handleDateRangeChange = (range: { from?: Date; to?: Date }) => {
    onFiltersChange({
      ...filters,
      dateRange: {
        start: range.from ? range.from.toISOString().split('T')[0] : '',
        end: range.to ? range.to.toISOString().split('T')[0] : ''
      }
    });
  };

  const resetFilters = () => {
    onFiltersChange({
      dateRange: { start: '', end: '' },
      trainers: [],
      classes: [],
      locations: [],
      days: [],
      times: [],
      types: [],
      minCapacity: undefined,
      maxCapacity: undefined,
      minFillRate: undefined,
      maxFillRate: undefined,
      minRevenue: undefined,
      maxRevenue: undefined
    });
    setSearchTerm('');
  };

  const activeFiltersCount = (filters.trainers?.length || 0) + 
    (filters.classes?.length || 0) + 
    (filters.locations?.length || 0) + 
    (filters.days?.length || 0) + 
    (filters.times?.length || 0) + 
    (filters.types?.length || 0) +
    (filters.dateRange?.start || filters.dateRange?.end ? 1 : 0) +
    (filters.minCapacity ? 1 : 0) + (filters.maxCapacity ? 1 : 0) +
    (filters.minFillRate ? 1 : 0) + (filters.maxFillRate ? 1 : 0) +
    (filters.minRevenue ? 1 : 0) + (filters.maxRevenue ? 1 : 0);

  const filterSections = [
    {
      title: 'Trainers & Staff',
      icon: Users,
      filters: [
        {
          key: 'trainers',
          label: 'Trainers',
          options: uniqueTrainers.slice(0, 20),
          values: filters.trainers || []
        }
      ]
    },
    {
      title: 'Classes & Types',
      icon: Activity,
      filters: [
        {
          key: 'classes',
          label: 'Class Names',
          options: uniqueClasses,
          values: filters.classes || []
        },
        {
          key: 'types',
          label: 'Class Types',
          options: uniqueTypes,
          values: filters.types || []
        }
      ]
    },
    {
      title: 'Schedule & Location',
      icon: MapPin,
      filters: [
        {
          key: 'locations',
          label: 'Locations',
          options: uniqueLocations,
          values: filters.locations || []
        },
        {
          key: 'days',
          label: 'Days of Week',
          options: uniqueDays,
          values: filters.days || []
        },
        {
          key: 'times',
          label: 'Time Slots',
          options: uniqueTimes.slice(0, 15),
          values: filters.times || []
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
                <h3 className="font-bold text-slate-800">Advanced Session Filters</h3>
                <p className="text-sm text-slate-600">Refine your session analysis</p>
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
              <h3 className="text-xl font-bold">Advanced Session Filters</h3>
              <p className="text-blue-100 text-sm">Customize your session analysis</p>
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
                from: filters.dateRange?.start ? new Date(filters.dateRange.start) : undefined,
                to: filters.dateRange?.end ? new Date(filters.dateRange.end) : undefined
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
              placeholder="Search sessions, trainers, classes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white border-slate-200"
            />
          </div>
        </div>

        {/* Numeric Range Filters */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Capacity Range */}
          <Card className="bg-white/70 border-slate-200 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Capacity Range
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.minCapacity || ''}
                  onChange={(e) => onFiltersChange({
                    ...filters,
                    minCapacity: e.target.value ? parseInt(e.target.value) : undefined
                  })}
                  className="bg-white border-slate-200"
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.maxCapacity || ''}
                  onChange={(e) => onFiltersChange({
                    ...filters,
                    maxCapacity: e.target.value ? parseInt(e.target.value) : undefined
                  })}
                  className="bg-white border-slate-200"
                />
              </div>
            </CardContent>
          </Card>

          {/* Fill Rate Range */}
          <Card className="bg-white/70 border-slate-200 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Percent className="w-5 h-5 text-blue-600" />
                Fill Rate Range (%)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="Min %"
                  value={filters.minFillRate || ''}
                  onChange={(e) => onFiltersChange({
                    ...filters,
                    minFillRate: e.target.value ? parseFloat(e.target.value) : undefined
                  })}
                  className="bg-white border-slate-200"
                />
                <Input
                  type="number"
                  placeholder="Max %"
                  value={filters.maxFillRate || ''}
                  onChange={(e) => onFiltersChange({
                    ...filters,
                    maxFillRate: e.target.value ? parseFloat(e.target.value) : undefined
                  })}
                  className="bg-white border-slate-200"
                />
              </div>
            </CardContent>
          </Card>

          {/* Revenue Range */}
          <Card className="bg-white/70 border-slate-200 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-blue-600" />
                Revenue Range (₹)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="Min ₹"
                  value={filters.minRevenue || ''}
                  onChange={(e) => onFiltersChange({
                    ...filters,
                    minRevenue: e.target.value ? parseFloat(e.target.value) : undefined
                  })}
                  className="bg-white border-slate-200"
                />
                <Input
                  type="number"
                  placeholder="Max ₹"
                  value={filters.maxRevenue || ''}
                  onChange={(e) => onFiltersChange({
                    ...filters,
                    maxRevenue: e.target.value ? parseFloat(e.target.value) : undefined
                  })}
                  className="bg-white border-slate-200"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                    <div className="max-h-40 overflow-y-auto">
                      <Select onValueChange={(value) => handleArrayFilterChange(filter.key, value)}>
                        <SelectTrigger className="w-full bg-white border-slate-200 z-50">
                          <SelectValue placeholder={`Select ${filter.label.toLowerCase()}...`} />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-slate-200 shadow-lg z-50 max-h-60">
                          {filter.options.filter(option => 
                            !searchTerm || option.toLowerCase().includes(searchTerm.toLowerCase())
                          ).map(option => (
                            <SelectItem 
                              key={option} 
                              value={option}
                              className="hover:bg-blue-50 focus:bg-blue-50"
                            >
                              <div className="flex items-center gap-2">
                                <Checkbox 
                                  checked={filter.values.includes(option)}
                                  onChange={() => {}}
                                />
                                {option}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {filter.values.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {filter.values.map(value => (
                          <Badge 
                            key={value} 
                            variant="secondary" 
                            className="text-xs bg-blue-100 text-blue-700 cursor-pointer hover:bg-red-100 hover:text-red-700"
                            onClick={() => handleArrayFilterChange(filter.key, value)}
                          >
                            {value} ×
                          </Badge>
                        ))}
                      </div>
                    )}
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