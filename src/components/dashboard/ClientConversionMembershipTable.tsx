
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { NewClientData } from '@/types/dashboard';
import { ModernDataTable } from '@/components/ui/ModernDataTable';

interface ClientConversionMembershipTableProps {
  data: NewClientData[];
}

export const ClientConversionMembershipTable: React.FC<ClientConversionMembershipTableProps> = ({ data }) => {
  const membershipData = React.useMemo(() => {
    const membershipStats = data.reduce((acc, client) => {
      const membership = client.membershipUsed || 'No Membership';
      if (!acc[membership]) {
        acc[membership] = {
          membershipType: membership,
          totalMembers: 0,
          newMembers: 0,
          converted: 0,
          retained: 0,
          totalLTV: 0,
          totalVisits: 0,
          conversionSpans: []
        };
      }
      
      acc[membership].totalMembers++;
      
      // Count new members - only when isNew contains "New" (case sensitive)
      if ((client.isNew || '').includes('New')) {
        acc[membership].newMembers++;
      }
      
      if (client.conversionStatus === 'Converted') acc[membership].converted++;
      if (client.retentionStatus === 'Retained') acc[membership].retained++;
      acc[membership].totalLTV += client.ltv || 0;
      acc[membership].totalVisits += client.visitsPostTrial || 0;
      if (client.conversionSpan && client.conversionSpan > 0) {
        acc[membership].conversionSpans.push(client.conversionSpan);
      }
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(membershipStats)
      .map((stat: any) => ({
        ...stat,
        conversionRate: stat.newMembers > 0 ? (stat.converted / stat.newMembers) * 100 : 0,
        retentionRate: stat.totalMembers > 0 ? (stat.retained / stat.totalMembers) * 100 : 0,
        avgLTV: stat.totalMembers > 0 ? stat.totalLTV / stat.totalMembers : 0,
        avgVisits: stat.totalMembers > 0 ? stat.totalVisits / stat.totalMembers : 0,
        avgConversionSpan: stat.conversionSpans.length > 0 
          ? stat.conversionSpans.reduce((a: number, b: number) => a + b, 0) / stat.conversionSpans.length 
          : 0
      }))
      .filter((stat: any) => stat.totalMembers > 0)
      .sort((a: any, b: any) => b.totalMembers - a.totalMembers);
  }, [data]);

  const columns = [
    {
      key: 'membershipType' as const,
      header: 'Membership Type',
      className: 'font-medium text-xs min-w-[200px]',
      render: (value: string) => (
        <span className="text-xs font-medium text-gray-800 truncate max-w-[200px]" title={value}>
          {value.length > 25 ? `${value.substring(0, 25)}...` : value}
        </span>
      )
    },
    {
      key: 'totalMembers' as const,
      header: 'Total Members',
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
          {value > 50 ? <TrendingUp className="w-3 h-3 text-green-500" /> : value < 20 ? <TrendingDown className="w-3 h-3 text-red-500" /> : null}
          <span className={`text-xs font-semibold ${value > 50 ? 'text-green-600' : value < 20 ? 'text-red-600' : 'text-gray-600'}`}>
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

  // Calculate totals with consistent calculation
  const totals = {
    membershipType: 'TOTAL',
    totalMembers: membershipData.reduce((sum, row) => sum + row.totalMembers, 0),
    newMembers: membershipData.reduce((sum, row) => sum + row.newMembers, 0),
    converted: membershipData.reduce((sum, row) => sum + row.converted, 0),
    conversionRate: 0,
    retained: membershipData.reduce((sum, row) => sum + row.retained, 0),
    retentionRate: 0,
    avgLTV: membershipData.reduce((sum, row) => sum + row.totalLTV, 0) / Math.max(membershipData.reduce((sum, row) => sum + row.totalMembers, 0), 1)
  };
  totals.conversionRate = totals.newMembers > 0 ? (totals.converted / totals.newMembers) * 100 : 0;
  totals.retentionRate = totals.totalMembers > 0 ? (totals.retained / totals.totalMembers) * 100 : 0;

  return (
    <Card className="bg-white shadow-lg border-0">
      <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <CardTitle className="flex items-center gap-2">
          <Award className="w-5 h-5" />
          Membership Type Performance Analysis
          <Badge variant="secondary" className="bg-white/20 text-white">
            {membershipData.length} Types
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ModernDataTable
          data={membershipData}
          columns={columns}
          headerGradient="from-purple-600 to-indigo-600"
          showFooter={true}
          footerData={totals}
          maxHeight="500px"
        />
      </CardContent>
    </Card>
  );
};
