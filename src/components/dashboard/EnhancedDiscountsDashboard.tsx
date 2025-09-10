import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, ComposedChart, Area, AreaChart
} from 'recharts';
import { 
  TrendingDown, Percent, DollarSign, Package, Target, Calendar, MapPin, 
  Users, ShoppingCart, Tag, Filter, BarChart3, PieChart as PieChartIcon,
  TrendingUp, Activity, CreditCard, Award, AlertTriangle, Eye, Crown,
  ArrowUp, ArrowDown, Zap, Star
} from 'lucide-react';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';
import { SalesData } from '@/types/dashboard';

interface EnhancedDiscountsDashboardProps {
  data: SalesData[];
}

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#ec4899', '#84cc16'];

export const EnhancedDiscountsDashboard: React.FC<EnhancedDiscountsDashboardProps> = ({ data }) => {
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSoldBy, setSelectedSoldBy] = useState('all');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('all');
  const [activeChart, setActiveChart] = useState('monthly');
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [minDiscountAmount, setMinDiscountAmount] = useState('');
  const [maxDiscountAmount, setMaxDiscountAmount] = useState('');

  // Filter data based on selections
  const filteredData = useMemo(() => {
    return data.filter(item => {
      // Location filter
      if (selectedLocation !== 'all' && item.calculatedLocation !== selectedLocation) return false;
      
      // Product filter
      if (selectedProduct !== 'all' && item.cleanedProduct !== selectedProduct) return false;
      
      // Category filter
      if (selectedCategory !== 'all' && item.cleanedCategory !== selectedCategory) return false;
      
      // Sold By filter
      if (selectedSoldBy !== 'all') {
        const soldBy = item.soldBy === '-' ? 'Online/System' : item.soldBy;
        if (soldBy !== selectedSoldBy) return false;
      }
      
      // Payment Method filter
      if (selectedPaymentMethod !== 'all' && item.paymentMethod !== selectedPaymentMethod) return false;
      
      // Date range filter
      if (dateRange.from || dateRange.to) {
        const itemDate = new Date(item.paymentDate);
        if (dateRange.from && itemDate < dateRange.from) return false;
        if (dateRange.to && itemDate > dateRange.to) return false;
      }
      
      // Discount amount range filter
      if (minDiscountAmount && (item.discountAmount || 0) < parseFloat(minDiscountAmount)) return false;
      if (maxDiscountAmount && (item.discountAmount || 0) > parseFloat(maxDiscountAmount)) return false;
      
      return true;
    });
  }, [data, selectedLocation, selectedProduct, selectedCategory, selectedSoldBy, selectedPaymentMethod, dateRange, minDiscountAmount, maxDiscountAmount]);

  // Get unique values for filters
  const filterOptions = useMemo(() => {
    return {
      locations: [...new Set(data.map(item => item.calculatedLocation))].filter(Boolean),
      products: [...new Set(data.map(item => item.cleanedProduct))].filter(Boolean),
      categories: [...new Set(data.map(item => item.cleanedCategory))].filter(Boolean),
      soldBy: [...new Set(data.map(item => item.soldBy === '-' ? 'Online/System' : item.soldBy))].filter(Boolean),
      paymentMethods: [...new Set(data.map(item => item.paymentMethod))].filter(Boolean)
    };
  }, [data]);

  // Separate discounted and non-discounted data
  const discountedData = useMemo(() => {
    return filteredData.filter(item => (item.discountAmount || 0) > 0);
  }, [filteredData]);

  const nonDiscountedData = useMemo(() => {
    return filteredData.filter(item => (item.discountAmount || 0) === 0);
  }, [filteredData]);

  // Calculate comprehensive metrics
  const metrics = useMemo(() => {
    const totalRevenue = filteredData.reduce((sum, item) => sum + (item.paymentValue || 0), 0);
    const totalDiscount = filteredData.reduce((sum, item) => sum + (item.discountAmount || 0), 0);
    const totalTransactions = filteredData.length;
    const totalUnits = filteredData.length; // Each transaction is one unit
    const uniqueMembers = new Set(filteredData.map(item => item.memberId)).size;
    
    // Discounted metrics
    const discountedRevenue = discountedData.reduce((sum, item) => sum + (item.paymentValue || 0), 0);
    const discountedTransactions = discountedData.length;
    const discountedUnits = discountedData.length;
    const discountedUniqueMembers = new Set(discountedData.map(item => item.memberId)).size;
    
    // Non-discounted metrics
    const nonDiscountedRevenue = nonDiscountedData.reduce((sum, item) => sum + (item.paymentValue || 0), 0);
    const nonDiscountedTransactions = nonDiscountedData.length;
    const nonDiscountedUnits = nonDiscountedData.length;
    const nonDiscountedUniqueMembers = new Set(nonDiscountedData.map(item => item.memberId)).size;
    
    // Calculate ATVs, AUVs, ASVs, UPTs
    const overallATV = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
    const overallAUV = totalUnits > 0 ? totalRevenue / totalUnits : 0;
    const overallASV = uniqueMembers > 0 ? totalRevenue / uniqueMembers : 0;
    const overallUPT = totalTransactions > 0 ? totalUnits / totalTransactions : 1;
    
    const discountedATV = discountedTransactions > 0 ? discountedRevenue / discountedTransactions : 0;
    const discountedAUV = discountedUnits > 0 ? discountedRevenue / discountedUnits : 0;
    const discountedASV = discountedUniqueMembers > 0 ? discountedRevenue / discountedUniqueMembers : 0;
    const discountedUPT = discountedTransactions > 0 ? discountedUnits / discountedTransactions : 1;
    
    const nonDiscountedATV = nonDiscountedTransactions > 0 ? nonDiscountedRevenue / nonDiscountedTransactions : 0;
    const nonDiscountedAUV = nonDiscountedUnits > 0 ? nonDiscountedRevenue / nonDiscountedUnits : 0;
    const nonDiscountedASV = nonDiscountedUniqueMembers > 0 ? nonDiscountedRevenue / nonDiscountedUniqueMembers : 0;
    const nonDiscountedUPT = nonDiscountedTransactions > 0 ? nonDiscountedUnits / nonDiscountedTransactions : 1;
    
    const avgDiscountPercentage = discountedData.length > 0 
      ? discountedData.reduce((sum, item) => sum + (item.discountPercentage || 0), 0) / discountedData.length 
      : 0;
    
    const discountPenetration = totalTransactions > 0 ? (discountedTransactions / totalTransactions) * 100 : 0;

    return {
      // Overall metrics
      totalRevenue,
      totalDiscount,
      totalTransactions,
      totalUnits,
      uniqueMembers,
      overallATV,
      overallAUV,
      overallASV,
      overallUPT,
      avgDiscountPercentage,
      discountPenetration,
      
      // Discounted metrics
      discountedRevenue,
      discountedTransactions,
      discountedUnits,
      discountedUniqueMembers,
      discountedATV,
      discountedAUV,
      discountedASV,
      discountedUPT,
      
      // Non-discounted metrics
      nonDiscountedRevenue,
      nonDiscountedTransactions,
      nonDiscountedUnits,
      nonDiscountedUniqueMembers,
      nonDiscountedATV,
      nonDiscountedAUV,
      nonDiscountedASV,
      nonDiscountedUPT
    };
  }, [filteredData, discountedData, nonDiscountedData]);

  // Monthly analysis
  const monthlyAnalysis = useMemo(() => {
    const monthlyStats = filteredData.reduce((acc, item) => {
      if (!item.paymentDate) return acc;
      
      const date = new Date(item.paymentDate);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: monthName,
          sortKey: monthKey,
          totalRevenue: 0,
          totalDiscount: 0,
          totalTransactions: 0,
          discountedTransactions: 0,
          uniqueMembers: new Set()
        };
      }
      
      acc[monthKey].totalRevenue += item.paymentValue || 0;
      acc[monthKey].totalDiscount += item.discountAmount || 0;
      acc[monthKey].totalTransactions += 1;
      acc[monthKey].uniqueMembers.add(item.memberId);
      
      if ((item.discountAmount || 0) > 0) {
        acc[monthKey].discountedTransactions += 1;
      }
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(monthlyStats)
      .map((stat: any) => ({
        ...stat,
        uniqueMembers: stat.uniqueMembers.size,
        discountRate: stat.totalRevenue > 0 ? (stat.totalDiscount / stat.totalRevenue) * 100 : 0,
        discountPenetration: stat.totalTransactions > 0 ? (stat.discountedTransactions / stat.totalTransactions) * 100 : 0,
        atv: stat.totalTransactions > 0 ? stat.totalRevenue / stat.totalTransactions : 0,
        asv: stat.uniqueMembers > 0 ? stat.totalRevenue / stat.uniqueMembers : 0
      }))
      .sort((a: any, b: any) => a.sortKey.localeCompare(b.sortKey));
  }, [filteredData]);

  // Year-on-Year analysis
  const yearlyAnalysis = useMemo(() => {
    const yearlyStats = filteredData.reduce((acc, item) => {
      if (!item.paymentDate) return acc;
      
      const date = new Date(item.paymentDate);
      const year = date.getFullYear().toString();
      
      if (!acc[year]) {
        acc[year] = {
          year,
          totalRevenue: 0,
          totalDiscount: 0,
          totalTransactions: 0,
          discountedTransactions: 0,
          uniqueMembers: new Set()
        };
      }
      
      acc[year].totalRevenue += item.paymentValue || 0;
      acc[year].totalDiscount += item.discountAmount || 0;
      acc[year].totalTransactions += 1;
      acc[year].uniqueMembers.add(item.memberId);
      
      if ((item.discountAmount || 0) > 0) {
        acc[year].discountedTransactions += 1;
      }
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(yearlyStats)
      .map((stat: any) => ({
        ...stat,
        uniqueMembers: stat.uniqueMembers.size,
        discountRate: stat.totalRevenue > 0 ? (stat.totalDiscount / stat.totalRevenue) * 100 : 0,
        discountPenetration: stat.totalTransactions > 0 ? (stat.discountedTransactions / stat.totalTransactions) * 100 : 0,
        atv: stat.totalTransactions > 0 ? stat.totalRevenue / stat.totalTransactions : 0,
        asv: stat.uniqueMembers > 0 ? stat.totalRevenue / stat.uniqueMembers : 0
      }))
      .sort((a: any, b: any) => a.year.localeCompare(b.year));
  }, [filteredData]);

  // Top/Bottom ranking lists
  const rankingLists = useMemo(() => {
    const analyzeByDimension = (dimensionKey: string) => {
      const stats = filteredData.reduce((acc, item) => {
        const key = dimensionKey === 'soldBy' 
          ? (item.soldBy === '-' ? 'Online/System' : item.soldBy)
          : item[dimensionKey as keyof SalesData] as string || 'Unknown';
        
        if (!acc[key]) {
          acc[key] = {
            name: key,
            totalRevenue: 0,
            totalDiscount: 0,
            totalTransactions: 0,
            discountedTransactions: 0,
            uniqueMembers: new Set(),
            totalUnits: 0
          };
        }
        
        acc[key].totalRevenue += item.paymentValue || 0;
        acc[key].totalDiscount += item.discountAmount || 0;
        acc[key].totalTransactions += 1;
        acc[key].totalUnits += 1;
        acc[key].uniqueMembers.add(item.memberId);
        
        if ((item.discountAmount || 0) > 0) {
          acc[key].discountedTransactions += 1;
        }
        
        return acc;
      }, {} as Record<string, any>);

      return Object.values(stats)
        .map((stat: any) => ({
          ...stat,
          uniqueMembers: stat.uniqueMembers.size,
          discountRate: stat.totalRevenue > 0 ? (stat.totalDiscount / stat.totalRevenue) * 100 : 0,
          discountPenetration: stat.totalTransactions > 0 ? (stat.discountedTransactions / stat.totalTransactions) * 100 : 0,
          atv: stat.totalTransactions > 0 ? stat.totalRevenue / stat.totalTransactions : 0,
          auv: stat.totalUnits > 0 ? stat.totalRevenue / stat.totalUnits : 0,
          asv: stat.uniqueMembers > 0 ? stat.totalRevenue / stat.uniqueMembers : 0,
          upt: stat.totalTransactions > 0 ? stat.totalUnits / stat.totalTransactions : 1
        }))
        .sort((a: any, b: any) => b.totalDiscount - a.totalDiscount);
    };

    return {
      byLocation: analyzeByDimension('calculatedLocation'),
      byProduct: analyzeByDimension('cleanedProduct'),
      byCategory: analyzeByDimension('cleanedCategory'),
      bySoldBy: analyzeByDimension('soldBy'),
      byPaymentMethod: analyzeByDimension('paymentMethod')
    };
  }, [filteredData]);

  // Impact analysis
  const impactAnalysis = useMemo(() => {
    const revenueImpact = metrics.totalDiscount;
    const atvImpact = metrics.discountedATV - metrics.nonDiscountedATV;
    const unitsImpact = metrics.discountedUnits - metrics.nonDiscountedUnits;
    const membershipImpact = metrics.discountedUniqueMembers - metrics.nonDiscountedUniqueMembers;
    
    // Calculate what revenue would have been without discounts
    const potentialRevenue = filteredData.reduce((sum, item) => {
      const originalPrice = (item.paymentValue || 0) + (item.discountAmount || 0);
      return sum + originalPrice;
    }, 0);
    
    const revenueEfficiency = potentialRevenue > 0 ? (metrics.totalRevenue / potentialRevenue) * 100 : 0;
    
    return {
      revenueImpact,
      atvImpact,
      unitsImpact,
      membershipImpact,
      potentialRevenue,
      revenueEfficiency,
      discountROI: revenueImpact > 0 ? (metrics.totalRevenue / revenueImpact) : 0
    };
  }, [metrics, filteredData]);

  const clearFilters = () => {
    setSelectedLocation('all');
    setSelectedProduct('all');
    setSelectedCategory('all');
    setSelectedSoldBy('all');
    setSelectedPaymentMethod('all');
    setDateRange({});
    setMinDiscountAmount('');
    setMaxDiscountAmount('');
  };

  const renderTopBottomList = (items: any[], title: string, metric: string = 'totalDiscount') => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Top Performers */}
      <Card className="bg-gradient-to-br from-white via-green-50/30 to-emerald-50/20 border-0 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-600" />
            Top {title} by Discount Amount
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.slice(0, 5).map((item, index) => (
            <div 
              key={item.name} 
              className="flex items-center justify-between p-4 bg-white/60 rounded-lg hover:bg-white/80 transition-all duration-300 cursor-pointer hover:scale-102 group"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                  index === 0 ? 'bg-gradient-to-r from-yellow-500 to-amber-500' :
                  index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                  index === 2 ? 'bg-gradient-to-r from-orange-500 to-amber-600' :
                  'bg-gradient-to-r from-blue-500 to-purple-600'
                }`}>
                  #{index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm text-slate-800 truncate group-hover:text-slate-900">
                    {item.name}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-slate-600">
                    <span>{formatNumber(item.totalTransactions)} transactions</span>
                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                      {item.discountRate.toFixed(1)}% rate
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="text-right space-y-1">
                <div className="font-bold text-red-600 text-sm">
                  {formatCurrency(item.totalDiscount)}
                </div>
                <div className="text-xs text-slate-500">
                  {formatCurrency(item.atv)} ATV
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Bottom Performers */}
      <Card className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/20 border-0 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            Lowest {title} by Discount Amount
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.slice(-5).reverse().map((item, index) => (
            <div 
              key={item.name} 
              className="flex items-center justify-between p-4 bg-white/60 rounded-lg hover:bg-white/80 transition-all duration-300 cursor-pointer hover:scale-102 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-slate-500 to-gray-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  #{items.length - 4 + index}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm text-slate-800 truncate group-hover:text-slate-900">
                    {item.name}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-slate-600">
                    <span>{formatNumber(item.totalTransactions)} transactions</span>
                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                      {item.discountRate.toFixed(1)}% rate
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="text-right space-y-1">
                <div className="font-bold text-blue-600 text-sm">
                  {formatCurrency(item.totalDiscount)}
                </div>
                <div className="text-xs text-slate-500">
                  {formatCurrency(item.atv)} ATV
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );

  if (!data || data.length === 0) {
    return (
      <Card className="bg-white shadow-xl border-0">
        <CardContent className="p-12 text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Data Available</h3>
          <p className="text-gray-600">No sales data found for discount analysis.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Filters Section */}
      <Card className="bg-white shadow-xl border-0">
        <CardHeader className="bg-gradient-to-r from-orange-600 to-red-600 text-white">
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Advanced Discount Analysis Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Location
              </label>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {filterOptions.locations.map(location => (
                    <SelectItem key={location} value={location}>{location}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Package className="w-4 h-4" />
                Product
              </label>
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger>
                  <SelectValue placeholder="All Products" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  {filterOptions.products.map(product => (
                    <SelectItem key={product} value={product}>{product}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Category
              </label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {filterOptions.categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Sold By
              </label>
              <Select value={selectedSoldBy} onValueChange={setSelectedSoldBy}>
                <SelectTrigger>
                  <SelectValue placeholder="All Staff" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Staff</SelectItem>
                  {filterOptions.soldBy.map(seller => (
                    <SelectItem key={seller} value={seller}>{seller}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Payment Method
              </label>
              <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="All Methods" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  {filterOptions.paymentMethods.map(method => (
                    <SelectItem key={method} value={method}>{method}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Date Range
              </label>
              <DatePickerWithRange 
                value={dateRange}
                onChange={setDateRange}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Min Discount Amount</label>
              <Input
                type="number"
                placeholder="₹0"
                value={minDiscountAmount}
                onChange={(e) => setMinDiscountAmount(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Max Discount Amount</label>
              <Input
                type="number"
                placeholder="₹10000"
                value={maxDiscountAmount}
                onChange={(e) => setMaxDiscountAmount(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={clearFilters} variant="outline" className="gap-2">
              <Target className="w-4 h-4" />
              Clear All Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-xl">
          <CardContent className="p-6 text-center">
            <DollarSign className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <p className="text-green-700 font-semibold mb-2">Total Revenue</p>
            <p className="text-3xl font-bold text-green-800">{formatCurrency(metrics.totalRevenue)}</p>
            <p className="text-xs text-green-600 mt-1">All transactions</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-rose-50 border-red-200 shadow-xl">
          <CardContent className="p-6 text-center">
            <TrendingDown className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <p className="text-red-700 font-semibold mb-2">Total Discount</p>
            <p className="text-3xl font-bold text-red-800">{formatCurrency(metrics.totalDiscount)}</p>
            <p className="text-xs text-red-600 mt-1">Revenue impact</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-xl">
          <CardContent className="p-6 text-center">
            <ShoppingCart className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <p className="text-blue-700 font-semibold mb-2">Total Transactions</p>
            <p className="text-3xl font-bold text-blue-800">{formatNumber(metrics.totalTransactions)}</p>
            <p className="text-xs text-blue-600 mt-1">{formatNumber(metrics.discountedTransactions)} discounted</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200 shadow-xl">
          <CardContent className="p-6 text-center">
            <Users className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <p className="text-purple-700 font-semibold mb-2">Unique Members</p>
            <p className="text-3xl font-bold text-purple-800">{formatNumber(metrics.uniqueMembers)}</p>
            <p className="text-xs text-purple-600 mt-1">{formatNumber(metrics.discountedUniqueMembers)} got discounts</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200 shadow-xl">
          <CardContent className="p-6 text-center">
            <Percent className="w-12 h-12 text-orange-600 mx-auto mb-4" />
            <p className="text-orange-700 font-semibold mb-2">Discount Penetration</p>
            <p className="text-3xl font-bold text-orange-800">{metrics.discountPenetration.toFixed(1)}%</p>
            <p className="text-xs text-orange-600 mt-1">Of all transactions</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-200 shadow-xl">
          <CardContent className="p-6 text-center">
            <Target className="w-12 h-12 text-teal-600 mx-auto mb-4" />
            <p className="text-teal-700 font-semibold mb-2">Avg Discount %</p>
            <p className="text-3xl font-bold text-teal-800">{metrics.avgDiscountPercentage.toFixed(1)}%</p>
            <p className="text-xs text-teal-600 mt-1">Per discounted sale</p>
          </CardContent>
        </Card>
      </div>

      {/* Discount Impact Analysis */}
      <Card className="bg-gradient-to-br from-white via-slate-50/30 to-white border-0 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-900 text-white">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Zap className="w-6 h-6" />
            Discount Impact Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Discounted vs Non-Discounted Comparison */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                Discounted vs Non-Discounted Performance
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-red-50 border-red-200">
                  <CardContent className="p-4 text-center">
                    <h4 className="font-semibold text-red-800 mb-3">Discounted Sales</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Revenue:</span>
                        <span className="font-bold">{formatCurrency(metrics.discountedRevenue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Transactions:</span>
                        <span className="font-bold">{formatNumber(metrics.discountedTransactions)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>ATV:</span>
                        <span className="font-bold">{formatCurrency(metrics.discountedATV)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>ASV:</span>
                        <span className="font-bold">{formatCurrency(metrics.discountedASV)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Members:</span>
                        <span className="font-bold">{formatNumber(metrics.discountedUniqueMembers)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4 text-center">
                    <h4 className="font-semibold text-green-800 mb-3">Non-Discounted Sales</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Revenue:</span>
                        <span className="font-bold">{formatCurrency(metrics.nonDiscountedRevenue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Transactions:</span>
                        <span className="font-bold">{formatNumber(metrics.nonDiscountedTransactions)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>ATV:</span>
                        <span className="font-bold">{formatCurrency(metrics.nonDiscountedATV)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>ASV:</span>
                        <span className="font-bold">{formatCurrency(metrics.nonDiscountedASV)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Members:</span>
                        <span className="font-bold">{formatNumber(metrics.nonDiscountedUniqueMembers)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Impact Metrics */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-600" />
                Revenue & Performance Impact
              </h3>
              
              <div className="space-y-4">
                <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-blue-600" />
                        <span className="font-semibold text-blue-800">Revenue Efficiency</span>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-900">
                          {impactAnalysis.revenueEfficiency.toFixed(1)}%
                        </div>
                        <div className="text-xs text-blue-600">
                          {formatCurrency(metrics.totalRevenue)} of {formatCurrency(impactAnalysis.potentialRevenue)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-purple-600" />
                        <span className="font-semibold text-purple-800">ATV Impact</span>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${impactAnalysis.atvImpact >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                          {impactAnalysis.atvImpact >= 0 ? '+' : ''}{formatCurrency(impactAnalysis.atvImpact)}
                        </div>
                        <div className="text-xs text-purple-600">
                          Discounted vs Non-discounted
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-green-600" />
                        <span className="font-semibold text-green-800">Discount ROI</span>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-900">
                          {impactAnalysis.discountROI.toFixed(1)}x
                        </div>
                        <div className="text-xs text-green-600">
                          Revenue per ₹1 discount
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Section */}
      <Card className="bg-white shadow-xl border-0">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Discount Analysis Visualizations
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant={activeChart === 'monthly' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setActiveChart('monthly')}
                className="text-white hover:bg-white/20"
              >
                <Calendar className="w-4 h-4 mr-1" />
                Monthly
              </Button>
              <Button
                variant={activeChart === 'yearly' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setActiveChart('yearly')}
                className="text-white hover:bg-white/20"
              >
                <TrendingUp className="w-4 h-4 mr-1" />
                Yearly
              </Button>
              <Button
                variant={activeChart === 'impact' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setActiveChart('impact')}
                className="text-white hover:bg-white/20"
              >
                <Zap className="w-4 h-4 mr-1" />
                Impact
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-96">
            {activeChart === 'monthly' && (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={monthlyAnalysis}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" tickFormatter={(value) => formatCurrency(value)} />
                  <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `${value}%`} />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'discountRate' || name === 'discountPenetration' ? `${(value as number).toFixed(1)}%` : formatCurrency(value as number),
                      name === 'totalRevenue' ? 'Revenue' : 
                      name === 'totalDiscount' ? 'Discount' : 
                      name === 'discountRate' ? 'Discount Rate' : 'Discount Penetration'
                    ]}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="totalRevenue" fill="#10b981" name="Revenue" />
                  <Bar yAxisId="left" dataKey="totalDiscount" fill="#ef4444" name="Discount" />
                  <Line yAxisId="right" type="monotone" dataKey="discountRate" stroke="#f59e0b" strokeWidth={3} name="Discount Rate %" />
                </ComposedChart>
              </ResponsiveContainer>
            )}

            {activeChart === 'yearly' && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={yearlyAnalysis}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Legend />
                  <Bar dataKey="totalRevenue" fill="#3b82f6" name="Revenue" />
                  <Bar dataKey="totalDiscount" fill="#ef4444" name="Discount" />
                </BarChart>
              </ResponsiveContainer>
            )}

            {activeChart === 'impact' && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[
                  { name: 'Discounted Sales', atv: metrics.discountedATV, asv: metrics.discountedASV, transactions: metrics.discountedTransactions },
                  { name: 'Non-Discounted Sales', atv: metrics.nonDiscountedATV, asv: metrics.nonDiscountedASV, transactions: metrics.nonDiscountedTransactions }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Legend />
                  <Area dataKey="atv" stackId="1" stroke="#8884d8" fill="#8884d8" name="ATV" />
                  <Area dataKey="asv" stackId="1" stroke="#82ca9d" fill="#82ca9d" name="ASV" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Top/Bottom Rankings */}
      <Tabs defaultValue="products" className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-6 bg-white shadow-sm">
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Products
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Tag className="w-4 h-4" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="locations" className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Locations
          </TabsTrigger>
          <TabsTrigger value="soldBy" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Sold By
          </TabsTrigger>
          <TabsTrigger value="payment" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Payment Methods
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          {renderTopBottomList(rankingLists.byProduct, "Products")}
        </TabsContent>

        <TabsContent value="categories">
          {renderTopBottomList(rankingLists.byCategory, "Categories")}
        </TabsContent>

        <TabsContent value="locations">
          {renderTopBottomList(rankingLists.byLocation, "Locations")}
        </TabsContent>

        <TabsContent value="soldBy">
          {renderTopBottomList(rankingLists.bySoldBy, "Staff")}
        </TabsContent>

        <TabsContent value="payment">
          {renderTopBottomList(rankingLists.byPaymentMethod, "Payment Methods")}
        </TabsContent>
      </Tabs>

      {/* Detailed Analysis Tables */}
      <Tabs defaultValue="monthly" className="w-full">
        <TabsList className="grid w-full grid-cols-6 bg-white border border-gray-200 p-1 rounded-xl shadow-sm">
          <TabsTrigger value="monthly">Month-on-Month</TabsTrigger>
          <TabsTrigger value="yearly">Year-on-Year</TabsTrigger>
          <TabsTrigger value="location">By Location</TabsTrigger>
          <TabsTrigger value="product">By Product</TabsTrigger>
          <TabsTrigger value="category">By Category</TabsTrigger>
          <TabsTrigger value="soldby">By Sold By</TabsTrigger>
        </TabsList>

        <TabsContent value="monthly" className="mt-6">
          <Card className="bg-white shadow-xl border-0">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Month-on-Month Discount Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gradient-to-r from-slate-100 to-slate-200">
                    <TableRow>
                      <TableHead className="font-bold text-slate-700">Month</TableHead>
                      <TableHead className="text-right font-bold text-slate-700">Revenue</TableHead>
                      <TableHead className="text-right font-bold text-slate-700">Discount</TableHead>
                      <TableHead className="text-right font-bold text-slate-700">Discount %</TableHead>
                      <TableHead className="text-right font-bold text-slate-700">Transactions</TableHead>
                      <TableHead className="text-right font-bold text-slate-700">ATV</TableHead>
                      <TableHead className="text-right font-bold text-slate-700">ASV</TableHead>
                      <TableHead className="text-right font-bold text-slate-700">Members</TableHead>
                      <TableHead className="text-right font-bold text-slate-700">Penetration %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {monthlyAnalysis.map((row, index) => (
                      <TableRow key={index} className="hover:bg-slate-50">
                        <TableCell className="font-medium">{row.month}</TableCell>
                        <TableCell className="text-right font-semibold text-green-600">
                          {formatCurrency(row.totalRevenue)}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-red-600">
                          {formatCurrency(row.totalDiscount)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline" className="text-orange-600 border-orange-200">
                            {row.discountRate.toFixed(2)}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{formatNumber(row.totalTransactions)}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(row.atv)}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(row.asv)}</TableCell>
                        <TableCell className="text-right">{formatNumber(row.uniqueMembers)}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline" className="text-blue-600 border-blue-200">
                            {row.discountPenetration.toFixed(1)}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter className="bg-slate-800 text-white">
                    <TableRow>
                      <TableCell className="font-bold">TOTALS</TableCell>
                      <TableCell className="text-right font-bold">
                        {formatCurrency(monthlyAnalysis.reduce((sum, row) => sum + row.totalRevenue, 0))}
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {formatCurrency(monthlyAnalysis.reduce((sum, row) => sum + row.totalDiscount, 0))}
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {formatPercentage(
                          monthlyAnalysis.reduce((sum, row) => sum + row.totalRevenue, 0) > 0 
                            ? (monthlyAnalysis.reduce((sum, row) => sum + row.totalDiscount, 0) / monthlyAnalysis.reduce((sum, row) => sum + row.totalRevenue, 0)) * 100 
                            : 0
                        )}
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {formatNumber(monthlyAnalysis.reduce((sum, row) => sum + row.totalTransactions, 0))}
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {formatCurrency(metrics.overallATV)}
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {formatCurrency(metrics.overallASV)}
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {formatNumber(metrics.uniqueMembers)}
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {formatPercentage(metrics.discountPenetration)}
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="yearly" className="mt-6">
          <Card className="bg-white shadow-xl border-0">
            <CardHeader className="bg-gradient-to-r from-green-600 to-teal-600 text-white">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Year-on-Year Discount Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gradient-to-r from-slate-100 to-slate-200">
                    <TableRow>
                      <TableHead className="font-bold text-slate-700">Year</TableHead>
                      <TableHead className="text-right font-bold text-slate-700">Revenue</TableHead>
                      <TableHead className="text-right font-bold text-slate-700">Discount</TableHead>
                      <TableHead className="text-right font-bold text-slate-700">Discount %</TableHead>
                      <TableHead className="text-right font-bold text-slate-700">Transactions</TableHead>
                      <TableHead className="text-right font-bold text-slate-700">ATV</TableHead>
                      <TableHead className="text-right font-bold text-slate-700">ASV</TableHead>
                      <TableHead className="text-right font-bold text-slate-700">Members</TableHead>
                      <TableHead className="text-right font-bold text-slate-700">Penetration %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {yearlyAnalysis.map((row, index) => (
                      <TableRow key={index} className="hover:bg-slate-50">
                        <TableCell className="font-medium">{row.year}</TableCell>
                        <TableCell className="text-right font-semibold text-green-600">
                          {formatCurrency(row.totalRevenue)}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-red-600">
                          {formatCurrency(row.totalDiscount)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline" className="text-orange-600 border-orange-200">
                            {row.discountRate.toFixed(2)}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{formatNumber(row.totalTransactions)}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(row.atv)}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(row.asv)}</TableCell>
                        <TableCell className="text-right">{formatNumber(row.uniqueMembers)}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline" className="text-blue-600 border-blue-200">
                            {row.discountPenetration.toFixed(1)}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other dimension tables */}
        {['location', 'product', 'category', 'soldby'].map((dimension) => {
          const dimensionData = rankingLists[`by${dimension.charAt(0).toUpperCase() + dimension.slice(1)}` as keyof typeof rankingLists] || [];
          const dimensionTitle = dimension.charAt(0).toUpperCase() + dimension.slice(1);
          
          return (
            <TabsContent key={dimension} value={dimension} className="mt-6">
              <Card className="bg-white shadow-xl border-0">
                <CardHeader className="bg-gradient-to-r from-purple-600 to-violet-600 text-white">
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Discount Analysis by {dimensionTitle}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-gradient-to-r from-slate-100 to-slate-200">
                        <TableRow>
                          <TableHead className="font-bold text-slate-700">{dimensionTitle}</TableHead>
                          <TableHead className="text-right font-bold text-slate-700">Revenue</TableHead>
                          <TableHead className="text-right font-bold text-slate-700">Discount</TableHead>
                          <TableHead className="text-right font-bold text-slate-700">Discount %</TableHead>
                          <TableHead className="text-right font-bold text-slate-700">Transactions</TableHead>
                          <TableHead className="text-right font-bold text-slate-700">ATV</TableHead>
                          <TableHead className="text-right font-bold text-slate-700">AUV</TableHead>
                          <TableHead className="text-right font-bold text-slate-700">ASV</TableHead>
                          <TableHead className="text-right font-bold text-slate-700">UPT</TableHead>
                          <TableHead className="text-right font-bold text-slate-700">Members</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dimensionData.map((row, index) => (
                          <TableRow key={index} className="hover:bg-slate-50">
                            <TableCell className="font-medium">{row.name}</TableCell>
                            <TableCell className="text-right font-semibold text-green-600">
                              {formatCurrency(row.totalRevenue)}
                            </TableCell>
                            <TableCell className="text-right font-semibold text-red-600">
                              {formatCurrency(row.totalDiscount)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge variant="outline" className="text-orange-600 border-orange-200">
                                {row.discountRate.toFixed(2)}%
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">{formatNumber(row.totalTransactions)}</TableCell>
                            <TableCell className="text-right font-medium">{formatCurrency(row.atv)}</TableCell>
                            <TableCell className="text-right font-medium">{formatCurrency(row.auv)}</TableCell>
                            <TableCell className="text-right font-medium">{formatCurrency(row.asv)}</TableCell>
                            <TableCell className="text-right">{row.upt.toFixed(2)}</TableCell>
                            <TableCell className="text-right">{formatNumber(row.uniqueMembers)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                      <TableFooter className="bg-slate-800 text-white">
                        <TableRow>
                          <TableCell className="font-bold">TOTALS</TableCell>
                          <TableCell className="text-right font-bold">
                            {formatCurrency(dimensionData.reduce((sum, row) => sum + row.totalRevenue, 0))}
                          </TableCell>
                          <TableCell className="text-right font-bold">
                            {formatCurrency(dimensionData.reduce((sum, row) => sum + row.totalDiscount, 0))}
                          </TableCell>
                          <TableCell className="text-right font-bold">
                            {formatPercentage(
                              dimensionData.reduce((sum, row) => sum + row.totalRevenue, 0) > 0 
                                ? (dimensionData.reduce((sum, row) => sum + row.totalDiscount, 0) / dimensionData.reduce((sum, row) => sum + row.totalRevenue, 0)) * 100 
                                : 0
                            )}
                          </TableCell>
                          <TableCell className="text-right font-bold">
                            {formatNumber(dimensionData.reduce((sum, row) => sum + row.totalTransactions, 0))}
                          </TableCell>
                          <TableCell className="text-right font-bold">
                            {formatCurrency(metrics.overallATV)}
                          </TableCell>
                          <TableCell className="text-right font-bold">
                            {formatCurrency(metrics.overallAUV)}
                          </TableCell>
                          <TableCell className="text-right font-bold">
                            {formatCurrency(metrics.overallASV)}
                          </TableCell>
                          <TableCell className="text-right font-bold">
                            {metrics.overallUPT.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right font-bold">
                            {formatNumber(metrics.uniqueMembers)}
                          </TableCell>
                        </TableRow>
                      </TableFooter>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};