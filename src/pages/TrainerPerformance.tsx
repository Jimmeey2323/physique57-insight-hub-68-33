import React, { useEffect, useMemo } from 'react';
import { useGlobalLoading } from '@/hooks/useGlobalLoading';
import { ProfessionalLoader } from '@/components/dashboard/ProfessionalLoader';
import { EnhancedTrainerPerformanceSection } from '@/components/dashboard/EnhancedTrainerPerformanceSection';
import { Footer } from '@/components/ui/footer';
import { ModernHeroSection } from '@/components/ui/ModernHeroSection';
import { usePayrollData } from '@/hooks/usePayrollData';
import { formatCurrency } from '@/utils/formatters';

const TrainerPerformance = () => {
  const { data: payrollData, isLoading } = usePayrollData();
  const { isLoading: globalLoading, setLoading } = useGlobalLoading();

  useEffect(() => {
    setLoading(isLoading, 'Analyzing trainer performance metrics and insights...');
  }, [isLoading, setLoading]);

  const heroMetrics = useMemo(() => {
    if (!payrollData || payrollData.length === 0) return [];

    const locations = [
      { key: 'Kwality House, Kemps Corner', name: 'Kwality' },
      { key: 'Supreme HQ, Bandra', name: 'Supreme' },
      { key: 'Kenkere House', name: 'Kenkere' }
    ];

    return locations.map(location => {
      const locationData = payrollData.filter(item => 
        location.key === 'Kenkere House' 
          ? item.location?.includes('Kenkere') || item.location === 'Kenkere House'
          : item.location === location.key
      );
      
      const totalSessions = locationData.reduce((sum, item) => sum + (item.cycleSessions || 0), 0);
      
      return {
        location: location.name,
        label: 'Total Sessions',
        value: totalSessions.toString()
      };
    });
  }, [payrollData]);

  if (globalLoading) {
    return <ProfessionalLoader variant="analytics" subtitle="Analyzing trainer performance metrics and insights..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <ModernHeroSection 
        title="Trainer Performance Analytics"
        subtitle="Comprehensive trainer performance metrics, insights, and development opportunities"
        variant="trainer"
        metrics={heroMetrics}
        onExport={() => console.log('Exporting trainer data...')}
      />

      <div className="container mx-auto px-6 py-8">
        <main className="space-y-8">
          <EnhancedTrainerPerformanceSection />
        </main>
      </div>
      
      <Footer />
    </div>
  );
};

export default TrainerPerformance;