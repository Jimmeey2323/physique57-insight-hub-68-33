import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLateCancellationsData } from '@/hooks/useLateCancellationsData';
import { useGlobalLoading } from '@/hooks/useGlobalLoading';
import { RefinedLoader } from '@/components/ui/RefinedLoader';
import { LateCancellationsMetricCards } from '@/components/dashboard/LateCancellationsMetricCards';
import { LateCancellationsInteractiveCharts } from '@/components/dashboard/LateCancellationsInteractiveCharts';
import { EnhancedLateCancellationsTopBottomLists } from '@/components/dashboard/EnhancedLateCancellationsTopBottomLists';
import { EnhancedLateCancellationsDataTables } from '@/components/dashboard/EnhancedLateCancellationsDataTables';
import { EnhancedLateCancellationsFilterSection } from '@/components/dashboard/EnhancedLateCancellationsFilterSection';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Home, XCircle } from 'lucide-react';
import { Footer } from '@/components/ui/footer';
import { AdvancedExportButton } from '@/components/ui/AdvancedExportButton';
import { LateCancellationsDrillDownModal } from '@/components/dashboard/LateCancellationsDrillDownModal';
import { ModernHeroSection } from '@/components/ui/ModernHeroSection';
import { formatNumber } from '@/utils/formatters';

