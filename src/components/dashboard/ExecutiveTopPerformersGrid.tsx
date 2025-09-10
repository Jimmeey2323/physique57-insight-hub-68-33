
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Target,
  Award,
  Star,
  Trophy,
  Crown
} from 'lucide-react';
import { formatCurrency, formatNumber } from '@/utils/formatters';

interface ExecutiveTopPerformersGridProps {
  data: {
    sales: any[];
    sessions: any[];
    payroll: any[];
    newClients: any[];
    leads: any[];
  };
}

export const ExecutiveTopPerformersGrid: React.FC<ExecutiveTopPerformersGridProps> = ({ data }) => {
  // Top Class Types by Attendance
  const topClassTypesByAttendance = React.useMemo(() => {
    const classTypes = data.sessions.reduce((acc, session) => {
      const classType = session.cleanedClass || 'Unknown';
      if (!acc[classType]) {
        acc[classType] = { classType, totalAttendance: 0, sessions: 0, avgAttendance: 0 };
      }
      acc[classType].totalAttendance += session.checkedInCount || 0;
      acc[classType].sessions += 1;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(classTypes)
      .map((classType: any) => ({
        ...classType,
        avgAttendance: classType.sessions > 0 ? classType.totalAttendance / classType.sessions : 0
      }))
      .sort((a: any, b: any) => b.totalAttendance - a.totalAttendance)
      .slice(0, 5)
      .map((classType, index) => ({
        ...classType,
        rank: index + 1
      }));
  }, [data.sessions]);

  // Top Products by Revenue
  const topProductsByRevenue = React.useMemo(() => {
    const products = data.sales.reduce((acc, sale) => {
      const product = sale.paymentItem || 'Unknown';
      if (!acc[product]) {
        acc[product] = { product, revenue: 0, transactions: 0 };
      }
      acc[product].revenue += sale.paymentValue || 0;
      acc[product].transactions += 1;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(products)
      .sort((a: any, b: any) => b.revenue - a.revenue)
      .slice(0, 5)
      .map((product: any, index) => ({
        ...product,
        rank: index + 1
      }));
  }, [data.sales]);

  // Top Sessions by Attendance
  const topSessionsByAttendance = React.useMemo(() => {
    return data.sessions
      .sort((a, b) => (b.checkedInCount || 0) - (a.checkedInCount || 0))
      .slice(0, 5)
      .map((session, index) => ({
        ...session,
        rank: index + 1
      }));
  }, [data.sessions]);

  // Top Clients by LTV
  const topClientsByLTV = React.useMemo(() => {
    return data.newClients
      .filter(client => client.ltv > 0)
      .sort((a, b) => (b.ltv || 0) - (a.ltv || 0))
      .slice(0, 5)
      .map((client, index) => ({
        ...client,
        rank: index + 1
      }));
  }, [data.newClients]);

  const RankBadge: React.FC<{ rank: number }> = ({ rank }) => {
    const getIcon = () => {
      switch (rank) {
        case 1: return <Crown className="w-3 h-3" />;
        case 2: return <Trophy className="w-3 h-3" />;
        case 3: return <Award className="w-3 h-3" />;
        default: return <Star className="w-3 h-3" />;
      }
    };

    const getColor = () => {
      switch (rank) {
        case 1: return 'bg-yellow-500 text-yellow-50';
        case 2: return 'bg-gray-400 text-gray-50';
        case 3: return 'bg-amber-600 text-amber-50';
        default: return 'bg-blue-500 text-blue-50';
      }
    };

    return (
      <Badge className={`${getColor()} font-bold`}>
        {getIcon()}
        #{rank}
      </Badge>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Top Class Types by Attendance */}
      <Card className="shadow-xl border-0">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-violet-600 text-white">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Top Class Types by Attendance
            <Badge className="bg-white/20 text-white">Previous Month</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {topClassTypesByAttendance.map((classType) => (
            <div key={classType.classType} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                <RankBadge rank={classType.rank} />
                <div>
                  <p className="font-semibold">{classType.classType}</p>
                  <p className="text-sm text-gray-600">{classType.sessions} sessions</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">{formatNumber(classType.totalAttendance)}</p>
                <p className="text-sm text-gray-600">total attendance</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Top Products by Revenue */}
      <Card className="shadow-xl border-0">
        <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Top Products by Revenue
            <Badge className="bg-white/20 text-white">Previous Month</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {topProductsByRevenue.map((product: any) => (
            <div key={product.product} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                <RankBadge rank={product.rank} />
                <div>
                  <p className="font-semibold">{product.product}</p>
                  <p className="text-sm text-gray-600">{product.transactions} transactions</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">{formatCurrency(product.revenue)}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Top Sessions by Attendance */}
      <Card className="shadow-xl border-0">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Top Sessions by Attendance
            <Badge className="bg-white/20 text-white">Previous Month</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {topSessionsByAttendance.map((session) => (
            <div key={session.sessionId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                <RankBadge rank={session.rank} />
                <div>
                  <p className="font-semibold">{session.cleanedClass}</p>
                  <p className="text-sm text-gray-600">{session.trainerName} • {session.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">{session.checkedInCount || 0}</p>
                <p className="text-sm text-gray-600">attendees</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Top Clients by LTV */}
      <Card className="shadow-xl border-0">
        <CardHeader className="bg-gradient-to-r from-orange-600 to-red-600 text-white">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Top Clients by LTV
            <Badge className="bg-white/20 text-white">Previous Month</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {topClientsByLTV.map((client) => (
            <div key={client.memberId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                <RankBadge rank={client.rank} />
                <div>
                  <p className="font-semibold">{client.firstName} {client.lastName}</p>
                  <p className="text-sm text-gray-600">{client.homeLocation}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">{formatCurrency(client.ltv || 0)}</p>
                <p className="text-sm text-gray-600">LTV</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
