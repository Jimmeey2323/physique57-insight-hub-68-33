import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PayrollData } from '@/types/dashboard';
import { PowerCycleDetailedTable } from './PowerCycleDetailedTable';
import { BarreDetailedTable } from './BarreDetailedTable';
import { StrengthDetailedTable } from './StrengthDetailedTable';
import { Zap, Activity, Dumbbell, BarChart3 } from 'lucide-react';

interface PowerCycleBarreStrengthDetailedAnalyticsProps {
  data: PayrollData[];
  onItemClick: (item: any) => void;
}

export const PowerCycleBarreStrengthDetailedAnalytics: React.FC<PowerCycleBarreStrengthDetailedAnalyticsProps> = ({
  data,
  onItemClick
}) => {
  const [activeFormat, setActiveFormat] = useState('powercycle');

  // Filter data for each format
  const powerCycleData = data.filter(item => (item.cycleSessions || 0) > 0);
  const barreData = data.filter(item => (item.barreSessions || 0) > 0);
  const strengthData = data.filter(item => (item.strengthSessions || 0) > 0);

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20 border-0 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardTitle className="text-xl font-bold flex items-center gap-3">
            <BarChart3 className="w-6 h-6" />
            Detailed Format Analytics
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs value={activeFormat} onValueChange={setActiveFormat} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1 rounded-lg">
              <TabsTrigger value="powercycle" className="text-sm font-medium">
                <Zap className="w-4 h-4 mr-2" />
                PowerCycle
              </TabsTrigger>
              <TabsTrigger value="barre" className="text-sm font-medium">
                <Activity className="w-4 h-4 mr-2" />
                Barre
              </TabsTrigger>
              <TabsTrigger value="strength" className="text-sm font-medium">
                <Dumbbell className="w-4 h-4 mr-2" />
                Strength Lab
              </TabsTrigger>
            </TabsList>

            <TabsContent value="powercycle" className="mt-6">
              <PowerCycleDetailedTable data={powerCycleData} onItemClick={onItemClick} />
            </TabsContent>

            <TabsContent value="barre" className="mt-6">
              <BarreDetailedTable data={barreData} onItemClick={onItemClick} />
            </TabsContent>

            <TabsContent value="strength" className="mt-6">
              <StrengthDetailedTable data={strengthData} onItemClick={onItemClick} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};