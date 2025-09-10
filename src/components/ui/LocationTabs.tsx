import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Users, MapPin, Building2 } from 'lucide-react';

interface Location {
  id: string;
  name: string;
  fullName: string;
  count?: number;
}

interface LocationTabsProps {
  locations: Location[];
  selectedLocation: string;
  onLocationChange: (locationId: string) => void;
  variant?: 'buttons' | 'tabs';
  showCounts?: boolean;
}

export const LocationTabs: React.FC<LocationTabsProps> = ({
  locations,
  selectedLocation,
  onLocationChange,
  variant = 'buttons',
  showCounts = true
}) => {
  if (variant === 'buttons') {
    return (
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            {locations.map((location) => (
              <Button
                key={location.id}
                variant={selectedLocation === location.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onLocationChange(location.id)}
                className="gap-2 text-xs"
              >
                {location.id === 'all' || location.id === 'All Locations' ? 
                  <Building2 className="w-4 h-4" /> : 
                  <MapPin className="w-4 h-4" />
                }
                {location.name} {showCounts && location.count !== undefined && `(${location.count})`}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default tabs variant
  return (
    <Card className="bg-white shadow-sm border border-gray-200 overflow-hidden">
      <CardContent className="p-2">
        <div className="grid grid-cols-4 bg-gradient-to-r from-slate-100 to-slate-200 p-2 rounded-2xl h-auto gap-2">
          {locations.map((location) => (
            <button
              key={location.id}
              onClick={() => onLocationChange(location.id)}
              className={`rounded-xl px-6 py-4 font-semibold text-sm transition-all duration-300 flex items-center gap-2 justify-center ${
                selectedLocation === location.id
                  ? 'bg-white shadow-md text-gray-900'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              {location.id === 'all' || location.id === 'All Locations' ? 
                <Building2 className="w-4 h-4" /> : 
                <MapPin className="w-4 h-4" />
              }
              <div className="text-center">
                <div className="font-bold">{location.name}</div>
                {showCounts && location.count !== undefined && (
                  <div className="text-xs opacity-75">({location.count})</div>
                )}
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};