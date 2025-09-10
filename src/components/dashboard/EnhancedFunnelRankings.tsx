import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Users, Target, AlertTriangle, CheckCircle, Crown, Activity } from 'lucide-react';
import { formatNumber, formatCurrency } from '@/utils/formatters';
import { motion } from 'framer-motion';
import { LeadsData } from '@/types/leads';

interface EnhancedFunnelRankingsProps {
  data: LeadsData[];
}

export const EnhancedFunnelRankings: React.FC<EnhancedFunnelRankingsProps> = ({ data }) => {
  const rankings = useMemo(() => {
    if (!data || data.length === 0) return { sources: [], stages: [] };

    // Source rankings
    const sourceMap = new Map();
    data.forEach(lead => {
      const source = lead.source || 'Unknown';
      if (!sourceMap.has(source)) {
        sourceMap.set(source, {
          name: source,
          count: 0,
          converted: 0,
          revenue: 0,
          conversionRate: 0
        });
      }

      const sourceData = sourceMap.get(source);
      sourceData.count += 1;
      
      if (lead.conversionStatus === 'Converted') {
        sourceData.converted += 1;
      }
      
      sourceData.revenue += (lead.ltv || 0);
    });

    const sources = Array.from(sourceMap.values()).map(source => ({
      ...source,
      conversionRate: source.count > 0 ? (source.converted / source.count) * 100 : 0,
      avgRevenue: source.count > 0 ? source.revenue / source.count : 0
    })).sort((a, b) => b.count - a.count);

    // Stage rankings
    const stageMap = new Map();
    data.forEach(lead => {
      const stage = lead.stage || 'Unknown';
      if (!stageMap.has(stage)) {
        stageMap.set(stage, {
          name: stage,
          count: 0,
          converted: 0,
          revenue: 0,
          conversionRate: 0
        });
      }

      const stageData = stageMap.get(stage);
      stageData.count += 1;
      
      if (lead.conversionStatus === 'Converted') {
        stageData.converted += 1;
      }
      
      stageData.revenue += (lead.ltv || 0);
    });

    const stages = Array.from(stageMap.values()).map(stage => ({
      ...stage,
      conversionRate: stage.count > 0 ? (stage.converted / stage.count) * 100 : 0,
      avgRevenue: stage.count > 0 ? stage.revenue / stage.count : 0,
      percentage: stage.count > 0 ? (stage.count / data.length) * 100 : 0
    })).sort((a, b) => b.count - a.count);

    return { sources, stages };
  }, [data]);

  const totalLeads = data?.length || 0;

  const RankingCard = ({ title, items, type, icon: Icon, gradient }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0 overflow-hidden h-full">
        <CardHeader className={`bg-gradient-to-r ${gradient} text-white`}>
          <CardTitle className="flex items-center gap-3 text-lg font-bold">
            <div className="p-2 bg-white/20 rounded-xl">
              <Icon className="w-5 h-5" />
            </div>
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Top Performers */}
            <div>
              <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                <Crown className="w-4 h-4 text-yellow-500" />
                Top Performers
              </h4>
              <div className="space-y-3">
                {items.slice(0, 5).map((item: any, index: number) => (
                  <motion.div
                    key={`top-${item.name}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200"
                  >
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant="secondary" 
                        className={`
                          ${index === 0 ? 'bg-yellow-100 text-yellow-800 border-yellow-300' : ''}
                          ${index === 1 ? 'bg-gray-100 text-gray-800 border-gray-300' : ''}
                          ${index === 2 ? 'bg-orange-100 text-orange-800 border-orange-300' : ''}
                          ${index > 2 ? 'bg-blue-100 text-blue-800 border-blue-300' : ''}
                        `}
                      >
                        #{index + 1}
                      </Badge>
                      <div>
                        <span className="font-semibold text-slate-800 text-sm">{item.name}</span>
                        <div className="text-xs text-slate-500">{item.conversionRate.toFixed(1)}% conversion</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-700 text-lg">{formatNumber(item.count)}</div>
                      <div className="text-xs text-slate-500">
                        {type === 'stage' ? `${item.percentage.toFixed(1)}% of funnel` : formatCurrency(item.avgRevenue)}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Bottom Performers */}
            <div>
              <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                Needs Attention
              </h4>
              <div className="space-y-3">
                {items.slice(-3).reverse().map((item: any, index: number) => (
                  <motion.div
                    key={`bottom-${item.name}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-200"
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-300">
                        #{items.length - 2 + index}
                      </Badge>
                      <div>
                        <span className="font-semibold text-slate-800 text-sm">{item.name}</span>
                        <div className="text-xs text-slate-500">{item.conversionRate.toFixed(1)}% conversion</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-red-700 text-lg">{formatNumber(item.count)}</div>
                      <div className="text-xs text-slate-500">
                        {type === 'stage' ? `${item.percentage.toFixed(1)}% of funnel` : formatCurrency(item.avgRevenue)}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Performance Overview */}
            <div className="mt-6 p-4 bg-slate-50 rounded-xl">
              <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-600" />
                Performance Overview
              </h4>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-indigo-600">{items.length}</div>
                  <div className="text-xs text-slate-600">Total {type === 'source' ? 'Sources' : 'Stages'}</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {(items.reduce((sum: number, item: any) => sum + item.conversionRate, 0) / items.length).toFixed(1)}%
                  </div>
                  <div className="text-xs text-slate-600">Avg Conversion</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{rankings.sources.length}</div>
              <div className="text-sm text-blue-100">Active Sources</div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{rankings.stages.length}</div>
              <div className="text-sm text-purple-100">Funnel Stages</div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-4 text-center">
              <div className="text-xl font-bold">
                {formatCurrency(rankings.sources.reduce((sum, source) => sum + source.revenue, 0))}
              </div>
              <div className="text-sm text-green-100">Total Revenue</div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Rankings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RankingCard
          title="Lead Source Rankings"
          items={rankings.sources}
          type="source"
          icon={Users}
          gradient="from-blue-600 to-indigo-700"
        />
        
        <RankingCard
          title="Funnel Stage Rankings"
          items={rankings.stages}
          type="stage"
          icon={Target}
          gradient="from-purple-600 to-pink-700"
        />
      </div>
    </div>
  );
};