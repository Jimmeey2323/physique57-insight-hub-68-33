import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LateCancellationsData } from '@/types/dashboard';
import { formatNumber } from '@/utils/formatters';
import { TrendingUp, TrendingDown, Users, MapPin, Calendar, User, Package } from 'lucide-react';

interface EnhancedLateCancellationsTopBottomListsProps {
  data: LateCancellationsData[];
}

export const EnhancedLateCancellationsTopBottomLists: React.FC<EnhancedLateCancellationsTopBottomListsProps> = ({ data }) => {
  const [activeList, setActiveList] = useState<'members' | 'locations' | 'classes' | 'trainers' | 'memberships'>('members');

  const listData = useMemo(() => {
    if (!data || data.length === 0) return { top: [], bottom: [] };

    const generateList = (groupBy: string, nameField: string) => {
      const groups = data.reduce((acc, item) => {
        const key = item[groupBy as keyof LateCancellationsData] as string || 'Unknown';
        const name = item[nameField as keyof LateCancellationsData] as string || key;
        
        if (!acc[key]) {
          acc[key] = {
            id: key,
            name: name,
            count: 0,
            members: new Set(),
            locations: new Set(),
            classes: new Set(),
            data: []
          };
        }
        
        acc[key].count += 1;
        acc[key].members.add(item.memberId);
        acc[key].locations.add(item.location);
        acc[key].classes.add(item.cleanedClass);
        acc[key].data.push(item);
        
        return acc;
      }, {} as Record<string, any>);

      const sortedGroups = Object.values(groups)
        .map((group: any) => ({
          ...group,
          uniqueMembers: group.members.size,
          uniqueLocations: group.locations.size,
          uniqueClasses: group.classes.size
        }))
        .sort((a: any, b: any) => b.count - a.count);

      return {
        top: sortedGroups.slice(0, 10),
        bottom: sortedGroups.slice(-5).reverse()
      };
    };

    switch (activeList) {
      case 'members':
        return generateList('memberId', 'firstName');
      case 'locations':
        return generateList('location', 'location');
      case 'classes':
        return generateList('cleanedClass', 'cleanedClass');
      case 'trainers':
        return generateList('teacherName', 'teacherName');
      case 'memberships':
        return generateList('cleanedProduct', 'cleanedProduct');
      default:
        return { top: [], bottom: [] };
    }
  }, [data, activeList]);

  const getIcon = () => {
    switch (activeList) {
      case 'members': return Users;
      case 'locations': return MapPin;
      case 'classes': return Calendar;
      case 'trainers': return User;
      case 'memberships': return Package;
      default: return Users;
    }
  };

  const getTitle = () => {
    switch (activeList) {
      case 'members': return 'Members';
      case 'locations': return 'Locations';
      case 'classes': return 'Class Types';
      case 'trainers': return 'Trainers';
      case 'memberships': return 'Membership Types';
      default: return 'Members';
    }
  };

  const renderListItem = (item: any, index: number, isTop: boolean) => {
    const IconComponent = getIcon();
    
    return (
      <div 
        key={item.id} 
        className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-white text-sm font-bold ${
            isTop ? 'bg-red-500' : 'bg-green-500'
          }`}>
            {index + 1}
          </div>
          <div className="flex items-center gap-2">
            <IconComponent className="w-4 h-4 text-gray-500" />
            <div>
              <p className="font-medium text-gray-900 truncate max-w-48" title={item.name}>
                {activeList === 'members' ? `${item.name} ${data.find(d => d.memberId === item.id)?.lastName || ''}` : item.name}
              </p>
              {activeList === 'members' && (
                <p className="text-sm text-gray-500">
                  ID: {item.id}
                </p>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {activeList === 'members' && (
            <div className="text-right">
              <p className="text-sm text-gray-600">
                {item.uniqueLocations} location{item.uniqueLocations !== 1 ? 's' : ''}
              </p>
              <p className="text-sm text-gray-600">
                {item.uniqueClasses} class type{item.uniqueClasses !== 1 ? 's' : ''}
              </p>
            </div>
          )}
          
          {activeList === 'locations' && (
            <div className="text-right">
              <p className="text-sm text-gray-600">
                {item.uniqueMembers} member{item.uniqueMembers !== 1 ? 's' : ''}
              </p>
              <p className="text-sm text-gray-600">
                {item.uniqueClasses} class type{item.uniqueClasses !== 1 ? 's' : ''}
              </p>
            </div>
          )}
          
          <Badge variant={isTop ? "destructive" : "secondary"}>
            {formatNumber(item.count)} cancellation{item.count !== 1 ? 's' : ''}
          </Badge>
        </div>
      </div>
    );
  };

  if (!data || data.length === 0) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-white via-slate-50/30 to-white border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800">
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-64">
            <p className="text-slate-600">No data available</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-white via-slate-50/30 to-white border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800">
              Bottom Performers
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-64">
            <p className="text-slate-600">No data available</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Category Selection */}
      <Card className="bg-gradient-to-br from-white via-slate-50/30 to-white border-0 shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-red-600" />
            Top & Bottom {getTitle()} by Late Cancellations
          </CardTitle>
          
          <div className="flex gap-2 flex-wrap">
            {[
              { key: 'members', label: 'Members', icon: Users },
              { key: 'locations', label: 'Locations', icon: MapPin },
              { key: 'classes', label: 'Classes', icon: Calendar },
              { key: 'trainers', label: 'Trainers', icon: User },
              { key: 'memberships', label: 'Memberships', icon: Package }
            ].map(({ key, label, icon: Icon }) => (
              <Button
                key={key}
                variant={activeList === key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveList(key as any)}
                className="flex items-center gap-1"
              >
                <Icon className="w-4 h-4" />
                {label}
              </Button>
            ))}
          </div>
        </CardHeader>
      </Card>

      {/* Side by Side Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers (Most Cancellations) */}
        <Card className="bg-gradient-to-br from-white via-red-50/30 to-white border-0 shadow-xl">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-red-500" />
              <CardTitle className="text-lg font-semibold text-gray-800">
                Most Late Cancellations
              </CardTitle>
              <Badge variant="destructive">
                {listData.top.length} items
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {listData.top.length > 0 ? (
                listData.top.map((item, index) => renderListItem(item, index, true))
              ) : (
                <p className="text-gray-500 text-center py-8">No data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Bottom Performers (Least Cancellations) */}
        <Card className="bg-gradient-to-br from-white via-green-50/30 to-white border-0 shadow-xl">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-green-500" />
              <CardTitle className="text-lg font-semibold text-gray-800">
                Least Late Cancellations
              </CardTitle>
              <Badge variant="secondary">
                {listData.bottom.length} items
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {listData.bottom.length > 0 ? (
                listData.bottom.map((item, index) => renderListItem(item, index, false))
              ) : (
                <p className="text-gray-500 text-center py-8">No data available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};