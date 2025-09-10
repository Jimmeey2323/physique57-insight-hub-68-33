
import { useState, useEffect } from 'react';
import { NewClientData } from '@/types/dashboard';

const GOOGLE_CONFIG = {
  CLIENT_ID: "416630995185-007ermh3iidknbbtdmu5vct207mdlbaa.apps.googleusercontent.com",
  CLIENT_SECRET: "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",
  REFRESH_TOKEN: "1//04pAfj5ZB3ahLCgYIARAAGAQSNwF-L9IrqCo4OyUjAbO1hP5bR3vhs8K96zDZkbeCzcuCjzEiBPZ3O639cLRkUduicMYK1Rzs5GY",
  TOKEN_URL: "https://oauth2.googleapis.com/token"
};

const SPREADSHEET_ID = "149ILDqovzZA6FRUJKOwzutWdVqmqWBtWPfzG3A0zxTI";

export const useNewClientData = () => {
  const [data, setData] = useState<NewClientData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

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

  // Helper to calculate conversion span in days
  const calculateConversionSpan = (firstVisitDate: string, firstPurchaseDate: string): number => {
    if (!firstVisitDate || !firstPurchaseDate) return 0;
    
    let firstVisit: Date, firstPurchase: Date;
    
    // Parse first visit date
    if (firstVisitDate.includes('/')) {
      const [day, month, year] = firstVisitDate.split(' ')[0].split('/');
      firstVisit = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    } else {
      firstVisit = new Date(firstVisitDate);
    }
    
    // Parse first purchase date  
    if (firstPurchaseDate.includes('/')) {
      const [day, month, year] = firstPurchaseDate.split(' ')[0].split('/');
      firstPurchase = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    } else {
      firstPurchase = new Date(firstPurchaseDate);
    }
    
    if (isNaN(firstVisit.getTime()) || isNaN(firstPurchase.getTime())) return 0;
    
    const diffTime = firstPurchase.getTime() - firstVisit.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  // Helper to extract monthYear from a date string (YYYY-MM or MMM YYYY)
  const getMonthYear = (dateStr: string = ''): string => {
    if (!dateStr) return '';
    
    // Handle format: "01/01/2020, 17:30:00"
    let parsedDate: Date;
    if (dateStr.includes('/')) {
      // Split by comma and space to get date part only
      const datePart = dateStr.split(',')[0].trim();
      const [day, month, year] = datePart.split('/');
      parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    } else {
      parsedDate = new Date(dateStr);
    }
    
    if (isNaN(parsedDate.getTime())) return '';
    
    const year = parsedDate.getFullYear();
    const month = (parsedDate.getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}`;
  };

  const fetchNewClientData = async () => {
    try {
      if (isInitialized) {
        setLoading(true);
      }
      const accessToken = await getAccessToken();
      
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/New?alt=json`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch new client data');
      }

      const result = await response.json();
      const rows = result.values || [];
      
      if (rows.length < 2) {
        setData([]);
        return;
      }

      const newClientData: NewClientData[] = rows.slice(1).map((row: any[]) => {
        const firstVisitDate = row[5] || '';
        return {
          memberId: row[0] || '',
          firstName: row[1] || '',
          lastName: row[2] || '',
          email: row[3] || '',
          phoneNumber: row[4] || '',
          firstVisitDate,
          firstVisitEntityName: row[6] || '',
          firstVisitType: row[7] || '',
          firstVisitLocation: row[8] || '',
          paymentMethod: row[9] || '',
          membershipUsed: row[10] || '',
          homeLocation: row[11] || '',
          classNo: parseFloat(row[12]) || 0,
          trainerName: row[13] || '',
          isNew: row[14] || '',
          visitsPostTrial: parseFloat(row[15]) || 0,
          membershipsBoughtPostTrial: row[16] || '',
          purchaseCountPostTrial: parseFloat(row[17]) || 0,
          ltv: parseFloat(row[18]) || 0,
          retentionStatus: row[19] || '',
          conversionStatus: row[20] || '',
          period: row[21] || '',
          unique: row[22] || '',
          firstPurchase: row[23] || '',
          conversionSpan: calculateConversionSpan(firstVisitDate, row[23] || ''),
          monthYear: getMonthYear(firstVisitDate),
        };
      });

      console.log('New client data loaded:', newClientData.length, 'records');
      setData(newClientData);
      setError(null);
      setIsInitialized(true);
    } catch (err) {
      console.error('Error fetching new client data:', err);
      setError('Failed to load new client data');
      setIsInitialized(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isInitialized) {
      fetchNewClientData();
    }
  }, [isInitialized]);

  return { data, loading, error, refetch: fetchNewClientData };
};
