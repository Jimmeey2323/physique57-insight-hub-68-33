
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Building2 } from 'lucide-react';
import { SalesData } from '@/types/dashboard';
import { formatNumber } from '@/utils/formatters';

interface DiscountLocationSelectorProps {
  data: SalesData[];
  selectedLocation: string;
  onLocationChange: (location: string) => void;
}

export const DiscountLocationSelector: React.FC<DiscountLocationSelectorProps> = ({
  data,
  selectedLocation,
  onLocationChange
}) => {
  const locationStats = React.useMemo(() => {
    const stats = data.reduce((acc, item) => {
      const location = item.calculatedLocation || 'Unknown';
      if (!acc[location]) {
        acc[location] = { 
          total: 0, 
          discounted: 0,
          totalDiscount: 0
        };
      }
      acc[location].total += 1;
      if ((item.discountAmount || 0) > 0) {
        acc[location].discounted += 1;
        acc[location].totalDiscount += item.discountAmount || 0;
      }
      return acc;
    }, {} as Record<string, { total: number; discounted: number; totalDiscount: number }>);

    const allStats = Object.entries(stats).map(([location, data]) => ({
      location,
      ...data,
      discountRate: data.total > 0 ? (data.discounted / data.total) * 100 : 0
    }));

    const totalAll = data.length;
    const discountedAll = data.filter(item => (item.discountAmount || 0) > 0).length;
    const totalDiscountAll = data.reduce((sum, item) => sum + (item.discountAmount || 0), 0);

    return [
      {
        location: 'all',
        total: totalAll,
        discounted: discountedAll,
        totalDiscount: totalDiscountAll,
        discountRate: totalAll > 0 ? (discountedAll / totalAll) * 100 : 0
      },
      ...allStats.sort((a, b) => b.discounted - a.discounted)
    ];
  }, [data]);

  return (
    <Card className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/20 border-0 shadow-xl">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
              Location Analysis
            </h3>
            <p className="text-sm text-slate-600">Select a location to filter discount analysis</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {locationStats.map((stat) => (
            <Button
              key={stat.location}
              variant={selectedLocation === stat.location ? "default" : "outline"}
              onClick={() => onLocationChange(stat.location)}
              className={`
                h-auto p-4 flex flex-col items-start space-y-2 text-left transition-all duration-300 hover:scale-105
                ${selectedLocation === stat.location 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' 
                  : 'bg-white hover:bg-blue-50 border-blue-200'
                }
              `}
            >
              <div className="flex items-center gap-2 w-full">
                <Building2 className="w-4 h-4 flex-shrink-0" />
                <span className="font-semibold text-sm truncate">
                  {stat.location === 'all' ? 'All Locations' : stat.location}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 w-full text-xs">
                <div>
                  <span className="opacity-75">Total:</span>
                  <div className="font-bold">{formatNumber(stat.total)}</div>
                </div>
                <div>
                  <span className="opacity-75">Discounted:</span>
                  <div className="font-bold">{formatNumber(stat.discounted)}</div>
                </div>
              </div>

              <div className="flex items-center justify-between w-full">
                <Badge 
                  variant={selectedLocation === stat.location ? "secondary" : "outline"}
                  className={`text-xs ${
                    selectedLocation === stat.location 
                      ? 'bg-white/20 text-white border-white/30' 
                      : 'border-blue-300 text-blue-700'
                  }`}
                >
                  {stat.discountRate.toFixed(1)}% rate
                </Badge>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};