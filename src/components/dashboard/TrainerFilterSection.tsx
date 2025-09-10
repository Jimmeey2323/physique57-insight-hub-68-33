
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, User, X, Filter } from 'lucide-react';
import { PayrollData } from '@/types/dashboard';

interface TrainerFilterSectionProps {
  data: PayrollData[];
  onFiltersChange: (filters: any) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const TrainerFilterSection: React.FC<TrainerFilterSectionProps> = ({
  data,
  onFiltersChange,
  isCollapsed,
  onToggleCollapse
}) => {
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedTrainer, setSelectedTrainer] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');

  const locations = Array.from(new Set(data.map(item => item.location))).filter(Boolean);
  const trainers = Array.from(new Set(data.map(item => item.teacherName))).filter(Boolean);
  const months = Array.from(new Set(data.map(item => item.monthYear))).filter(Boolean).sort().reverse();

  useEffect(() => {
    onFiltersChange({
      location: selectedLocation === 'all' ? '' : selectedLocation,
      trainer: selectedTrainer === 'all' ? '' : selectedTrainer,
      month: selectedMonth === 'all' ? '' : selectedMonth
    });
  }, [selectedLocation, selectedTrainer, selectedMonth, onFiltersChange]);

  const clearFilters = () => {
    setSelectedLocation('all');
    setSelectedTrainer('all');
    setSelectedMonth('all');
  };

  const hasActiveFilters = selectedLocation !== 'all' || selectedTrainer !== 'all' || selectedMonth !== 'all';

  if (isCollapsed) {
    return (
      <Card className="bg-gradient-to-br from-white via-slate-50/30 to-white border-0 shadow-xl">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-slate-700">Filters</span>
              {hasActiveFilters && (
                <Badge variant="secondary" className="text-xs">
                  {[selectedLocation, selectedTrainer, selectedMonth].filter(f => f !== 'all').length} active
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCollapse}
              className="text-blue-600 hover:text-blue-700"
            >
              Show Filters
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-white via-slate-50/30 to-white border-0 shadow-xl">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Filter className="w-5 h-5 text-blue-600" />
            Advanced Filters
          </CardTitle>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="text-slate-600 hover:text-slate-700"
              >
                <X className="w-3 h-3 mr-1" />
                Clear All
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCollapse}
              className="text-blue-600 hover:text-blue-700"
            >
              Hide Filters
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              Location
            </label>
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger>
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              Trainer
            </label>
            <Select value={selectedTrainer} onValueChange={setSelectedTrainer}>
              <SelectTrigger>
                <SelectValue placeholder="All Trainers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Trainers</SelectItem>
                {trainers.map((trainer) => (
                  <SelectItem key={trainer} value={trainer}>
                    {trainer}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              Month
            </label>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger>
                <SelectValue placeholder="All Months" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                {months.map((month) => (
                  <SelectItem key={month} value={month}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
