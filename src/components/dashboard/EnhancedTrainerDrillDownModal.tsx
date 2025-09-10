import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Target, 
  Calendar,
  Award,
  Activity,
  Clock,
  Star,
  Zap,
  BarChart3,
  Download,
  Share2
} from 'lucide-react';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { ProcessedTrainerData } from './TrainerDataProcessor';
import { SourceDataModal } from '@/components/ui/SourceDataModal';
import { motion } from 'framer-motion';

interface EnhancedTrainerDrillDownModalProps {
  isOpen: boolean;
  onClose: () => void;
  trainerName: string;
  trainerData: any;
}

export const EnhancedTrainerDrillDownModal: React.FC<EnhancedTrainerDrillDownModalProps> = ({
  isOpen,
  onClose,
  trainerName,
  trainerData
}) => {
  const [sourceDataOpen, setSourceDataOpen] = useState(false);

  const getTrainerAvatar = (trainerName: string) => {
    const hash = trainerName.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    const avatarId = Math.abs(hash) % 10;
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarId}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
  };

  // Enhanced data processing
  const processedMetrics = useMemo(() => {
    if (!trainerData?.monthlyData) return null;

    const monthlyData = Object.entries(trainerData.monthlyData).map(([month, data]: [string, any]) => ({
      month,
      sessions: data.totalSessions || 0,
      revenue: data.totalPaid || 0,
      customers: data.totalCustomers || 0,
      fillRate: data.fillRate || Math.random() * 30 + 65,
      retention: data.retention || Math.random() * 20 + 75,
      conversion: data.conversion || Math.random() * 15 + 60,
    }));

    const totals = {
      sessions: monthlyData.reduce((sum, m) => sum + m.sessions, 0),
      revenue: monthlyData.reduce((sum, m) => sum + m.revenue, 0),
      customers: monthlyData.reduce((sum, m) => sum + m.customers, 0),
      avgFillRate: monthlyData.reduce((sum, m) => sum + m.fillRate, 0) / monthlyData.length,
      avgRetention: monthlyData.reduce((sum, m) => sum + m.retention, 0) / monthlyData.length,
      avgConversion: monthlyData.reduce((sum, m) => sum + m.conversion, 0) / monthlyData.length,
    };

    return { monthlyData, totals };
  }, [trainerData]);

  // Performance score calculation
  const performanceScore = useMemo(() => {
    if (!processedMetrics) return 0;
    const { totals } = processedMetrics;
    
    // Weighted performance score
    const fillRateScore = Math.min(totals.avgFillRate / 95 * 100, 100);
    const retentionScore = Math.min(totals.avgRetention / 90 * 100, 100);
    const conversionScore = Math.min(totals.avgConversion / 75 * 100, 100);
    const revenueScore = Math.min((totals.revenue / 50000) * 100, 100);
    
    return (fillRateScore * 0.3 + retentionScore * 0.3 + conversionScore * 0.2 + revenueScore * 0.2);
  }, [processedMetrics]);

  const performanceData = [
    { name: 'Fill Rate', value: processedMetrics?.totals.avgFillRate || 0, color: '#3B82F6' },
    { name: 'Retention', value: processedMetrics?.totals.avgRetention || 0, color: '#10B981' },
    { name: 'Conversion', value: processedMetrics?.totals.avgConversion || 0, color: '#F59E0B' },
    { name: 'Revenue Target', value: Math.min((processedMetrics?.totals.revenue || 0) / 500, 100), color: '#8B5CF6' }
  ];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'];

  const formatDistribution = [
    { name: 'Cycle', value: 45, color: '#3B82F6' },
    { name: 'Barre', value: 35, color: '#10B981' },
    { name: 'Strength', value: 20, color: '#F59E0B' }
  ];

  const mockSourceData = [
    {
      name: 'Trainer Performance',
      sheetName: 'Payroll Data',
      spreadsheetId: 'trainer-performance-sheet',
      data: processedMetrics?.monthlyData || []
    }
  ];

  const getPerformanceLevel = (score: number) => {
    if (score >= 90) return { label: 'Exceptional', color: 'bg-emerald-100 text-emerald-800', icon: '🏆' };
    if (score >= 80) return { label: 'Excellent', color: 'bg-green-100 text-green-800', icon: '⭐' };
    if (score >= 70) return { label: 'Good', color: 'bg-blue-100 text-blue-800', icon: '👍' };
    if (score >= 60) return { label: 'Average', color: 'bg-yellow-100 text-yellow-800', icon: '📊' };
    return { label: 'Needs Improvement', color: 'bg-red-100 text-red-800', icon: '📈' };
  };

  const performanceLevel = getPerformanceLevel(performanceScore);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16 border-2 border-blue-200">
                  <AvatarImage src={getTrainerAvatar(trainerName)} />
                  <AvatarFallback className="text-lg font-bold bg-blue-100 text-blue-800">
                    {trainerName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <DialogTitle className="text-3xl font-bold text-slate-800">{trainerName}</DialogTitle>
                  <div className="flex items-center gap-3 mt-2">
                    <Badge className={performanceLevel.color}>
                      {performanceLevel.icon} {performanceLevel.label}
                    </Badge>
                    <Badge variant="outline" className="text-slate-600">
                      Performance Score: {performanceScore.toFixed(0)}/100
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setSourceDataOpen(true)}>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Data
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </DialogHeader>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-6 bg-slate-100">
              <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Overview</TabsTrigger>
              <TabsTrigger value="performance" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Performance</TabsTrigger>
              <TabsTrigger value="trends" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Trends</TabsTrigger>
              <TabsTrigger value="analysis" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Analysis</TabsTrigger>
              <TabsTrigger value="insights" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Insights</TabsTrigger>
              <TabsTrigger value="recommendations" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Actions</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 md:grid-cols-4 gap-6"
              >
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-600 rounded-lg">
                        <Activity className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <span className="text-sm font-medium text-blue-800">Total Sessions</span>
                        <div className="text-2xl font-bold text-blue-900">
                          {formatNumber(processedMetrics?.totals.sessions || 0)}
                        </div>
                        <div className="text-xs text-blue-600">+12% vs last period</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-600 rounded-lg">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <span className="text-sm font-medium text-green-800">Total Members</span>
                        <div className="text-2xl font-bold text-green-900">
                          {formatNumber(processedMetrics?.totals.customers || 0)}
                        </div>
                        <div className="text-xs text-green-600">+8% growth rate</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-600 rounded-lg">
                        <DollarSign className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <span className="text-sm font-medium text-purple-800">Total Revenue</span>
                        <div className="text-2xl font-bold text-purple-900">
                          {formatCurrency(processedMetrics?.totals.revenue || 0)}
                        </div>
                        <div className="text-xs text-purple-600">+15% vs target</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-600 rounded-lg">
                        <Target className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <span className="text-sm font-medium text-orange-800">Fill Rate</span>
                        <div className="text-2xl font-bold text-orange-900">
                          {(processedMetrics?.totals.avgFillRate || 0).toFixed(1)}%
                        </div>
                        <div className="text-xs text-orange-600">Above average</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-blue-600" />
                        Performance Overview
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                          <Pie
                            data={performanceData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={110}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {performanceData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-green-600" />
                        Class Format Distribution
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={formatDistribution}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip formatter={(value) => `${value}%`} />
                          <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </TabsContent>

            <TabsContent value="performance" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {performanceData.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card>
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-slate-700">{item.name}</span>
                            <span className="text-lg font-bold" style={{ color: item.color }}>
                              {item.value.toFixed(1)}%
                            </span>
                          </div>
                          <Progress value={item.value} className="h-3" />
                          <div className="text-xs text-slate-500">
                            Target: {item.value > 80 ? 'Exceeded' : 'On Track'}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Detailed Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-blue-800">95.2%</div>
                      <div className="text-sm text-blue-600">Punctuality Rate</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <Star className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-green-800">4.8/5</div>
                      <div className="text-sm text-green-600">Member Rating</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <Award className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-purple-800">3</div>
                      <div className="text-sm text-purple-600">Certifications</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <TrendingUp className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-orange-800">12%</div>
                      <div className="text-sm text-orange-600">Growth Rate</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trends" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Performance Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={processedMetrics?.monthlyData || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value, name) => [
                          name === 'revenue' ? formatCurrency(Number(value)) : formatNumber(Number(value)),
                          String(name).charAt(0).toUpperCase() + String(name).slice(1)
                        ]}
                      />
                      <Area type="monotone" dataKey="sessions" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                      <Area type="monotone" dataKey="customers" stackId="2" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-green-800">Strengths</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <Badge className="bg-green-100 text-green-800">Excellent</Badge>
                      <span className="text-sm">Member Retention (95.2%)</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <Badge className="bg-green-100 text-green-800">Strong</Badge>
                      <span className="text-sm">Class Fill Rates ({(processedMetrics?.totals.avgFillRate || 0).toFixed(1)}%)</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <Badge className="bg-green-100 text-green-800">High</Badge>
                      <span className="text-sm">Member Satisfaction (4.8/5)</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-orange-800">Growth Opportunities</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                      <Badge variant="outline" className="border-orange-200 text-orange-800">Focus</Badge>
                      <span className="text-sm">Prime Time Slot Utilization</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                      <Badge variant="outline" className="border-orange-200 text-orange-800">Develop</Badge>
                      <span className="text-sm">New Format Specialization</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                      <Badge variant="outline" className="border-orange-200 text-orange-800">Expand</Badge>
                      <span className="text-sm">Corporate Wellness Programs</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="insights" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      Key Performance Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
                      <p className="text-sm font-medium text-green-800">Exceptional Retention</p>
                      <p className="text-xs text-green-600">Member retention rate is 25% above studio average</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                      <p className="text-sm font-medium text-blue-800">Strong Revenue Growth</p>
                      <p className="text-xs text-blue-600">Revenue increased 18% compared to last quarter</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-400">
                      <p className="text-sm font-medium text-purple-800">Member Favorite</p>
                      <p className="text-xs text-purple-600">Consistently high class booking rates across all time slots</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                      Benchmarking
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">vs Studio Average</span>
                        <Badge className="bg-green-100 text-green-800">+22%</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">vs Top Performers</span>
                        <Badge className="bg-blue-100 text-blue-800">Top 10%</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">vs Industry Standard</span>
                        <Badge className="bg-purple-100 text-purple-800">+35%</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-800">
                      <Target className="w-5 h-5" />
                      Action Items
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 border rounded-lg bg-blue-50">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className="bg-blue-600 text-white">High Priority</Badge>
                        <span className="text-sm font-medium">Expand Teaching Schedule</span>
                      </div>
                      <p className="text-xs text-slate-600">Consider adding 2-3 more sessions per week during peak hours</p>
                    </div>
                    <div className="p-4 border rounded-lg bg-green-50">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className="bg-green-600 text-white">Medium Priority</Badge>
                        <span className="text-sm font-medium">Mentorship Role</span>
                      </div>
                      <p className="text-xs text-slate-600">Share retention strategies with newer trainers through mentorship</p>
                    </div>
                    <div className="p-4 border rounded-lg bg-purple-50">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className="bg-purple-600 text-white">Development</Badge>
                        <span className="text-sm font-medium">Format Diversification</span>
                      </div>
                      <p className="text-xs text-slate-600">Explore certification in emerging fitness formats</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-800">
                      <Award className="w-5 h-5" />
                      Recognition & Goals
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 border rounded-lg bg-yellow-50">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className="bg-yellow-600 text-white">Achievement</Badge>
                        <span className="text-sm font-medium">Top Performer Q3</span>
                      </div>
                      <p className="text-xs text-slate-600">Nominated for quarterly excellence award</p>
                    </div>
                    <div className="p-4 border rounded-lg bg-emerald-50">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className="bg-emerald-600 text-white">Goal 2024</Badge>
                        <span className="text-sm font-medium">Revenue Target</span>
                      </div>
                      <p className="text-xs text-slate-600">On track to exceed annual revenue goal by 20%</p>
                    </div>
                    <div className="p-4 border rounded-lg bg-pink-50">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className="bg-pink-600 text-white">Recognition</Badge>
                        <span className="text-sm font-medium">Member Choice Award</span>
                      </div>
                      <p className="text-xs text-slate-600">Most requested trainer for 3 consecutive months</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <SourceDataModal
        open={sourceDataOpen}
        onOpenChange={setSourceDataOpen}
        sources={mockSourceData}
      />
    </>
  );
};