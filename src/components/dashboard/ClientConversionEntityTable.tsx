
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { NewClientData } from '@/types/dashboard';
import { ModernDataTable } from '@/components/ui/ModernDataTable';

interface ClientConversionEntityTableProps {
  data: NewClientData[];
}

export const ClientConversionEntityTable: React.FC<ClientConversionEntityTableProps> = ({ data }) => {
  const entityData = React.useMemo(() => {
    const entityStats = data.reduce((acc, client) => {
      const entity = client.firstVisitEntityName || 'Unknown Entity';
      if (!acc[entity]) {
        acc[entity] = {
          entityName: entity,
          totalClients: 0,
          newMembers: 0,
          converted: 0,
          retained: 0,
          totalLTV: 0,
          totalVisits: 0,
          totalClasses: 0
        };
      }
      
      acc[entity].totalClients++;
      
      // Count new members - only when isNew contains "New" (case sensitive)
      if ((client.isNew || '').includes('New')) {
        acc[entity].newMembers++;
      }
      
      // Count converted - exact match for "Converted"
      if (client.conversionStatus === 'Converted') {
        acc[entity].converted++;
      }
      
      // Count retained - exact match for "Retained"
      if (client.retentionStatus === 'Retained') {
        acc[entity].retained++;
      }
      
      acc[entity].totalLTV += client.ltv || 0;
      acc[entity].totalVisits += client.visitsPostTrial || 0;
      acc[entity].totalClasses += client.classNo || 0;
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(entityStats)
      .map((stat: any) => ({
        ...stat,
        conversionRate: stat.newMembers > 0 ? (stat.converted / stat.newMembers) * 100 : 0,
        retentionRate: stat.totalClients > 0 ? (stat.retained / stat.totalClients) * 100 : 0,
        avgLTV: stat.totalClients > 0 ? stat.totalLTV / stat.totalClients : 0,
        avgVisits: stat.totalClients > 0 ? stat.totalVisits / stat.totalClients : 0,
        avgClasses: stat.totalClients > 0 ? stat.totalClasses / stat.totalClients : 0
      }))
      .filter((stat: any) => stat.totalClients > 0)
      .sort((a: any, b: any) => b.totalClients - a.totalClients);
  }, [data]);

  const columns = [
    {
      key: 'entityName' as const,
      header: 'First Visit Entity',
      className: 'font-medium text-xs min-w-[180px]',
      render: (value: string) => (
        <div className="text-xs font-medium text-gray-800 truncate max-w-[180px]" title={value}>
          {value || 'Unknown Entity'}
        </div>
      )
    },
    {
      key: 'totalClients' as const,
      header: 'Total Clients',
      align: 'center' as const,
      render: (value: number) => <span className="text-xs font-semibold text-blue-600">{formatNumber(value)}</span>
    },
    {
      key: 'newMembers' as const,
      header: 'New Members',
      align: 'center' as const,
      render: (value: number) => <span className="text-xs font-semibold text-green-600">{formatNumber(value)}</span>
    },
    {
      key: 'converted' as const,
      header: 'Converted',
      align: 'center' as const,
      render: (value: number) => <span className="text-xs font-semibold text-green-600">{formatNumber(value)}</span>
    },
    {
      key: 'conversionRate' as const,
      header: 'Conv. Rate',
      align: 'center' as const,
      render: (value: number) => (
        <div className="flex items-center justify-center gap-1">
          {value > 30 ? <TrendingUp className="w-3 h-3 text-green-500" /> : value < 10 ? <TrendingDown className="w-3 h-3 text-red-500" /> : null}
          <span className={`text-xs font-semibold ${value > 30 ? 'text-green-600' : value < 10 ? 'text-red-600' : 'text-gray-600'}`}>
            {value.toFixed(1)}%
          </span>
        </div>
      )
    },
    {
      key: 'retained' as const,
      header: 'Retained',
      align: 'center' as const,
      render: (value: number) => <span className="text-xs font-semibold text-purple-600">{formatNumber(value)}</span>
    },
    {
      key: 'retentionRate' as const,
      header: 'Ret. Rate',
      align: 'center' as const,
      render: (value: number) => <span className="text-xs font-semibold">{value.toFixed(1)}%</span>
    },
    {
      key: 'avgLTV' as const,
      header: 'Avg LTV',
      align: 'right' as const,
      render: (value: number) => <span className="text-xs font-semibold">{formatCurrency(value)}</span>
    }
  ];

  // Calculate totals with consistent logic
  const totals = {
    entityName: 'TOTAL',
    totalClients: entityData.reduce((sum, row) => sum + row.totalClients, 0),
    newMembers: entityData.reduce((sum, row) => sum + row.newMembers, 0),
    converted: entityData.reduce((sum, row) => sum + row.converted, 0),
    conversionRate: 0,
    retained: entityData.reduce((sum, row) => sum + row.retained, 0),
    retentionRate: 0,
    avgLTV: entityData.reduce((sum, row) => sum + row.totalLTV, 0) / Math.max(entityData.reduce((sum, row) => sum + row.totalClients, 0), 1)
  };
  totals.conversionRate = totals.newMembers > 0 ? (totals.converted / totals.newMembers) * 100 : 0;
  totals.retentionRate = totals.totalClients > 0 ? (totals.retained / totals.totalClients) * 100 : 0;

  return (
    <Card className="bg-white shadow-lg border-0">
      <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-green-600 to-teal-600 text-white">
        <CardTitle className="flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          First Visit Entity Performance Analysis
          <Badge variant="secondary" className="bg-white/20 text-white">
            {entityData.length} Entities
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ModernDataTable
          data={entityData}
          columns={columns}
          headerGradient="from-green-600 to-teal-600"
          showFooter={true}
          footerData={totals}
          maxHeight="500px"
        />
      </CardContent>
    </Card>
  );
};
