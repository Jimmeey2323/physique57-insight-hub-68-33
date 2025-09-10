
import { useState, useEffect } from 'react';

export interface SessionData {
  trainerId: string;
  trainerFirstName: string;
  trainerLastName: string;
  trainerName: string;
  sessionId: string;
  sessionName: string;
  capacity: number;
  checkedInCount: number;
  lateCancelledCount: number;
  bookedCount: number;
  complimentaryCount: number;
  location: string;
  date: string;
  dayOfWeek: string;
  time: string;
  totalPaid: number;
  nonPaidCount: number;
  uniqueId1: string;
  uniqueId2: string;
  checkedInsWithMemberships: number;
  checkedInsWithPackages: number;
  checkedInsWithIntroOffers: number;
  checkedInsWithSingleClasses: number;
  classType: string;
  cleanedClass: string;
  classes: number;
  fillPercentage?: number;
  revenue?: number;
  // Legacy field for backward compatibility
  uniqueId?: string;
}

const GOOGLE_CONFIG = {
  CLIENT_ID: "416630995185-g7b0fm679lb4p45p5lou070cqscaalaf.apps.googleusercontent.com",
  CLIENT_SECRET: "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",
  REFRESH_TOKEN: "1//0gT2uoYBlNdGXCgYIARAAGBASNwF-L9IrBK_ijYwpce6-TdqDfji4GxYuc4uxIBKasdgoZBPm-tu_EU0xS34cNirqfLgXbJ8_NMk",
  TOKEN_URL: "https://oauth2.googleapis.com/token"
};

const SPREADSHEET_ID = "149ILDqovzZA6FRUJKOwzutWdVqmqWBtWPfzG3A0zxTI";

export const useSessionsData = () => {
  const [data, setData] = useState<SessionData[]>([]);
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

  const fetchSessionsData = async () => {
    try {
      setLoading(true);
      const accessToken = await getAccessToken();
      
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Sessions?alt=json`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch sessions data');
      }

      const result = await response.json();
      const rows = result.values || [];
      
      if (rows.length < 2) {
        setData([]);
        return;
      }

      const sessionsData: SessionData[] = rows.slice(1).map((row: any[]) => {
        const capacity = parseNumericValue(row[6]);
        const checkedInCount = parseNumericValue(row[7]);
        const fillPercentage = capacity > 0 ? (checkedInCount / capacity) * 100 : 0;
        
        return {
          trainerId: row[0] || '',
          trainerFirstName: row[1] || '',
          trainerLastName: row[2] || '',
          trainerName: row[3] || '',
          sessionId: row[4] || '',
          sessionName: row[5] || '',
          capacity,
          checkedInCount,
          lateCancelledCount: parseNumericValue(row[8]),
          bookedCount: parseNumericValue(row[9]),
          complimentaryCount: parseNumericValue(row[10]),
          location: row[11] || '',
          date: row[12] || '',
          dayOfWeek: row[13] || '',
          time: row[14] || '',
          totalPaid: parseNumericValue(row[15]), // Revenue column
          nonPaidCount: parseNumericValue(row[16]),
          uniqueId1: row[17] || '',
          uniqueId2: row[18] || '',
          checkedInsWithMemberships: parseNumericValue(row[19]), // Memberships
          checkedInsWithPackages: parseNumericValue(row[20]), // Packages
          checkedInsWithIntroOffers: parseNumericValue(row[21]), // IntroOffers
          checkedInsWithSingleClasses: parseNumericValue(row[22]), // SingleClasses
          classType: row[23] || '', // Type
          cleanedClass: row[24] || '', // Class
          classes: parseNumericValue(row[25]), // Classes
          fillPercentage,
          revenue: parseNumericValue(row[15]),
          // Legacy field for backward compatibility
          uniqueId: row[17] || ''
        };
      });

      setData(sessionsData);
      setError(null);
    } catch (err) {
      console.error('Error fetching sessions data:', err);
      setError('Failed to load sessions data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessionsData();
  }, []);

  return { data, loading, error, refetch: fetchSessionsData };
};
