import { useState, useEffect, useMemo } from 'react';
// Assuming useGoogleSheets hook is in this path
import { useGoogleSheets } from './useGoogleSheets';

// Updated interface to match all columns in the sample data
export interface DiscountAnalysisData {
  memberId: string;
  customerName: string;
  customerEmail: string;
  saleItemId: string;
  paymentCategory: string;
  paymentDate: string;
  paymentValue: number;
  paidInMoneyCredits: number;
  paymentVat: number;
  paymentItem: string;
  cleanedProduct?: string;
  mrpPostTax?: number;
  discountAmount?: number;
  discountPercentage?: number;
  soldBy?: string;
  location?: string;
}
export const useDiscountAnalysis = () => {
  const { data: salesData, loading, error } = useGoogleSheets();
  const [discountData, setDiscountData] = useState<DiscountAnalysisData[]>([]);

  useEffect(() => {
    if (salesData && salesData.length > 0) {
      try {
        console.log('Processing discount analysis data...', salesData.length, 'items');
        
        const parseNumber = (value: any): number => {
          if (value === null || value === undefined || value === '') return 0;
          // Handle string values with currency symbols or commas
          const cleanValue = value.toString().replace(/[₹,]/g, '').trim();
          const num = parseFloat(cleanValue);
          return isNaN(num) ? 0 : num;
        };

        const parseDate = (dateStr: string): string => {
          if (!dateStr) return '';
          try {
            // Handle DD/MM/YYYY format
            if (dateStr.includes('/')) {
              const datePart = dateStr.split(',')[0].trim();
              const [day, month, year] = datePart.split('/');
              
              if (day && month && year) {
                const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                return new Date(isoDate).toISOString().split('T')[0];
              }
            }
            // Handle YYYY-MM-DD format
            if (dateStr.includes('-')) {
              const date = new Date(dateStr);
              if (!isNaN(date.getTime())) {
                return date.toISOString().split('T')[0];
              }
            }
            return '';
          } catch (e) {
            console.error(`Date parsing error for value: "${dateStr}"`, e);
            return '';
          }
        };
        
        // Process all sales data, not just discounted ones
        const processedData: DiscountAnalysisData[] = salesData.map((item: any) => {
          const discountAmount = parseNumber(item.discountAmount || item['Discount Amount -Mrp- Payment Value'] || 0);
          const discountPercentage = parseNumber(item.discountPercentage || item['Discount Percentage - discount amount/mrp*100'] || 0);
          
          return {
            memberId: item.memberId || item['Member ID']?.toString() || '',
            customerName: item.customerName || item['Customer Name'] || '',
            customerEmail: item.customerEmail || item['Customer Email'] || '',
            saleItemId: item.saleItemId || item['Sale Item ID']?.toString() || '',
            paymentCategory: item.paymentCategory || item['Payment Category'] || '',
            paymentDate: parseDate(item.paymentDate || item['Payment Date'] || ''),
            paymentValue: parseNumber(item.paymentValue || item['Payment Value'] || 0),
            paidInMoneyCredits: parseNumber(item.paidInMoneyCredits || item['Paid In Money Credits'] || 0),
            paymentVat: parseNumber(item.paymentVat || item['Payment VAT'] || 0),
            paymentItem: item.paymentItem || item['Payment Item'] || '',
            paymentMethod: item.paymentMethod || item['Payment Method'] || '',
            paymentStatus: item.paymentStatus || item['Payment Status'] || '',
            paymentTransactionId: item.paymentTransactionId || item['Payment Transaction ID']?.toString() || '',
            stripeToken: item.stripeToken || item['Stripe Token'] || '',
            saleReference: item.saleReference || item['Sale Reference']?.toString() || '',
            soldBy: item.soldBy === '-' ? 'Online/System' : (item.soldBy || item['Sold By'] || 'Unknown'),
            location: item.calculatedLocation || item['Calculated Location'] || '',
            cleanedProduct: item.cleanedProduct || item['Cleaned Product'] || '',
            cleanedCategory: item.cleanedCategory || item['Cleaned Category'] || '',
            hostId: item.hostId || item['Host Id']?.toString() || '',
            mrpPreTax: parseNumber(item.mrpPreTax || item['Mrp - Pre Tax'] || 0),
            mrpPostTax: parseNumber(item.mrpPostTax || item['Mrp - Post Tax'] || 0),
            discountAmount,
            discountPercentage,
            membershipType: item.membershipType || item['Membership Type']?.trim() || '',
          };
        });

        console.log('Discount Analysis - Total transactions:', processedData.length);
        console.log('Discount Analysis - Sample transaction:', processedData[0]);
        
        setDiscountData(processedData);

      } catch (error) {
        console.error('Error processing discount data:', error);
        setDiscountData([]);
      }
    } else {
      console.log('No sales data available for discount analysis');
      setDiscountData([]);
    }
  }, [salesData]);

  const metrics = useMemo(() => {
    if (!discountData.length) {
      return {
        totalDiscountAmount: 0,
        totalRevenueLost: 0,
        totalTransactions: 0,
        avgDiscountPercentage: 0,
        totalPotentialRevenue: 0,
        totalActualRevenue: 0,
        discountEffectiveness: 0,
        productBreakdown: [],
        monthlyBreakdown: [],
      };
    }

    const totalDiscountAmount = discountData.reduce((sum, item) => sum + (item.discountAmount || 0), 0);
    const totalTransactions = discountData.length;
    const totalPotentialRevenue = discountData.reduce((sum, item) => sum + (item.mrpPostTax || item.paymentValue || 0), 0);
    const totalActualRevenue = discountData.reduce((sum, item) => sum + (item.paymentValue || 0), 0);

    // Calculate average discount percentage
    const discountedItems = discountData.filter(item => (item.discountAmount || 0) > 0);
    const avgDiscountPercentage = discountedItems.length > 0 
      ? discountedItems.reduce((sum, item) => sum + (item.discountPercentage || 0), 0) / discountedItems.length 
      : 0;

    // Group by product
    const productBreakdown = discountData.reduce((acc, item) => {
      const key = item.cleanedProduct || 'Unknown Product';
      if (!acc[key]) {
        acc[key] = {
          product: key,
          transactions: 0,
          totalDiscount: 0,
          avgDiscountPercentage: 0,
          revenue: 0,
          totalMrp: 0,
        };
      }
      acc[key].transactions += 1;
      acc[key].totalDiscount += item.discountAmount || 0;
      acc[key].revenue += item.paymentValue || 0;
      acc[key].totalMrp += item.mrpPostTax || item.paymentValue || 0;
      return acc;
    }, {} as Record<string, any>);

    Object.values(productBreakdown).forEach((product: any) => {
      product.avgDiscountPercentage = product.totalMrp > 0 ? (product.totalDiscount / product.totalMrp) * 100 : 0;
    });

    // Group by month
    const monthlyBreakdown = discountData.reduce((acc, item) => {
      if (!item.paymentDate) return acc;
      const monthKey = item.paymentDate.substring(0, 7); // YYYY-MM
      
      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: monthKey,
          transactions: 0,
          totalDiscount: 0,
          revenue: 0,
        };
      }
      acc[monthKey].transactions += 1;
      acc[monthKey].totalDiscount += item.discountAmount || 0;
      acc[monthKey].revenue += item.paymentValue || 0;
      return acc;
    }, {} as Record<string, any>);

    return {
      totalDiscountAmount,
      totalRevenueLost: totalDiscountAmount,
      totalTransactions,
      avgDiscountPercentage,
      totalPotentialRevenue,
      totalActualRevenue,
      discountEffectiveness: totalPotentialRevenue > 0 ? (totalActualRevenue / totalPotentialRevenue) * 100 : 0,
      productBreakdown: Object.values(productBreakdown),
      monthlyBreakdown: Object.values(monthlyBreakdown),
    };
  }, [discountData]);

  return {
    data: discountData,
    metrics,
    loading,
    error,
  };
};