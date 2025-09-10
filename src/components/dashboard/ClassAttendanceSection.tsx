import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, BarChart3, Users, Target, Filter, MapPin, Building2, Home } from 'lucide-react';
import { useSessionsData, SessionData } from '@/hooks/useSessionsDataDemo';
import { useFilteredSessionsData } from '@/hooks/useFilteredSessionsData';
import { ClassAttendanceFilterSection } from './ClassAttendanceFilterSection';
import { ClassAttendanceMetricCards } from './ClassAttendanceMetricCards';
import { ClassAttendanceInteractiveCharts } from './ClassAttendanceInteractiveCharts';
import { ClassAttendancePerformanceTable } from './ClassAttendancePerformanceTable';
import { ClassAttendanceMonthOnMonthTable } from './ClassAttendanceMonthOnMonthTable';
import { ClassAttendanceUtilizationTable } from './ClassAttendanceUtilizationTable';
import { ClassAttendanceRevenueTable } from './ClassAttendanceRevenueTable';
import { ClassAttendanceEfficiencyTable } from './ClassAttendanceEfficiencyTable';
import { ClassPerformanceRankingTable } from './ClassPerformanceRankingTable';
import { useNavigate } from 'react-router-dom';

const locations = [{
  id: 'all',
  name: 'All Locations',
  fullName: 'All Locations'
}, {
  id: 'Kwality House, Kemps Corner',
  name: 'Kwality House',
  fullName: 'Kwality House, Kemps Corner'
}, {
  id: 'Supreme HQ, Bandra',
  name: 'Supreme HQ',
  fullName: 'Supreme HQ, Bandra'
}, {
  id: 'Kenkere House',
  name: 'Kenkere House',
  fullName: 'Kenkere House'
}];

export const ClassAttendanceSection: React.FC = () => {
  const navigate = useNavigate();
  const { data: sessionsData, loading, error, refetch } = useSessionsData();
  const [activeLocation, setActiveLocation] = useState('all');
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [compareWithTrainer, setCompareWithTrainer] = useState(false);

  // Apply filters to the data
  const filteredData = useFilteredSessionsData(sessionsData || []);

  // Filter data by location
  const locationFilteredData = useMemo(() => {
    if (!filteredData || activeLocation === 'all') return filteredData || [];
    
    const selectedLocation = locations.find(loc => loc.id === activeLocation);
    if (!selectedLocation) return filteredData || [];

    return filteredData.filter(session => {
      if (session.location === selectedLocation.fullName) return true;
      
      const sessionLoc = session.location?.toLowerCase() || '';
      const targetLoc = selectedLocation.fullName.toLowerCase();
      
      if (selectedLocation.id === 'Kwality House, Kemps Corner' && sessionLoc.includes('kwality')) return true;
      if (selectedLocation.id === 'Supreme HQ, Bandra' && sessionLoc.includes('supreme')) return true;
      if (selectedLocation.id === 'Kenkere House' && sessionLoc.includes('kenkere')) return true;
      
      return false;
    });
  }, [filteredData, activeLocation]);

  // Get unique class formats
  const uniqueClassFormats = useMemo(() => {
    if (!locationFilteredData) return [];
    return [...new Set(locationFilteredData.map(session => session.cleanedClass || session.classType).filter(Boolean))];
  }, [locationFilteredData]);

  // Get hosted classes (classes that contain "Hosted" in sessionName)
  const hostedClasses = useMemo(() => {
    if (!locationFilteredData) return [];
    return locationFilteredData.filter(session => 
      session.sessionName?.toLowerCase().includes('hosted') || 
      session.sessionName?.toLowerCase().includes('myriad')
    );
  }, [locationFilteredData]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading class attendance data...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-red-600 mb-4">Error loading data: {error}</p>
          <Button onClick={refetch} variant="outline">Retry</Button>
        </CardContent>
      </Card>
    );
  }

  if (!sessionsData || sessionsData.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-slate-600">No class attendance data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
        {/* Filter Section */}
        <ClassAttendanceFilterSection data={sessionsData || []} />

        {/* Location Tabs */}
        <Tabs value={activeLocation} onValueChange={setActiveLocation} className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="glass-morphism p-2 rounded-2xl shadow-lg border-0 grid grid-cols-4 w-full max-w-4xl">
              {locations.map(location => (
                <TabsTrigger 
                  key={location.id} 
                  value={location.id} 
                  className="tab-modern"
                >
                  <div className="flex items-center gap-2">
                    {location.id === 'all' ? <Building2 className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                    <div className="text-center">
                      <div className="font-bold">{location.name.split(',')[0]}</div>
                      {location.name.includes(',') && <div className="text-xs opacity-75">{location.name.split(',')[1]?.trim()}</div>}
                    </div>
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {locations.map(location => (
            <TabsContent key={location.id} value={location.id} className="space-y-8">
              {/* Key Metric Cards */}
              <ClassAttendanceMetricCards data={locationFilteredData} />

              {/* Interactive Charts Section */}
              <ClassAttendanceInteractiveCharts data={locationFilteredData} />

              {/* Performance Tables Grid */}
              <div className="grid grid-cols-1 gap-8">
                {/* Class Performance Ranking Table */}
                <ClassPerformanceRankingTable data={locationFilteredData} />

                {/* Class Format Performance Table */}
                <ClassAttendancePerformanceTable data={locationFilteredData} />

                {/* Month on Month Analysis */}
                <ClassAttendanceMonthOnMonthTable data={locationFilteredData} />

                {/* Utilization Analysis */}
                <ClassAttendanceUtilizationTable data={locationFilteredData} />

                {/* Revenue Analysis */}
                <ClassAttendanceRevenueTable data={locationFilteredData} />

                {/* Efficiency Analysis */}
                <ClassAttendanceEfficiencyTable data={locationFilteredData} />
              </div>
            </TabsContent>
          ))}
        </Tabs>
    </div>
  );
};