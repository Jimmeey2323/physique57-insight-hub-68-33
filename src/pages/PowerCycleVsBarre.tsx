
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePayrollData } from '@/hooks/usePayrollData';
import { useGlobalLoading } from '@/hooks/useGlobalLoading';
import { ProfessionalLoader } from '@/components/dashboard/ProfessionalLoader';
import { PowerCycleVsBarreSection } from '@/components/dashboard/PowerCycleVsBarreSection';
import { SessionsFiltersProvider } from '@/contexts/SessionsFiltersContext';
import { Footer } from '@/components/ui/footer';
import { ModernHeroSection } from '@/components/ui/ModernHeroSection';

const PowerCycleVsBarre = () => {
  const { data: payrollData, isLoading: loading } = usePayrollData();
  const { isLoading, setLoading } = useGlobalLoading();

  useEffect(() => {
    if (loading !== undefined) {
      setLoading(loading, 'Loading PowerCycle vs Barre vs Strength performance data...');
    }
  }, [loading, setLoading]);

  if (isLoading) {
    return <ProfessionalLoader variant="analytics" subtitle="Loading PowerCycle vs Barre vs Strength performance data..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-purple-50/20">
      <ModernHeroSection 
        title="PowerCycle vs Barre vs Strength"
        subtitle="Comprehensive analysis of PowerCycle, Barre, and Strength Lab class performance"
        variant="powercycle"
        onExport={() => console.log('Exporting powercycle data...')}
      />

      <div className="container mx-auto px-6 py-8">
        <main className="space-y-8">
          <SessionsFiltersProvider>
            <PowerCycleVsBarreSection data={payrollData || []} />
          </SessionsFiltersProvider>
        </main>
      </div>
      
      <Footer />
    </div>
  );
};

export default PowerCycleVsBarre;
