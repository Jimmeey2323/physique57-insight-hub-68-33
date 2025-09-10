
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { getPreviousMonthDateRange } from '@/utils/dateUtils';

interface SessionsFilters {
  trainers: string[];
  classTypes: string[];
  dayOfWeek: string[];
  timeSlots: string[];
  dateRange: { start: Date | null; end: Date | null };
}

interface SessionsFiltersContextType {
  filters: SessionsFilters;
  updateFilters: (newFilters: Partial<SessionsFilters>) => void;
  clearFilters: () => void;
  clearAllFilters: () => void;
}

const SessionsFiltersContext = createContext<SessionsFiltersContextType | undefined>(undefined);

export const useSessionsFilters = () => {
  const context = useContext(SessionsFiltersContext);
  if (!context) {
    throw new Error('useSessionsFilters must be used within a SessionsFiltersProvider');
  }
  return context;
};

interface SessionsFiltersProviderProps {
  children: ReactNode;
}

export const SessionsFiltersProvider: React.FC<SessionsFiltersProviderProps> = ({ children }) => {
  const [filters, setFilters] = useState<SessionsFilters>(() => {
    const previousMonth = getPreviousMonthDateRange();
    return {
      trainers: [],
      classTypes: [],
      dayOfWeek: [],
      timeSlots: [],
      dateRange: { 
        start: new Date(previousMonth.start), 
        end: new Date(previousMonth.end) 
      }
    };
  });

  const updateFilters = (newFilters: Partial<SessionsFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    const previousMonth = getPreviousMonthDateRange();
    setFilters({
      trainers: [],
      classTypes: [],
      dayOfWeek: [],
      timeSlots: [],
      dateRange: { 
        start: new Date(previousMonth.start), 
        end: new Date(previousMonth.end) 
      }
    });
  };

  const clearAllFilters = clearFilters;

  return (
    <SessionsFiltersContext.Provider value={{
      filters,
      updateFilters,
      clearFilters,
      clearAllFilters
    }}>
      {children}
    </SessionsFiltersContext.Provider>
  );
};
