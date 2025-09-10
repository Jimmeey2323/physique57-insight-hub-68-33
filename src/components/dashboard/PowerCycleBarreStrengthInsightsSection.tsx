import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PayrollData } from '@/types/dashboard';
import { Eye } from 'lucide-react';

interface PowerCycleBarreStrengthInsightsSectionProps {
  data: PayrollData[];
  onItemClick: (item: any) => void;
}

export const PowerCycleBarreStrengthInsightsSection: React.FC<PowerCycleBarreStrengthInsightsSectionProps> = ({
  data,
  onItemClick
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="w-5 h-5" />
          Deep Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p>Insights section simplified and coming soon...</p>
      </CardContent>
    </Card>
  );
};