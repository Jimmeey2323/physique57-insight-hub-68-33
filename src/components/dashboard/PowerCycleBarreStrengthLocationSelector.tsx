import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { MapPin, Building2, Users } from 'lucide-react';
import { PayrollData } from '@/types/dashboard';

interface PowerCycleBarreStrengthLocationSelectorProps {
  data: PayrollData[];
  selectedLocation: string;
  onLocationChange: (location: string) => void;
}

export const PowerCycleBarreStrengthLocationSelector: React.FC<PowerCycleBarreStrengthLocationSelectorProps> = ({
  data,
  selectedLocation,
  onLocationChange
}) => {
  const locationStats = React.useMemo(() => {
    const stats = new Map();
    
    // Add "all" option
    const allStats = {
      name: 'All Locations',
      sessions: data.reduce((sum, item) => sum + (item.totalSessions || 0), 0),
      revenue: data.reduce((sum, item) => sum + (item.totalPaid || 0), 0),
      trainers: new Set(data.map(item => item.teacherName)).size
    };
    stats.set('all', allStats);
    
    // Calculate stats per location
    const locations = [...new Set(data.map(item => item.location))].filter(Boolean);
    
    locations.forEach(location => {
      const locationData = data.filter(item => item.location === location);
      stats.set(location, {
        name: location,
        sessions: locationData.reduce((sum, item) => sum + (item.totalSessions || 0), 0),
        revenue: locationData.reduce((sum, item) => sum + (item.totalPaid || 0), 0),
        trainers: new Set(locationData.map(item => item.teacherName)).size
      });
    });
    
    return stats;
  }, [data]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(amount);
  };

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-0 shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <MapPin className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">Location Analysis</h3>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            {locationStats.size - 1} Locations
          </Badge>
        </div>
        
        <Tabs value={selectedLocation} onValueChange={onLocationChange} className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 bg-white/50 p-2 h-auto">
            {Array.from(locationStats.entries()).map(([key, stats]) => (
              <TabsTrigger
                key={key}
                value={key}
                className="flex flex-col items-center gap-2 p-4 h-auto data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all duration-200 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  {key === 'all' ? (
                    <Building2 className="w-4 h-4" />
                  ) : (
                    <MapPin className="w-4 h-4" />
                  )}
                  <span className="font-medium text-sm">
                    {key === 'all' ? 'All' : stats.name}
                  </span>
                </div>
                
                <div className="text-xs space-y-1 text-center opacity-80">
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span>{stats.sessions} sessions</span>
                  </div>
                  <div>{formatCurrency(stats.revenue)}</div>
                  <div>{stats.trainers} trainers</div>
                </div>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </CardContent>
    </Card>
  );
};