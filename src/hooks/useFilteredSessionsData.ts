
import { useMemo, useContext } from 'react';
import { SessionData } from '@/hooks/useSessionsData';
import { useSessionsFilters } from '@/contexts/SessionsFiltersContext';

export const useFilteredSessionsData = (data: SessionData[]) => {
  // Try to get filters context, but don't throw if it doesn't exist
  let filters = null;
  try {
    const context = useSessionsFilters();
    filters = context.filters;
  } catch (error) {
    // If we're not within a SessionsFiltersProvider, just use the data as-is
    filters = null;
  }

  const filteredData = useMemo(() => {
    if (!data) return [];

    return data.filter(session => {
      // Only exclude sessions that are clearly test/invalid data
      // Allow empty sessions and low attendance sessions to be counted
      const sessionName = session.sessionName?.toLowerCase() || '';
      
      // Only exclude if it's clearly test data or invalid
      if (sessionName.includes('test') || sessionName.includes('demo')) {
        return false;
      }

      // Only apply global filters if we have a filter context
      if (!filters) {
        return true; // No filters available, return all data that passed basic exclusions
      }

      // Apply global filters
      if (filters.trainers.length > 0 && !filters.trainers.includes(session.trainerName)) {
        return false;
      }

      if (filters.classTypes.length > 0 && !filters.classTypes.includes(session.cleanedClass)) {
        return false;
      }

      if (filters.dayOfWeek.length > 0 && !filters.dayOfWeek.includes(session.dayOfWeek)) {
        return false;
      }

      if (filters.timeSlots.length > 0 && !filters.timeSlots.includes(session.time)) {
        return false;
      }

      // Date range filter with improved parsing
      if (filters.dateRange.start || filters.dateRange.end) {
        let sessionDate: Date;
        
        // Handle different date formats from the sheets
        if (session.date.includes('/')) {
          // Handle DD/MM/YYYY format
          const parts = session.date.split('/');
          if (parts.length === 3) {
            const day = parseInt(parts[0]);
            const month = parseInt(parts[1]);
            const year = parseInt(parts[2]);
            sessionDate = new Date(year, month - 1, day);
          } else {
            sessionDate = new Date(session.date);
          }
        } else {
          // Handle YYYY-MM-DD format
          sessionDate = new Date(session.date);
        }
        
        // Ensure we have a valid date
        if (isNaN(sessionDate.getTime())) {
          console.warn('Invalid date format:', session.date);
          return true; // Don't exclude if we can't parse the date
        }
        
        // Compare dates (ignore time component)
        const sessionDateOnly = new Date(sessionDate.getFullYear(), sessionDate.getMonth(), sessionDate.getDate());
        
        if (filters.dateRange.start) {
          const startDateOnly = new Date(filters.dateRange.start.getFullYear(), filters.dateRange.start.getMonth(), filters.dateRange.start.getDate());
          if (sessionDateOnly < startDateOnly) {
            return false;
          }
        }
        
        if (filters.dateRange.end) {
          const endDateOnly = new Date(filters.dateRange.end.getFullYear(), filters.dateRange.end.getMonth(), filters.dateRange.end.getDate());
          if (sessionDateOnly > endDateOnly) {
            return false;
          }
        }
      }

      return true;
    });
  }, [data, filters]);

  return filteredData;
};
