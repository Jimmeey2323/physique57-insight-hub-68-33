
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, Users, Target, DollarSign, Percent, Eye, ChevronRight } from 'lucide-react';
import { formatNumber, formatCurrency } from '@/utils/formatters';

interface ListItem {
  name: string;
  value: number;
  extra?: string;
  conversionRate?: number;
  ltv?: number;
}

interface LeadTopBottomListsProps {
  title: string;
  items: ListItem[];
  variant: 'top' | 'bottom';
  type: 'source' | 'associate' | 'stage';
}

export const LeadTopBottomLists: React.FC<LeadTopBottomListsProps> = ({
  title,
  items,
  variant,
  type
}) => {
  const [viewMode, setViewMode] = useState<'top' | 'bottom'>('top');
  const [criteriaMode, setCriteriaMode] = useState<'leads' | 'conversion' | 'ltv'>('leads');
  const [showCount, setShowCount] = useState(5);

  // Sort items based on criteria
  const sortedItems = [...items].sort((a, b) => {
    switch (criteriaMode) {
      case 'leads':
        return viewMode === 'top' ? b.value - a.value : a.value - b.value;
      case 'conversion':
        return viewMode === 'top' 
          ? (b.conversionRate || 0) - (a.conversionRate || 0)
          : (a.conversionRate || 0) - (b.conversionRate || 0);
      case 'ltv':
        return viewMode === 'top' 
          ? (b.ltv || 0) - (a.ltv || 0)
          : (a.ltv || 0) - (b.ltv || 0);
      default:
        return 0;
    }
  });

  const displayedItems = sortedItems.slice(0, showCount);

  const criteriaOptions = [
    { value: 'leads', label: 'Total Leads', icon: Users },
    { value: 'conversion', label: 'Conversion Rate', icon: Percent },
    { value: 'ltv', label: 'Average LTV', icon: DollarSign }
  ];

  const getValueForCriteria = (item: ListItem) => {
    switch (criteriaMode) {
      case 'leads':
        return formatNumber(item.value);
      case 'conversion':
        return `${(item.conversionRate || 0).toFixed(1)}%`;
      case 'ltv':
        return formatCurrency(item.ltv || 0);
      default:
        return formatNumber(item.value);
    }
  };

  const getExtraInfo = (item: ListItem) => {
    if (criteriaMode === 'leads') return item.extra;
    if (criteriaMode === 'conversion') return `${formatNumber(item.value)} leads`;
    if (criteriaMode === 'ltv') return `${(item.conversionRate || 0).toFixed(1)}% conv`;
    return item.extra;
  };

  const handleItemClick = (item: ListItem) => {
    console.log(`Drill-down for ${type}:`, item.name, item);
  };

  return (
    <Card className="bg-white shadow-sm border border-gray-200 h-fit">
      <CardHeader className="border-b border-gray-100 space-y-4 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-gray-800 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            {title}
          </CardTitle>
          <Badge variant="outline" className="text-blue-600 border-blue-600">
            {items.length} {type}s
          </Badge>
        </div>
        
        {/* View Mode Toggle */}
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'top' | 'bottom')} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-lg">
            <TabsTrigger value="top" className="text-xs font-medium">
              <TrendingUp className="w-3 h-3 mr-1" />
              Top Performers
            </TabsTrigger>
            <TabsTrigger value="bottom" className="text-xs font-medium">
              <TrendingDown className="w-3 h-3 mr-1" />
              Bottom Performers
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Criteria Selection */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-600">Sort by:</label>
          <div className="flex gap-1">
            {criteriaOptions.map((option) => (
              <Button
                key={option.value}
                variant={criteriaMode === option.value ? "default" : "outline"}
                size="sm"
                onClick={() => setCriteriaMode(option.value as any)}
                className={`text-xs flex items-center gap-1 ${
                  criteriaMode === option.value 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 hover:bg-blue-50'
                }`}
              >
                <option.icon className="w-3 h-3" />
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="space-y-3">
          {displayedItems.map((item, index) => (
            <div 
              key={item.name}
              className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-blue-50 hover:border-blue-200 transition-all duration-200 cursor-pointer group"
              onClick={() => handleItemClick(item)}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  viewMode === 'top' 
                    ? index < 3 
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' 
                      : 'bg-gray-100 text-gray-600'
                    : index < 3
                      ? 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                      : 'bg-gray-100 text-gray-600'
                }`}>
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium text-gray-800 text-sm truncate max-w-[120px]" title={item.name}>
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {getExtraInfo(item)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <p className="font-bold text-gray-800 text-sm">
                    {getValueForCriteria(item)}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </div>
            </div>
          ))}
        </div>

        {/* Show More Button */}
        {items.length > showCount && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCount(prev => prev + 5)}
              className="w-full text-xs hover:bg-blue-50"
            >
              <Eye className="w-3 h-3 mr-1" />
              Show {Math.min(5, items.length - showCount)} More
            </Button>
          </div>
        )}

        {showCount > 5 && (
          <div className="mt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCount(5)}
              className="w-full text-xs text-gray-500 hover:text-gray-700"
            >
              Show Less
            </Button>
          </div>
        )}

        {displayedItems.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Target className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm">No {type}s found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
