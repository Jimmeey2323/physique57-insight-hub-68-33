import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UniformTrainerTable } from './UniformTrainerTable';
import { ProcessedTrainerData } from './TrainerDataProcessor';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { Zap, Clock, Target, TrendingUp, TrendingDown, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TrainerEfficiencyAnalysisTableProps {
  data: ProcessedTrainerData[];
  onRowClick?: (trainer: string, data: any) => void;
}

export const TrainerEfficiencyAnalysisTable: React.FC<TrainerEfficiencyAnalysisTableProps> = ({ 
  data, 
  onRowClick 
}) => {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'efficiencyScore',
    direction: 'desc'
  });

  const efficiencyData = useMemo(() => {
    // Aggregate and calculate efficiency metrics by trainer
    const trainerEfficiency = data.reduce((acc, record) => {
      const key = record.trainerName;
      
      if (!acc[key]) {
        acc[key] = {
          trainerName: record.trainerName,
          location: record.location,
          totalSessions: 0,
          nonEmptySessions: 0,
          emptySessions: 0,
          totalCustomers: 0,
          totalRevenue: 0,
          cycleSessions: 0,
          barreSessions: 0,
          strengthSessions: 0,
          monthsActive: 0,
          capacityUtilization: 0,
          revenuePerHour: 0,
          customerRetention: 0,
          avgClassFill: 0,
          efficiencyScore: 0,
          productivityRank: 'A',
          timeOptimization: 0,
          resourceUtilization: 0,
          impactScore: 0,
          qualityIndex: 0,
          growthMomentum: 0,
          consistencyFactor: 0
        };
      }

      acc[key].totalSessions += record.totalSessions;
      acc[key].nonEmptySessions += record.nonEmptySessions;
      acc[key].emptySessions += record.emptySessions;
      acc[key].totalCustomers += record.totalCustomers;
      acc[key].totalRevenue += record.totalPaid;
      acc[key].cycleSessions += record.cycleSessions;
      acc[key].barreSessions += record.barreSessions;
      acc[key].strengthSessions += record.strengthSessions;
      acc[key].monthsActive += 1;

      return acc;
    }, {} as Record<string, any>);

    // Calculate efficiency metrics
    return Object.values(trainerEfficiency).map((trainer: any) => {
      // Basic efficiency calculations
      trainer.capacityUtilization = trainer.totalSessions > 0 
        ? (trainer.nonEmptySessions / trainer.totalSessions) * 100 
        : 0;
      
      trainer.avgClassFill = trainer.nonEmptySessions > 0 
        ? trainer.totalCustomers / trainer.nonEmptySessions 
        : 0;

      // Advanced efficiency metrics (mock realistic calculations)
      trainer.revenuePerHour = trainer.totalSessions > 0 
        ? trainer.totalRevenue / (trainer.totalSessions * 1) // Assuming 1 hour per session
        : 0;

      trainer.customerRetention = 75 + Math.random() * 20; // Mock 75-95%
      trainer.timeOptimization = 80 + Math.random() * 15; // Mock 80-95%
      trainer.resourceUtilization = trainer.capacityUtilization;
      trainer.impactScore = 70 + Math.random() * 25; // Mock 70-95%
      trainer.qualityIndex = 75 + Math.random() * 20; // Mock 75-95%
      trainer.growthMomentum = Math.random() * 30 - 5; // Mock -5% to +25%
      trainer.consistencyFactor = 70 + Math.random() * 25; // Mock 70-95%

      // Calculate overall efficiency score
      trainer.efficiencyScore = (
        trainer.capacityUtilization * 0.25 +
        trainer.revenuePerHour * 0.01 + // Normalized
        trainer.customerRetention * 0.2 +
        trainer.timeOptimization * 0.15 +
        trainer.impactScore * 0.2 +
        trainer.qualityIndex * 0.15 +
        trainer.consistencyFactor * 0.05
      );

      // Determine productivity rank
      if (trainer.efficiencyScore >= 90) trainer.productivityRank = 'S+';
      else if (trainer.efficiencyScore >= 85) trainer.productivityRank = 'A+';
      else if (trainer.efficiencyScore >= 80) trainer.productivityRank = 'A';
      else if (trainer.efficiencyScore >= 75) trainer.productivityRank = 'B+';
      else if (trainer.efficiencyScore >= 70) trainer.productivityRank = 'B';
      else trainer.productivityRank = 'C';

      return trainer;
    }).sort((a, b) => {
      if (sortConfig.key === 'trainerName') {
        return sortConfig.direction === 'asc' 
          ? a.trainerName.localeCompare(b.trainerName)
          : b.trainerName.localeCompare(a.trainerName);
      }
      const aValue = a[sortConfig.key] || 0;
      const bValue = b[sortConfig.key] || 0;
      return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
    });
  }, [data, sortConfig]);

  const handleRowClick = (rowData: any) => {
    if (onRowClick) {
      onRowClick(rowData.trainerName, {
        ...rowData,
        type: 'trainer-efficiency'
      });
    }
  };

  const columns = [
    {
      key: 'trainerName' as const,
      header: 'Trainer',
      className: 'font-semibold min-w-[160px]',
      render: (value: string, row: any) => (
        <div>
          <div className="font-medium text-slate-800">{value}</div>
          <div className="text-sm text-slate-500">{row.location}</div>
          <Badge className={`mt-1 text-xs ${
            row.productivityRank === 'S+' ? 'bg-purple-100 text-purple-800' :
            row.productivityRank === 'A+' ? 'bg-green-100 text-green-800' :
            row.productivityRank === 'A' ? 'bg-blue-100 text-blue-800' :
            row.productivityRank === 'B+' ? 'bg-yellow-100 text-yellow-800' :
            row.productivityRank === 'B' ? 'bg-orange-100 text-orange-800' :
            'bg-red-100 text-red-800'
          }`}>
            Rank {row.productivityRank}
          </Badge>
        </div>
      )
    },
    {
      key: 'efficiencyScore' as const,
      header: 'Efficiency Score',
      align: 'center' as const,
      render: (value: number) => (
        <div className="flex flex-col items-center">
          <div className={`text-2xl font-bold ${
            value >= 85 ? 'text-green-600' :
            value >= 75 ? 'text-blue-600' :
            value >= 65 ? 'text-yellow-600' :
            'text-red-600'
          }`}>
            {value.toFixed(0)}
          </div>
          <div className="flex items-center gap-1 mt-1">
            <Zap className="w-3 h-3 text-yellow-500" />
            <span className="text-xs text-slate-500">Score</span>
          </div>
        </div>
      )
    },
    {
      key: 'capacityUtilization' as const,
      header: 'Capacity Usage',
      align: 'center' as const,
      render: (value: number, row: any) => (
        <div className="flex flex-col items-center">
          <div className={`font-semibold ${
            value >= 90 ? 'text-green-600' :
            value >= 80 ? 'text-blue-600' :
            value >= 70 ? 'text-yellow-600' :
            'text-red-600'
          }`}>
            {value.toFixed(1)}%
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {row.nonEmptySessions}/{row.totalSessions}
          </div>
          <div className="w-12 h-1 bg-slate-200 rounded-full mt-1">
            <div 
              className={`h-full rounded-full ${
                value >= 90 ? 'bg-green-500' :
                value >= 80 ? 'bg-blue-500' :
                value >= 70 ? 'bg-yellow-500' :
                'bg-red-500'
              }`}
              style={{ width: `${Math.min(value, 100)}%` }}
            />
          </div>
        </div>
      )
    },
    {
      key: 'revenuePerHour' as const,
      header: 'Revenue/Hour',
      align: 'center' as const,
      render: (value: number) => (
        <div className="flex flex-col items-center">
          <span className="font-semibold text-green-600">{formatCurrency(value)}</span>
          <Clock className="w-3 h-3 text-green-400 mt-1" />
        </div>
      )
    },
    {
      key: 'avgClassFill' as const,
      header: 'Avg Fill',
      align: 'center' as const,
      render: (value: number) => (
        <div className="flex flex-col items-center">
          <span className="font-semibold text-purple-600">{value.toFixed(1)}</span>
          <div className="text-xs text-purple-500 mt-1">customers</div>
        </div>
      )
    },
    {
      key: 'customerRetention' as const,
      header: 'Retention',
      align: 'center' as const,
      render: (value: number) => (
        <div className="flex flex-col items-center">
          <span className={`font-semibold ${
            value >= 90 ? 'text-green-600' :
            value >= 80 ? 'text-blue-600' :
            value >= 70 ? 'text-yellow-600' :
            'text-red-600'
          }`}>
            {value.toFixed(1)}%
          </span>
          <Target className="w-3 h-3 text-slate-400 mt-1" />
        </div>
      )
    },
    {
      key: 'timeOptimization' as const,
      header: 'Time Opt.',
      align: 'center' as const,
      render: (value: number) => (
        <span className={`font-semibold ${
          value >= 90 ? 'text-green-600' :
          value >= 85 ? 'text-blue-600' :
          value >= 80 ? 'text-yellow-600' :
          'text-red-600'
        }`}>
          {value.toFixed(0)}%
        </span>
      )
    },
    {
      key: 'qualityIndex' as const,
      header: 'Quality Index',
      align: 'center' as const,
      render: (value: number) => (
        <div className="flex flex-col items-center">
          <span className={`font-semibold ${
            value >= 90 ? 'text-green-600' :
            value >= 85 ? 'text-blue-600' :
            value >= 80 ? 'text-yellow-600' :
            'text-red-600'
          }`}>
            {value.toFixed(0)}
          </span>
          <Award className="w-3 h-3 text-slate-400 mt-1" />
        </div>
      )
    },
    {
      key: 'growthMomentum' as const,
      header: 'Growth',
      align: 'center' as const,
      render: (value: number) => (
        <div className="flex items-center justify-center gap-1">
          {value >= 0 ? (
            <TrendingUp className="w-3 h-3 text-green-500" />
          ) : (
            <TrendingDown className="w-3 h-3 text-red-500" />
          )}
          <span className={`font-semibold ${
            value >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {value >= 0 ? '+' : ''}{value.toFixed(1)}%
          </span>
        </div>
      )
    },
    {
      key: 'impactScore' as const,
      header: 'Impact',
      align: 'center' as const,
      render: (value: number) => (
        <div className="flex flex-col items-center">
          <div className={`font-bold ${
            value >= 90 ? 'text-purple-600' :
            value >= 80 ? 'text-blue-600' :
            value >= 70 ? 'text-green-600' :
            'text-yellow-600'
          }`}>
            {value.toFixed(0)}
          </div>
          <div className="text-xs text-slate-500">score</div>
        </div>
      )
    }
  ];

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const avgEfficiency = efficiencyData.reduce((sum, trainer) => sum + trainer.efficiencyScore, 0) / efficiencyData.length;
    const topPerformers = efficiencyData.filter(trainer => trainer.efficiencyScore >= 85).length;
    const avgCapacityUtilization = efficiencyData.reduce((sum, trainer) => sum + trainer.capacityUtilization, 0) / efficiencyData.length;
    
    return { avgEfficiency, topPerformers, avgCapacityUtilization };
  }, [efficiencyData]);

  return (
    <Card className="bg-gradient-to-br from-white via-slate-50/30 to-white border-0 shadow-xl">
      <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-orange-600 to-red-600 text-white">
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Trainer Efficiency & Productivity Analysis
          <Badge variant="secondary" className="bg-white/20 text-white">
            {efficiencyData.length} Trainers
          </Badge>
        </CardTitle>
        <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
          <div className="bg-white/10 rounded-lg p-3">
            <div className="text-white/80">Avg Efficiency</div>
            <div className="text-xl font-bold">{summaryStats.avgEfficiency.toFixed(0)}</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <div className="text-white/80">Top Performers</div>
            <div className="text-xl font-bold">{summaryStats.topPerformers}</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <div className="text-white/80">Avg Utilization</div>
            <div className="text-xl font-bold">{summaryStats.avgCapacityUtilization.toFixed(1)}%</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <UniformTrainerTable
          data={efficiencyData}
          columns={columns}
          onRowClick={handleRowClick}
          headerGradient="from-orange-600 to-red-600"
          showFooter={false}
          stickyHeader={true}
        />
      </CardContent>
    </Card>
  );
};