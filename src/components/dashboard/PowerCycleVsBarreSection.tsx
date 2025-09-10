import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { PowerCycleBarreStrengthMetricCards } from './PowerCycleBarreStrengthMetricCards';
import { PowerCycleBarreStrengthComparison } from './PowerCycleBarreStrengthComparison';
import { PowerCycleBarreStrengthAdvancedCharts } from './PowerCycleBarreStrengthAdvancedCharts';
import { PowerCycleBarreStrengthRankings } from './PowerCycleBarreStrengthRankings';
import { PowerCycleBarreStrengthEnhancedDataTables } from './PowerCycleBarreStrengthEnhancedDataTables';
import { DetailedClassAnalyticsTable } from './DetailedClassAnalyticsTable';
import { EnhancedFilterSection } from './EnhancedFilterSection';
import { PowerCycleBarreStrengthLocationSelector } from './PowerCycleBarreStrengthLocationSelector';
import { ModernDrillDownModal } from './ModernDrillDownModal';
import { SourceDataModal } from '@/components/ui/SourceDataModal';
import { PowerCycleBarreStrengthComprehensiveSection } from './PowerCycleBarreStrengthComprehensiveSection';
import { usePayrollData } from '@/hooks/usePayrollData';
import { RefinedLoader } from '@/components/ui/RefinedLoader';
import { useGlobalLoading } from '@/hooks/useGlobalLoading';
import { TrendingUp, BarChart3, Activity, Users, Eye, Zap } from 'lucide-react';

interface PowerCycleVsBarreSectionProps {
  data: any[];
}

export const PowerCycleVsBarreSection: React.FC<PowerCycleVsBarreSectionProps> = ({ data: payrollData }) => {
  return <PowerCycleBarreStrengthComprehensiveSection data={payrollData || []} />;
};