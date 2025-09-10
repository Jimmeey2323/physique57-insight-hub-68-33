
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { CalendarIcon, Filter, X, ChevronDown, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { FilterOptions } from '@/types/dashboard';
import { cn } from '@/lib/utils';

interface AutoCloseFilterSectionProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onReset: () => void;
}

export const AutoCloseFilterSection: React.FC<AutoCloseFilterSectionProps> = ({
  filters,
  onFiltersChange,
  onReset,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(
    filters.dateRange.start ? new Date(filters.dateRange.start) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    filters.dateRange.end ? new Date(filters.dateRange.end) : undefined
  );
  const [tempFilters, setTempFilters] = useState<FilterOptions>(filters);

  const applyFilters = () => {
    const updatedFilters = {
      ...tempFilters,
      dateRange: {
        start: startDate ? format(startDate, 'yyyy-MM-dd') : '',
        end: endDate ? format(endDate, 'yyyy-MM-dd') : '',
      },
    };
    onFiltersChange(updatedFilters);
    setIsOpen(false); // Auto-close after applying
  };

  const resetFilters = () => {
    onReset();
    setStartDate(undefined);
    setEndDate(undefined);
    setTempFilters({
      dateRange: { start: '', end: '' },
      location: [],
      category: [],
      product: [],
      soldBy: [],
      paymentMethod: []
    });
    setIsOpen(false); // Auto-close after reset
  };

  const removeFilter = (type: keyof FilterOptions, value: string) => {
    if (type === 'dateRange') {
      setStartDate(undefined);
      setEndDate(undefined);
      onFiltersChange({
        ...filters,
        dateRange: { start: '', end: '' }
      });
    } else if (Array.isArray(filters[type])) {
      const newFilters = (filters[type] as string[]).filter(item => item !== value);
      onFiltersChange({
        ...filters,
        [type]: newFilters
      });
    }
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    if (filters.category?.length) count += filters.category.length;
    if (filters.paymentMethod?.length) count += filters.paymentMethod.length;
    if (filters.soldBy?.length) count += filters.soldBy.length;
    if (filters.minAmount || filters.maxAmount) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Card className="bg-gradient-to-br from-white via-slate-50/30 to-white border-0 shadow-xl backdrop-blur-sm">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-slate-50/50 transition-colors rounded-t-xl">
            <CardTitle className="flex items-center justify-between text-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
                  <Filter className="w-5 h-5 text-white" />
                </div>
                <span className="bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 bg-clip-text text-transparent">
                  Advanced Filters
                </span>
                {activeFiltersCount > 0 && (
                  <Badge variant="default" className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                    {activeFiltersCount} active
                  </Badge>
                )}
              </div>
              <ChevronDown className={cn("w-5 h-5 transition-transform text-slate-600", isOpen && "rotate-180")} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-6 pt-0">
            {/* Date Range Filter */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Start Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-white/80 backdrop-blur-sm",
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
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">End Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-white/80 backdrop-blur-sm",
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
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Category</label>
              <Select
                value=""
                onValueChange={(value) => {
                  if (!tempFilters.category?.includes(value)) {
                    setTempFilters({
                      ...tempFilters,
                      category: [...(tempFilters.category || []), value]
                    });
                  }
                }}
              >
                <SelectTrigger className="bg-white/80 backdrop-blur-sm">
                  <SelectValue placeholder="Select categories..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="membership">Membership</SelectItem>
                  <SelectItem value="class-packages">Class Packages</SelectItem>
                  <SelectItem value="merchandise">Merchandise</SelectItem>
                  <SelectItem value="personal-training">Personal Training</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Amount Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Min Amount</label>
                <Input
                  type="number"
                  placeholder="₹0"
                  value={tempFilters.minAmount || ''}
                  onChange={(e) => setTempFilters({
                    ...tempFilters,
                    minAmount: e.target.value ? Number(e.target.value) : undefined
                  })}
                  className="bg-white/80 backdrop-blur-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Max Amount</label>
                <Input
                  type="number"
                  placeholder="₹100,000"
                  value={tempFilters.maxAmount || ''}
                  onChange={(e) => setTempFilters({
                    ...tempFilters,
                    maxAmount: e.target.value ? Number(e.target.value) : undefined
                  })}
                  className="bg-white/80 backdrop-blur-sm"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-slate-200/50">
              <Button onClick={applyFilters} className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                Apply Filters
              </Button>
              <Button onClick={resetFilters} variant="outline" className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Reset
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <CardContent className="pt-0 pb-4">
          <div className="flex flex-wrap gap-2">
            {(filters.dateRange.start || filters.dateRange.end) && (
              <Badge variant="secondary" className="gap-1">
                Date: {filters.dateRange.start || '...'} to {filters.dateRange.end || '...'}
                <X 
                  className="w-3 h-3 cursor-pointer hover:text-red-500" 
                  onClick={() => removeFilter('dateRange', '')}
                />
              </Badge>
            )}
            {filters.category?.map(cat => (
              <Badge key={cat} variant="secondary" className="gap-1">
                Category: {cat}
                <X 
                  className="w-3 h-3 cursor-pointer hover:text-red-500" 
                  onClick={() => removeFilter('category', cat)}
                />
              </Badge>
            ))}
            {filters.paymentMethod?.map(method => (
              <Badge key={method} variant="secondary" className="gap-1">
                Payment: {method}
                <X 
                  className="w-3 h-3 cursor-pointer hover:text-red-500" 
                  onClick={() => removeFilter('paymentMethod', method)}
                />
              </Badge>
            ))}
            {filters.soldBy?.map(seller => (
              <Badge key={seller} variant="secondary" className="gap-1">
                Sold by: {seller}
                <X 
                  className="w-3 h-3 cursor-pointer hover:text-red-500" 
                  onClick={() => removeFilter('soldBy', seller)}
                />
              </Badge>
            ))}
            {(filters.minAmount || filters.maxAmount) && (
              <Badge variant="secondary" className="gap-1">
                Amount: ₹{filters.minAmount || 0} - ₹{filters.maxAmount || '∞'}
                <X 
                  className="w-3 h-3 cursor-pointer hover:text-red-500" 
                  onClick={() => onFiltersChange({
                    ...filters,
                    minAmount: undefined,
                    maxAmount: undefined
                  })}
                />
              </Badge>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
};
