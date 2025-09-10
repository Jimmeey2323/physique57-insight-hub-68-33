import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  ShoppingCart, 
  Calendar, 
  MapPin, 
  BarChart3, 
  DollarSign, 
  Activity, 
  CreditCard,
  Target,
  Clock,
  Star,
  Zap,
  X
} from 'lucide-react';
import { NewClientData } from '@/types/dashboard';

interface ClientConversionDrillDownModalV3Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  data: any;
  type: 'month' | 'year' | 'class' | 'membership' | 'metric';
}

export const ClientConversionDrillDownModalV3: React.FC<ClientConversionDrillDownModalV3Props> = ({
  isOpen,
  onClose,
  title,
  data,
  type
}) => {
  if (!data) return null;

  // Extract targeted client data based on type and drill-down context
  const clients: NewClientData[] = React.useMemo(() => {
    if (!data) return [];
    
    // For metric card clicks, use the filtered clients array
    if (type === 'metric' && data.clients) {
      console.log('Drill-down V3: Using metric card filtered clients:', data.clients.length);
      return data.clients;
    }
    
    // For month/year type, use the specific clients from the clicked row
    if ((type === 'month' || type === 'year') && data.clients) {
      console.log('Drill-down V3: Using targeted clients from clicked row:', data.clients.length);
      return data.clients;
    }
    
    // For other types, ensure we return the array format
    if (Array.isArray(data)) {
      return data;
    }
    
    // Fallback to empty array
    console.log('Drill-down V3: No targeted clients found, showing empty');
    return [];
  }, [data, type]);

  // Calculate summary metrics from targeted clients
  const summary = React.useMemo(() => {
    const totalMembers = clients.length;
    const newMembers = clients.filter(c => (c.isNew || '').toLowerCase().includes('new')).length;
    const convertedMembers = clients.filter(c => (c.conversionStatus || '').toLowerCase().includes('converted')).length;
    const retainedMembers = clients.filter(c => (c.retentionStatus || '').toLowerCase().includes('retained')).length;
    const totalLTV = clients.reduce((sum, c) => sum + (c.ltv || 0), 0);
    const totalConversionSpan = clients.filter(c => c.conversionSpan > 0).reduce((sum, c) => sum + (c.conversionSpan || 0), 0);
    const clientsWithConversionData = clients.filter(c => c.conversionSpan > 0).length;
    
    return {
      totalMembers,
      newMembers,
      convertedMembers,
      retainedMembers,
      conversionRate: newMembers > 0 ? (convertedMembers / newMembers) * 100 : 0,
      retentionRate: totalMembers > 0 ? (retainedMembers / totalMembers) * 100 : 0,
      avgLTV: totalMembers > 0 ? totalLTV / totalMembers : 0,
      totalLTV,
      avgConversionTime: clientsWithConversionData > 0 ? totalConversionSpan / clientsWithConversionData : 0
    };
  }, [clients]);

  const renderMetricCards = () => {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 text-blue-100" />
              <Badge className="bg-white/20 text-white border-0">Total</Badge>
            </div>
            <div className="text-2xl font-bold">{formatNumber(summary.totalMembers)}</div>
            <div className="text-blue-100 text-sm">Total Members</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-5 h-5 text-green-100" />
              <Badge className="bg-white/20 text-white border-0">New</Badge>
            </div>
            <div className="text-2xl font-bold">{formatNumber(summary.newMembers)}</div>
            <div className="text-green-100 text-sm">New Members</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-purple-100" />
              <Badge className="bg-white/20 text-white border-0">Rate</Badge>
            </div>
            <div className="text-2xl font-bold">{summary.conversionRate.toFixed(1)}%</div>
            <div className="text-purple-100 text-sm">Conversion Rate</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-5 h-5 text-orange-100" />
              <Badge className="bg-white/20 text-white border-0">LTV</Badge>
            </div>
            <div className="text-2xl font-bold">{formatCurrency(summary.avgLTV)}</div>
            <div className="text-orange-100 text-sm">Avg LTV</div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderClientTable = () => {
    if (clients.length === 0) {
      return (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No client data available for this selection.</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Client Details ({formatNumber(clients.length)} members)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-96 overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-gray-50 z-10">
                <TableRow>
                  <TableHead className="font-semibold text-gray-900 text-xs px-3">Name</TableHead>
                  <TableHead className="font-semibold text-gray-900 text-xs px-3">Email</TableHead>
                  <TableHead className="font-semibold text-gray-900 text-xs px-3 text-center">Type</TableHead>
                  <TableHead className="font-semibold text-gray-900 text-xs px-3 text-center">Status</TableHead>
                  <TableHead className="font-semibold text-gray-900 text-xs px-3 text-center">Conversion</TableHead>
                  <TableHead className="font-semibold text-gray-900 text-xs px-3 text-right">LTV</TableHead>
                  <TableHead className="font-semibold text-gray-900 text-xs px-3 text-center">Location</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.slice(0, 50).map((client, index) => (
                  <TableRow key={index} className="hover:bg-gray-50 transition-colors h-10">
                    <TableCell className="text-xs px-3 font-medium">
                      {client.firstName} {client.lastName}
                    </TableCell>
                    <TableCell className="text-xs px-3 text-gray-600 truncate max-w-[150px]" title={client.email}>
                      {client.email}
                    </TableCell>
                    <TableCell className="text-xs px-3 text-center">
                      <Badge 
                        variant={client.isNew?.toLowerCase().includes('new') ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {client.isNew || 'Unknown'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs px-3 text-center">
                      <Badge 
                        variant={client.retentionStatus?.toLowerCase().includes('retained') ? 'default' : 'secondary'}
                        className={`text-xs ${
                          client.retentionStatus?.toLowerCase().includes('retained') 
                            ? 'bg-purple-100 text-purple-800' 
                            : ''
                        }`}
                      >
                        {client.retentionStatus || 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs px-3 text-center">
                      <Badge 
                        variant={client.conversionStatus?.toLowerCase().includes('converted') ? 'default' : 'secondary'}
                        className={`text-xs ${
                          client.conversionStatus?.toLowerCase().includes('converted') 
                            ? 'bg-green-100 text-green-800' 
                            : ''
                        }`}
                      >
                        {client.conversionStatus || 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs px-3 text-right font-semibold text-emerald-600">
                      {formatCurrency(client.ltv || 0)}
                    </TableCell>
                    <TableCell className="text-xs px-3 text-center text-gray-600 truncate max-w-[120px]" title={client.firstVisitLocation}>
                      {client.firstVisitLocation || 'Unknown'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {clients.length > 50 && (
              <div className="p-4 text-center text-sm text-gray-600 bg-gray-50 border-t">
                Showing 50 of {clients.length} clients. Drill down shows only targeted data for this selection.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto bg-gradient-to-br from-white via-slate-50/30 to-white border-0 shadow-2xl">
        <DialogHeader className="pb-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-slate-800 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                {title} - Detailed Analysis
              </DialogTitle>
              <p className="text-slate-600 mt-2 text-lg">
                Targeted client conversion and retention analysis
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-100 text-blue-800 border-0">
                {type === 'month' ? 'Monthly' : type === 'year' ? 'Yearly' : type === 'metric' ? 'Metric Analysis' : 'Analytics'}
              </Badge>
              <Button variant="outline" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="pt-6 space-y-8">
          {/* Metric Cards */}
          {renderMetricCards()}

          {/* Main Content Tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-slate-100">
              <TabsTrigger value="overview" className="gap-2">
                <Star className="w-4 h-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="clients" className="gap-2">
                <Users className="w-4 h-4" />
                Client Details
              </TabsTrigger>
              <TabsTrigger value="insights" className="gap-2">
                <Zap className="w-4 h-4" />
                Insights
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
                <CardHeader>
                  <CardTitle className="text-indigo-800">Summary Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-white rounded-lg border">
                      <div className="text-2xl font-bold text-indigo-600">
                        {formatNumber(summary.totalMembers)}
                      </div>
                      <div className="text-sm text-indigo-600">Total Members</div>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg border">
                      <div className="text-2xl font-bold text-green-600">
                        {formatNumber(summary.convertedMembers)}
                      </div>
                      <div className="text-sm text-green-600">Converted</div>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg border">
                      <div className="text-2xl font-bold text-purple-600">
                        {summary.conversionRate.toFixed(1)}%
                      </div>
                      <div className="text-sm text-purple-600">Conversion Rate</div>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg border">
                      <div className="text-2xl font-bold text-orange-600">
                        {summary.avgConversionTime > 0 ? `${summary.avgConversionTime.toFixed(0)} days` : 'N/A'}
                      </div>
                      <div className="text-sm text-orange-600">Avg Conv. Time</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="clients">
              {renderClientTable()}
            </TabsContent>

            <TabsContent value="insights">
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardHeader>
                  <CardTitle className="text-purple-800">AI-Powered Insights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="p-4 bg-white rounded-lg border-l-4 border-purple-400">
                      <h4 className="font-medium text-purple-800 mb-2">Key Metrics</h4>
                      <ul className="text-sm text-purple-600 space-y-1">
                        <li>• Total Revenue: {formatCurrency(summary.totalLTV)}</li>
                        <li>• Conversion Rate: {summary.conversionRate.toFixed(1)}%</li>
                        <li>• Retention Rate: {summary.retentionRate.toFixed(1)}%</li>
                        <li>• Average Customer Value: {formatCurrency(summary.avgLTV)}</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-white rounded-lg border-l-4 border-orange-400">
                      <h4 className="font-medium text-orange-800 mb-2">Performance Analysis</h4>
                      <ul className="text-sm text-orange-600 space-y-1">
                        <li>• {summary.conversionRate > 30 ? 'Strong' : summary.conversionRate > 15 ? 'Moderate' : 'Needs improvement'} conversion performance</li>
                        <li>• {summary.retentionRate > 70 ? 'Excellent' : summary.retentionRate > 50 ? 'Good' : 'Needs attention'} retention rate</li>
                        <li>• Customer lifetime value is {summary.avgLTV > 10000 ? 'high' : summary.avgLTV > 5000 ? 'moderate' : 'developing'}</li>
                        <li>• This selection shows targeted analytics for clicked data only</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};