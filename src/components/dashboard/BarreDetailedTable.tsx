import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PayrollData } from '@/types/dashboard';
import { formatNumber } from '@/utils/formatters';
import { Activity, Users, DollarSign, Target, Calendar, AlertTriangle } from 'lucide-react';

interface BarreDetailedTableProps {
  data: PayrollData[];
  onItemClick: (item: any) => void;
}

export const BarreDetailedTable: React.FC<BarreDetailedTableProps> = ({
  data,
  onItemClick
}) => {
  return (
    <Card className="bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200">
      <CardHeader>
        <CardTitle className="text-lg font-bold flex items-center gap-3 text-pink-900">
          <Activity className="w-5 h-5" />
          Barre Detailed Analytics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-pink-200">
                <th className="text-left p-3 font-semibold text-pink-800">Trainer</th>
                <th className="text-right p-3 font-semibold text-pink-800">Total Sessions</th>
                <th className="text-right p-3 font-semibold text-pink-800">Empty Sessions</th>
                <th className="text-right p-3 font-semibold text-pink-800">Fill Rate</th>
                <th className="text-right p-3 font-semibold text-pink-800">Customers</th>
                <th className="text-right p-3 font-semibold text-pink-800">Revenue</th>
                <th className="text-right p-3 font-semibold text-pink-800">Revenue/Session</th>
                <th className="text-right p-3 font-semibold text-pink-800">Avg Customers</th>
              </tr>
            </thead>
            <tbody>
              {data.map((trainer, index) => {
                const sessions = trainer.barreSessions || 0;
                const emptySessions = trainer.emptyBarreSessions || 0;
                const customers = trainer.barreCustomers || 0;
                const revenue = trainer.barrePaid || 0;
                const fillRate = sessions > 0 ? ((sessions - emptySessions) / sessions) * 100 : 0;
                const revenuePerSession = sessions > 0 ? revenue / sessions : 0;
                const avgCustomers = (sessions - emptySessions) > 0 ? customers / (sessions - emptySessions) : 0;

                return (
                  <tr 
                    key={trainer.unique}
                    className="border-b border-pink-100 hover:bg-pink-50 cursor-pointer"
                    onClick={() => onItemClick({ 
                      type: 'barre-trainer', 
                      trainer, 
                      metrics: { sessions, emptySessions, customers, revenue, fillRate, revenuePerSession, avgCustomers }
                    })}
                  >
                    <td className="p-3">
                      <div>
                        <div className="font-medium text-pink-900">{trainer.teacherName}</div>
                        <div className="text-sm text-pink-600">{trainer.location}</div>
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Calendar className="w-4 h-4 text-pink-500" />
                        <span className="font-medium">{formatNumber(sessions)}</span>
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                        <span className="font-medium">{formatNumber(emptySessions)}</span>
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      <Badge 
                        variant={fillRate >= 80 ? "default" : fillRate >= 60 ? "secondary" : "destructive"}
                        className="flex items-center gap-1"
                      >
                        <Target className="w-3 h-3" />
                        {fillRate.toFixed(1)}%
                      </Badge>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Users className="w-4 h-4 text-pink-500" />
                        <span className="font-medium">{formatNumber(customers)}</span>
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <DollarSign className="w-4 h-4 text-green-500" />
                        <span className="font-medium">₹{formatNumber(revenue)}</span>
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      <span className="font-medium">₹{formatNumber(revenuePerSession)}</span>
                    </td>
                    <td className="p-3 text-right">
                      <span className="font-medium">{avgCustomers.toFixed(1)}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};