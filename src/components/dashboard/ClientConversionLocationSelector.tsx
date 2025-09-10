
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin } from 'lucide-react';
import { NewClientData } from '@/types/dashboard';

interface ClientConversionLocationSelectorProps {
  data: NewClientData[];
  selectedLocation: string;
  onLocationChange: (location: string) => void;
}

// Normalize location names for deduplication and display
const normalizeLocation = (loc: string = '') => {
  const l = loc.trim().toLowerCase();
  if (l.includes('kemps') || l.includes('kwality')) return 'Kwality House, Kemps Corner';
  if (l.includes('bandra') || l.includes('supreme')) return 'Supreme HQ, Bandra';
  if (l.includes('bengaluru') || l.includes('kenkere')) return 'Kenkere House, Bengaluru';
  if (l.includes('juhu')) return 'Juhu';
  return loc.trim();
};

export const ClientConversionLocationSelector: React.FC<ClientConversionLocationSelectorProps> = ({
  data,
  selectedLocation,
  onLocationChange
}) => {
  // Get all possible locations, normalize, deduplicate, and sort
  const allLocations = data
    .map(item => normalizeLocation(item.firstVisitLocation) || normalizeLocation(item.homeLocation))
    .filter(Boolean);
  const uniqueLocations = Array.from(new Set(allLocations)).sort();

  return (
    <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0">
      <CardContent className="p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <MapPin className="w-5 h-5 text-purple-600" />
          <label className="text-sm font-medium text-gray-700">Filter by Location:</label>
          <Select
            value={selectedLocation}
            onValueChange={onLocationChange}
          >
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Select location..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {uniqueLocations.map(location => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};
