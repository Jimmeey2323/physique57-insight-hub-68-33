
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { YearOnYearMetricType } from '@/types/dashboard';

interface YearOnYearMetricTabsProps {
  value: YearOnYearMetricType;
  onValueChange: (value: YearOnYearMetricType) => void;
  className?: string;
}

export const YearOnYearMetricTabs: React.FC<YearOnYearMetricTabsProps> = ({
  value,
  onValueChange,
  className = ""
}) => {
  return (
    <Tabs value={value} onValueChange={onValueChange} className={className}>
      <TabsList className="grid w-full grid-cols-3 lg:grid-cols-9 bg-white border border-gray-200 p-1 rounded-xl shadow-sm h-auto gap-1">
        <TabsTrigger
          value="revenue"
          className="text-xs px-3 py-2.5 min-w-20 h-8 flex items-center justify-center data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg transition-all duration-200"
        >
          Revenue
        </TabsTrigger>
        <TabsTrigger
          value="transactions"
          className="text-xs px-3 py-2.5 min-w-20 h-8 flex items-center justify-center data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg transition-all duration-200"
        >
          Transactions
        </TabsTrigger>
        <TabsTrigger
          value="members"
          className="text-xs px-3 py-2.5 min-w-20 h-8 flex items-center justify-center data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg transition-all duration-200"
        >
          Members
        </TabsTrigger>
        <TabsTrigger
          value="units"
          className="text-xs px-3 py-2.5 min-w-20 h-8 flex items-center justify-center data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg transition-all duration-200"
        >
          Units Sold
        </TabsTrigger>
        <TabsTrigger
          value="atv"
          className="text-xs px-3 py-2.5 min-w-20 h-8 flex items-center justify-center data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg transition-all duration-200"
        >
          ATV
        </TabsTrigger>
        <TabsTrigger
          value="auv"
          className="text-xs px-3 py-2.5 min-w-20 h-8 flex items-center justify-center data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg transition-all duration-200"
        >
          AUV
        </TabsTrigger>
        <TabsTrigger
          value="asv"
          className="text-xs px-3 py-2.5 min-w-20 h-8 flex items-center justify-center data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg transition-all duration-200"
        >
          ASV
        </TabsTrigger>
        <TabsTrigger
          value="upt"
          className="text-xs px-3 py-2.5 min-w-20 h-8 flex items-center justify-center data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg transition-all duration-200"
        >
          UPT
        </TabsTrigger>
        <TabsTrigger
          value="vat"
          className="text-xs px-3 py-2.5 min-w-20 h-8 flex items-center justify-center data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg transition-all duration-200"
        >
          VAT
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
