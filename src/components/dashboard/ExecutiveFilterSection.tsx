import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  MapPin, 
  Calendar, 
  Users, 
  Package, 
  CreditCard,
  X
} from 'lucide-react';
import { useGlobalFilters } from '@/contexts/GlobalFiltersContext';
import { getPreviousMonthDisplay } from '@/utils/dateUtils';

interface ExecutiveFilterSectionProps {
  availableLocations: string[];
}

export const ExecutiveFilterSection: React.FC<ExecutiveFilterSectionProps> = ({ 
  availableLocations 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { filters, updateFilters, clearFilters } = useGlobalFilters();

  const handleLocationSelect = (location: string) => {
    const currentLocations = Array.isArray(filters.location) ? filters.location : [];
    
    if (location === 'all') {
      updateFilters({ location: [] });
    } else {
      const isSelected = currentLocations.includes(location);
      if (isSelected) {
        updateFilters({ 
          location: currentLocations.filter(l => l !== location) 
        });
      } else {
        updateFilters({ 
          location: [location] // Only allow single location selection for executive summary
        });
      }
    }
  };

  const selectedLocation = Array.isArray(filters.location) ? filters.location[0] : filters.location;
  const hasActiveFilters = (filters.location && filters.location.length > 0);

  return (
    <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <Filter className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-xl font-bold text-gray-900">Filters & Controls</span>
                  <p className="text-sm text-gray-600 font-normal">
                    Data filtered for {getPreviousMonthDisplay()}
                    {selectedLocation && ` • ${selectedLocation}`}
                  </p>
                </div>
                {hasActiveFilters && (
                  <Badge className="bg-blue-100 text-blue-800 ml-2">
                    {filters.location?.length || 0} filter{filters.location?.length !== 1 ? 's' : ''} active
                  </Badge>
                )}
              </CardTitle>
              <div className="flex items-center gap-2">
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearFilters();
                    }}
                    className="text-gray-600 hover:text-red-600"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Clear
                  </Button>
                )}
                {isOpen ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0 space-y-6">
            {/* Date Range Info */}
            <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <Calendar className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-900">Date Range</p>
                <p className="text-sm text-blue-700">
                  Showing data for {getPreviousMonthDisplay()} (Previous Month)
                </p>
              </div>
            </div>

            {/* Location Filter */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Location Filter</h3>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={!selectedLocation ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleLocationSelect('all')}
                  className="flex items-center gap-2"
                >
                  <MapPin className="w-4 h-4" />
                  All Locations
                </Button>
                
                {availableLocations.map((location) => (
                  <Button
                    key={location}
                    variant={selectedLocation === location ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleLocationSelect(location)}
                    className="flex items-center gap-2"
                  >
                    {location}
                    {selectedLocation === location && (
                      <Badge className="bg-white/20 text-current ml-1">Active</Badge>
                    )}
                  </Button>
                ))}
              </div>
            </div>

            {/* Filter Summary */}
            {hasActiveFilters && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Active Filters Summary</h4>
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>Location: {selectedLocation || 'All'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Period: {getPreviousMonthDisplay()}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};