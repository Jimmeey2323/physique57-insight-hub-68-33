import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { RecurringSessionData } from '@/hooks/useRecurringSessionsData';

interface RecurringSessionsFilterSectionProps {
  data: RecurringSessionData[];
}

export const RecurringSessionsFilterSection: React.FC<RecurringSessionsFilterSectionProps> = ({ data }) => {
  return (
    <Card className="bg-white shadow-sm border border-gray-200">
      <CardContent className="p-6">
        <div className="text-center text-gray-500">
          Advanced filters will be available soon for recurring sessions data.
        </div>
      </CardContent>
    </Card>
  );
};