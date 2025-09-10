import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OptimizedTable } from '@/components/ui/OptimizedTable';
import { Badge } from '@/components/ui/badge';
import { SalesData } from '@/types/dashboard';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { Package, MapPin, Users, ShoppingBag, TrendingUp } from 'lucide-react';

interface DiscountBreakdownTablesProps {
  data: SalesData[];
  onDrillDown?: (title: string, data: any[], type: string) => void;
}

export const DiscountBreakdownTables: React.FC<DiscountBreakdownTablesProps> = ({ data, onDrillDown }) => {
  // Product Breakdown
  const productBreakdown = useMemo(() => {
    const products = data.reduce((acc, item) => {
      const product = item.cleanedProduct || 'Unknown Product';
      
      if (!acc[product]) {
        acc[product] = {
          product,
          transactions: 0,
          unitsSold: 0,
          totalDiscount: 0,
          totalRevenue: 0,
          avgDiscountPercent: 0,
          totalDiscountPercent: 0,
          locations: new Set(),
          customers: new Set()
        };
      }
      
      acc[product].transactions += 1;
      acc[product].unitsSold += 1; // Each transaction is one unit
      acc[product].totalDiscount += item.discountAmount || 0;
      acc[product].totalRevenue += item.paymentValue || 0;
      acc[product].totalDiscountPercent += item.discountPercentage || 0;
      acc[product].locations.add(item.calculatedLocation);
      acc[product].customers.add(item.customerEmail);
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(products).map((item: any) => ({
      ...item,
      locationsCount: item.locations.size,
      customersCount: item.customers.size,
      avgDiscountPercent: item.transactions > 0 ? item.totalDiscountPercent / item.transactions : 0,
      avgRevenuePerUnit: item.unitsSold > 0 ? item.totalRevenue / item.unitsSold : 0
    })).sort((a, b) => b.totalDiscount - a.totalDiscount);
  }, [data]);

  // Category Breakdown
  const categoryBreakdown = useMemo(() => {
    const categories = data.reduce((acc, item) => {
      const category = item.cleanedCategory || 'Unknown Category';
      
      if (!acc[category]) {
        acc[category] = {
          category,
          transactions: 0,
          unitsSold: 0,
          totalDiscount: 0,
          totalRevenue: 0,
          avgDiscountPercent: 0,
          totalDiscountPercent: 0,
          products: new Set(),
          customers: new Set()
        };
      }
      
      acc[category].transactions += 1;
      acc[category].unitsSold += 1;
      acc[category].totalDiscount += item.discountAmount || 0;
      acc[category].totalRevenue += item.paymentValue || 0;
      acc[category].totalDiscountPercent += item.discountPercentage || 0;
      acc[category].products.add(item.cleanedProduct);
      acc[category].customers.add(item.customerEmail);
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(categories).map((item: any) => ({
      ...item,
      productsCount: item.products.size,
      customersCount: item.customers.size,
      avgDiscountPercent: item.transactions > 0 ? item.totalDiscountPercent / item.transactions : 0,
      avgRevenuePerUnit: item.unitsSold > 0 ? item.totalRevenue / item.unitsSold : 0
    })).sort((a, b) => b.totalDiscount - a.totalDiscount);
  }, [data]);

  // Location Breakdown
  const locationBreakdown = useMemo(() => {
    const locations = data.reduce((acc, item) => {
      const location = item.calculatedLocation || 'Unknown Location';
      
      if (!acc[location]) {
        acc[location] = {
          location,
          transactions: 0,
          unitsSold: 0,
          totalDiscount: 0,
          totalRevenue: 0,
          avgDiscountPercent: 0,
          totalDiscountPercent: 0,
          products: new Set(),
          customers: new Set()
        };
      }
      
      acc[location].transactions += 1;
      acc[location].unitsSold += 1;
      acc[location].totalDiscount += item.discountAmount || 0;
      acc[location].totalRevenue += item.paymentValue || 0;
      acc[location].totalDiscountPercent += item.discountPercentage || 0;
      acc[location].products.add(item.cleanedProduct);
      acc[location].customers.add(item.customerEmail);
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(locations).map((item: any) => ({
      ...item,
      productsCount: item.products.size,
      customersCount: item.customers.size,
      avgDiscountPercent: item.transactions > 0 ? item.totalDiscountPercent / item.transactions : 0,
      avgRevenuePerUnit: item.unitsSold > 0 ? item.totalRevenue / item.unitsSold : 0
    })).sort((a, b) => b.totalDiscount - a.totalDiscount);
  }, [data]);

  // Sold By Breakdown
  const soldByBreakdown = useMemo(() => {
    const soldBy = data.reduce((acc, item) => {
      const seller = item.soldBy === '-' ? 'Online/System' : (item.soldBy || 'Unknown');
      
      if (!acc[seller]) {
        acc[seller] = {
          soldBy: seller,
          transactions: 0,
          unitsSold: 0,
          totalDiscount: 0,
          totalRevenue: 0,
          avgDiscountPercent: 0,
          totalDiscountPercent: 0,
          products: new Set(),
          customers: new Set()
        };
      }
      
      acc[seller].transactions += 1;
      acc[seller].unitsSold += 1;
      acc[seller].totalDiscount += item.discountAmount || 0;
      acc[seller].totalRevenue += item.paymentValue || 0;
      acc[seller].totalDiscountPercent += item.discountPercentage || 0;
      acc[seller].products.add(item.cleanedProduct);
      acc[seller].customers.add(item.customerEmail);
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(soldBy).map((item: any) => ({
      ...item,
      productsCount: item.products.size,
      customersCount: item.customers.size,
      avgDiscountPercent: item.transactions > 0 ? item.totalDiscountPercent / item.transactions : 0,
      avgRevenuePerUnit: item.unitsSold > 0 ? item.totalRevenue / item.unitsSold : 0
    })).sort((a, b) => b.totalDiscount - a.totalDiscount);
  }, [data]);

  const productColumns = [
    { key: 'product', header: 'Product', align: 'left' as const },
    { key: 'transactions', header: 'Transactions', align: 'center' as const,
      render: (value: number) => <Badge className="w-16 justify-center bg-blue-100 text-blue-800">{formatNumber(value)}</Badge>
    },
    { key: 'unitsSold', header: 'Units Sold', align: 'center' as const,
      render: (value: number) => <Badge className="w-16 justify-center bg-green-100 text-green-800">{formatNumber(value)}</Badge>
    },
    { key: 'customersCount', header: 'Customers', align: 'center' as const,
      render: (value: number) => <Badge className="w-16 justify-center bg-purple-100 text-purple-800">{formatNumber(value)}</Badge>
    },
    { key: 'totalDiscount', header: 'Total Discount', align: 'right' as const,
      render: (value: number) => <span className="font-bold text-red-600">{formatCurrency(value)}</span>
    },
    { key: 'avgDiscountPercent', header: 'Avg Discount %', align: 'right' as const,
      render: (value: number) => <span className="font-medium text-orange-600">{value?.toFixed(1)}%</span>
    },
    { key: 'totalRevenue', header: 'Total Revenue', align: 'right' as const,
      render: (value: number) => <span className="font-bold text-green-600">{formatCurrency(value)}</span>
    },
    { key: 'avgRevenuePerUnit', header: 'Avg Revenue/Unit', align: 'right' as const,
      render: (value: number) => <span className="font-medium text-teal-600">{formatCurrency(value)}</span>
    }
  ];

  const categoryColumns = [
    { key: 'category', header: 'Category', align: 'left' as const },
    { key: 'transactions', header: 'Transactions', align: 'center' as const,
      render: (value: number) => <Badge className="w-16 justify-center bg-blue-100 text-blue-800">{formatNumber(value)}</Badge>
    },
    { key: 'unitsSold', header: 'Units Sold', align: 'center' as const,
      render: (value: number) => <Badge className="w-16 justify-center bg-green-100 text-green-800">{formatNumber(value)}</Badge>
    },
    { key: 'productsCount', header: 'Products', align: 'center' as const,
      render: (value: number) => <Badge className="w-16 justify-center bg-indigo-100 text-indigo-800">{formatNumber(value)}</Badge>
    },
    { key: 'customersCount', header: 'Customers', align: 'center' as const,
      render: (value: number) => <Badge className="w-16 justify-center bg-purple-100 text-purple-800">{formatNumber(value)}</Badge>
    },
    { key: 'totalDiscount', header: 'Total Discount', align: 'right' as const,
      render: (value: number) => <span className="font-bold text-red-600">{formatCurrency(value)}</span>
    },
    { key: 'avgDiscountPercent', header: 'Avg Discount %', align: 'right' as const,
      render: (value: number) => <span className="font-medium text-orange-600">{value?.toFixed(1)}%</span>
    },
    { key: 'totalRevenue', header: 'Total Revenue', align: 'right' as const,
      render: (value: number) => <span className="font-bold text-green-600">{formatCurrency(value)}</span>
    }
  ];

  const locationColumns = [
    { key: 'location', header: 'Location', align: 'left' as const },
    { key: 'transactions', header: 'Transactions', align: 'center' as const,
      render: (value: number) => <Badge className="w-16 justify-center bg-blue-100 text-blue-800">{formatNumber(value)}</Badge>
    },
    { key: 'unitsSold', header: 'Units Sold', align: 'center' as const,
      render: (value: number) => <Badge className="w-16 justify-center bg-green-100 text-green-800">{formatNumber(value)}</Badge>
    },
    { key: 'productsCount', header: 'Products', align: 'center' as const,
      render: (value: number) => <Badge className="w-16 justify-center bg-indigo-100 text-indigo-800">{formatNumber(value)}</Badge>
    },
    { key: 'customersCount', header: 'Customers', align: 'center' as const,
      render: (value: number) => <Badge className="w-16 justify-center bg-purple-100 text-purple-800">{formatNumber(value)}</Badge>
    },
    { key: 'totalDiscount', header: 'Total Discount', align: 'right' as const,
      render: (value: number) => <span className="font-bold text-red-600">{formatCurrency(value)}</span>
    },
    { key: 'avgDiscountPercent', header: 'Avg Discount %', align: 'right' as const,
      render: (value: number) => <span className="font-medium text-orange-600">{value?.toFixed(1)}%</span>
    },
    { key: 'totalRevenue', header: 'Total Revenue', align: 'right' as const,
      render: (value: number) => <span className="font-bold text-green-600">{formatCurrency(value)}</span>
    }
  ];

  const soldByColumns = [
    { key: 'soldBy', header: 'Sold By', align: 'left' as const },
    { key: 'transactions', header: 'Transactions', align: 'center' as const,
      render: (value: number) => <Badge className="w-16 justify-center bg-blue-100 text-blue-800">{formatNumber(value)}</Badge>
    },
    { key: 'unitsSold', header: 'Units Sold', align: 'center' as const,
      render: (value: number) => <Badge className="w-16 justify-center bg-green-100 text-green-800">{formatNumber(value)}</Badge>
    },
    { key: 'productsCount', header: 'Products', align: 'center' as const,
      render: (value: number) => <Badge className="w-16 justify-center bg-indigo-100 text-indigo-800">{formatNumber(value)}</Badge>
    },
    { key: 'customersCount', header: 'Customers', align: 'center' as const,
      render: (value: number) => <Badge className="w-16 justify-center bg-purple-100 text-purple-800">{formatNumber(value)}</Badge>
    },
    { key: 'totalDiscount', header: 'Total Discount', align: 'right' as const,
      render: (value: number) => <span className="font-bold text-red-600">{formatCurrency(value)}</span>
    },
    { key: 'avgDiscountPercent', header: 'Avg Discount %', align: 'right' as const,
      render: (value: number) => <span className="font-medium text-orange-600">{value?.toFixed(1)}%</span>
    },
    { key: 'totalRevenue', header: 'Total Revenue', align: 'right' as const,
      render: (value: number) => <span className="font-bold text-green-600">{formatCurrency(value)}</span>
    }
  ];

  return (
    <Card className="bg-white border-0 shadow-2xl">
      <CardHeader className="bg-gradient-to-r from-orange-900 via-amber-800 to-orange-900 text-white">
        <CardTitle className="text-2xl font-bold flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-amber-300" />
          Discount Breakdown Analytics
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        <Tabs defaultValue="product" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-gradient-to-r from-orange-100 to-amber-100 p-1 rounded-xl">
            <TabsTrigger value="product" className="data-[state=active]:bg-white data-[state=active]:shadow-md">
              <Package className="w-4 h-4 mr-2" />
              By Product
            </TabsTrigger>
            <TabsTrigger value="category" className="data-[state=active]:bg-white data-[state=active]:shadow-md">
              <ShoppingBag className="w-4 h-4 mr-2" />
              By Category
            </TabsTrigger>
            <TabsTrigger value="location" className="data-[state=active]:bg-white data-[state=active]:shadow-md">
              <MapPin className="w-4 h-4 mr-2" />
              By Location
            </TabsTrigger>
            <TabsTrigger value="soldby" className="data-[state=active]:bg-white data-[state=active]:shadow-md">
              <Users className="w-4 h-4 mr-2" />
              By Seller
            </TabsTrigger>
          </TabsList>

          <TabsContent value="product" className="space-y-4">
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-orange-900 mb-2">Product Discount Analysis</h3>
              <p className="text-orange-700">Breakdown of discounts by individual products with units sold and performance metrics.</p>
            </div>
            <OptimizedTable
              data={productBreakdown}
              columns={productColumns}
              maxHeight="500px"
              stickyHeader={true}
              onRowClick={(item) => onDrillDown?.(`Product: ${item.product} - Discount Analysis`, [item], 'product')}
            />
          </TabsContent>

          <TabsContent value="category" className="space-y-4">
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-orange-900 mb-2">Category Discount Analysis</h3>
              <p className="text-orange-700">Discount performance across different product categories with comprehensive metrics.</p>
            </div>
            <OptimizedTable
              data={categoryBreakdown}
              columns={categoryColumns}
              maxHeight="500px"
              stickyHeader={true}
              onRowClick={(item) => onDrillDown?.(`Category: ${item.category} - Discount Analysis`, [item], 'category')}
            />
          </TabsContent>

          <TabsContent value="location" className="space-y-4">
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-orange-900 mb-2">Location Discount Analysis</h3>
              <p className="text-orange-700">Discount distribution and performance across different business locations.</p>
            </div>
            <OptimizedTable
              data={locationBreakdown}
              columns={locationColumns}
              maxHeight="500px"
              stickyHeader={true}
              onRowClick={(item) => onDrillDown?.(`Location: ${item.location} - Discount Analysis`, [item], 'location')}
            />
          </TabsContent>

          <TabsContent value="soldby" className="space-y-4">
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-orange-900 mb-2">Sales Team Discount Analysis</h3>
              <p className="text-orange-700">Discount patterns and performance by sales representatives and online channels.</p>
            </div>
            <OptimizedTable
              data={soldByBreakdown}
              columns={soldByColumns}
              maxHeight="500px"
              stickyHeader={true}
              onRowClick={(item) => onDrillDown?.(`Sold By: ${item.soldBy} - Discount Analysis`, [item], 'soldby')}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};