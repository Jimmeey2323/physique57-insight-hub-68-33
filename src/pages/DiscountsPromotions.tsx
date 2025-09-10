import React, { useEffect, useMemo, useState } from 'react';
import { RefinedLoader } from '@/components/ui/RefinedLoader';
import { useSalesData } from '@/hooks/useSalesData';
import { useGlobalLoading } from '@/hooks/useGlobalLoading';
import { EnhancedDiscountsDashboardV2 } from '@/components/dashboard/EnhancedDiscountsDashboardV2';
import { ModernHeroSection } from '@/components/ui/ModernHeroSection';
import { formatNumber, formatCurrency } from '@/utils/formatters';
import { useNavigate } from 'react-router-dom';
import { Footer } from '@/components/ui/footer';
import { AdvancedExportButton } from '@/components/ui/AdvancedExportButton';

const DiscountsPromotions: React.FC = () => {
  const navigate = useNavigate();
  const { setLoading } = useGlobalLoading();
  const { data: salesData, loading, error } = useSalesData();
  
  // Transform sales data for discount analysis
  const discountData = useMemo(() => {
    if (!salesData) return [];
    
    return salesData.map((item: any) => {
      // Parse numeric values safely
      const parseNumber = (value: any): number => {
        if (value === null || value === undefined || value === '') return 0;
        const cleanValue = value.toString().replace(/[₹,\s]/g, '');
        const num = parseFloat(cleanValue);
        return isNaN(num) ? 0 : num;
      };

      const discountAmount = parseNumber(item.discountAmount || item['Discount Amount -Mrp- Payment Value'] || 0);
      const discountPercentage = parseNumber(item.discountPercentage || item['Discount Percentage - discount amount/mrp*100'] || 0);
      const paymentValue = parseNumber(item.paymentValue || item['Payment Value'] || 0);
      const mrpPreTax = parseNumber(item.mrpPreTax || item['Mrp - Pre Tax'] || 0);
      const mrpPostTax = parseNumber(item.mrpPostTax || item['Mrp - Post Tax'] || 0);

      return {
        ...item,
        memberId: item.memberId || item['Member ID']?.toString() || '',
        customerName: item.customerName || item['Customer Name'] || '',
        customerEmail: item.customerEmail || item['Customer Email'] || '',
        paymentDate: item.paymentDate || item['Payment Date'] || '',
        paymentValue,
        paymentMethod: item.paymentMethod || item['Payment Method'] || '',
        calculatedLocation: item.calculatedLocation || item['Calculated Location'] || '',
        cleanedProduct: item.cleanedProduct || item['Cleaned Product'] || '',
        cleanedCategory: item.cleanedCategory || item['Cleaned Category'] || '',
        soldBy: item.soldBy === '-' ? 'Online/System' : (item.soldBy || item['Sold By'] || 'Unknown'),
        discountAmount,
        discountPercentage,
        mrpPreTax,
        mrpPostTax,
        hasDiscount: discountAmount > 0 || discountPercentage > 0,
      };
    });
  }, [salesData]);

  const heroMetrics = useMemo(() => {
    if (!discountData || discountData.length === 0) return [];

    // Get previous month date range
    const now = new Date();
    const firstDayPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Filter data for previous month
    const previousMonthData = discountData.filter(item => {
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
      
      const totalDiscounts = locationData.reduce((sum, item) => sum + (item.discountAmount || 0), 0);
      
      return {
        location: location.name,
        label: 'Previous Month Discounts',
        value: formatCurrency(totalDiscounts)
      };
    });
  }, [discountData]);

  useEffect(() => {
    setLoading(loading, 'Loading discount and promotional analysis...');
  }, [loading, setLoading]);

  if (loading) {
    return <RefinedLoader subtitle="Loading discount and promotional analysis..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-amber-50/20">
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Connection Error</h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
            >
              Retry Loading
            </button>
          </div>
        </div>
      </div>
    );
  }

  const exportButton = (
    <AdvancedExportButton 
      discountData={discountData}
      defaultFileName="discounts-promotions-export"
      size="sm"
      variant="ghost"
    />
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-amber-50/20">
      <ModernHeroSection 
        title="Discounts & Promotions"
        subtitle="Advanced analytics for discount strategies, promotional impact analysis, and revenue optimization insights"
        variant="discounts"
        metrics={heroMetrics}
        exportButton={exportButton}
      />

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <main className="space-y-8">
          <EnhancedDiscountsDashboardV2 data={discountData} />
        </main>
      </div>
      
      <Footer />

      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes bounce-slow {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-15px);
          }
          60% {
            transform: translateY(-8px);
          }
        }
        
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.08);
          }
        }
        
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          33% {
            transform: translateY(-12px) translateX(4px);
          }
          66% {
            transform: translateY(-6px) translateX(-4px);
          }
        }
        
        @keyframes twinkle {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1) rotate(0deg);
          }
          25% {
            opacity: 0.9;
            transform: scale(1.3) rotate(90deg);
          }
          75% {
            opacity: 0.6;
            transform: scale(0.8) rotate(270deg);
          }
        }
        
        @keyframes drift-left {
          0%, 100% {
            transform: translateX(0px) translateY(0px);
          }
          50% {
            transform: translateX(-20px) translateY(-10px);
          }
        }
        
        @keyframes drift-right {
          0%, 100% {
            transform: translateX(0px) translateY(0px);
          }
          50% {
            transform: translateX(20px) translateY(-10px);
          }
        }
        
        @keyframes gentle-float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }
        
        @keyframes gentle-bounce {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-6px);
          }
        }
        
        @keyframes gentle-pulse {
          0%, 100% {
            opacity: 0.2;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.1);
          }
        }
        
        @keyframes gentle-spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        @keyframes gentle-drift {
          0%, 100% {
            transform: translateX(0px);
          }
          50% {
            transform: translateX(10px);
          }
        }
        
        @keyframes gentle-wave {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-5px) rotate(180deg);
          }
        }
        
        @keyframes gentle-bob {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          33% {
            transform: translateY(-4px) translateX(2px);
          }
          66% {
            transform: translateY(-2px) translateX(-2px);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 4s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 5s ease-in-out infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 12s linear infinite;
        }
        
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        
        .animate-twinkle {
          animation: twinkle 3s ease-in-out infinite;
        }
        
        .animate-drift-left {
          animation: drift-left 6s ease-in-out infinite;
        }
        
        .animate-drift-right {
          animation: drift-right 6s ease-in-out infinite;
        }
        
        .animate-gentle-float {
          animation: gentle-float 3s ease-in-out infinite;
        }
        
        .animate-gentle-bounce {
          animation: gentle-bounce 2.5s ease-in-out infinite;
        }
        
        .animate-gentle-pulse {
          animation: gentle-pulse 4s ease-in-out infinite;
        }
        
        .animate-gentle-spin {
          animation: gentle-spin 20s linear infinite;
        }
        
        .animate-gentle-drift {
          animation: gentle-drift 5s ease-in-out infinite;
        }
        
        .animate-gentle-wave {
          animation: gentle-wave 4s ease-in-out infinite;
        }
        
        .animate-gentle-bob {
          animation: gentle-bob 3.5s ease-in-out infinite;
        }
        
        .animate-bounce-delayed {
          animation: bounce-slow 4s ease-in-out infinite;
          animation-delay: 0.8s;
        }
        
        .animate-pulse-delayed {
          animation: pulse-slow 5s ease-in-out infinite;
          animation-delay: 1.2s;
        }
        
        .animate-float-delayed {
          animation: float 4s ease-in-out infinite;
          animation-delay: 2s;
        }
        
        /* Enhanced Glow effects */
        .glow-purple {
          filter: drop-shadow(0 0 25px rgba(168, 85, 247, 0.6)) drop-shadow(0 0 50px rgba(168, 85, 247, 0.3));
        }
        
        .glow-blue {
          filter: drop-shadow(0 0 25px rgba(59, 130, 246, 0.6)) drop-shadow(0 0 50px rgba(59, 130, 246, 0.3));
        }
        
        .glow-pink {
          filter: drop-shadow(0 0 25px rgba(236, 72, 153, 0.6)) drop-shadow(0 0 50px rgba(236, 72, 153, 0.3));
        }
        
        .glow-green {
          filter: drop-shadow(0 0 25px rgba(34, 197, 94, 0.6)) drop-shadow(0 0 50px rgba(34, 197, 94, 0.3));
        }
        
        .glow-yellow {
          filter: drop-shadow(0 0 25px rgba(234, 179, 8, 0.6)) drop-shadow(0 0 50px rgba(234, 179, 8, 0.3));
        }
        
        .glow-indigo {
          filter: drop-shadow(0 0 25px rgba(99, 102, 241, 0.6)) drop-shadow(0 0 50px rgba(99, 102, 241, 0.3));
        }
        
        .glow-orange {
          filter: drop-shadow(0 0 25px rgba(249, 115, 22, 0.6)) drop-shadow(0 0 50px rgba(249, 115, 22, 0.3));
        }
        
        .glow-cyan {
          filter: drop-shadow(0 0 20px rgba(6, 182, 212, 0.5));
        }
        
        .glow-rose {
          filter: drop-shadow(0 0 20px rgba(244, 63, 94, 0.5));
        }
        
        .glow-emerald {
          filter: drop-shadow(0 0 20px rgba(16, 185, 129, 0.5));
        }
        
        .glow-violet {
          filter: drop-shadow(0 0 20px rgba(139, 69, 228, 0.5));
        }
        
        .glow-amber {
          filter: drop-shadow(0 0 20px rgba(245, 158, 11, 0.5));
        }
        
        .glow-teal {
          filter: drop-shadow(0 0 15px rgba(20, 184, 166, 0.4));
        }
        
        .glow-fuchsia {
          filter: drop-shadow(0 0 15px rgba(217, 70, 239, 0.4));
        }
        
        .glow-lime {
          filter: drop-shadow(0 0 15px rgba(132, 204, 22, 0.4));
        }
        
        .glow-sky {
          filter: drop-shadow(0 0 15px rgba(14, 165, 233, 0.4));
        }
        
        .glow-red {
          filter: drop-shadow(0 0 15px rgba(239, 68, 68, 0.4));
        }
        
        .glow-blue-light {
          filter: drop-shadow(0 0 12px rgba(147, 197, 253, 0.3));
        }
        
        .glow-purple-light {
          filter: drop-shadow(0 0 12px rgba(196, 181, 253, 0.3));
        }
        
        .delay-200 {
          animation-delay: 0.2s;
        }
        
        .delay-300 {
          animation-delay: 0.3s;
        }
        
        .delay-500 {
          animation-delay: 0.5s;
        }
      `}</style>
    </div>
  );
};

export default DiscountsPromotions;