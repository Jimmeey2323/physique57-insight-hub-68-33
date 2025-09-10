
export const formatCurrency = (value: number | undefined | null): string => {
  // Handle undefined, null, or NaN values
  if (value === undefined || value === null || isNaN(value)) {
    return '₹0';
  }
  
  const absValue = Math.abs(value);
  
  if (absValue < 1000) {
    return `₹${Math.round(value)}`;
  } else if (absValue >= 10000000) {
    return `₹${(value / 10000000).toFixed(1)}Cr`;
  } else if (absValue >= 100000) {
    return `₹${(value / 100000).toFixed(1)}L`;
  } else if (absValue >= 1000) {
    return `₹${(value / 1000).toFixed(1)}K`;
  }
  
  return `₹${value.toLocaleString('en-IN')}`;
};

export const formatPercentage = (value: number | undefined | null): string => {
  if (value === undefined || value === null || isNaN(value)) return '0.0%';
  return `${value.toFixed(1)}%`;
};

export const formatNumber = (value: number | undefined | null): string => {
  if (value === undefined || value === null || isNaN(value)) return '0';
  return value.toLocaleString('en-IN');
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return 'No date';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return 'Invalid date';
  }
};

// Specific formatters for metrics
export const formatATV = (value: number): string => {
  return formatCurrency(Math.round(value)); // No decimals
};

export const formatAUV = (value: number): string => {
  return formatCurrency(Math.round(value)); // No decimals
};

export const formatASV = (value: number): string => {
  return formatCurrency(Math.round(value)); // No decimals
};

export const formatUPT = (value: number): string => {
  return value.toFixed(1); // 1 decimal place
};