const LateCancellations = () => {
  const { data: lateCancellationsData, loading } = useLateCancellationsData();
  const { isLoading, setLoading } = useGlobalLoading();
  const navigate = useNavigate();
  
  // Location tabs state
  const [activeLocation, setActiveLocation] = useState('all');
  
  // Enhanced filter states - Default to previous month
  const [selectedTimeframe, setSelectedTimeframe] = useState('prev-month');
  const [selectedTrainer, setSelectedTrainer] = useState('all');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState('all');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  
  // Drill down modal state
  const [drillDownData, setDrillDownData] = useState<any>(null);
  const [isDrillDownOpen, setIsDrillDownOpen] = useState(false);
  
  // Get unique locations for tabs
  const locations = useMemo(() => {
    if (!Array.isArray(lateCancellationsData)) return [];
    const uniqueLocations = Array.from(new Set(lateCancellationsData.map(item => item?.location).filter(Boolean)));
    return [
      { id: 'all', name: 'All Locations' },
      { id: 'kwality', name: 'Kwality House' },
      { id: 'supreme', name: 'Supreme HQ' },
      { id: 'kenkere', name: 'Kenkere House' }
    ].filter(loc => loc.id === 'all' || uniqueLocations.some(ul => 
      loc.id === 'kwality' ? ul.includes('Kwality') :
      loc.id === 'supreme' ? ul.includes('Supreme') :
      loc.id === 'kenkere' ? ul.includes('Kenkere') : false
    ));
  }, [lateCancellationsData]);
  
  // Enhanced filter data based on all selected filters
  const filteredData = useMemo(() => {
    if (!Array.isArray(lateCancellationsData)) return [];
    
    let filtered = lateCancellationsData;
    
    // Location tab filter
    if (activeLocation !== 'all') {
      filtered = filtered.filter(item => {
        const location = item?.location || '';
        return activeLocation === 'kwality' ? location.includes('Kwality') :
               activeLocation === 'supreme' ? location.includes('Supreme') :
               activeLocation === 'kenkere' ? location.includes('Kenkere') : true;
      });
    }
    
    // Trainer filter
    if (selectedTrainer !== 'all') {
      filtered = filtered.filter(item => item?.teacherName === selectedTrainer);
    }
    
    // Class filter
    if (selectedClass !== 'all') {
      filtered = filtered.filter(item => item?.cleanedClass === selectedClass);
    }
    
    // Product filter
    if (selectedProduct !== 'all') {
      filtered = filtered.filter(item => item?.cleanedProduct === selectedProduct);
    }
    
    // Time slot filter
    if (selectedTimeSlot !== 'all') {
      filtered = filtered.filter(item => {
        if (!item?.time) return false;
        const hour = parseInt(item.time.split(':')[0]);
        switch (selectedTimeSlot) {
          case 'morning':
            return hour >= 6 && hour < 12;
          case 'afternoon':
            return hour >= 12 && hour < 17;
          case 'evening':
            return hour >= 17 && hour < 22;
          case 'late':
            return hour >= 22 || hour < 6;
          default:
            return true;
        }
      });
    }
    
    // Timeframe filter
    if (selectedTimeframe !== 'all') {
      const now = new Date();
      let startDate = new Date();
      let endDate = new Date();
      
      switch (selectedTimeframe) {
        case '1w':
          startDate.setDate(now.getDate() - 7);
          break;
        case '2w':
          startDate.setDate(now.getDate() - 14);
          break;
        case '1m':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'prev-month':
          // Previous complete month
          const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
          startDate = lastMonth;
          endDate = lastMonthEnd;
          filtered = filtered.filter(item => {
            if (!item?.dateIST) return false;
            const itemDate = new Date(item.dateIST);
            return itemDate >= startDate && itemDate <= endDate;
          });
          return filtered;
        case '3m':
          startDate.setMonth(now.getMonth() - 3);
          break;
        case '6m':
          startDate.setMonth(now.getMonth() - 6);
          break;
        case '1y':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
        case 'custom':
          if (dateRange.start || dateRange.end) {
            const customStart = dateRange.start ? new Date(dateRange.start) : new Date('2020-01-01');
            const customEnd = dateRange.end ? new Date(dateRange.end) : now;
            filtered = filtered.filter(item => {
              if (!item?.dateIST) return false;
              const itemDate = new Date(item.dateIST);
              return itemDate >= customStart && itemDate <= customEnd;
            });
          }
          return filtered;
        default:
          return filtered;
      }
      
      filtered = filtered.filter(item => {
        if (!item?.dateIST) return false;
        const itemDate = new Date(item.dateIST);
        return itemDate >= startDate && itemDate <= now;
      });
    }
    
    return filtered;
  }, [lateCancellationsData, activeLocation, selectedTimeframe, selectedTrainer, selectedClass, selectedProduct, selectedTimeSlot, dateRange]);

  // Clear all filters function
  const clearAllFilters = () => {
    setSelectedTimeframe('prev-month');
    setSelectedTrainer('all');
    setSelectedClass('all');
    setSelectedProduct('all');
    setSelectedTimeSlot('all');
    setDateRange({ start: '', end: '' });
  };

  // Handle drill down click
  const handleDrillDownClick = (data: any) => {
    setDrillDownData(data);
    setIsDrillDownOpen(true);
  };

  // Filter data for charts (exempt from date range)
  const chartData = useMemo(() => {
    if (!Array.isArray(lateCancellationsData)) return [];
    
    let filtered = lateCancellationsData;
    
    // Apply all filters except timeframe for charts
    if (activeLocation !== 'all') {
      filtered = filtered.filter(item => {
        const location = item?.location || '';
        return activeLocation === 'kwality' ? location.includes('Kwality') :
               activeLocation === 'supreme' ? location.includes('Supreme') :
               activeLocation === 'kenkere' ? location.includes('Kenkere') : true;
      });
    }
    
    if (selectedTrainer !== 'all') {
      filtered = filtered.filter(item => item?.teacherName === selectedTrainer);
    }
    
    if (selectedClass !== 'all') {
      filtered = filtered.filter(item => item?.cleanedClass === selectedClass);
    }
    
    if (selectedProduct !== 'all') {
      filtered = filtered.filter(item => item?.cleanedProduct === selectedProduct);
    }
    
    if (selectedTimeSlot !== 'all') {
      filtered = filtered.filter(item => {
        if (!item?.time) return false;
        const hour = parseInt(item.time.split(':')[0]);
        switch (selectedTimeSlot) {
          case 'morning':
            return hour >= 6 && hour < 12;
          case 'afternoon':
            return hour >= 12 && hour < 17;
          case 'evening':
            return hour >= 17 && hour < 22;
          case 'late':
            return hour >= 22 || hour < 6;
          default:
            return true;
        }
      });
    }
    
    return filtered;
  }, [lateCancellationsData, activeLocation, selectedTrainer, selectedClass, selectedProduct, selectedTimeSlot]);

  const heroMetrics = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return [];

    const locations = [
      { key: 'Kwality', name: 'Kwality' },
      { key: 'Supreme', name: 'Supreme' },
      { key: 'Kenkere', name: 'Kenkere' }
    ];

    return locations.map(location => {
      const locationData = filteredData.filter(item => 
        item.location?.includes(location.key)
      );
      
      const totalCancellations = locationData.length;
      
      return {
        location: location.name,
        label: 'Filtered Cancellations',
        value: formatNumber(totalCancellations)
      };
    });
  }, [filteredData]);

  useEffect(() => {
    setLoading(loading, 'Loading late cancellations data...');
  }, [loading, setLoading]);

  if (isLoading) {
    return <RefinedLoader subtitle="Loading late cancellations analytics data..." />;
  }

  const exportButton = (
    <AdvancedExportButton 
      lateCancellationsData={filteredData}
      defaultFileName={`late-cancellations-${activeLocation}`}
      size="sm"
      variant="ghost"
    />
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/20">
      <ModernHeroSection 
        title="Late Cancellations"
        subtitle="Comprehensive analysis of late cancellation patterns across locations, classes, trainers, and products"
        variant="cancellations"
        metrics={heroMetrics}
        exportButton={exportButton}
      />

      {/* Main Content */}
      <div className="relative">
        <div className="container mx-auto px-6 py-8">
          {/* Location Tabs */}
          <Tabs value={activeLocation} onValueChange={setActiveLocation} className="w-full mb-8">
            <div className="flex justify-center mb-8">
              <TabsList className="bg-white/90 backdrop-blur-sm p-2 rounded-2xl shadow-xl border-0 grid w-full max-w-4xl min-h-16 overflow-hidden" style={{ gridTemplateColumns: `repeat(${locations.length}, 1fr)` }}>
                {locations.map(location => (
                  <TabsTrigger 
                    key={location.id} 
                    value={location.id} 
                    className="relative px-4 py-3 font-semibold text-gray-800 transition-all duration-300 ease-out hover:scale-105 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-gray-50 text-sm rounded-xl"
                  >
                    {location.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {locations.map(location => (
              <TabsContent key={location.id} value={location.id} className="space-y-8">
                <div className="space-y-8">
                  {/* Enhanced Filter Section */}
                  <EnhancedLateCancellationsFilterSection
                    selectedLocation="all"
                    onLocationChange={() => {}}
                    selectedTimeframe={selectedTimeframe}
                    onTimeframeChange={setSelectedTimeframe}
                    selectedTrainer={selectedTrainer}
                    onTrainerChange={setSelectedTrainer}
                    selectedClass={selectedClass}
                    onClassChange={setSelectedClass}
                    selectedProduct={selectedProduct}
                    onProductChange={setSelectedProduct}
                    selectedTimeSlot={selectedTimeSlot}
                    onTimeSlotChange={setSelectedTimeSlot}
                    dateRange={dateRange}
                    onDateRangeChange={setDateRange}
                    data={lateCancellationsData}
                    onClearFilters={clearAllFilters}
                  />
                  
                  {/* Metric Cards */}
                  <LateCancellationsMetricCards data={filteredData} onMetricClick={handleDrillDownClick} />
                  
                  {/* Interactive Charts */}
                  <LateCancellationsInteractiveCharts data={chartData} />
                  
                  {/* Enhanced Top/Bottom Lists (Side by Side) */}
                  <EnhancedLateCancellationsTopBottomLists data={filteredData} />
                  
                  {/* Enhanced Detailed Data Tables with Pagination */}
                  <EnhancedLateCancellationsDataTables data={filteredData} onDrillDown={handleDrillDownClick} />
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
      
      {/* Drill Down Modal */}
      <LateCancellationsDrillDownModal
        isOpen={isDrillDownOpen}
        onClose={() => setIsDrillDownOpen(false)}
        data={drillDownData}
      />
      
      <Footer />
    </div>
  );
};

export default LateCancellations;
