
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrainerMetricType } from '@/types/dashboard';

interface TrainerMetricTabsProps {
  value: TrainerMetricType;
  onValueChange: (value: TrainerMetricType) => void;
  className?: string;
}

export const TrainerMetricTabs: React.FC<TrainerMetricTabsProps> = ({
  value,
  onValueChange,
  className = ""
}) => {
  return (
    <Tabs value={value} onValueChange={onValueChange} className={className}>
      <TabsList className="grid w-full grid-cols-4 md:grid-cols-8 gap-1 h-auto p-2">
        <TabsTrigger
          value="totalSessions"
          className="text-xs px-3 py-3 h-auto flex-col gap-1"
        >
          <span className="font-semibold">Total</span>
          <span className="text-[10px] opacity-80">Sessions</span>
        </TabsTrigger>
        <TabsTrigger
          value="totalCustomers"
          className="text-xs px-3 py-3 h-auto flex-col gap-1"
        >
          <span className="font-semibold">Total</span>
          <span className="text-[10px] opacity-80">Members</span>
        </TabsTrigger>
        <TabsTrigger
          value="totalPaid"
          className="text-xs px-3 py-3 h-auto flex-col gap-1"
        >
          <span className="font-semibold">Total</span>
          <span className="text-[10px] opacity-80">Revenue</span>
        </TabsTrigger>
        <TabsTrigger
          value="classAverageExclEmpty"
          className="text-xs px-3 py-3 h-auto flex-col gap-1"
        >
          <span className="font-semibold">Class</span>
          <span className="text-[10px] opacity-80">Average</span>
        </TabsTrigger>
        <TabsTrigger
          value="emptySessions"
          className="text-xs px-3 py-3 h-auto flex-col gap-1"
        >
          <span className="font-semibold">Empty</span>
          <span className="text-[10px] opacity-80">Sessions</span>
        </TabsTrigger>
        <TabsTrigger
          value="conversion"
          className="text-xs px-3 py-3 h-auto flex-col gap-1"
        >
          <span className="font-semibold">Conversion</span>
          <span className="text-[10px] opacity-80">Rate</span>
        </TabsTrigger>
        <TabsTrigger
          value="retention"
          className="text-xs px-3 py-3 h-auto flex-col gap-1"
        >
          <span className="font-semibold">Retention</span>
          <span className="text-[10px] opacity-80">Rate</span>
        </TabsTrigger>
        <TabsTrigger
          value="newMembers"
          className="text-xs px-3 py-3 h-auto flex-col gap-1"
        >
          <span className="font-semibold">New</span>
          <span className="text-[10px] opacity-80">Members</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
