import React, { useMemo } from 'react';
import { SalesAnalyticsSection } from '@/components/dashboard/SalesAnalyticsSection';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import { Footer } from '@/components/ui/footer';
import { ModernHeroSection } from '@/components/ui/ModernHeroSection';
import { AdvancedExportButton } from '@/components/ui/AdvancedExportButton';
import { formatCurrency } from '@/utils/formatters';

const SalesAnalytics = () => {
  const { data } = useGoogleSheets();

  const heroMetrics = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Get previous month date range
    const now = new Date();
    const firstDayPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Filter data for previous month
    const previousMonthData = data.filter(item => {
      if (!item.paymentDate) return false;
      const itemDate = new Date(item.paymentDate);
      return itemDate >= firstDayPreviousMonth && itemDate <= lastDayPreviousMonth;
    });

    const locations = [
      { key: 'Kwality House, Kemps Corner', name: 'Kwality' },
      { key: 'Supreme HQ, Bandra', name: 'Supreme' },
      { key: 'Kenkere House', name: 'Kenkere' }
    ];

    return locations.map(location => {
      const locationData = previousMonthData.filter(item => 
        location.key === 'Kenkere House' 
          ? item.calculatedLocation?.includes('Kenkere') || item.calculatedLocation === 'Kenkere House'
          : item.calculatedLocation === location.key
      );
      
      const totalRevenue = locationData.reduce((sum, item) => sum + (item.paymentValue || 0), 0);
      
      return {
        location: location.name,
        label: 'Previous Month Revenue',
        value: formatCurrency(totalRevenue)
      };
    });
  }, [data]);

  const exportButton = (
    <AdvancedExportButton 
      salesData={data}
      defaultFileName="sales-analytics-all-locations"
      size="sm"
      variant="ghost"
    />
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/20">
      <ModernHeroSection 
        title="Sales Analytics"
        subtitle="Comprehensive analysis of sales performance, revenue trends, and customer insights"
        variant="sales"
        metrics={heroMetrics}
        exportButton={exportButton}
      />

      <div className="container mx-auto px-6 py-8">
        <main className="space-y-8">
          <SalesAnalyticsSection data={data} />
        </main>
      </div>
      
      <Footer />
    </div>
  );
};

export default SalesAnalytics;
