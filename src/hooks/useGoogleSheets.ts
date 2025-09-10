
import { useState, useEffect } from 'react';
import { SalesData } from '@/types/dashboard';

const GOOGLE_CONFIG = {
  CLIENT_ID: "416630995185-007ermh3iidknbbtdmu5vct207mdlbaa.apps.googleusercontent.com",
  CLIENT_SECRET: "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",
  REFRESH_TOKEN: "1//04w4V2xMUIMzACgYIARAAGAQSNwF-L9Ir5__pXDmZVYaHKOSqyauTDVmTvrCvgaL2beep4gmp8_lVED0ppM9BPWDDimHyQKk50EY",
  TOKEN_URL: "https://oauth2.googleapis.com/token"
};

const SPREADSHEET_ID = "12xbYJQrh5wyYDaFhQrq4L0-YkSSlA6z7nMCb66XEbCQ";

export const useGoogleSheets = () => {
  const [data, setData] = useState<SalesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getAccessToken = async () => {
    try {
      const response = await fetch(GOOGLE_CONFIG.TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: GOOGLE_CONFIG.CLIENT_ID,
          client_secret: GOOGLE_CONFIG.CLIENT_SECRET,
          refresh_token: GOOGLE_CONFIG.REFRESH_TOKEN,
          grant_type: 'refresh_token',
        }),
      });

      const tokenData = await response.json();
      return tokenData.access_token;
    } catch (error) {
      console.error('Error getting access token:', error);
      throw error;
    }
  };

  const parseNumericValue = (value: string | number): number => {
    if (typeof value === 'number') return value;
    if (!value || value === '') return 0;
    
    const cleaned = value.toString().replace(/,/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  };

  const fetchSalesData = async () => {
    try {
      setLoading(true);
      setError(null); // Clear previous errors
      console.log('Fetching sales data from Google Sheets...');
      const accessToken = await getAccessToken();
      console.log('Access token obtained successfully');
      
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Sales?alt=json`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const result = await response.json();
      const rows = result.values || [];
      
      if (rows.length < 2) {
        setData([]);
        return;
      }

      const headers = rows[0];
      console.log('Sheet headers:', headers);
      
      // Transform the raw data to match SalesData interface
      const salesData: SalesData[] = rows.slice(1).map((row: any[]) => {
        const rawItem: any = {};
        headers.forEach((header: string, index: number) => {
          rawItem[header] = row[index] || '';
        });

        // Transform to match SalesData interface with camelCase field names
        const transformedItem: SalesData = {
          memberId: rawItem['Member ID'] || rawItem['memberId'] || '',
          customerName: rawItem['Customer Name'] || rawItem['customerName'] || '',
          customerEmail: rawItem['Customer Email'] || rawItem['customerEmail'] || '',
          saleItemId: rawItem['Sale Item ID'] || rawItem['saleItemId'] || '',
          paymentCategory: rawItem['Payment Category'] || rawItem['paymentCategory'] || '',
          membershipType: rawItem['Membership Type'] || rawItem['membershipType'] || '',
          paymentDate: rawItem['Payment Date'] || rawItem['paymentDate'] || '',
          paymentValue: parseNumericValue(rawItem['Payment Value'] || rawItem['paymentValue'] || 0),
          paidInMoneyCredits: parseNumericValue(rawItem['Paid in Money Credits'] || rawItem['Paid In Money Credits'] || rawItem['paidInMoneyCredits'] || 0),
          paymentVAT: parseNumericValue(rawItem['Payment VAT'] || rawItem['paymentVAT'] || 0),
          paymentItem: rawItem['Payment Item'] || rawItem['paymentItem'] || '',
          paymentStatus: rawItem['Payment Status'] || rawItem['paymentStatus'] || '',
          paymentMethod: rawItem['Payment Method'] || rawItem['paymentMethod'] || '',
          paymentTransactionId: rawItem['Payment Transaction ID'] || rawItem['paymentTransactionId'] || '',
          stripeToken: rawItem['Stripe Token'] || rawItem['stripeToken'] || '',
          soldBy: rawItem['Sold By'] || rawItem['soldBy'] || '',
          saleReference: rawItem['Sale Reference'] || rawItem['saleReference'] || '',
          calculatedLocation: rawItem['Calculated Location'] || rawItem['calculatedLocation'] || '',
          cleanedProduct: rawItem['Cleaned Product'] || rawItem['cleanedProduct'] || '',
          cleanedCategory: rawItem['Cleaned Category'] || rawItem['cleanedCategory'] || '',
          
          // Calculate derived fields
          netRevenue: parseNumericValue(rawItem['Payment Value'] || rawItem['paymentValue'] || 0) - parseNumericValue(rawItem['Payment VAT'] || rawItem['paymentVAT'] || 0),
          vat: parseNumericValue(rawItem['Payment VAT'] || rawItem['paymentVAT'] || 0),
          grossRevenue: parseNumericValue(rawItem['Payment Value'] || rawItem['paymentValue'] || 0),
          
          // Handle discount columns with multiple possible names
          mrpPreTax: parseNumericValue(
            rawItem['Mrp - Pre Tax'] || rawItem['MRP Pre Tax'] || rawItem['MRP_Pre_Tax'] || 
            rawItem['mrpPreTax'] || rawItem['MrpPreTax'] || rawItem['Pre Tax MRP'] || 0
          ),
          mrpPostTax: parseNumericValue(
            rawItem['Mrp - Post Tax'] || rawItem['MRP Post Tax'] || rawItem['MRP_Post_Tax'] || 
            rawItem['mrpPostTax'] || rawItem['MrpPostTax'] || rawItem['Post Tax MRP'] || 0
          ),
          discountAmount: parseNumericValue(
            rawItem['Discount Amount -Mrp- Payment Value'] || rawItem['Discount Amount'] || 
            rawItem['discount_amount'] || rawItem['discountAmount'] || rawItem['DiscountAmount'] ||
            rawItem['Discount_Amount'] || rawItem['Total Discount'] || 0
          ),
          discountPercentage: parseNumericValue(
            rawItem['Discount Percentage - discount amount/mrp*100'] || rawItem['Discount Percentage'] || 
            rawItem['discount_percentage'] || rawItem['discountPercentage'] || rawItem['DiscountPercentage'] ||
            rawItem['Discount_Percentage'] || rawItem['Discount %'] || rawItem['Discount_Percent'] || 0
          ),
          hostId: rawItem['Host Id'] || rawItem['Host ID'] || rawItem['hostId'] || ''
        };

        return transformedItem;
      });

      console.log('Transformed sales data sample:', salesData.slice(0, 3));
      console.log('Sample discount data:', {
        discountAmount: salesData[0]?.discountAmount,
        discountPercentage: salesData[0]?.discountPercentage,
        mrpPreTax: salesData[0]?.mrpPreTax,
        mrpPostTax: salesData[0]?.mrpPostTax
      });
      
      setData(salesData);
      setError(null);
    } catch (err) {
      console.error('Error fetching sales data:', err);
      setError('Failed to load sales data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesData();
  }, []);

  return { data, loading, error, refetch: fetchSalesData };
};
