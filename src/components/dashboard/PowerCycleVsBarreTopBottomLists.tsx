
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Users, Clock } from 'lucide-react';
import { SessionData } from '@/hooks/useSessionsData';
import { formatNumber } from '@/utils/formatters';

interface PowerCycleVsBarreTopBottomListsProps {
  powerCycleData: SessionData[];
  barreData: SessionData[];
  onItemClick?: (item: any) => void;
}

export const PowerCycleVsBarreTopBottomLists: React.FC<PowerCycleVsBarreTopBottomListsProps> = ({
  powerCycleData,
  barreData,
  onItemClick
}) => {
  // Top performing sessions by fill rate
  const topPowerCycleSessions = React.useMemo(() => {
    return powerCycleData
      .sort((a, b) => (b.fillPercentage || 0) - (a.fillPercentage || 0))
      .slice(0, 5);
  }, [powerCycleData]);

  const topBarreSessions = React.useMemo(() => {
    return barreData
      .sort((a, b) => (b.fillPercentage || 0) - (a.fillPercentage || 0))
      .slice(0, 5);
  }, [barreData]);

  // Bottom performing sessions by fill rate
  const bottomPowerCycleSessions = React.useMemo(() => {
    return powerCycleData
      .sort((a, b) => (a.fillPercentage || 0) - (b.fillPercentage || 0))
      .slice(0, 5);
  }, [powerCycleData]);

  const bottomBarreSessions = React.useMemo(() => {
    return barreData
      .sort((a, b) => (a.fillPercentage || 0) - (b.fillPercentage || 0))
      .slice(0, 5);
  }, [barreData]);

  const SessionListItem: React.FC<{ session: SessionData; isTop: boolean }> = ({ session, isTop }) => (
    <div 
      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
      onClick={() => onItemClick?.(session)}
    >
      <div className="flex items-center gap-3">
        {isTop ? (
          <TrendingUp className="w-4 h-4 text-green-600" />
        ) : (
          <TrendingDown className="w-4 h-4 text-red-600" />
        )}
        <div>
          <p className="font-medium text-sm">{session.cleanedClass}</p>
          <p className="text-xs text-gray-600">{session.trainerName} • {session.date}</p>
        </div>
      </div>
      <div className="text-right">
        <Badge variant={isTop ? "default" : "secondary"}>
          {Math.round(session.fillPercentage || 0)}%
        </Badge>
        <p className="text-xs text-gray-600 mt-1">
          {session.checkedInCount}/{session.capacity}
        </p>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Top Performing Sessions */}
      <div className="space-y-4">
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Top PowerCycle Sessions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topPowerCycleSessions.map((session, index) => (
              <SessionListItem key={session.sessionId} session={session} isTop={true} />
            ))}
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Top Barre Sessions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topBarreSessions.map((session, index) => (
              <SessionListItem key={session.sessionId} session={session} isTop={true} />
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Performing Sessions */}
      <div className="space-y-4">
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingDown className="w-5 h-5 text-red-600" />
              Low-Fill PowerCycle Sessions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {bottomPowerCycleSessions.map((session, index) => (
              <SessionListItem key={session.sessionId} session={session} isTop={false} />
            ))}
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingDown className="w-5 h-5 text-red-600" />
              Low-Fill Barre Sessions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {bottomBarreSessions.map((session, index) => (
              <SessionListItem key={session.sessionId} session={session} isTop={false} />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
