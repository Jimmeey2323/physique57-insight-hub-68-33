import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, User, Filter, X } from 'lucide-react';
import { PayrollData } from '@/types/dashboard';

interface PowerCycleBarreStrengthFilterSectionProps {
  data: PayrollData[];
  selectedLocation: string;
  onLocationChange: (location: string) => void;
  selectedTimeframe: string;
  onTimeframeChange: (timeframe: string) => void;
  selectedTrainer: string;
  onTrainerChange: (trainer: string) => void;
}

export function PowerCycleBarreStrengthFilterSection({
  data,
  selectedLocation,
  onLocationChange,
  selectedTimeframe,
  onTimeframeChange,
  selectedTrainer,
  onTrainerChange
}: PowerCycleBarreStrengthFilterSectionProps) {
  // Extract unique values for dropdowns
  const locations = React.useMemo(() => 
    Array.from(new Set(data.map(item => item.location).filter(Boolean))), [data]
  );

  const trainers = React.useMemo(() => 
    Array.from(new Set(data.map(item => item.teacherName).filter(Boolean))), [data]
  );

  const timeframes = [
    { value: 'all', label: 'All Time' },
    { value: '3m', label: 'Last 3 Months' },
    { value: '6m', label: 'Last 6 Months' },
    { value: '1y', label: 'Last 12 Months' }
  ];

  const clearAllFilters = () => {
    onLocationChange('all');
    onTimeframeChange('all');
    onTrainerChange('all');
  };

  const activeFiltersCount = [
    selectedLocation !== 'all',
    selectedTimeframe !== 'all',
    selectedTrainer !== 'all'
  ].filter(Boolean).length;

  return (
    <Card className="bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/20 border-0 shadow-xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Filter className="w-6 h-6" />
            <div>
              <h3 className="text-xl font-bold">PowerCycle vs Barre vs Strength Filters</h3>
              <p className="text-indigo-100 text-sm">Customize your class format analysis</p>
            </div>
            <Badge className="bg-white/20 text-white border-white/30">
              {activeFiltersCount} Active
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
              disabled={activeFiltersCount === 0}
              className="bg-white/10 border-white/30 text-white hover:bg-white/20"
            >
              <X className="w-4 h-4 mr-1" />
              Reset
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-8 space-y-6">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-lg font-semibold text-slate-800">Filter Options</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
        </div>
      </CardContent>
    </Card>
  );
}