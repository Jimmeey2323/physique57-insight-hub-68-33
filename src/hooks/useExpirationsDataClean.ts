import { useState, useEffect, useCallback } from 'react';
import { ExpirationData } from '@/types/dashboard';

// Spreadsheet ID from the provided URL: https://docs.google.com/spreadsheets/d/1rGMDDvvTbZfNg1dueWtRN3LhOgGQOdLg3Fd7Sn1GCZo/edit?gid=0#gid=0
const SPREADSHEET_ID = "1rGMDDvvTbZfNg1dueWtRN3LhOgGQOdLg3Fd7Sn1GCZo";

/**
 * Hook for loading expirations data from the specified Google Sheets
 * Currently experiencing API access issues in development environment
 * Will return empty data with appropriate error messages until resolved
 */
export const useExpirationsDataClean = () => {
  const [data, setData] = useState<ExpirationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Google Sheets CSV export URL (public access)
  const SHEET_CSV_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=0`;

  const parseCSV = (text: string): string[][] => {
    const lines = text.split('\n').filter(line => line.trim());
    const result: string[][] = [];
    
    for (let line of lines) {
      // Handle CSV parsing with quoted fields
      const fields: string[] = [];
      let currentField = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"' && (i === 0 || line[i-1] === ',')) {
          inQuotes = true;
        } else if (char === '"' && inQuotes && (i === line.length - 1 || line[i+1] === ',')) {
          inQuotes = false;
        } else if (char === ',' && !inQuotes) {
          fields.push(currentField.trim());
          currentField = '';
        } else {
          currentField += char;
        }
      }
      
      fields.push(currentField.trim());
      result.push(fields);
    }
    
    return result;
  };

  const transformRowToExpirationData = (row: string[], headers: string[]): ExpirationData => {
    const rawItem: any = {};
    headers.forEach((header: string, index: number) => {
      rawItem[header] = row[index] || '';
    });

    return {
      uniqueId: rawItem['Unique Id'] || rawItem['UniqueId'] || rawItem['ID'] || rawItem['unique_id'] || rawItem['Unique ID'] || `exp-${Date.now()}-${Math.random().toString(36).substring(2)}`,
      memberId: rawItem['Member ID'] || rawItem['MemberID'] || rawItem['member_id'] || rawItem['Member Id'] || '',
      firstName: rawItem['First Name'] || rawItem['FirstName'] || rawItem['first_name'] || rawItem['Name'] || '',
      lastName: rawItem['Last Name'] || rawItem['LastName'] || rawItem['last_name'] || rawItem['Surname'] || '',
      email: rawItem['Email'] || rawItem['email'] || rawItem['Email Address'] || rawItem['email_address'] || '',
      membershipName: rawItem['Membership Name'] || rawItem['MembershipName'] || rawItem['membership_name'] || rawItem['Membership'] || '',
      endDate: rawItem['End Date'] || rawItem['EndDate'] || rawItem['end_date'] || rawItem['Expiry Date'] || rawItem['Expiration Date'] || '',
      homeLocation: rawItem['Home Location'] || rawItem['HomeLocation'] || rawItem['home_location'] || rawItem['Location'] || '',
      currentUsage: rawItem['Current Usage'] || rawItem['CurrentUsage'] || rawItem['current_usage'] || rawItem['Usage'] || '',
      id: rawItem['Id'] || rawItem['ID'] || rawItem['id'] || rawItem['Record ID'] || '',
      orderAt: rawItem['Order At'] || rawItem['OrderAt'] || rawItem['order_at'] || rawItem['Ordered Date'] || '',
      soldBy: rawItem['Sold By'] || rawItem['SoldBy'] || rawItem['sold_by'] || rawItem['Sales Rep'] || '',
      membershipId: rawItem['Membership Id'] || rawItem['MembershipId'] || rawItem['membership_id'] || rawItem['Membership ID'] || '',
      frozen: rawItem['Frozen'] === 'TRUE' || rawItem['frozen'] === 'true' || rawItem['Frozen'] === '1' || rawItem['frozen'] === true || false,
      paid: rawItem['Paid'] || rawItem['paid'] || rawItem['Payment Status'] || rawItem['payment_status'] || '',
      status: rawItem['Status'] || rawItem['status'] || rawItem['Membership Status'] || rawItem['membership_status'] || '',
    };
  };

  const fetchExpirationsData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 Attempting to fetch expirations data...');
      console.log('📊 Target spreadsheet:', SPREADSHEET_ID);
      console.log('🔗 CSV URL:', SHEET_CSV_URL);
      
      const response = await fetch(SHEET_CSV_URL, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        headers: {
          'Accept': 'text/csv, application/csv, text/plain',
        }
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Spreadsheet is private or access denied. Please check sharing permissions.');
        } else if (response.status === 404) {
          throw new Error('Spreadsheet not found. Please verify the URL.');
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      }

      const text = await response.text();
      console.log('📄 Received response:', text.length, 'characters');

      if (!text || text.trim().length === 0) {
        throw new Error('Empty spreadsheet or no data available');
      }

      // Parse CSV data
      const rows = parseCSV(text);
      console.log('📊 Parsed rows:', rows.length);

      if (rows.length < 2) {
        console.log('⚠️ No data rows found, setting empty data');
        setData([]);
        setError(null);
        return;
      }

      const headers = rows[0];
      console.log('📋 Headers:', headers);

      // Transform data
      const expirationsData: ExpirationData[] = rows.slice(1)
        .map((row: string[], index: number) => {
          try {
            return transformRowToExpirationData(row, headers);
          } catch (error) {
            console.warn(`⚠️ Error processing row ${index + 2}:`, error);
            return null;
          }
        })
        .filter(Boolean) as ExpirationData[];

      console.log('✅ Successfully loaded:', expirationsData.length, 'expiration records');
      console.log('📝 Sample record:', expirationsData[0]);
      
      setData(expirationsData);
      setError(null);
    } catch (err) {
      console.error('💥 Error fetching expirations data:', err);
      
      // Determine error message based on error type
      let errorMessage = 'Unknown error occurred';
      if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
        errorMessage = 'Network error: Unable to connect to Google Sheets. This may be due to CORS restrictions in the development environment.';
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      
      // Set empty data when there's an error
      setData([]);
      
      console.log('📊 Data loading failed - showing empty state');
    } finally {
      setLoading(false);
    }
  }, [SHEET_CSV_URL]); // Added dependency

  useEffect(() => {
    fetchExpirationsData();
  }, [fetchExpirationsData]);

  return { 
    data, 
    loading, 
    error, 
    refetch: fetchExpirationsData,
    isEmpty: !loading && !error && data.length === 0,
    hasNetworkError: error?.includes('Network error') || error?.includes('Failed to fetch') || false
  };
};