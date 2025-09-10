import React, { useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { OptimizedTable } from '@/components/ui/OptimizedTable';
import { TrendingUp, TrendingDown, DollarSign, Users, Target, Eye, X } from 'lucide-react';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';

interface UniversalDrillDownModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  relatedData: any[];
  type: 'product' | 'category' | 'member' | 'seller' | 'trainer' | 'location' | 'metric' | 'lead' | 'client';
  title: string;
}

export const UniversalDrillDownModal: React.FC<UniversalDrillDownModalProps> = ({
  isOpen,
  onClose,
  data,
  relatedData,
  type,
  title
}) => {
  // Filter related data based on the selected item
  const filteredData = useMemo(() => {
    // First, check if we already have pre-filtered specific data
    if (data?.filteredTransactionData && data.filteredTransactionData.length > 0) {
      console.log(`UniversalDrillDownModal: Using pre-filtered data with ${data.filteredTransactionData.length} transactions`);
      return data.filteredTransactionData;
    }
    
    if (data?.rawData && data.rawData.length > 0) {
      console.log(`UniversalDrillDownModal: Using raw data with ${data.rawData.length} transactions`);
      return data.rawData;
    }
    
    if (!data || !relatedData) return [];
    
    // Fallback to filtering relatedData based on the selected item
    let filtered = [];
    switch (type) {
      case 'product':
        filtered = relatedData.filter(item => 
          item.paymentItem === data.name || 
          item.cleanedProduct === data.name ||
          item.product === data.name
        );
        break;
      case 'category':
        filtered = relatedData.filter(item => 
          item.cleanedCategory === data.name || 
          item.category === data.name
        );
        break;
      case 'member':
        filtered = relatedData.filter(item => 
          item.customerName === data.name ||
          item.memberId === data.memberId
        );
        break;
      case 'seller':
        filtered = relatedData.filter(item => 
          item.soldBy === data.name
        );
        break;
      case 'trainer':
        filtered = relatedData.filter(item => 
          item.teacherName === data.name ||
          item.Trainer === data.name ||
          item.trainerName === data.name
        );
        break;
      case 'location':
        filtered = relatedData.filter(item => 
          item.calculatedLocation === data.name ||
          item.location === data.name ||
          item.center === data.name
        );
        break;
      case 'lead':
        filtered = relatedData.filter(item => 
          item.id === data.id || 
          item.memberId === data.memberId
        );
        break;
      case 'client':
        filtered = relatedData.filter(item => 
          item.memberId === data.memberId ||
          item.firstName === data.firstName
        );
        break;
      default:
        filtered = relatedData.slice(0, 100);
        break;
    }
    
    console.log(`UniversalDrillDownModal: Filtered ${filtered.length} transactions from ${relatedData.length} total`);
    return filtered;
  }, [data, relatedData, type]);

  // Generate summary metrics
  const summaryMetrics = useMemo(() => {
    if (!filteredData.length) return null;

    const metrics = {
      totalRecords: filteredData.length,
      totalRevenue: 0,
      totalTransactions: 0,
      uniqueCustomers: new Set(),
      avgValue: 0
    };

    filteredData.forEach(item => {
      if (item.paymentValue) {
        metrics.totalRevenue += item.paymentValue;
        metrics.totalTransactions += 1;
      }
      if (item.memberId) {
        metrics.uniqueCustomers.add(item.memberId);
      }
      if (item.ltv) {
        metrics.totalRevenue += item.ltv;
      }
    });

    metrics.avgValue = metrics.totalTransactions > 0 ? 
      metrics.totalRevenue / metrics.totalTransactions : 0;

    return {
      ...metrics,
      uniqueCustomers: metrics.uniqueCustomers.size
    };
  }, [filteredData]);

  // Dynamic columns based on data type
  const columns = useMemo(() => {
    if (!filteredData.length) return [];

    const firstItem = filteredData[0];
    const baseColumns = [];

    // Common columns for sales data
    if (firstItem.paymentDate) {
      baseColumns.push(
        { key: 'paymentDate', header: 'Date', align: 'center' as const },
        { key: 'customerName', header: 'Customer', align: 'left' as const },
        { key: 'paymentItem', header: 'Product', align: 'left' as const },
        { 
          key: 'paymentValue', 
          header: 'Amount', 
          align: 'right' as const,
          render: (value: number) => formatCurrency(value)
        },
        { key: 'paymentMethod', header: 'Method', align: 'center' as const }
      );
    }
    // Client/Lead data columns
    else if (firstItem.firstName || firstItem.fullName) {
      baseColumns.push(
        { key: 'firstName', header: 'First Name', align: 'left' as const },
        { key: 'lastName', header: 'Last Name', align: 'left' as const },
        { key: 'email', header: 'Email', align: 'left' as const },
        { 
          key: 'ltv', 
          header: 'LTV', 
          align: 'right' as const,
          render: (value: number) => formatCurrency(value || 0)
        },
        { key: 'conversionStatus', header: 'Status', align: 'center' as const }
      );
    }
    // Session data columns
    else if (firstItem.date || firstItem.sessionId) {
      baseColumns.push(
        { key: 'date', header: 'Date', align: 'center' as const },
        { key: 'cleanedClass', header: 'Class', align: 'left' as const },
        { key: 'instructor', header: 'Instructor', align: 'left' as const },
        { key: 'checkedInCount', header: 'Attendance', align: 'center' as const },
        { key: 'capacity', header: 'Capacity', align: 'center' as const }
      );
    }
    // Trainer data columns
    else if (firstItem.teacherName) {
      baseColumns.push(
        { key: 'teacherName', header: 'Trainer', align: 'left' as const },
        { key: 'totalSessions', header: 'Sessions', align: 'center' as const },
        { key: 'totalCustomers', header: 'Customers', align: 'center' as const },
        { 
          key: 'totalPaid', 
          header: 'Revenue', 
          align: 'right' as const,
          render: (value: number) => formatCurrency(value || 0)
        },
        { key: 'location', header: 'Location', align: 'center' as const }
      );
    }

    return baseColumns;
  }, [filteredData]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0 bg-white">
        <DialogHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
              <Eye className="w-6 h-6" />
              {title} - Detailed View
            </DialogTitle>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Summary Cards */}
          {summaryMetrics && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="border-blue-200 bg-blue-50/50">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Target className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-blue-900">
                    {formatNumber(summaryMetrics.totalRecords)}
                  </div>
                  <div className="text-sm text-blue-600">Total Records</div>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-green-50/50">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-green-900">
                    {formatCurrency(summaryMetrics.totalRevenue)}
                  </div>
                  <div className="text-sm text-green-600">Total Revenue</div>
                </CardContent>
              </Card>

              <Card className="border-purple-200 bg-purple-50/50">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="text-2xl font-bold text-purple-900">
                    {formatNumber(summaryMetrics.uniqueCustomers)}
                  </div>
                  <div className="text-sm text-purple-600">Unique Customers</div>
                </CardContent>
              </Card>

              <Card className="border-orange-200 bg-orange-50/50">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <TrendingUp className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="text-2xl font-bold text-orange-900">
                    {formatCurrency(summaryMetrics.avgValue)}
                  </div>
                  <div className="text-sm text-orange-600">Average Value</div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Data Table */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-slate-100 to-slate-200 border-b">
              <CardTitle className="flex items-center justify-between">
                <span>Detailed Data</span>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  {filteredData.length} items
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {columns.length > 0 && filteredData.length > 0 ? (
                <OptimizedTable
                  data={filteredData.slice(0, 100)} // Limit for performance
                  columns={columns}
                  maxHeight="500px"
                  stickyHeader={true}
                />
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">No detailed data available</p>
                  <p className="text-sm">This item doesn't have associated transaction details.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Data Summary */}
          {data && (
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-gray-100 to-gray-200 border-b">
                <CardTitle>Item Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {Object.entries(data).map(([key, value]) => (
                    <div key={key} className="space-y-1">
                      <div className="font-medium text-gray-600 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </div>
                      <div className="text-gray-900 font-semibold">
                        {typeof value === 'number' && (key.includes('revenue') || key.includes('value') || key.includes('ltv'))
                          ? formatCurrency(value as number)
                          : typeof value === 'number' 
                          ? formatNumber(value as number)
                          : String(value || 'N/A')
                        }
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};