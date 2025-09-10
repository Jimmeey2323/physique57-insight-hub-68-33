
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
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
  Cell
} from 'recharts';
import { TrendingUp, TrendingDown, Users, DollarSign, Target, Calendar } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/utils/formatters';

interface TrainerDrillDownModalProps {
  isOpen: boolean;
  onClose: () => void;
  trainerName: string;
  trainerData: any;
}

export const TrainerDrillDownModal: React.FC<TrainerDrillDownModalProps> = ({
  isOpen,
  onClose,
  trainerName,
  trainerData
}) => {
  const getTrainerAvatar = (trainerName: string) => {
    const hash = trainerName.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    const avatarId = Math.abs(hash) % 3;
    const avatarUrls = [
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1501286353178-1ec881214838?w=150&h=150&fit=crop&crop=face'
    ];
    return avatarUrls[avatarId];
  };

  // Prepare chart data
  const monthlyTrendData = trainerData?.months ? Object.entries(trainerData.months).map(([month, data]: [string, any]) => ({
    month,
    current: data.current,
    previous: data.previous,
    change: data.change
  })) : [];

  const performanceData = [
    { name: 'New Members', value: 85, color: '#3B82F6' },
    { name: 'Retention Rate', value: 78, color: '#10B981' },
    { name: 'Conversion Rate', value: 65, color: '#F59E0B' },
    { name: 'LTV Performance', value: 82, color: '#8B5CF6' }
  ];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={getTrainerAvatar(trainerName)} />
              <AvatarFallback>{trainerName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{trainerName}</h2>
              <p className="text-gray-600">Performance Analytics Dashboard</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="comparison">YoY Comparison</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium">Total Members</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">248</div>
                  <div className="text-xs text-green-600">+12% from last year</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium">Retention Rate</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600">78.5%</div>
                  <div className="text-xs text-green-600">+5.2% from last year</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-orange-600" />
                    <span className="text-sm font-medium">Conversion Rate</span>
                  </div>
                  <div className="text-2xl font-bold text-orange-600">65.2%</div>
                  <div className="text-xs text-red-600">-2.1% from last year</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-medium">Average LTV</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-600">$1,245</div>
                  <div className="text-xs text-green-600">+8.7% from last year</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={performanceData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {performanceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Monthly Performance Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {performanceData.map((item, index) => (
                    <div key={item.name} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">{item.name}</span>
                        <span className="text-sm font-bold">{item.value}%</span>
                      </div>
                      <Progress value={item.value} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={monthlyTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="current" stroke="#3B82F6" strokeWidth={3} name="Current Year" />
                    <Line type="monotone" dataKey="previous" stroke="#6B7280" strokeWidth={2} strokeDasharray="5 5" name="Previous Year" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comparison" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Year-over-Year Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={monthlyTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="previous" fill="#6B7280" name="Previous Year" />
                    <Bar dataKey="current" fill="#3B82F6" name="Current Year" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Strengths</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="bg-green-100 text-green-800">Excellent</Badge>
                    <span className="text-sm">Member Retention</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="bg-blue-100 text-blue-800">Strong</Badge>
                    <span className="text-sm">Client Satisfaction</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="bg-purple-100 text-purple-800">Good</Badge>
                    <span className="text-sm">Revenue Generation</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Improvement Areas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-orange-200 text-orange-800">Focus</Badge>
                    <span className="text-sm">New Member Conversion</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-red-200 text-red-800">Priority</Badge>
                    <span className="text-sm">Trial to Membership</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    Key Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                    <p className="text-sm font-medium text-green-800">Strong Performance</p>
                    <p className="text-xs text-green-600">Retention rate is 15% above gym average</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                    <p className="text-sm font-medium text-blue-800">Consistent Growth</p>
                    <p className="text-xs text-blue-600">Member base grew by 12% year-over-year</p>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-lg border-l-4 border-orange-400">
                    <p className="text-sm font-medium text-orange-800">Opportunity</p>
                    <p className="text-xs text-orange-600">Conversion rate could improve with focused training</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-600" />
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 border rounded-lg">
                    <p className="text-sm font-medium">Focus on Trial Conversions</p>
                    <p className="text-xs text-gray-600">Implement follow-up protocols for trial members</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="text-sm font-medium">Leverage Retention Success</p>
                    <p className="text-xs text-gray-600">Share retention strategies with other trainers</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="text-sm font-medium">Expand Member Base</p>
                    <p className="text-xs text-gray-600">Consider increasing class capacity or schedule</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
