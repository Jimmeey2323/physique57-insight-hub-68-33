import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DatePickerWithRange } from '@/components/ui/date-picker-with-range';
import { format } from 'date-fns';
import { 
  Filter, 
  X, 
  ChevronDown, 
  ChevronUp, 
  Calendar as CalendarIcon,
  MapPin, 
  User, 
  Clock,
  Search,
  Settings,
  Target
} from 'lucide-react';
import { PayrollData } from '@/types/dashboard';
import { cn } from '@/lib/utils';

interface EnhancedFilterSectionProps {
  data: PayrollData[];
  selectedLocation: string;
  onLocationChange: (location: string) => void;
  selectedTimeframe: string;
  onTimeframeChange: (timeframe: string) => void;
  selectedTrainer: string;
  onTrainerChange: (trainer: string) => void;
  dateRange?: { start: Date | null; end: Date | null };
  onDateRangeChange?: (range: { start: Date | null; end: Date | null }) => void;
  // Additional filters
  selectedClassType?: string;
  onClassTypeChange?: (classType: string) => void;
  selectedPerformanceRange?: string;
  onPerformanceRangeChange?: (range: string) => void;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  selectedUtilizationRange?: string;
  onUtilizationRangeChange?: (range: string) => void;
}

export const EnhancedFilterSection: React.FC<EnhancedFilterSectionProps> = ({
  data,
  selectedLocation,
  onLocationChange,
  selectedTimeframe,
  onTimeframeChange,
  selectedTrainer,
  onTrainerChange,
  dateRange = { start: null, end: null },
  onDateRangeChange = () => {},
  selectedClassType = 'all',
  onClassTypeChange = () => {},
  selectedPerformanceRange = 'all',
  onPerformanceRangeChange = () => {},
  searchTerm = '',
  onSearchChange = () => {},
  selectedUtilizationRange = 'all',
  onUtilizationRangeChange = () => {}
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(dateRange.start || undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(dateRange.end || undefined);

  // Initialize with previous month dates
  React.useEffect(() => {
    if (!dateRange.start && !dateRange.end) {
      const now = new Date();
      const firstDayPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDayPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      
      setStartDate(firstDayPrevMonth);
      setEndDate(lastDayPrevMonth);
      onDateRangeChange({ start: firstDayPrevMonth, end: lastDayPrevMonth });
    }
  }, []);

  const filterOptions = useMemo(() => {
    const locations = [...new Set(data.map(d => d.location))].filter(Boolean).sort();
    const trainers = [...new Set(data.map(d => d.teacherName))].filter(Boolean).sort();
    const monthYears = [...new Set(data.map(d => d.monthYear))].filter(Boolean).sort();

    return { locations, trainers, monthYears };
  }, [data]);

  const timeframes = [
    { value: 'all', label: 'All Time' },
    { value: '3m', label: 'Last 3 Months' },
    { value: '6m', label: 'Last 6 Months' },
    { value: '1y', label: 'Last 12 Months' },
    { value: 'prev-month', label: 'Previous Month (Default)' },
    { value: 'custom', label: 'Custom Date Range' }
  ];

  const classTypes = [
    { value: 'all', label: 'All Class Types' },
    { value: 'powercycle', label: 'PowerCycle' },
    { value: 'barre', label: 'Barre' },
    { value: 'strength', label: 'Strength Lab' }
  ];

  const performanceRanges = [
    { value: 'all', label: 'All Performance Levels' },
    { value: 'high', label: 'High Performers (Top 25%)' },
    { value: 'medium', label: 'Medium Performers (25-75%)' },
    { value: 'low', label: 'Low Performers (Bottom 25%)' }
  ];

  const utilizationRanges = [
    { value: 'all', label: 'All Utilization Levels' },
    { value: 'high', label: 'High Utilization (80%+)' },
    { value: 'medium', label: 'Medium Utilization (50-80%)' },
    { value: 'low', label: 'Low Utilization (<50%)' }
  ];

  const hasActiveFilters = selectedLocation !== 'all' || 
    selectedTimeframe !== 'prev-month' || 
    selectedTrainer !== 'all' ||
    selectedClassType !== 'all' ||
    selectedPerformanceRange !== 'all' ||
    selectedUtilizationRange !== 'all' ||
    searchTerm !== '' ||
    dateRange.start || 
    dateRange.end;

  const activeFilterCount = [
    selectedLocation !== 'all' ? 1 : 0,
    selectedTimeframe !== 'prev-month' ? 1 : 0,
    selectedTrainer !== 'all' ? 1 : 0,
    selectedClassType !== 'all' ? 1 : 0,
    selectedPerformanceRange !== 'all' ? 1 : 0,
    selectedUtilizationRange !== 'all' ? 1 : 0,
    searchTerm !== '' ? 1 : 0,
    dateRange.start ? 1 : 0,
    dateRange.end ? 1 : 0
  ].filter(count => count > 0).length;

  const clearAllFilters = () => {
    onLocationChange('all');
    onTimeframeChange('prev-month');
    onTrainerChange('all');
    onClassTypeChange('all');
    onPerformanceRangeChange('all');
    onUtilizationRangeChange('all');
    onSearchChange('');
    
    // Reset to previous month
    const now = new Date();
    const firstDayPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    setStartDate(firstDayPrevMonth);
    setEndDate(lastDayPrevMonth);
    onDateRangeChange({ start: firstDayPrevMonth, end: lastDayPrevMonth });
  };

  const handleDateChange = (type: 'start' | 'end', date: Date | undefined) => {
    if (type === 'start') {
      setStartDate(date);
      onDateRangeChange({ start: date || null, end: endDate || null });
    } else {
      setEndDate(date);
      onDateRangeChange({ start: startDate || null, end: date || null });
    }
  };

  return (
    <Card className="bg-gradient-to-br from-white via-slate-50/30 to-blue-50/20 border-0 shadow-xl overflow-hidden">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-slate-50/50 transition-colors bg-gradient-to-r from-slate-600 to-slate-700 text-white">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Settings className="w-6 h-6" />
                <div>
                  <h3 className="text-xl font-bold">Advanced Analytics Filters</h3>
                  <p className="text-slate-200 text-sm">Complete control and customization</p>
                </div>
                {hasActiveFilters && (
                  <Badge className="bg-white/20 text-white border-white/30">
                    {activeFilterCount} Active
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearAllFilters();
                    }}
                    className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Reset
                  </Button>
                )}
                {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="p-8 space-y-8">
            {/* Search */}
            <div className="space-y-2">
              <Label className="text-slate-700 flex items-center gap-2 text-base font-medium">
                <Search className="w-4 h-4 text-blue-500" />
                Search & Filter
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search trainers, locations, or periods..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-10 bg-white border-slate-200 text-slate-800"
                />
              </div>
            </div>

            {/* Primary Filters */}
            <div>
              <h4 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Filter className="w-5 h-5 text-slate-600" />
                Primary Filters
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Location Filter */}
                <div className="space-y-2">
                  <Label className="text-slate-700 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-green-500" />
                    Location
                  </Label>
                  <Select value={selectedLocation} onValueChange={onLocationChange}>
                    <SelectTrigger className="bg-white border-slate-200">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200">
                      <SelectItem value="all">All Locations</SelectItem>
                      {filterOptions.locations.map(location => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Timeframe Filter */}
                <div className="space-y-2">
                  <Label className="text-slate-700 flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-blue-500" />
                    Timeframe
                  </Label>
                  <Select value={selectedTimeframe} onValueChange={onTimeframeChange}>
                    <SelectTrigger className="bg-white border-slate-200">
                      <SelectValue placeholder="Select timeframe" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200">
                      {timeframes.map(timeframe => (
                        <SelectItem key={timeframe.value} value={timeframe.value}>
                          {timeframe.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Trainer Filter */}
                <div className="space-y-2">
                  <Label className="text-slate-700 flex items-center gap-2">
                    <User className="w-4 h-4 text-purple-500" />
                    Trainer
                  </Label>
                  <Select value={selectedTrainer} onValueChange={onTrainerChange}>
                    <SelectTrigger className="bg-white border-slate-200">
                      <SelectValue placeholder="Select trainer" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200">
                      <SelectItem value="all">All Trainers</SelectItem>
                      {filterOptions.trainers.map(trainer => (
                        <SelectItem key={trainer} value={trainer}>
                          {trainer}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Class Type Filter */}
                <div className="space-y-2">
                  <Label className="text-slate-700 flex items-center gap-2">
                    <Target className="w-4 h-4 text-orange-500" />
                    Class Type
                  </Label>
                  <Select value={selectedClassType} onValueChange={onClassTypeChange}>
                    <SelectTrigger className="bg-white border-slate-200">
                      <SelectValue placeholder="Select class type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200">
                      {classTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Advanced Filters */}
            <div>
              <h4 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-slate-600" />
                Advanced Analytics
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Performance Range */}
                <div className="space-y-2">
                  <Label className="text-slate-700">Performance Range</Label>
                  <Select value={selectedPerformanceRange} onValueChange={onPerformanceRangeChange}>
                    <SelectTrigger className="bg-white border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200">
                      {performanceRanges.map(range => (
                        <SelectItem key={range.value} value={range.value}>
                          {range.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Utilization Range */}
                <div className="space-y-2">
                  <Label className="text-slate-700">Utilization Range</Label>
                  <Select value={selectedUtilizationRange} onValueChange={onUtilizationRangeChange}>
                    <SelectTrigger className="bg-white border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200">
                      {utilizationRanges.map(range => (
                        <SelectItem key={range.value} value={range.value}>
                          {range.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Custom Date Range */}
            {selectedTimeframe === 'custom' && (
              <div>
                <h4 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-slate-600" />
                  Custom Date Range
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-slate-700">Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal bg-white border-slate-200",
                            !startDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, "PPP") : "Pick start date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={(date) => handleDateChange('start', date)}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-700">End Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal bg-white border-slate-200",
                            !endDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate ? format(endDate, "PPP") : "Pick end date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={(date) => handleDateChange('end', date)}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            )}

            {/* Filter Summary */}
            <div className="pt-6 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {selectedLocation !== 'all' && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <MapPin className="w-3 h-3 mr-1" />
                      {selectedLocation}
                    </Badge>
                  )}
                  {selectedTimeframe !== 'prev-month' && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      <CalendarIcon className="w-3 h-3 mr-1" />
                      {timeframes.find(t => t.value === selectedTimeframe)?.label}
                    </Badge>
                  )}
                  {selectedTrainer !== 'all' && (
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                      <User className="w-3 h-3 mr-1" />
                      {selectedTrainer}
                    </Badge>
                  )}
                  {selectedClassType !== 'all' && (
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                      <Target className="w-3 h-3 mr-1" />
                      {classTypes.find(t => t.value === selectedClassType)?.label}
                    </Badge>
                  )}
                  {searchTerm && (
                    <Badge variant="secondary" className="bg-slate-100 text-slate-800">
                      <Search className="w-3 h-3 mr-1" />
                      "{searchTerm}"
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-slate-600">
                  {data.length} total records available
                </div>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};