import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Users, TrendingUp, Calendar, Award, Target, Clock, UserCheck, AlertTriangle, MapPin, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { ModernDataTable } from '@/components/ui/ModernDataTable';
import { LeadsData } from '@/types/leads';

interface FunnelDrillDownModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  data: LeadsData[];
  type: string;
}

export const FunnelDrillDownModal: React.FC<FunnelDrillDownModalProps> = ({
  isOpen,
  onClose,
  title,
  data,
  type
}) => {
  const columns = [
    {
      key: 'fullName',
      header: 'Name',
      className: 'min-w-[150px]',
      render: (value: string, row: LeadsData) => (
        <div className="font-medium text-gray-900">
          <div className="text-sm font-semibold">{value}</div>
          <div className="text-xs text-gray-500 flex items-center gap-1">
            <Phone className="w-3 h-3" />
            {row.phone}
          </div>
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
      key: 'source',
      header: 'Source',
      align: 'center' as const,
      render: (value: string) => (
        <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
          {value || 'Unknown'}
        </Badge>
      )
    },
    {
      key: 'stage',
      header: 'Stage',
      align: 'center' as const,
      render: (value: string) => (
        <Badge 
          variant="outline"
          className={`${
            value?.includes('Trial') 
              ? 'text-purple-600 border-purple-200 bg-purple-50' 
              : value?.includes('Proximity')
              ? 'text-red-600 border-red-200 bg-red-50'
              : 'text-gray-600 border-gray-200 bg-gray-50'
          }`}
        >
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
      key: 'visits',
      header: 'Visits',
      align: 'center' as const,
      render: (value: number) => (
        <div className="text-sm font-medium text-gray-700">
          {formatNumber(value || 0)}
        </div>
      )
    },
    {
      key: 'center',
      header: 'Location',
      className: 'min-w-[150px]',
      render: (value: string) => (
        <div className="text-sm text-gray-600 truncate flex items-center gap-1" title={value}>
          <MapPin className="w-3 h-3 text-gray-400" />
          {value || 'Unknown'}
        </div>
      )
    }
  ];

  // Calculate summary metrics
  const summary = React.useMemo(() => {
    const totalLeads = data.length;
    const trialsCompleted = data.filter(d => d.stage === 'Trial Completed').length;
    const trialsScheduled = data.filter(d => d.stage?.includes('Trial')).length;
    const convertedLeads = data.filter(d => d.conversionStatus === 'Converted').length;
    const proximityIssues = data.filter(d => d.stage?.includes('Proximity') || d.remarks?.toLowerCase().includes('proximity')).length;
    const totalLTV = data.reduce((sum, d) => sum + (d.ltv || 0), 0);
    const totalVisits = data.reduce((sum, d) => sum + (d.visits || 0), 0);
    
    return {
      totalLeads,
      trialsCompleted,
      trialsScheduled,
      convertedLeads,
      proximityIssues,
      conversionRate: totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0,
      trialConversionRate: trialsCompleted > 0 ? (convertedLeads / trialsCompleted) * 100 : 0,
      avgLTV: totalLeads > 0 ? totalLTV / totalLeads : 0,
      avgVisits: totalLeads > 0 ? totalVisits / totalLeads : 0,
      totalLTV
    };
  }, [data]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b bg-gradient-to-r from-blue-50 to-purple-50 -m-6 p-6 mb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              {title} - Detailed Analysis
            </DialogTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="hover:bg-white/50"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold text-blue-700">
                    {formatNumber(summary.totalLeads)}
                  </div>
                  <div className="text-xs text-blue-600">Total Leads</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-green-600" />
                <div>
                  <div className="text-2xl font-bold text-green-700">
                    {formatNumber(summary.convertedLeads)}
                  </div>
                  <div className="text-xs text-green-600">Converted</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-600" />
                <div>
                  <div className="text-2xl font-bold text-purple-700">
                    {summary.conversionRate.toFixed(1)}%
                  </div>
                  <div className="text-xs text-purple-600">Conv. Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <div>
                  <div className="text-2xl font-bold text-emerald-700">
                    {formatCurrency(summary.avgLTV)}
                  </div>
                  <div className="text-xs text-emerald-600">Avg LTV</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-orange-600" />
                <div>
                  <div className="text-2xl font-bold text-orange-700">
                    {summary.avgVisits.toFixed(1)}
                  </div>
                  <div className="text-xs text-orange-600">Avg Visits</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lead Data Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-600" />
              Lead Details ({formatNumber(data.length)} leads)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ModernDataTable
              data={data}
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