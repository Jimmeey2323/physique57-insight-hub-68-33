import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { DatePickerWithRange } from '@/components/ui/date-picker';
import { Filter, X, ChevronDown, ChevronUp, Calendar, MapPin, Users, Clock, BarChart3, Building2 } from 'lucide-react';
import { useSessionsFilters } from '@/contexts/SessionsFiltersContext';
import { SessionData } from '@/hooks/useSessionsData';

interface ClassAttendanceFilterSectionProps {
  data: SessionData[];
}

export const ClassAttendanceFilterSection: React.FC<ClassAttendanceFilterSectionProps> = ({ data }) => {
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
    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg mb-6">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardContent className="p-4 cursor-pointer hover:bg-gray-50/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600">
                  <Filter className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Class Attendance Filters</h3>
                  <p className="text-sm text-gray-600">Filter and refine your attendance analytics</p>
                </div>
                {hasActiveFilters && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
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
                    className="gap-2 hover:bg-red-50 hover:border-red-200 hover:text-red-700"
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
          <CardContent className="px-4 pb-4 pt-0 border-t border-gray-100 bg-gradient-to-br from-gray-50/50 to-white">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mt-6">
              <div className="space-y-3">
                <Label className="text-sm font-semibold flex items-center gap-2 text-gray-700">
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
                        start: range?.from || null, 
                        end: range?.to || null 
                      } 
                    })
                  }
                  className="w-full"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold flex items-center gap-2 text-gray-700">
                  <MapPin className="w-4 h-4 text-green-500" />
                  Location
                </Label>
                <Select
                  value="all-locations"
                  onValueChange={(value) => 
                    updateFilters({ trainers: value === 'all-locations' ? [] : [value] })
                  }
                >
                  <SelectTrigger className="w-full border-gray-200 hover:border-gray-300">
                    <SelectValue placeholder="Select location..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-locations">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        All Locations
                      </div>
                    </SelectItem>
                    {filterOptions.locations.map(location => (
                      <SelectItem key={location} value={location}>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {location}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold flex items-center gap-2 text-gray-700">
                  <Users className="w-4 h-4 text-purple-500" />
                  Trainers
                </Label>
                <Select
                  value="all-trainers"
                  onValueChange={(value) => 
                    updateFilters({ trainers: value === 'all-trainers' ? [] : [value] })
                  }
                >
                  <SelectTrigger className="w-full border-gray-200 hover:border-gray-300">
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

              <div className="space-y-3">
                <Label className="text-sm font-semibold flex items-center gap-2 text-gray-700">
                  <BarChart3 className="w-4 h-4 text-orange-500" />
                  Class Types
                </Label>
                <Select
                  value="all-classes"
                  onValueChange={(value) => 
                    updateFilters({ classTypes: value === 'all-classes' ? [] : [value] })
                  }
                >
                  <SelectTrigger className="w-full border-gray-200 hover:border-gray-300">
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

              <div className="space-y-3">
                <Label className="text-sm font-semibold flex items-center gap-2 text-gray-700">
                  <Calendar className="w-4 h-4 text-indigo-500" />
                  Day of Week
                </Label>
                <Select
                  value="all-days"
                  onValueChange={(value) => 
                    updateFilters({ dayOfWeek: value === 'all-days' ? [] : [value] })
                  }
                >
                  <SelectTrigger className="w-full border-gray-200 hover:border-gray-300">
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

              <div className="space-y-3">
                <Label className="text-sm font-semibold flex items-center gap-2 text-gray-700">
                  <Clock className="w-4 h-4 text-red-500" />
                  Time Slots
                </Label>
                <Select
                  value="all-times"
                  onValueChange={(value) => 
                    updateFilters({ timeSlots: value === 'all-times' ? [] : [value] })
                  }
                >
                  <SelectTrigger className="w-full border-gray-200 hover:border-gray-300">
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

            {/* Active Filters Summary */}
            {hasActiveFilters && (
              <div className="mt-6 p-4 bg-blue-50/50 rounded-lg border-l-4 border-blue-500">
                <h4 className="text-sm font-semibold text-blue-800 mb-2">Active Filters:</h4>
                <div className="flex flex-wrap gap-2">
                  {filters.trainers.map(trainer => (
                    <Badge key={trainer} variant="secondary" className="bg-blue-100 text-blue-800">
                      Trainer: {trainer}
                      <X 
                        className="w-3 h-3 ml-1 cursor-pointer" 
                        onClick={() => updateFilters({ trainers: filters.trainers.filter(t => t !== trainer) })}
                      />
                    </Badge>
                  ))}
                  {filters.classTypes.map(classType => (
                    <Badge key={classType} variant="secondary" className="bg-orange-100 text-orange-800">
                      Class: {classType}
                      <X 
                        className="w-3 h-3 ml-1 cursor-pointer" 
                        onClick={() => updateFilters({ classTypes: filters.classTypes.filter(c => c !== classType) })}
                      />
                    </Badge>
                  ))}
                  {filters.dayOfWeek.map(day => (
                    <Badge key={day} variant="secondary" className="bg-indigo-100 text-indigo-800">
                      Day: {day}
                      <X 
                        className="w-3 h-3 ml-1 cursor-pointer" 
                        onClick={() => updateFilters({ dayOfWeek: filters.dayOfWeek.filter(d => d !== day) })}
                      />
                    </Badge>
                  ))}
                  {filters.timeSlots.map(time => (
                    <Badge key={time} variant="secondary" className="bg-red-100 text-red-800">
                      Time: {time}
                      <X 
                        className="w-3 h-3 ml-1 cursor-pointer" 
                        onClick={() => updateFilters({ timeSlots: filters.timeSlots.filter(t => t !== time) })}
                      />
                    </Badge>
                  ))}
                  {(filters.dateRange.start || filters.dateRange.end) && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Date Range
                      <X 
                        className="w-3 h-3 ml-1 cursor-pointer" 
                        onClick={() => updateFilters({ dateRange: { start: null, end: null } })}
                      />
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};