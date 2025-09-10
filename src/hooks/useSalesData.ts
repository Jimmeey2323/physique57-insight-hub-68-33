
import { useGoogleSheets } from './useGoogleSheets';

export const useSalesData = () => {
  const { data, loading, error } = useGoogleSheets();
  
  return {
    data,
    loading,
    error,
    isLoading: loading
  };
};
