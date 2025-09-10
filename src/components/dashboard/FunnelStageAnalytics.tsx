
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Users, Target, AlertTriangle, CheckCircle, ArrowUpRight, ArrowDownRight, Zap } from 'lucide-react';
import { formatNumber, formatCurrency } from '@/utils/formatters';
import { motion } from 'framer-motion';

interface FunnelStageAnalyticsProps {
  data: any[];
}

export const FunnelStageAnalytics: React.FC<FunnelStageAnalyticsProps> = ({ data }) => {
  const stageAnalytics = useMemo(() => {
    if (!data || data.length === 0) return { stages: [], mostCommon: [], leastCommon: [] };

    const stageMap = new Map();

    data.forEach(lead => {
      const stage = lead.stage || 'Unknown';
      if (!stageMap.has(stage)) {
        stageMap.set(stage, {
          stage,
          count: 0,
          converted: 0,
          lost: 0,
          revenue: 0,
          conversionRate: 0
        });
      }

      const stageData = stageMap.get(stage);
      stageData.count += 1;
      
      if (lead.conversionStatus === 'Converted') {
        stageData.converted += 1;
      }
      
      if (lead.conversionStatus === 'Lost' || lead.stage === 'Lost') {
        stageData.lost += 1;
      }
      
      stageData.revenue += (lead.ltv || 0);
    });

    const stages = Array.from(stageMap.values()).map(stage => ({
      ...stage,
      conversionRate: stage.count > 0 ? (stage.converted / stage.count) * 100 : 0,
      lostRate: stage.count > 0 ? (stage.lost / stage.count) * 100 : 0,
      percentage: stage.count > 0 ? (stage.count / data.length) * 100 : 0,
      avgRevenue: stage.count > 0 ? stage.revenue / stage.count : 0
    })).sort((a, b) => b.count - a.count);

    const mostCommon = stages.slice(0, 5);
    const leastCommon = stages.slice(-5).reverse();

    return { stages, mostCommon, leastCommon };
  }, [data]);

  const totalLeads = data?.length || 0;

  const StageCard = ({ stages, title, icon: Icon, gradient, index }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0 overflow-hidden">
        <CardHeader className={`bg-gradient-to-r ${gradient} text-white`}>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Icon className="w-5 h-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            {stages.map((stage: any, stageIndex: number) => (
              <motion.div
                key={stage.stage}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (index * 0.1) + (stageIndex * 0.05) }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant="secondary" 
                      className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 font-semibold"
                    >
                      #{stageIndex + 1}
                    </Badge>
                    <span className="font-bold text-slate-800 text-sm">{stage.stage}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-900 text-lg">{formatNumber(stage.count)}</div>
                    <div className="text-xs text-slate-500">{stage.percentage.toFixed(1)}% of total</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Progress 
                    value={stage.percentage} 
                    className="h-3 bg-gradient-to-r from-slate-100 to-slate-200"
                  />
                  
                  <div className="grid grid-cols-4 gap-3 text-xs">
                    <div className="text-center p-2 bg-green-50 rounded-lg border border-green-200">
                      <div className="font-bold text-green-700 text-lg">{stage.converted}</div>
                      <div className="text-green-600">Converted</div>
                      <div className="text-green-500 text-xs">{stage.conversionRate.toFixed(1)}%</div>
                    </div>
                    <div className="text-center p-2 bg-red-50 rounded-lg border border-red-200">
                      <div className="font-bold text-red-700 text-lg">{stage.lost}</div>
                      <div className="text-red-600">Lost</div>
                      <div className="text-red-500 text-xs">{stage.lostRate.toFixed(1)}%</div>
                    </div>
                    <div className="text-center p-2 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="font-bold text-blue-700 text-sm">{formatCurrency(stage.revenue)}</div>
                      <div className="text-blue-600">Revenue</div>
                    </div>
                    <div className="text-center p-2 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="font-bold text-purple-700 text-sm">{formatCurrency(stage.avgRevenue)}</div>
                      <div className="text-purple-600">Avg LTV</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="space-y-8">
      {/* Top-level metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{stageAnalytics.stages.length}</div>
              <div className="text-sm text-blue-100">Active Stages</div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">
                {stageAnalytics.stages.reduce((sum, stage) => sum + stage.converted, 0)}
              </div>
              <div className="text-sm text-green-100">Total Conversions</div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">
                {stageAnalytics.stages.reduce((sum, stage) => sum + stage.lost, 0)}
              </div>
              <div className="text-sm text-red-100">Total Lost</div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-4 text-center">
              <div className="text-xl font-bold">
                {formatCurrency(stageAnalytics.stages.reduce((sum, stage) => sum + stage.revenue, 0))}
              </div>
              <div className="text-sm text-purple-100">Total Revenue</div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Stage breakdown cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <StageCard
          stages={stageAnalytics.mostCommon}
          title="Most Common Stages"
          icon={TrendingUp}
          gradient="from-green-500 to-emerald-600"
          index={0}
        />
        
        <StageCard
          stages={stageAnalytics.leastCommon}
          title="Least Common Stages"
          icon={AlertTriangle}
          gradient="from-orange-500 to-red-600"
          index={1}
        />
      </div>

      {/* Stage Performance Overview */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Target className="w-6 h-6" />
              Complete Funnel Stage Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            {/* Performance grid */}
            <div className="space-y-4">
              <h4 className="font-bold text-slate-800 text-lg mb-6 flex items-center gap-2">
                <Zap className="w-5 h-5 text-indigo-600" />
                Conversion Performance by Stage
              </h4>
              
              {stageAnalytics.stages.slice(0, 10).map((stage, index) => (
                <motion.div
                  key={stage.stage}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + (index * 0.05) }}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-200 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600" />
                    <div>
                      <span className="font-semibold text-slate-800 text-lg">{stage.stage}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {formatNumber(stage.count)} leads
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {stage.percentage.toFixed(1)}% of funnel
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="font-bold text-green-600 text-lg">
                        {stage.conversionRate.toFixed(1)}%
                      </div>
                      <div className="text-xs text-slate-500">Conversion</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-red-600 text-lg">
                        {stage.lostRate.toFixed(1)}%
                      </div>
                      <div className="text-xs text-slate-500">Lost Rate</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-indigo-600 text-lg">
                        {formatCurrency(stage.avgRevenue)}
                      </div>
                      <div className="text-xs text-slate-500">Avg LTV</div>
                    </div>
                    <div className="flex items-center">
                      {stage.conversionRate > 20 ? (
                        <TrendingUp className="w-5 h-5 text-green-500" />
                      ) : stage.conversionRate < 5 ? (
                        <TrendingDown className="w-5 h-5 text-red-500" />
                      ) : (
                        <div className="w-5 h-5" />
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
