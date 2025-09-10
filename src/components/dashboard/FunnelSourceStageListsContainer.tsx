
import React from 'react';
import { LeadTopBottomLists } from './LeadTopBottomLists';
import { LeadsData } from '@/types/leads';

interface FunnelSourceStageListsContainerProps {
  data: LeadsData[];
}

export const FunnelSourceStageListsContainer: React.FC<FunnelSourceStageListsContainerProps> = ({
  data
}) => {
  // Process source data
  const sourceStats = data.reduce((acc, item) => {
    const source = item.source || 'Unknown';
    if (!acc[source]) {
      acc[source] = {
        name: source,
        value: 0,
        conversionRate: 0,
        ltv: 0,
        convertedCount: 0,
        totalLTV: 0
      };
    }
    
    acc[source].value += 1;
    if (item.conversionStatus === 'Converted') {
      acc[source].convertedCount += 1;
    }
    acc[source].totalLTV += item.ltv || 0;
    
    return acc;
  }, {} as Record<string, any>);

  // Calculate conversion rates and average LTV for sources
  const sourceItems = Object.values(sourceStats).map((stat: any) => ({
    ...stat,
    conversionRate: stat.value > 0 ? (stat.convertedCount / stat.value) * 100 : 0,
    ltv: stat.value > 0 ? stat.totalLTV / stat.value : 0,
    extra: `${stat.convertedCount} converted`
  }));

  // Process stage data
  const stageStats = data.reduce((acc, item) => {
    const stage = item.stage || 'Unknown';
    if (!acc[stage]) {
      acc[stage] = {
        name: stage,
        value: 0,
        conversionRate: 0,
        ltv: 0,
        convertedCount: 0,
        totalLTV: 0
      };
    }
    
    acc[stage].value += 1;
    if (item.conversionStatus === 'Converted') {
      acc[stage].convertedCount += 1;
    }
    acc[stage].totalLTV += item.ltv || 0;
    
    return acc;
  }, {} as Record<string, any>);

  // Calculate conversion rates and average LTV for stages
  const stageItems = Object.values(stageStats).map((stat: any) => ({
    ...stat,
    conversionRate: stat.value > 0 ? (stat.convertedCount / stat.value) * 100 : 0,
    ltv: stat.value > 0 ? stat.totalLTV / stat.value : 0,
    extra: `${stat.convertedCount} converted`
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <LeadTopBottomLists
        title="Lead Sources Performance"
        items={sourceItems}
        variant="top"
        type="source"
      />
      <LeadTopBottomLists
        title="Lead Stages Performance"
        items={stageItems}
        variant="top"
        type="stage"
      />
    </div>
  );
};
