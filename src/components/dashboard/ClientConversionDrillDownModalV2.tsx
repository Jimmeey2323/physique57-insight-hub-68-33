import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Users, TrendingUp, Calendar, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { ModernDataTable } from '@/components/ui/ModernDataTable';
import { NewClientData } from '@/types/dashboard';

interface ClientConversionDrillDownModalV2Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  data: any;
  type: 'month' | 'year' | 'class' | 'membership';
}

export const ClientConversionDrillDownModalV2: React.FC<ClientConversionDrillDownModalV2Props> = ({
  isOpen,
  onClose,
  title,
  data,
  type
}) => {
  // Extract targeted client data based on type and drill-down context
  const clients: NewClientData[] = React.useMemo(() => {
    if (!data) return [];
    
    // For month/year type, use the specific clients from the clicked row
    if ((type === 'month' || type === 'year') && data.clients) {
      console.log('Drill-down: Using targeted clients from clicked row:', data.clients.length);
      return data.clients;
    }
    
    // For other types, ensure we return the array format
    if (Array.isArray(data)) {
      return data;
    }
    
    // Fallback to empty array
    console.log('Drill-down: No targeted clients found, showing empty');
    return [];
  }, [data, type]);

  const columns = [
    {
      key: 'firstName',
      header: 'First Name',
      className: 'min-w-[120px]',
      render: (value: string, row: NewClientData) => (
        <div className="font-medium text-gray-900">
          {value} {row.lastName}
        </div>
      )
    },
    {
      key: 'email',
      header: 'Email',
      className: 'min-w-[200px]',
      render: (value: string) => (
        <div className="text-sm text-gray-600 truncate" title={value}>
          {value}
        </div>
      )
    },
    {
      key: 'firstVisitDate',
      header: 'First Visit',
      align: 'center' as const,
      render: (value: string) => (
        <div className="text-sm text-gray-700">
          {new Date(value).toLocaleDateString()}
        </div>
      )
    },
    {
      key: 'isNew',
      header: 'Status',
      align: 'center' as const,
      render: (value: string) => (
        <Badge variant={value?.toLowerCase().includes('new') ? 'default' : 'secondary'}>
          {value || 'Unknown'}
        </Badge>
      )
    },
    {
      key: 'conversionStatus',
      header: 'Conversion',
      align: 'center' as const,
      render: (value: string) => (
        <Badge 
          variant={value?.toLowerCase().includes('converted') ? 'default' : 'secondary'}
          className={value?.toLowerCase().includes('converted') ? 'bg-green-100 text-green-800' : ''}
        >
          {value || 'Pending'}
        </Badge>
      )
    },
    {
      key: 'retentionStatus',
      header: 'Retention',
      align: 'center' as const,
      render: (value: string) => (
        <Badge 
          variant={value?.toLowerCase().includes('retained') ? 'default' : 'secondary'}
          className={value?.toLowerCase().includes('retained') ? 'bg-purple-100 text-purple-800' : ''}
        >
          {value || 'Pending'}
        </Badge>
      )
    },
    {
      key: 'ltv',
      header: 'LTV',
      align: 'right' as const,
      render: (value: number) => (
        <span className="font-semibold text-emerald-600">
          {formatCurrency(value || 0)}
        </span>
      )
    },
    {
      key: 'firstVisitLocation',
      header: 'Location',
      className: 'min-w-[150px]',
      render: (value: string) => (
        <div className="text-sm text-gray-600 truncate" title={value}>
          {value || 'Unknown'}
        </div>
      )
    }
  ];

  // Calculate summary metrics
  const summary = React.useMemo(() => {
    const totalMembers = clients.length;
    const newMembers = clients.filter(c => (c.isNew || '').toLowerCase().includes('new')).length;
    const convertedMembers = clients.filter(c => (c.conversionStatus || '').toLowerCase().includes('converted')).length;
    const retainedMembers = clients.filter(c => (c.retentionStatus || '').toLowerCase().includes('retained')).length;
    const totalLTV = clients.reduce((sum, c) => sum + (c.ltv || 0), 0);
    
    return {
      totalMembers,
      newMembers,
      convertedMembers,
      retainedMembers,
      conversionRate: newMembers > 0 ? (convertedMembers / newMembers) * 100 : 0,
      retentionRate: totalMembers > 0 ? (retainedMembers / totalMembers) * 100 : 0,
      avgLTV: totalMembers > 0 ? totalLTV / totalMembers : 0,
      totalLTV
    };
  }, [clients]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5" />
              {title} - Detailed Analysis
            </DialogTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="hover:bg-gray-100"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" />
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatNumber(summary.totalMembers)}
                  </div>
                  <div className="text-xs text-gray-500">Total Members</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {formatNumber(summary.newMembers)}
                  </div>
                  <div className="text-xs text-gray-500">New Members</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-500" />
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {summary.conversionRate.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500">Conversion Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-500" />
                <div>
                  <div className="text-2xl font-bold text-emerald-600">
                    {formatCurrency(summary.avgLTV)}
                  </div>
                  <div className="text-xs text-gray-500">Avg LTV</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Client Data Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Client Details ({formatNumber(clients.length)} members)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ModernDataTable
              data={clients}
              columns={columns}
              headerGradient="from-blue-600 to-purple-600"
              maxHeight="400px"
            />
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};