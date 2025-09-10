import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, User, Clock, Package, Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { LateCancellationsData } from '@/types/dashboard';

interface EnhancedLateCancellationsFilterSectionProps {
  selectedLocation: string;
  onLocationChange: (location: string) => void;
  selectedTimeframe: string;
  onTimeframeChange: (timeframe: string) => void;
  selectedTrainer: string;
  onTrainerChange: (trainer: string) => void;
  selectedClass: string;
  onClassChange: (classType: string) => void;
  selectedProduct: string;
  onProductChange: (product: string) => void;
  selectedTimeSlot: string;
  onTimeSlotChange: (timeSlot: string) => void;
  dateRange: { start: string; end: string };
  onDateRangeChange: (range: { start: string; end: string }) => void;
  data: LateCancellationsData[];
  onClearFilters: () => void;
}

export function EnhancedLateCancellationsFilterSection({
  selectedLocation,
  onLocationChange,
  selectedTimeframe,
  onTimeframeChange,
  selectedTrainer,
  onTrainerChange,
  selectedClass,
  onClassChange,
  selectedProduct,
  onProductChange,
  selectedTimeSlot,
  onTimeSlotChange,
  dateRange,
  onDateRangeChange,
  data,
  onClearFilters
}: EnhancedLateCancellationsFilterSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Extract unique values for dropdowns
  const locations = React.useMemo(() => 
    Array.from(new Set(data.map(item => item.location).filter(Boolean))), [data]
  );

  const trainers = React.useMemo(() => 
    Array.from(new Set(data.map(item => item.teacherName).filter(Boolean))), [data]
  );

  const classes = React.useMemo(() => 
    Array.from(new Set(data.map(item => item.cleanedClass).filter(Boolean))), [data]
  );

  const products = React.useMemo(() => 
    Array.from(new Set(data.map(item => item.cleanedProduct).filter(Boolean))), [data]
  );

  const timeframes = [
    { value: 'all', label: 'All Time' },
    { value: 'prev-month', label: 'Previous Month' },
    { value: '1w', label: 'Last Week' },
    { value: '2w', label: 'Last 2 Weeks' },
    { value: '1m', label: 'Last Month' },
    { value: '3m', label: 'Last 3 Months' },
    { value: '6m', label: 'Last 6 Months' },
    { value: '1y', label: 'Last 12 Months' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const timeSlots = [
    { value: 'all', label: 'All Time Slots' },
    { value: 'morning', label: 'Morning (6-12)' },
    { value: 'afternoon', label: 'Afternoon (12-17)' },
    { value: 'evening', label: 'Evening (17-22)' },
    { value: 'late', label: 'Late Night (22+)' }
  ];

  const activeFiltersCount = [
    selectedLocation !== 'all',
    selectedTimeframe !== 'all',
    selectedTrainer !== 'all',
    selectedClass !== 'all',
    selectedProduct !== 'all',
    selectedTimeSlot !== 'all',
    dateRange.start || dateRange.end
  ].filter(Boolean).length;

  if (!isExpanded) {
    return (
      <Card className="bg-gradient-to-br from-white via-red-50/30 to-white border-0 shadow-xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg">
                <Filter className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Advanced Filters</h3>
                <p className="text-sm text-slate-600">Refine your late cancellations analysis</p>
              </div>
              {activeFiltersCount > 0 && (
                <Badge className="bg-gradient-to-r from-red-600 to-orange-600 text-white">
                  {activeFiltersCount} active
                </Badge>
              )}
            </div>
            <Button
              variant="outline"
              onClick={() => setIsExpanded(true)}
              className="gap-2 border-red-200 text-red-700 hover:bg-red-50"
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
    <Card className="bg-gradient-to-br from-white via-red-50/30 to-white border-0 shadow-xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-red-600 to-orange-600 text-white">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Filter className="w-6 h-6" />
            <div>
              <h3 className="text-xl font-bold">Advanced Filters</h3>
              <p className="text-red-100 text-sm">Customize your late cancellations analysis</p>
            </div>
            <Badge className="bg-white/20 text-white border-white/30">
              {activeFiltersCount} Active
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              disabled={activeFiltersCount === 0}
              className="bg-white/10 border-white/30 text-white hover:bg-white/20"
            >
              <X className="w-4 h-4 mr-1" />
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
      
      <CardContent className="p-8 space-y-6">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-lg font-semibold text-slate-800">Filter Options</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Location Filter */}
          <div className="space-y-2">
            <Label htmlFor="location-select" className="text-slate-700 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Location
            </Label>
            <Select value={selectedLocation} onValueChange={onLocationChange}>
              <SelectTrigger id="location-select" className="bg-white border-slate-200">
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200">
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map(location => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Timeframe Filter */}
          <div className="space-y-2">
            <Label htmlFor="timeframe-select" className="text-slate-700 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Timeframe
            </Label>
            <Select value={selectedTimeframe} onValueChange={onTimeframeChange}>
              <SelectTrigger id="timeframe-select" className="bg-white border-slate-200">
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
            <Label htmlFor="trainer-select" className="text-slate-700 flex items-center gap-2">
              <User className="w-4 h-4" />
              Trainer
            </Label>
            <Select value={selectedTrainer} onValueChange={onTrainerChange}>
              <SelectTrigger id="trainer-select" className="bg-white border-slate-200">
                <SelectValue placeholder="Select trainer" />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200">
                <SelectItem value="all">All Trainers</SelectItem>
                {trainers.map(trainer => (
                  <SelectItem key={trainer} value={trainer}>
                    {trainer}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Class Type Filter */}
          <div className="space-y-2">
            <Label htmlFor="class-select" className="text-slate-700 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Class Type
            </Label>
            <Select value={selectedClass} onValueChange={onClassChange}>
              <SelectTrigger id="class-select" className="bg-white border-slate-200">
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200">
                <SelectItem value="all">All Classes</SelectItem>
                {classes.map(classType => (
                  <SelectItem key={classType} value={classType}>
                    {classType}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Product Filter */}
          <div className="space-y-2">
            <Label htmlFor="product-select" className="text-slate-300 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Product Type
            </Label>
            <Select value={selectedProduct} onValueChange={onProductChange}>
              <SelectTrigger id="product-select" className="bg-slate-800 border-slate-600 text-white">
                <SelectValue placeholder="Select product" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="all" className="text-white hover:bg-slate-700">All Products</SelectItem>
                {products.map(product => (
                  <SelectItem key={product} value={product} className="text-white hover:bg-slate-700">
                    {product}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Time Slot Filter */}
          <div className="space-y-2">
            <Label htmlFor="timeslot-select" className="text-slate-300 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Time Slot
            </Label>
            <Select value={selectedTimeSlot} onValueChange={onTimeSlotChange}>
              <SelectTrigger id="timeslot-select" className="bg-slate-800 border-slate-600 text-white">
                <SelectValue placeholder="Select time slot" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                {timeSlots.map(timeSlot => (
                  <SelectItem key={timeSlot.value} value={timeSlot.value} className="text-white hover:bg-slate-700">
                    {timeSlot.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom Date Range */}
          {selectedTimeframe === 'custom' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="start-date" className="text-slate-700">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => onDateRangeChange({ ...dateRange, start: e.target.value })}
                  className="bg-white border-slate-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end-date" className="text-slate-700">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => onDateRangeChange({ ...dateRange, end: e.target.value })}
                  className="bg-white border-slate-200"
                />
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}