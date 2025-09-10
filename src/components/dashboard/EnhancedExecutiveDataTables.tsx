import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  Users, 
  Target, 
  Activity,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  UserCheck,
  Calendar,
  Star,
  Zap
} from 'lucide-react';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { DisplayedDataExportControls } from '@/components/ui/DisplayedDataExportControls';

interface SimpleEnhancedExecutiveDataTablesProps {
  data: {
    sales: any[];
    sessions: any[];
    payroll: any[];
    newClients: any[];
    leads: any[];
  };
  selectedLocation?: string;
}

export const EnhancedExecutiveDataTables: React.FC<SimpleEnhancedExecutiveDataTablesProps> = ({ 
  data, 
  selectedLocation 
}) => {
  // Process sales by product and category
  const salesByProduct = useMemo(() => {
    const productGroups = data.sales.reduce((acc, sale) => {
      const product = sale.cleanedProduct || 'Unknown Product';
      const category = sale.cleanedCategory || 'Uncategorized';
      
      if (!acc[product]) {
        acc[product] = {
          product,
          category,
          revenue: 0,
          transactions: 0,
          avgValue: 0
        };
      }
      
      acc[product].revenue += sale.paymentValue || 0;
      acc[product].transactions += 1;
      acc[product].avgValue = acc[product].revenue / acc[product].transactions;
      
      return acc;
    }, {} as Record<string, any>);
    
    return Object.values(productGroups)
      .sort((a: any, b: any) => b.revenue - a.revenue)
      .slice(0, 10);
  }, [data.sales]);

  // Process leads by source
  const leadsBySource = useMemo(() => {
    const sourceGroups = data.leads.reduce((acc, lead) => {
      const source = lead.source || 'Unknown Source';
      
      if (!acc[source]) {
        acc[source] = {
          source,
          total: 0,
          converted: 0,
          conversionRate: 0
        };
      }
      
      acc[source].total += 1;
      if (lead.conversionStatus === 'Converted') {
        acc[source].converted += 1;
      }
      acc[source].conversionRate = acc[source].total > 0 ? (acc[source].converted / acc[source].total) * 100 : 0;
      
      return acc;
    }, {} as Record<string, any>);
    
    return Object.values(sourceGroups)
      .sort((a: any, b: any) => b.total - a.total)
      .slice(0, 8);
  }, [data.leads]);

  // Process new clients by class with conversions
  const newClientsByClass = useMemo(() => {
    const classGroups = data.newClients.reduce((acc, client) => {
      const className = client.firstClassType || 'Unknown Class';
      
      if (!acc[className]) {
        acc[className] = {
          className,
          newClients: 0,
          retained: 0,
          retentionRate: 0
        };
      }
      
      acc[className].newClients += 1;
      if (client.isRetained) {
        acc[className].retained += 1;
      }
      acc[className].retentionRate = acc[className].newClients > 0 ? (acc[className].retained / acc[className].newClients) * 100 : 0;
      
      return acc;
    }, {} as Record<string, any>);
    
    return Object.values(classGroups)
      .sort((a: any, b: any) => b.newClients - a.newClients)
      .slice(0, 8);
  }, [data.newClients]);

  if (!data || Object.values(data).every(arr => arr.length === 0)) {
    return (
      <div className="text-center text-gray-600 p-8">
        <Activity className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p>No data available for the selected location and time period.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Sales by Product */}
      <Card className="bg-gradient-to-br from-white via-blue-50/30 to-white border-0 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-blue-600" />
              Top Products by Revenue
              <Badge variant="secondary">{salesByProduct.length} items</Badge>
            </CardTitle>
            <DisplayedDataExportControls 
              tableData={salesByProduct}
              tableHeaders={['Product', 'Category', 'Revenue', 'Transactions', 'Avg Value']}
              tableName="Top Products by Revenue"
              filename="executive-sales-by-product"
              size="sm"
              formatters={{
                'Revenue': (value) => formatCurrency(value),
                'Avg Value': (value) => formatCurrency(value)
              }}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {salesByProduct.map((product: any, index) => (
              <div key={product.product} className="flex items-center justify-between p-3 bg-white/80 rounded-lg shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-slate-800 text-sm">{product.product}</p>
                    <p className="text-xs text-slate-500">{product.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900">{formatCurrency(product.revenue)}</p>
                  <p className="text-xs text-slate-500">{product.transactions} sales</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Leads by Source */}
      <Card className="bg-gradient-to-br from-white via-green-50/30 to-white border-0 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Target className="w-5 h-5 text-green-600" />
              Lead Sources & Conversion
              <Badge variant="secondary">{leadsBySource.length} sources</Badge>
            </CardTitle>
            <DisplayedDataExportControls 
              tableData={leadsBySource}
              tableHeaders={['Source', 'Total Leads', 'Converted', 'Conversion Rate']}
              tableName="Lead Sources & Conversion"
              filename="executive-leads-by-source"
              size="sm"
              formatters={{
                'Conversion Rate': (value) => `${value.toFixed(1)}%`
              }}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {leadsBySource.map((source: any, index) => (
              <div key={source.source} className="flex items-center justify-between p-3 bg-white/80 rounded-lg shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-green-600">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-slate-800 text-sm">{source.source}</p>
                    <p className="text-xs text-slate-500">{source.total} leads</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900">{source.conversionRate.toFixed(1)}%</p>
                  <p className="text-xs text-slate-500">{source.converted} converted</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* New Clients by Class */}
      <Card className="bg-gradient-to-br from-white via-purple-50/30 to-white border-0 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-purple-600" />
              New Clients by Class Type
              <Badge variant="secondary">{newClientsByClass.length} classes</Badge>
            </CardTitle>
            <DisplayedDataExportControls 
              tableData={newClientsByClass}
              tableHeaders={['Class Name', 'New Clients', 'Retained', 'Retention Rate']}
              tableName="New Clients by Class Type"
              filename="executive-new-clients-by-class"
              size="sm"
              formatters={{
                'Retention Rate': (value) => `${value.toFixed(1)}%`
              }}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {newClientsByClass.map((classData: any, index) => (
              <div key={classData.className} className="flex items-center justify-between p-3 bg-white/80 rounded-lg shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-purple-600">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-slate-800 text-sm">{classData.className}</p>
                    <p className="text-xs text-slate-500">{classData.newClients} new clients</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900">{classData.retentionRate.toFixed(1)}%</p>
                  <p className="text-xs text-slate-500">{classData.retained} retained</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};