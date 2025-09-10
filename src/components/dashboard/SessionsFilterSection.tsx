
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CalendarIcon, 
  Filter, 
  X, 
  ChevronDown, 
  Search,
  Users,
  Activity,
  Clock,
  Calendar
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useSessionsFilters } from '@/contexts/SessionsFiltersContext';
import { SessionData } from '@/hooks/useSessionsData';

interface SessionsFilterSectionProps {
  data: SessionData[];
}

export const SessionsFilterSection: React.FC<SessionsFilterSectionProps> = ({ data }) => {
  const { filters, updateFilters, clearFilters } = useSessionsFilters();
  const [openPopover, setOpenPopover] = useState<string | null>(null);

  // Extract unique filter options from data
  const filterOptions = useMemo(() => {
    const trainers = [...new Set(data.map(session => session.trainerName).filter(Boolean))].sort();
    const classTypes = [...new Set(data.map(session => session.cleanedClass).filter(Boolean))].sort();
    const daysOfWeek = [...new Set(data.map(session => session.dayOfWeek).filter(Boolean))].sort();
    const timeSlots = [...new Set(data.map(session => session.time).filter(Boolean))].sort();

    return {
      trainers,
      classTypes,
      daysOfWeek,
      timeSlots
    };
  }, [data]);

  const filterConfigs = [
    {
      key: 'trainers',
      label: 'Trainers',
      icon: Users,
      options: filterOptions.trainers,
      values: filters.trainers,
      description: 'Filter by class instructors'
    },
    {
      key: 'classTypes',
      label: 'Class Types',
      icon: Activity,
      options: filterOptions.classTypes,
      values: filters.classTypes,
      description: 'Filter by class formats'
    },
    {
      key: 'dayOfWeek',
      label: 'Days of Week',
      icon: Calendar,
      options: filterOptions.daysOfWeek,
      values: filters.dayOfWeek,
      description: 'Filter by day of week'
    },
    {
      key: 'timeSlots',
      label: 'Time Slots',
      icon: Clock,
      options: filterOptions.timeSlots,
      values: filters.timeSlots,
      description: 'Filter by class times'
    }
  ];

  const handleFilterChange = (filterKey: string, value: string) => {
    const currentValues = [...(filters[filterKey as keyof typeof filters] as string[])];
    const index = currentValues.indexOf(value);
    
    if (index > -1) {
      currentValues.splice(index, 1);
    } else {
      currentValues.push(value);
    }
    
    updateFilters({ 
      [filterKey]: currentValues 
    });
  };

  const handleDateRangeChange = (type: 'start' | 'end', date: Date | null) => {
    updateFilters({
      dateRange: {
        ...filters.dateRange,
        [type]: date
      }
    });
  };

  const clearFilter = (filterKey: string) => {
    updateFilters({
      [filterKey]: []
    });
  };

  const activeFilterCount = filterConfigs.reduce((count, config) => {
    return count + config.values.length;
  }, 0) + (filters.dateRange.start ? 1 : 0) + (filters.dateRange.end ? 1 : 0);

  const MultiSelectFilter = ({ config }: { config: typeof filterConfigs[0] }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <config.icon className="w-4 h-4 text-muted-foreground" />
          <label className="font-medium text-sm">{config.label}</label>
          {config.values.length > 0 && (
            <Badge variant="secondary" className="text-xs min-w-[20px] text-center">
              {config.values.length}
            </Badge>
          )}
        </div>
        {config.values.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => clearFilter(config.key)}
            className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            Clear
          </Button>
        )}
      </div>
      
      <Popover 
        open={openPopover === config.key} 
        onOpenChange={(open) => setOpenPopover(open ? config.key : null)}
      >
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full justify-between text-left font-normal h-9"
            size="sm"
          >
            <span className="truncate">
              {config.values.length > 0 
                ? `${config.values.length} selected`
                : `Select ${config.label.toLowerCase()}`
              }
            </span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <Command>
            <CommandInput placeholder={`Search ${config.label.toLowerCase()}...`} />
            <CommandList>
              <CommandEmpty>No {config.label.toLowerCase()} found.</CommandEmpty>
              <CommandGroup>
                {config.options.map((option) => (
                  <CommandItem
                    key={option}
                    onSelect={() => handleFilterChange(config.key, option)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center space-x-2">
                      <div className={cn(
                        "flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        config.values.includes(option)
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible"
                      )}>
                        <Search className="h-3 w-3" />
                      </div>
                      <span>{option}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      {config.values.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {config.values.slice(0, 3).map((value) => (
            <Badge 
              key={value} 
              variant="secondary" 
              className="text-xs cursor-pointer hover:bg-destructive/10 min-w-[60px] max-w-[120px] truncate text-center"
              onClick={() => handleFilterChange(config.key, value)}
            >
              <span className="truncate">{value}</span>
              <X className="h-3 w-3 ml-1 flex-shrink-0" />
            </Badge>
          ))}
          {config.values.length > 3 && (
            <Badge variant="outline" className="text-xs min-w-[60px] text-center">
              +{config.values.length - 3} more
            </Badge>
          )}
        </div>
      )}
      
      <p className="text-xs text-muted-foreground mt-1">{config.description}</p>
    </div>
  );

  return (
    <Card className="bg-background shadow-sm border">
      <CardHeader className="border-b pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-primary" />
            Session Filters
          </CardTitle>
          <div className="flex items-center gap-2">
            {activeFilterCount > 0 && (
              <Badge className="bg-primary text-primary-foreground min-w-[60px] text-center">
                {activeFilterCount} Active
              </Badge>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearFilters}
              disabled={activeFilterCount === 0}
              className="gap-1 h-8"
            >
              <X className="h-4 w-4" />
              Clear All
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <Tabs defaultValue="filters" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="filters">Filter Options</TabsTrigger>
            <TabsTrigger value="dateRange">Date Range</TabsTrigger>
          </TabsList>
          
          <TabsContent value="filters" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filterConfigs.map((config) => (
                <MultiSelectFilter key={config.key} config={config} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="dateRange" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-medium text-sm flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    Start Date
                  </label>
                  {filters.dateRange.start && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDateRangeChange('start', null)}
                      className="h-6 px-2 text-xs"
                    >
                      Clear
                    </Button>
                  )}
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-left font-normal h-9"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateRange.start 
                        ? format(filters.dateRange.start, 'PPP')
                        : 'Select start date'
                      }
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={filters.dateRange.start || undefined}
                      onSelect={(date) => handleDateRangeChange('start', date || null)}
                      disabled={(date) => 
                        filters.dateRange.end 
                          ? date > filters.dateRange.end 
                          : false
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-medium text-sm flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    End Date
                  </label>
                  {filters.dateRange.end && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDateRangeChange('end', null)}
                      className="h-6 px-2 text-xs"
                    >
                      Clear
                    </Button>
                  )}
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-left font-normal h-9"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateRange.end 
                        ? format(filters.dateRange.end, 'PPP')
                        : 'Select end date'
                      }
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={filters.dateRange.end || undefined}
                      onSelect={(date) => handleDateRangeChange('end', date || null)}
                      disabled={(date) => 
                        filters.dateRange.start 
                          ? date < filters.dateRange.start 
                          : false
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
