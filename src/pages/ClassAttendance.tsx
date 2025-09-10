
import React, { useMemo } from 'react';
import { ClassAttendanceSection } from '@/components/dashboard/ClassAttendanceSection';
import { Footer } from '@/components/ui/footer';
import { SessionsFiltersProvider } from '@/contexts/SessionsFiltersContext';
import { ModernHeroSection } from '@/components/ui/ModernHeroSection';
import { useSessionsData } from '@/hooks/useSessionsData';
import { formatNumber } from '@/utils/formatters';

const ClassAttendance = () => {
  const { data } = useSessionsData();

  const heroMetrics = useMemo(() => {
    if (!data || data.length === 0) return [];

    const locations = [
      { key: 'Kwality House, Kemps Corner', name: 'Kwality' },
      { key: 'Supreme HQ, Bandra', name: 'Supreme' },
      { key: 'Kenkere House', name: 'Kenkere' }
    ];

    return locations.map(location => {
      const locationData = data.filter(item => 
        location.key === 'Kenkere House' 
          ? item.location?.includes('Kenkere') || item.location === 'Kenkere House'
          : item.location === location.key
      );
      
      const totalSessions = locationData.length;
      
      return {
        location: location.name,
        label: 'Total Sessions',
        value: formatNumber(totalSessions)
      };
    });
  }, [data]);

  return (
    <SessionsFiltersProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/20">
        <ModernHeroSection 
          title="Class Attendance Analytics"
          subtitle="Comprehensive class utilization and attendance trend analysis across all sessions"
          variant="attendance"
          metrics={heroMetrics}
          onExport={() => console.log('Exporting attendance data...')}
        />

        <div className="container mx-auto px-6 py-8">
          <main className="space-y-8">
            <ClassAttendanceSection />
          </main>
        </div>
        
        <Footer />
      </div>
    </SessionsFiltersProvider>
  );
};

export default ClassAttendance;
