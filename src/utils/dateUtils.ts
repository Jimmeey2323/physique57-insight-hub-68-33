
// Date utility functions for the dashboard
export const getPreviousMonthDateRange = () => {
  const now = new Date();
  // Get the first day of the previous month
  const firstDayPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  // Get the last day of the previous month  
  const lastDayPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0);
  
  // Format dates as YYYY-MM-DD using local timezone
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const result = {
    start: formatDate(firstDayPreviousMonth),
    end: formatDate(lastDayPreviousMonth)
  };
  
  console.log('Previous month date range:', result, { 
    firstDay: firstDayPreviousMonth.toDateString(), 
    lastDay: lastDayPreviousMonth.toDateString(),
    currentMonth: now.getMonth() + 1,
    previousMonth: firstDayPreviousMonth.getMonth() + 1
  });
  
  return result;
};

export const getCurrentMonthDateRange = () => {
  const now = new Date();
  const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDayCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  return {
    start: firstDayCurrentMonth.toISOString().split('T')[0],
    end: lastDayCurrentMonth.toISOString().split('T')[0]
  };
};

export const getDateRangeForMonths = (monthsBack: number) => {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  return {
    start: startDate.toISOString().split('T')[0],
    end: endDate.toISOString().split('T')[0]
  };
};

export const generateDynamicMonths = (monthCount: number = 18) => {
  const months = [];
  const now = new Date();
  
  for (let i = monthCount - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    
    months.push({
      key: `${year}-${month.toString().padStart(2, '0')}`,
      display: `${date.toLocaleDateString('en-US', { month: 'short' })} ${year}`,
      year,
      month
    });
  }
  
  return months;
};

export const parseDate = (dateString: string): Date | null => {
  if (!dateString || dateString.trim() === '') return null;
  
  try {
    // Handle DD/MM/YYYY format
    if (dateString.includes('/')) {
      const parts = dateString.split('/');
      if (parts.length === 3) {
        const day = parseInt(parts[0]);
        const month = parseInt(parts[1]);
        const year = parseInt(parts[2]);
        
        if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
          return new Date(year, month - 1, day);
        }
      }
    }
    
    // Handle YYYY-MM-DD format
    if (dateString.includes('-')) {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
    
    // Try direct parsing
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date;
    }
    
    return null;
  } catch (error) {
    console.warn('Failed to parse date:', dateString, error);
    return null;
  }
};

// New function to get previous month as period string for filters that use period instead of date range
export const getPreviousMonthPeriod = () => {
  const now = new Date();
  const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const year = previousMonth.getFullYear();
  const month = previousMonth.getMonth() + 1;
  
  return `${year}-${month.toString().padStart(2, '0')}`;
};

// Function to get previous month display name
export const getPreviousMonthDisplay = () => {
  const now = new Date();
  const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  
  return `${previousMonth.toLocaleDateString('en-US', { month: 'long' })} ${previousMonth.getFullYear()}`;
};
