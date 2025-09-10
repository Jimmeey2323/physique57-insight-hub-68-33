import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow,
  TableFooter 
} from '@/components/ui/table';
import { 
  BarChart3, 
  Users, 
  MapPin, 
  Package, 
  TrendingDown,
  Eye,
  Percent,
  DollarSign
} from 'lucide-react';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';
import { SalesData } from '@/types/dashboard';

interface EnhancedDiscountBreakdownTablesProps {
  data: SalesData[];
  onDrillDown?: (title: string, data: any[], type: string) => void;
}

export const EnhancedDiscountBreakdownTables: React.FC<EnhancedDiscountBreakdownTablesProps> = ({ 
  data, 
  onDrillDown 
}) => {
  
  // Product breakdown
  const productBreakdown = useMemo(() => {
    const breakdown = data.reduce((acc, item) => {
      const key = item.cleanedProduct || 'Unknown Product';
      if (!acc[key]) {
        acc[key] = {
          product: key,
          category: item.cleanedCategory || 'Unknown',
          transactions: 0,
          totalDiscount: 0,
          totalRevenue: 0,
          totalMrp: 0,
          avgDiscountPercentage: 0,
          data: []
        };
      }
      acc[key].transactions += 1;
      acc[key].totalDiscount += item.discountAmount || 0;
      acc[key].totalRevenue += item.paymentValue || 0;
      acc[key].totalMrp += item.mrpPostTax || 0;
      acc[key].data.push(item);
      return acc;
    }, {} as Record<string, any>);

    return Object.values(breakdown).map((item: any) => ({
      ...item,
      avgDiscountPercentage: item.totalMrp > 0 ? (item.totalDiscount / item.totalMrp) * 100 : 0,
      discountRate: item.transactions > 0 ? (item.totalDiscount / item.transactions) : 0
    })).sort((a, b) => b.totalDiscount - a.totalDiscount);
  }, [data]);

  // Location breakdown
  const locationBreakdown = useMemo(() => {
    const breakdown = data.reduce((acc, item) => {
      const key = item.calculatedLocation || 'Unknown Location';
      if (!acc[key]) {
        acc[key] = {
          location: key,
          transactions: 0,
          totalDiscount: 0,
          totalRevenue: 0,
          totalMrp: 0,
          uniqueCustomers: new Set(),
          data: []
        };
      }
      acc[key].transactions += 1;
      acc[key].totalDiscount += item.discountAmount || 0;
      acc[key].totalRevenue += item.paymentValue || 0;
      acc[key].totalMrp += item.mrpPostTax || 0;
      acc[key].uniqueCustomers.add(item.customerEmail);
      acc[key].data.push(item);
      return acc;
    }, {} as Record<string, any>);

    return Object.values(breakdown).map((item: any) => ({
      ...item,
      uniqueCustomers: item.uniqueCustomers.size,
      avgDiscountPercentage: item.totalMrp > 0 ? (item.totalDiscount / item.totalMrp) * 100 : 0,
      avgDiscountPerTransaction: item.transactions > 0 ? (item.totalDiscount / item.transactions) : 0
    })).sort((a, b) => b.totalDiscount - a.totalDiscount);
  }, [data]);

  // Staff breakdown
  const staffBreakdown = useMemo(() => {
    const breakdown = data.reduce((acc, item) => {
      const key = item.soldBy || 'Unknown';
      if (!acc[key]) {
        acc[key] = {
          staff: key,
          transactions: 0,
          totalDiscount: 0,
          totalRevenue: 0,
          totalMrp: 0,
          data: []
        };
      }
      acc[key].transactions += 1;
      acc[key].totalDiscount += item.discountAmount || 0;
      acc[key].totalRevenue += item.paymentValue || 0;
      acc[key].totalMrp += item.mrpPostTax || 0;
      acc[key].data.push(item);
      return acc;
    }, {} as Record<string, any>);

    return Object.values(breakdown).map((item: any) => ({
      ...item,
      avgDiscountPercentage: item.totalMrp > 0 ? (item.totalDiscount / item.totalMrp) * 100 : 0,
      discountRate: item.transactions > 0 ? (item.totalDiscount / item.transactions) : 0
    })).sort((a, b) => b.totalDiscount - a.totalDiscount);
  }, [data]);

  const handleDrillDown = (title: string, data: any[], type: string) => {
    if (onDrillDown) {
      onDrillDown(title, data, type);
    }
  };

  const getPerformanceBadge = (percentage: number) => {
    if (percentage >= 40) return { variant: 'destructive' as const, label: 'High' };
    if (percentage >= 20) return { variant: 'secondary' as const, label: 'Medium' };
    return { variant: 'default' as const, label: 'Low' };
  };

  return (
    <div className="grid gap-6">
      {/* Product Breakdown */}
      <Card className="shadow-xl border-0 bg-gradient-to-br from-white via-orange-50/30 to-amber-50/20">
        <CardHeader className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 text-white rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">Product-wise Discount Breakdown</CardTitle>
              <p className="text-slate-200 mt-1">
                Discount performance analysis by product category
              </p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-center">Transactions</TableHead>
                  <TableHead className="text-right">Total Discount</TableHead>
                  <TableHead className="text-right">Avg Discount %</TableHead>
                  <TableHead className="text-right">Total Revenue</TableHead>
                  <TableHead className="text-right">Discount Impact</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productBreakdown.slice(0, 10).map((item, index) => {
                  const badge = getPerformanceBadge(item.avgDiscountPercentage);
                  return (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        <div className="max-w-[200px] truncate" title={item.product}>
                          {item.product}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-slate-600">{item.category}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{formatNumber(item.transactions)}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-red-600">
                        {formatCurrency(item.totalDiscount)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant={badge.variant}>
                          {formatPercentage(item.avgDiscountPercentage)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-green-600">
                        {formatCurrency(item.totalRevenue)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="text-sm">
                          <div className="font-medium">{formatCurrency(item.discountRate)}</div>
                          <div className="text-slate-500">per transaction</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDrillDown(
                            `${item.product} - Discount Analysis`, 
                            item.data, 
                            'product-discount'
                          )}
                          className="hover:bg-orange-50"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={2} className="font-bold">Total (Top 10)</TableCell>
                  <TableCell className="text-center font-bold">
                    {formatNumber(productBreakdown.slice(0, 10).reduce((sum, item) => sum + item.transactions, 0))}
                  </TableCell>
                  <TableCell className="text-right font-bold text-red-600">
                    {formatCurrency(productBreakdown.slice(0, 10).reduce((sum, item) => sum + item.totalDiscount, 0))}
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {formatPercentage(
                      productBreakdown.slice(0, 10).reduce((sum, item) => sum + item.avgDiscountPercentage, 0) / 
                      Math.min(10, productBreakdown.length)
                    )}
                  </TableCell>
                  <TableCell className="text-right font-bold text-green-600">
                    {formatCurrency(productBreakdown.slice(0, 10).reduce((sum, item) => sum + item.totalRevenue, 0))}
                  </TableCell>
                  <TableCell colSpan={2}></TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Location Breakdown */}
      <Card className="shadow-xl border-0 bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/20">
        <CardHeader className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 text-white rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">Location-wise Discount Breakdown</CardTitle>
              <p className="text-slate-200 mt-1">
                Geographic analysis of discount utilization patterns
              </p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-center">Transactions</TableHead>
                  <TableHead className="text-center">Customers</TableHead>
                  <TableHead className="text-right">Total Discount</TableHead>
                  <TableHead className="text-right">Avg Discount %</TableHead>
                  <TableHead className="text-right">Avg per Transaction</TableHead>
                  <TableHead className="text-right">Total Revenue</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {locationBreakdown.map((item, index) => {
                  const badge = getPerformanceBadge(item.avgDiscountPercentage);
                  return (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.location}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{formatNumber(item.transactions)}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{formatNumber(item.uniqueCustomers)}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-red-600">
                        {formatCurrency(item.totalDiscount)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant={badge.variant}>
                          {formatPercentage(item.avgDiscountPercentage)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(item.avgDiscountPerTransaction)}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-green-600">
                        {formatCurrency(item.totalRevenue)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDrillDown(
                            `${item.location} - Discount Analysis`, 
                            item.data, 
                            'location-discount'
                          )}
                          className="hover:bg-blue-50"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell className="font-bold">Total</TableCell>
                  <TableCell className="text-center font-bold">
                    {formatNumber(locationBreakdown.reduce((sum, item) => sum + item.transactions, 0))}
                  </TableCell>
                  <TableCell className="text-center font-bold">
                    {formatNumber(locationBreakdown.reduce((sum, item) => sum + item.uniqueCustomers, 0))}
                  </TableCell>
                  <TableCell className="text-right font-bold text-red-600">
                    {formatCurrency(locationBreakdown.reduce((sum, item) => sum + item.totalDiscount, 0))}
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {formatPercentage(
                      locationBreakdown.reduce((sum, item) => sum + item.avgDiscountPercentage, 0) / 
                      locationBreakdown.length
                    )}
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {formatCurrency(
                      locationBreakdown.reduce((sum, item) => sum + item.avgDiscountPerTransaction, 0) / 
                      locationBreakdown.length
                    )}
                  </TableCell>
                  <TableCell className="text-right font-bold text-green-600">
                    {formatCurrency(locationBreakdown.reduce((sum, item) => sum + item.totalRevenue, 0))}
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Staff Breakdown */}
      <Card className="shadow-xl border-0 bg-gradient-to-br from-white via-purple-50/30 to-pink-50/20">
        <CardHeader className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 text-white rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">Staff-wise Discount Breakdown</CardTitle>
              <p className="text-slate-200 mt-1">
                Analysis of discount authorization by sales staff
              </p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff Member</TableHead>
                  <TableHead className="text-center">Transactions</TableHead>
                  <TableHead className="text-right">Total Discount</TableHead>
                  <TableHead className="text-right">Avg Discount %</TableHead>
                  <TableHead className="text-right">Discount per Sale</TableHead>
                  <TableHead className="text-right">Total Revenue</TableHead>
                  <TableHead className="text-center">Performance</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staffBreakdown.map((item, index) => {
                  const badge = getPerformanceBadge(item.avgDiscountPercentage);
                  return (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.staff}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{formatNumber(item.transactions)}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-red-600">
                        {formatCurrency(item.totalDiscount)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant={badge.variant}>
                          {formatPercentage(item.avgDiscountPercentage)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(item.discountRate)}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-green-600">
                        {formatCurrency(item.totalRevenue)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={badge.variant}>{badge.label}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDrillDown(
                            `${item.staff} - Discount Analysis`, 
                            item.data, 
                            'staff-discount'
                          )}
                          className="hover:bg-purple-50"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell className="font-bold">Total</TableCell>
                  <TableCell className="text-center font-bold">
                    {formatNumber(staffBreakdown.reduce((sum, item) => sum + item.transactions, 0))}
                  </TableCell>
                  <TableCell className="text-right font-bold text-red-600">
                    {formatCurrency(staffBreakdown.reduce((sum, item) => sum + item.totalDiscount, 0))}
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {formatPercentage(
                      staffBreakdown.reduce((sum, item) => sum + item.avgDiscountPercentage, 0) / 
                      staffBreakdown.length
                    )}
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {formatCurrency(
                      staffBreakdown.reduce((sum, item) => sum + item.discountRate, 0) / 
                      staffBreakdown.length
                    )}
                  </TableCell>
                  <TableCell className="text-right font-bold text-green-600">
                    {formatCurrency(staffBreakdown.reduce((sum, item) => sum + item.totalRevenue, 0))}
                  </TableCell>
                  <TableCell colSpan={2}></TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};