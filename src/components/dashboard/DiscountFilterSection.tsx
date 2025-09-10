
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, User, X, Filter, Package, CreditCard, Percent } from 'lucide-react';
import { SalesData } from '@/types/dashboard';
import { DatePickerWithRange } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';

interface DiscountFilterSectionProps {
  data: SalesData[];
  onFiltersChange: (filters: any) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const DiscountFilterSection: React.FC<DiscountFilterSectionProps> = ({
  data,
  onFiltersChange,
  isCollapsed,
  onToggleCollapse
}) => {
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<string>('all');
  const [selectedSoldBy, setSelectedSoldBy] = useState<string>('all');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('all');
  const [minDiscountAmount, setMinDiscountAmount] = useState<string>('');
  const [maxDiscountAmount, setMaxDiscountAmount] = useState<string>('');
  const [minDiscountPercent, setMinDiscountPercent] = useState<string>('');
  const [maxDiscountPercent, setMaxDiscountPercent] = useState<string>('');
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});

  // Extract unique values for filters
  const discountedData = data.filter(item => (item.discountAmount || 0) > 0);
  const locations = Array.from(new Set(discountedData.map(item => item.calculatedLocation))).filter(Boolean);
  const categories = Array.from(new Set(discountedData.map(item => item.cleanedCategory))).filter(Boolean);
  const products = Array.from(new Set(discountedData.map(item => item.cleanedProduct))).filter(Boolean);
  const soldByOptions = Array.from(new Set(discountedData.map(item => item.soldBy === '-' ? 'Online/System' : item.soldBy))).filter(Boolean);
  const paymentMethods = Array.from(new Set(discountedData.map(item => item.paymentMethod))).filter(Boolean);

  useEffect(() => {
    onFiltersChange({
      location: selectedLocation === 'all' ? '' : selectedLocation,
      category: selectedCategory === 'all' ? '' : selectedCategory,
      product: selectedProduct === 'all' ? '' : selectedProduct,
      soldBy: selectedSoldBy === 'all' ? '' : selectedSoldBy,
      paymentMethod: selectedPaymentMethod === 'all' ? '' : selectedPaymentMethod,
      minDiscountAmount: minDiscountAmount ? parseFloat(minDiscountAmount) : undefined,
      maxDiscountAmount: maxDiscountAmount ? parseFloat(maxDiscountAmount) : undefined,
      minDiscountPercent: minDiscountPercent ? parseFloat(minDiscountPercent) : undefined,
      maxDiscountPercent: maxDiscountPercent ? parseFloat(maxDiscountPercent) : undefined,
      dateRange
    });
  }, [selectedLocation, selectedCategory, selectedProduct, selectedSoldBy, selectedPaymentMethod, 
      minDiscountAmount, maxDiscountAmount, minDiscountPercent, maxDiscountPercent, dateRange, onFiltersChange]);

  const clearFilters = () => {
    setSelectedLocation('all');
    setSelectedCategory('all');
    setSelectedProduct('all');
    setSelectedSoldBy('all');
    setSelectedPaymentMethod('all');
    setMinDiscountAmount('');
    setMaxDiscountAmount('');
    setMinDiscountPercent('');
    setMaxDiscountPercent('');
    setDateRange({});
  };

  const hasActiveFilters = selectedLocation !== 'all' || selectedCategory !== 'all' || 
    selectedProduct !== 'all' || selectedSoldBy !== 'all' || selectedPaymentMethod !== 'all' ||
    minDiscountAmount || maxDiscountAmount || minDiscountPercent || maxDiscountPercent ||
    dateRange.from || dateRange.to;

  if (isCollapsed) {
    return (
      <div className="w-full">
          <div className="flex items-center justify-between p-4 bg-gradient-to-br from-white via-indigo-50/30 to-white rounded-lg border shadow-sm">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-medium text-slate-700">Discount Filters</span>
            {hasActiveFilters && (
              <Badge variant="secondary" className="text-xs bg-indigo-100 text-indigo-700">
                {[selectedLocation, selectedCategory, selectedProduct, selectedSoldBy, selectedPaymentMethod]
                  .filter(f => f !== 'all').length + 
                 [minDiscountAmount, maxDiscountAmount, minDiscountPercent, maxDiscountPercent]
                  .filter(f => f).length +
                 (dateRange.from || dateRange.to ? 1 : 0)} active
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="text-indigo-600 hover:text-indigo-700"
          >
            Show Filters
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="bg-gradient-to-br from-white via-indigo-50/30 to-white rounded-lg border shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-bold text-slate-800">Discount Filters & Analytics</h3>
          </div>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="text-slate-600 hover:text-slate-700"
              >
                <X className="w-3 h-3 mr-1" />
                Clear All
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCollapse}
              className="text-indigo-600 hover:text-indigo-700"
            >
              Hide Filters
            </Button>
          </div>
        </div>

        {/* Full width filter grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indigo-600" />
              Location
            </label>
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger>
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Package className="w-4 h-4 text-indigo-600" />
              Category
            </label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Package className="w-4 h-4 text-indigo-600" />
              Product
            </label>
            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
              <SelectTrigger>
                <SelectValue placeholder="All Products" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                {products.map((product) => (
                  <SelectItem key={product} value={product}>
                    {product}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-600" />
              Sold By
            </label>
            <Select value={selectedSoldBy} onValueChange={setSelectedSoldBy}>
              <SelectTrigger>
                <SelectValue placeholder="All Staff" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Staff</SelectItem>
                {soldByOptions.map((soldBy) => (
                  <SelectItem key={soldBy} value={soldBy}>
                    {soldBy}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-indigo-600" />
              Payment Method
            </label>
            <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="All Methods" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                {paymentMethods.map((method) => (
                  <SelectItem key={method} value={method}>
                    {method}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              Date Range
            </label>
            <DatePickerWithRange 
              value={dateRange}
              onChange={setDateRange}
            />
          </div>
        </div>

        {/* Discount amount and percentage filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Min Discount Amount</label>
            <Input
              type="number"
              placeholder="₹0"
              value={minDiscountAmount}
              onChange={(e) => setMinDiscountAmount(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Max Discount Amount</label>
            <Input
              type="number"
              placeholder="₹10000"
              value={maxDiscountAmount}
              onChange={(e) => setMaxDiscountAmount(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Min Discount %</label>
            <Input
              type="number"
              placeholder="0%"
              value={minDiscountPercent}
              onChange={(e) => setMinDiscountPercent(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Max Discount %</label>
            <Input
              type="number"
              placeholder="100%"
              value={maxDiscountPercent}
              onChange={(e) => setMaxDiscountPercent(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
