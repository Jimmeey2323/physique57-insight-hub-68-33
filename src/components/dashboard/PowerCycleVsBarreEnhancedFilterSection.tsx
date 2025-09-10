
import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { DatePickerWithRange } from '@/components/ui/date-picker';
import { Filter, X, ChevronDown, ChevronUp, Zap, BarChart3, Calendar, MapPin } from 'lucide-react';
import { useSessionsFilters } from '@/contexts/SessionsFiltersContext';
import { SessionData } from '@/hooks/useSessionsData';

interface PowerCycleVsBarreEnhancedFilterSectionProps {
  data: SessionData[];
}

export const PowerCycleVsBarreEnhancedFilterSection: React.FC<PowerCycleVsBarreEnhancedFilterSectionProps> = ({ data }) => {
  const { filters, updateFilters, clearAllFilters } = useSessionsFilters();
  const [isOpen, setIsOpen] = useState(false);

  const filterOptions = useMemo(() => {
    const trainers = [...new Set(data.map(d => d.trainerName))].filter(Boolean).sort();
    const classTypes = [...new Set(data.map(d => d.cleanedClass))].filter(Boolean).sort();
    const dayOfWeek = [...new Set(data.map(d => d.dayOfWeek))].filter(Boolean).sort();
    const timeSlots = [...new Set(data.map(d => d.time))].filter(Boolean).sort();
    const locations = [...new Set(data.map(d => d.location))].filter(Boolean).sort();

    return { trainers, classTypes, dayOfWeek, timeSlots, locations };
  }, [data]);

  const hasActiveFilters = filters.trainers.length > 0 || 
    filters.classTypes.length > 0 || 
    filters.dayOfWeek.length > 0 || 
    filters.timeSlots.length > 0 ||
    filters.dateRange.start || 
    filters.dateRange.end;

  const activeFilterCount = [
    filters.trainers.length,
    filters.classTypes.length,
    filters.dayOfWeek.length,
    filters.timeSlots.length,
    filters.dateRange.start ? 1 : 0,
    filters.dateRange.end ? 1 : 0
  ].filter(count => count > 0).length;

  return (
    <Card className="bg-white shadow-sm border border-gray-200 overflow-hidden">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardContent className="p-4 cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Filter className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-800">PowerCycle vs Barre Filters</span>
                {hasActiveFilters && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {activeFilterCount} active
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
                    className="gap-2"
                  >
                    <X className="w-4 h-4" />
                    Clear All
                  </Button>
                )}
                {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </div>
          </CardContent>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="px-4 pb-4 pt-0 border-t border-gray-100 bg-gray-50/50">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mt-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  Date Range
                </Label>
                <DatePickerWithRange
                  value={{
                    from: filters.dateRange.start ? new Date(filters.dateRange.start) : undefined,
                    to: filters.dateRange.end ? new Date(filters.dateRange.end) : undefined
                  }}
                  onChange={(range) => 
                    updateFilters({ 
                      dateRange: { 
                        start: range.from || null, 
                        end: range.to || null 
                      } 
                    })
                  }
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-green-500" />
                  Location
                </Label>
                <Select
                  value="all-locations"
                  onValueChange={(value) => 
                    updateFilters({ trainers: value === 'all-locations' ? [] : [value] })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select location..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-locations">All Locations</SelectItem>
                    {filterOptions.locations.map(location => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-500" />
                  Trainers
                </Label>
                <Select
                  value={filters.trainers[0] || 'all-trainers'}
                  onValueChange={(value) => 
                    updateFilters({ trainers: value === 'all-trainers' ? [] : [value] })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select trainer..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-trainers">All Trainers</SelectItem>
                    {filterOptions.trainers.map(trainer => (
                      <SelectItem key={trainer} value={trainer}>
                        {trainer}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-purple-500" />
                  Class Types
                </Label>
                <Select
                  value={filters.classTypes[0] || 'all-classes'}
                  onValueChange={(value) => 
                    updateFilters({ classTypes: value === 'all-classes' ? [] : [value] })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select class type..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-classes">All Classes</SelectItem>
                    {filterOptions.classTypes.map(classType => (
                      <SelectItem key={classType} value={classType}>
                        {classType}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Day of Week</Label>
                <Select
                  value={filters.dayOfWeek[0] || 'all-days'}
                  onValueChange={(value) => 
                    updateFilters({ dayOfWeek: value === 'all-days' ? [] : [value] })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select day..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-days">All Days</SelectItem>
                    {filterOptions.dayOfWeek.map(day => (
                      <SelectItem key={day} value={day}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Time Slots</Label>
                <Select
                  value={filters.timeSlots[0] || 'all-times'}
                  onValueChange={(value) => 
                    updateFilters({ timeSlots: value === 'all-times' ? [] : [value] })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select time..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-times">All Times</SelectItem>
                    {filterOptions.timeSlots.map(time => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
