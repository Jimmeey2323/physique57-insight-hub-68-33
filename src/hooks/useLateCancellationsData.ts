import { useState, useEffect } from 'react';
import { LateCancellationsData } from '@/types/dashboard';

const GOOGLE_CONFIG = {
  CLIENT_ID: "416630995185-007ermh3iidknbbtdmu5vct207mdlbaa.apps.googleusercontent.com",
  CLIENT_SECRET: "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",
  REFRESH_TOKEN: "1//04w4V2xMUIMzACgYIARAAGAQSNwF-L9Ir5__pXDmZVYaHKOSqyauTDVmTvrCvgaL2beep4gmp8_lVED0ppM9BPWDDimHyQKk50EY",
  TOKEN_URL: "https://oauth2.googleapis.com/token"
};

const SPREADSHEET_ID = "149ILDqovzZA6FRUJKOwzutWdVqmqWBtWPfzG3A0zxTI";

export const useLateCancellationsData = () => {
  const [data, setData] = useState<LateCancellationsData[]>([]);
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
    
    // Handle date-like values that might be incorrectly formatted
    const valueStr = value.toString();
    if (valueStr.includes('-') && (valueStr.includes('1899') || valueStr.includes('1900'))) {
      return 0; // These appear to be data formatting issues
    }
    
    const cleaned = valueStr.replace(/,/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  };

  const fetchLateCancellationsData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching late cancellations data from Google Sheets...');
      const accessToken = await getAccessToken();
      console.log('Access token obtained successfully');
      
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Checkins?alt=json`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch late cancellations data');
      }

      const result = await response.json();
      const rows = result.values || [];
      
      if (rows.length < 2) {
        setData([]);
        return;
      }

      // Process the Checkins data and filter for late cancellations
      const processedData: LateCancellationsData[] = [];
      
      if (rows.length < 2) {
        setData([]);
        return;
      }

      const headers = rows[0];
      const lateCancelledIndex = headers.findIndex((h: string) => h === 'Is Late Cancelled');
      
      if (lateCancelledIndex === -1) {
        console.error('Is Late Cancelled column not found');
        setData([]);
        return;
      }

      // Process data rows (skip header)
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        
        // Skip empty rows
        if (!row || row.length === 0) continue;
        
        // Only include rows where Is Late Cancelled = TRUE
        if (row[lateCancelledIndex] !== 'TRUE') continue;
        
        const dataRow: LateCancellationsData = {
          memberId: row[headers.findIndex((h: string) => h === 'Member ID')] || '',
          firstName: row[headers.findIndex((h: string) => h === 'First Name')] || '',
          lastName: row[headers.findIndex((h: string) => h === 'Last Name')] || '',
          email: row[headers.findIndex((h: string) => h === 'Email')] || '',
          location: row[headers.findIndex((h: string) => h === 'Location')] || '',
          sessionName: row[headers.findIndex((h: string) => h === 'Session Name')] || '',
          teacherName: row[headers.findIndex((h: string) => h === 'Teacher Name')] || '',
          cleanedProduct: row[headers.findIndex((h: string) => h === 'Cleaned Product')] || '',
          cleanedCategory: row[headers.findIndex((h: string) => h === 'Cleaned Category')] || '',
          cleanedClass: row[headers.findIndex((h: string) => h === 'Cleaned Class')] || '',
          paymentMethodName: row[headers.findIndex((h: string) => h === 'Payment Method Name')] || '',
          dateIST: row[headers.findIndex((h: string) => h === 'Date (IST)')] || '',
          dayOfWeek: row[headers.findIndex((h: string) => h === 'Day of Week')] || '',
          time: row[headers.findIndex((h: string) => h === 'Time')] || '',
          duration: parseNumericValue(row[headers.findIndex((h: string) => h === 'Duration (Minutes)')] || '0'),
          capacity: parseNumericValue(row[headers.findIndex((h: string) => h === 'Capacity')] || '0'),
          month: row[headers.findIndex((h: string) => h === 'Month')] || '',
          year: parseNumericValue(row[headers.findIndex((h: string) => h === 'Year')] || '0'),
          paidAmount: parseNumericValue(row[headers.findIndex((h: string) => h === 'Paid')] || '0'),
          isNew: row[headers.findIndex((h: string) => h === 'Is New')] || '',
          tableType: 'checkins'
        };
        
        processedData.push(dataRow);
      }

      console.log('Processed late cancellations data sample:', processedData.slice(0, 5));
      console.log('Total late cancellations records:', processedData.length);
      
      setData(processedData);
      setError(null);
    } catch (err) {
      console.error('Error fetching late cancellations data:', err);
      setError('Failed to load late cancellations data');
      setData([]); // Clear data on error - no mock data as per requirements
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLateCancellationsData();
  }, []);

  return { data, loading, error, refetch: fetchLateCancellationsData };
};