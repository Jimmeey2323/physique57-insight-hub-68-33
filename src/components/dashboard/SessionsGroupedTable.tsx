import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  ChevronDown, 
  ChevronRight, 
  Filter,
  SortAsc,
  SortDesc,
  Users,
  Target,
  DollarSign,
  Calendar,
  Info,
  Eye,
  TrendingUp
} from 'lucide-react';
import { SessionData } from '@/hooks/useSessionsData';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SessionsGroupedTableProps {
  data: SessionData[];
}

type ViewType = 
  | 'uniqueId' 
  | 'trainer' 
  | 'classType' 
  | 'dayOfWeek' 
  | 'timeSlot' 
  | 'location' 
  | 'date' 
  | 'capacity'
  | 'classTypeDay'
  | 'classTypeTime'
  | 'classTypeDayTime'
  | 'classTypeDayTimeLocation'
  | 'classTypeDayTimeLocationTrainer';

type SortField = 'name' | 'occurrences' | 'totalAttendees' | 'avgFillRate' | 'totalRevenue' | 'avgRevenue' | 'classAverage' | 'lateCancellations' | 'complimentaryCount' | 'nonPaidCount';
type SortDirection = 'asc' | 'desc';

export const SessionsGroupedTable: React.FC<SessionsGroupedTableProps> = ({ data }) => {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [currentView, setCurrentView] = useState<ViewType>('classTypeDayTimeLocation');
  const [sortField, setSortField] = useState<SortField>('classAverage');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  // Filter data to exclude sessions < 2 and unwanted class names
  const filteredData = useMemo(() => {
    return data.filter(session => {
      const className = session.cleanedClass || '';
      const excludeKeywords = ['Hosted', 'P57', 'X'];
      
      // Check if class name contains any excluded keywords
      const hasExcludedKeyword = excludeKeywords.some(keyword => 
        className.toLowerCase().includes(keyword.toLowerCase())
      );
      
      return !hasExcludedKeyword;
    });
  }, [data]);

  const groupedData = useMemo(() => {
    const groups: Record<string, SessionData[]> = {};
    
    filteredData.forEach(session => {
      let groupKey: string;
      
      switch (currentView) {
        case 'uniqueId':
          groupKey = session.uniqueId || 'Unknown';
          break;
        case 'trainer':
          groupKey = session.trainerName || 'Unknown';
          break;
        case 'classType':
          groupKey = session.cleanedClass || 'Unknown';
          break;
        case 'dayOfWeek':
          groupKey = session.dayOfWeek || 'Unknown';
          break;
        case 'timeSlot':
          groupKey = session.time || 'Unknown';
          break;
        case 'location':
          groupKey = session.location || 'Unknown';
          break;
        case 'date':
          groupKey = session.date || 'Unknown';
          break;
        case 'capacity':
          groupKey = `${session.capacity} seats`;
          break;
        case 'classTypeDay':
          groupKey = `${session.cleanedClass || 'Unknown'} | ${session.dayOfWeek || 'Unknown'}`;
          break;
        case 'classTypeTime':
          groupKey = `${session.cleanedClass || 'Unknown'} | ${session.time || 'Unknown'}`;
          break;
        case 'classTypeDayTime':
          groupKey = `${session.cleanedClass || 'Unknown'} | ${session.dayOfWeek || 'Unknown'} | ${session.time || 'Unknown'}`;
          break;
        case 'classTypeDayTimeLocation':
          groupKey = `${session.cleanedClass || 'Unknown'} | ${session.dayOfWeek || 'Unknown'} | ${session.time || 'Unknown'} | ${session.location || 'Unknown'}`;
          break;
        case 'classTypeDayTimeLocationTrainer':
          groupKey = `${session.cleanedClass || 'Unknown'} | ${session.dayOfWeek || 'Unknown'} | ${session.time || 'Unknown'} | ${session.location || 'Unknown'} | ${session.trainerName || 'Unknown'}`;
          break;
        default:
          groupKey = session.uniqueId || 'Unknown';
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(session);
    });

    return groups;
  }, [filteredData, currentView]);

  const processedGroups = useMemo(() => {
    return Object.entries(groupedData)
      .filter(([, sessions]) => sessions.length >= 2) // Filter out groups with less than 2 sessions
      .map(([groupName, sessions]) => {
        const totalAttendees = sessions.reduce((sum, s) => sum + s.checkedInCount, 0);
        const totalCapacity = sessions.reduce((sum, s) => sum + s.capacity, 0);
        const totalRevenue = sessions.reduce((sum, s) => sum + s.totalPaid, 0);
        const totalLateCancellations = sessions.reduce((sum, s) => sum + s.lateCancelledCount, 0);
        const totalComplimentary = sessions.reduce((sum, s) => sum + s.complimentaryCount, 0);
        const totalNonPaid = sessions.reduce((sum, s) => sum + s.nonPaidCount, 0);
        const totalBooked = sessions.reduce((sum, s) => sum + s.bookedCount, 0);
        const totalMemberships = sessions.reduce((sum, s) => sum + s.checkedInsWithMemberships, 0);
        const totalPackages = sessions.reduce((sum, s) => sum + s.checkedInsWithPackages, 0);
        const totalIntroOffers = sessions.reduce((sum, s) => sum + s.checkedInsWithIntroOffers, 0);
        const totalSingleClasses = sessions.reduce((sum, s) => sum + s.checkedInsWithSingleClasses, 0);
        
        const avgFillRate = totalCapacity > 0 ? (totalAttendees / totalCapacity) * 100 : 0;
        const avgRevenue = sessions.length > 0 ? totalRevenue / sessions.length : 0;
        const classAverage = sessions.length > 0 ? totalAttendees / sessions.length : 0;
        const avgLateCancellations = sessions.length > 0 ? totalLateCancellations / sessions.length : 0;

        return {
          name: groupName,
          sessions,
          occurrences: sessions.length,
          totalAttendees,
          totalCapacity,
          totalBooked,
          avgFillRate,
          totalRevenue,
          avgRevenue,
          classAverage,
          lateCancellations: totalLateCancellations,
          avgLateCancellations,
          complimentaryCount: totalComplimentary,
          nonPaidCount: totalNonPaid,
          totalMemberships,
          totalPackages,
          totalIntroOffers,
          totalSingleClasses
        };
      }).sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];
        
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sortDirection === 'asc' 
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }
        
        return sortDirection === 'asc' 
          ? (aVal as number) - (bVal as number)
          : (bVal as number) - (aVal as number);
      });
  }, [groupedData, sortField, sortDirection]);

  const toggleGroup = (groupName: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupName)) {
      newExpanded.delete(groupName);
    } else {
      newExpanded.add(groupName);
    }
    setExpandedGroups(newExpanded);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const showDrillDown = (groupName: string) => {
    setSelectedGroup(groupName);
  };

  const viewOptions = [
    { value: 'classTypeDayTimeLocation', label: 'Class + Day + Time + Location', icon: Target },
    { value: 'classTypeDayTimeLocationTrainer', label: 'Class + Day + Time + Location + Trainer', icon: Target },
    { value: 'classTypeDayTime', label: 'Class + Day + Time', icon: Target },
    { value: 'classTypeDay', label: 'Class + Day', icon: Target },
    { value: 'classTypeTime', label: 'Class + Time', icon: Target },
    { value: 'uniqueId', label: 'Individual Sessions', icon: Calendar },
    { value: 'trainer', label: 'By Trainer', icon: Users },
    { value: 'classType', label: 'By Class Type', icon: Target },
    { value: 'dayOfWeek', label: 'By Day of Week', icon: Calendar },
    { value: 'timeSlot', label: 'By Time Slot', icon: Calendar },
    { value: 'location', label: 'By Location', icon: Calendar },
    { value: 'date', label: 'By Date', icon: Calendar },
    { value: 'capacity', label: 'By Capacity', icon: Users }
  ];

  const getDisplayColumns = () => {
    const columns = [];
    
    if (currentView.includes('classType') || currentView === 'classType') {
      columns.push({ key: 'cleanedClass', label: 'Class Name' });
    }
    if (currentView.includes('Day') || currentView === 'dayOfWeek') {
      columns.push({ key: 'dayOfWeek', label: 'Day' });
    }
    if (currentView.includes('Time') || currentView === 'timeSlot') {
      columns.push({ key: 'time', label: 'Time' });
    }
    if (currentView.includes('Location') || currentView === 'location') {
      columns.push({ key: 'location', label: 'Location' });
    }
    if (currentView.includes('Trainer') || currentView === 'trainer') {
      columns.push({ key: 'trainerName', label: 'Trainer' });
    }
    
    return columns;
  };

  const parseGroupedRowData = (groupName: string) => {
    const parts = groupName.split(' | ');
    const columns = getDisplayColumns();
    const result: Record<string, string> = {};
    
    columns.forEach((col, index) => {
      result[col.key] = parts[index] || '';
    });
    
    return result;
  };

  return (
    <TooltipProvider>
      <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-white/20">
          <div className="flex items-center justify-between">
            <CardTitle className="text-gray-800 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Filter className="w-5 h-5 text-white" />
              </div>
              Session Analysis Table
              <Badge variant="secondary" className="ml-2">
                {processedGroups.length} groups • {filteredData.length} sessions
              </Badge>
            </CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 bg-white/80 hover:bg-white">
                  {viewOptions.find(opt => opt.value === currentView)?.label}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white shadow-lg border-0">
                {viewOptions.map(option => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => setCurrentView(option.value as ViewType)}
                    className="hover:bg-blue-50"
                  >
                    <option.icon className="w-4 h-4 mr-2" />
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="max-h-[800px] overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-gradient-to-r from-gray-50 to-blue-50 z-10">
                <TableRow>
                  <TableHead className="w-80 sticky left-0 bg-gradient-to-r from-gray-50 to-blue-50 z-20 border-r">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('name')}
                      className="h-6 p-0 font-semibold"
                    >
                      Group
                      {sortField === 'name' && (
                        sortDirection === 'asc' ? <SortAsc className="ml-1 h-3 w-3" /> : <SortDesc className="ml-1 h-3 w-3" />
                      )}
                    </Button>
                  </TableHead>
                  {getDisplayColumns().map(col => (
                    <TableHead key={col.key} className="text-center min-w-28 font-semibold">
                      {col.label}
                    </TableHead>
                  ))}
                  <TableHead className="text-center min-w-20">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort('occurrences')}
                          className="h-6 p-0 font-semibold"
                        >
                          Sessions
                          {sortField === 'occurrences' && (
                            sortDirection === 'asc' ? <SortAsc className="ml-1 h-3 w-3" /> : <SortDesc className="ml-1 h-3 w-3" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Number of sessions in this group</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableHead>
                  <TableHead className="text-center min-w-28">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort('totalAttendees')}
                          className="h-6 p-0 font-semibold"
                        >
                          Total Attendance
                          {sortField === 'totalAttendees' && (
                            sortDirection === 'asc' ? <SortAsc className="ml-1 h-3 w-3" /> : <SortDesc className="ml-1 h-3 w-3" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Total number of attendees across all sessions</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableHead>
                  <TableHead className="text-center min-w-24">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort('avgFillRate')}
                          className="h-6 p-0 font-semibold"
                        >
                          Fill Rate %
                          {sortField === 'avgFillRate' && (
                            sortDirection === 'asc' ? <SortAsc className="ml-1 h-3 w-3" /> : <SortDesc className="ml-1 h-3 w-3" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Average capacity utilization percentage</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableHead>
                  <TableHead className="text-center min-w-32">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort('totalRevenue')}
                          className="h-6 p-0 font-semibold"
                        >
                          Total Revenue
                          {sortField === 'totalRevenue' && (
                            sortDirection === 'asc' ? <SortAsc className="ml-1 h-3 w-3" /> : <SortDesc className="ml-1 h-3 w-3" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Total revenue generated by this group</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableHead>
                  <TableHead className="text-center min-w-32">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort('avgRevenue')}
                          className="h-6 p-0 font-semibold"
                        >
                          Avg Revenue
                          {sortField === 'avgRevenue' && (
                            sortDirection === 'asc' ? <SortAsc className="ml-1 h-3 w-3" /> : <SortDesc className="ml-1 h-3 w-3" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Average revenue per session</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableHead>
                  <TableHead className="text-center min-w-32">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort('lateCancellations')}
                          className="h-6 p-0 font-semibold"
                        >
                          Late Cancellations
                          {sortField === 'lateCancellations' && (
                            sortDirection === 'asc' ? <SortAsc className="ml-1 h-3 w-3" /> : <SortDesc className="ml-1 h-3 w-3" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Total late cancellations in this group</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableHead>
                  <TableHead className="text-center min-w-32">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort('complimentaryCount')}
                          className="h-6 p-0 font-semibold"
                        >
                          Complimentary
                          {sortField === 'complimentaryCount' && (
                            sortDirection === 'asc' ? <SortAsc className="ml-1 h-3 w-3" /> : <SortDesc className="ml-1 h-3 w-3" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Total complimentary entries</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableHead>
                  <TableHead className="text-center min-w-32">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort('nonPaidCount')}
                          className="h-6 p-0 font-semibold"
                        >
                          Non-Paid
                          {sortField === 'nonPaidCount' && (
                            sortDirection === 'asc' ? <SortAsc className="ml-1 h-3 w-3" /> : <SortDesc className="ml-1 h-3 w-3" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Total non-paid entries</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableHead>
                  <TableHead className="text-center min-w-24">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 p-0 font-semibold"
                    >
                      Actions
                    </Button>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {processedGroups.map((group) => {
                  const groupRowData = parseGroupedRowData(group.name);
                  const displayColumns = getDisplayColumns();
                  
                  return (
                    <React.Fragment key={group.name}>
                      <TableRow 
                        className="cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 border-b-2 border-gray-200 transition-all duration-200"
                        onClick={() => toggleGroup(group.name)}
                      >
                        <TableCell className="sticky left-0 bg-white z-10 border-r h-12 py-2">
                          <div className="flex items-center gap-3">
                            {expandedGroups.has(group.name) ? 
                              <ChevronDown className="h-4 w-4 text-gray-500" /> : 
                              <ChevronRight className="h-4 w-4 text-gray-500" />
                            }
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                                <Target className="w-4 h-4 text-white" />
                              </div>
                              <span className="font-semibold text-sm truncate max-w-[200px]">{group.name}</span>
                            </div>
                          </div>
                        </TableCell>
                        {displayColumns.map(col => (
                          <TableCell key={col.key} className="text-center h-12 py-2 text-sm font-medium">
                            <Badge variant="outline" className="bg-blue-50">
                              {groupRowData[col.key]}
                            </Badge>
                          </TableCell>
                        ))}
                        <TableCell className="text-center h-12 py-2">
                          <Badge variant="secondary" className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700">
                            {group.occurrences}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center h-12 py-2 text-sm font-medium">
                          {formatNumber(group.totalAttendees)}
                        </TableCell>
                        <TableCell className="text-center h-12 py-2">
                          <Badge className={
                            group.avgFillRate >= 80 ? 'bg-green-100 text-green-800' :
                            group.avgFillRate >= 60 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }>
                            {group.avgFillRate.toFixed(1)}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center h-12 py-2 text-sm font-medium text-green-700">
                          {formatCurrency(group.totalRevenue)}
                        </TableCell>
                        <TableCell className="text-center h-12 py-2 text-sm font-medium text-blue-700">
                          {formatCurrency(group.avgRevenue)}
                        </TableCell>
                        <TableCell className="text-center h-12 py-2 text-sm font-medium">
                          <Badge variant={group.lateCancellations > 10 ? 'destructive' : 'secondary'}>
                            {group.lateCancellations}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center h-12 py-2 text-sm font-medium">
                          <Badge variant="outline" className="bg-purple-50 text-purple-700">
                            {group.complimentaryCount}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center h-12 py-2 text-sm font-medium">
                          <Badge variant="outline" className="bg-orange-50 text-orange-700">
                            {group.nonPaidCount}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center h-12 py-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              showDrillDown(group.name);
                            }}
                            className="h-8 px-3 text-xs bg-gray-100 hover:bg-gray-200"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            Details
                          </Button>
                        </TableCell>
                      </TableRow>
                      
                      {expandedGroups.has(group.name) && (
                        <TableRow>
                          <TableCell colSpan={getDisplayColumns().length + 9} className="bg-gradient-to-r from-blue-50 to-purple-50 p-6">
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-white p-4 rounded-lg shadow-sm">
                                  <div className="text-sm text-gray-600">Average Attendance</div>
                                  <div className="text-xl font-bold text-blue-600">{group.classAverage.toFixed(1)}</div>
                                </div>
                                <div className="bg-white p-4 rounded-lg shadow-sm">
                                  <div className="text-sm text-gray-600">Total Capacity</div>
                                  <div className="text-xl font-bold text-gray-800">{formatNumber(group.totalCapacity)}</div>
                                </div>
                                <div className="bg-white p-4 rounded-lg shadow-sm">
                                  <div className="text-sm text-gray-600">Memberships Used</div>
                                  <div className="text-xl font-bold text-green-600">{formatNumber(group.totalMemberships)}</div>
                                </div>
                                <div className="bg-white p-4 rounded-lg shadow-sm">
                                  <div className="text-sm text-gray-600">Packages Used</div>
                                  <div className="text-xl font-bold text-purple-600">{formatNumber(group.totalPackages)}</div>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};