
import React, { useMemo } from 'react';
import { SessionsSection } from '@/components/dashboard/SessionsSection';
import { Footer } from '@/components/ui/footer';
import { SessionsFiltersProvider } from '@/contexts/SessionsFiltersContext';
import { ModernHeroSection } from '@/components/ui/ModernHeroSection';
import { useSessionsData } from '@/hooks/useSessionsData';
import { formatNumber } from '@/utils/formatters';

const Sessions = () => {
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
      
      const totalCheckedIn = locationData.reduce((sum, item) => sum + (item.checkedInCount || 0), 0);
      
      return {
        location: location.name,
        label: 'Total Check-ins',
        value: formatNumber(totalCheckedIn)
      };
    });
  }, [data]);

  return (
    <SessionsFiltersProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-red-50/20">
        <ModernHeroSection 
          title="Sessions Analytics"
          subtitle="Comprehensive analysis of class sessions, attendance patterns, and performance insights"
          variant="sessions"
          metrics={heroMetrics}
          onExport={() => console.log('Exporting sessions data...')}
        />
        <main>
          <SessionsSection />
        </main>
        <Footer />
      </div>
    </SessionsFiltersProvider>
  );
};

export default Sessions;
