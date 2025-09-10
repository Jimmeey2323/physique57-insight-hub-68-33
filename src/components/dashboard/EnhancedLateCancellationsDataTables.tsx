import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LateCancellationsData } from '@/types/dashboard';
import { formatNumber } from '@/utils/formatters';
import { AlertTriangle, Users, Calendar, Package, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';

interface EnhancedLateCancellationsDataTablesProps {
  data: LateCancellationsData[];
  onDrillDown?: (data: any) => void;
}

const ITEMS_PER_PAGE = 100;

export const EnhancedLateCancellationsDataTables: React.FC<EnhancedLateCancellationsDataTablesProps> = ({ data, onDrillDown }) => {
  const [activeTab, setActiveTab] = useState('multiple-day');
  const [currentPage, setCurrentPage] = useState(1);

  // Members cancelling more than 1 class per day
  const multipleCancellationsPerDay = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    const memberDayGroups = data.reduce((acc, item) => {
      if (!item.dateIST || !item.memberId) return acc;
      
      const key = `${item.memberId}-${item.dateIST}`;
      
      if (!acc[key]) {
        acc[key] = {
          memberId: item.memberId,
          memberName: `${item.firstName || ''} ${item.lastName || ''}`.trim(),
          email: item.email,
          date: item.dateIST,
          cancellations: [],
          count: 0,
          locations: new Set(),
          classes: new Set(),
          trainers: new Set()
        };
      }
      
      acc[key].cancellations.push({
        sessionName: item.sessionName,
        time: item.time,
        location: item.location,
        teacherName: item.teacherName,
        cleanedClass: item.cleanedClass,
        cleanedProduct: item.cleanedProduct
      });
      acc[key].count += 1;
      acc[key].locations.add(item.location);
      acc[key].classes.add(item.cleanedClass);
      acc[key].trainers.add(item.teacherName);
      
      return acc;
    }, {} as Record<string, any>);
    
    return Object.values(memberDayGroups)
      .filter((group: any) => group.count > 1)
      .map((group: any) => ({
        ...group,
        uniqueLocations: group.locations.size,
        uniqueClasses: group.classes.size,
        uniqueTrainers: group.trainers.size
      }))
      .sort((a: any, b: any) => b.count - a.count);
  }, [data]);

  // Enhanced checkins per day calculation
  const multipleCheckinsPerDay = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // Group by member and date to find multiple cancellations
    const memberDayStats = data.reduce((acc, item) => {
      if (!item.dateIST || !item.memberId) return acc;
      
      const key = `${item.memberId}-${item.dateIST}`;
      
      if (!acc[key]) {
        acc[key] = {
          memberId: item.memberId,
          memberName: `${item.firstName || ''} ${item.lastName || ''}`.trim(),
          email: item.email,
          date: item.dateIST,
          totalSessions: 0,
          cancellations: 0,
          sessionDetails: []
        };
      }
      
      acc[key].cancellations += 1;
      acc[key].totalSessions += 1; // Assuming cancellations = booked sessions
      acc[key].sessionDetails.push({
        sessionName: item.sessionName,
        time: item.time,
        location: item.location,
        teacherName: item.teacherName,
        status: 'cancelled'
      });
      
      return acc;
    }, {} as Record<string, any>);
    
    return Object.values(memberDayStats)
      .filter((member: any) => member.totalSessions > 1)
      .sort((a: any, b: any) => b.totalSessions - a.totalSessions);
  }, [data]);

  // Cancellations by class type with enhanced analytics
  const cancellationsByClass = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    const classGroups = data.reduce((acc, item) => {
      const classType = item.cleanedClass || 'Unknown Class';
      
      if (!acc[classType]) {
        acc[classType] = {
          className: classType,
          category: item.cleanedCategory || 'Unknown',
          count: 0,
          members: new Set(),
          locations: new Set(),
          trainers: new Set(),
          totalDuration: 0,
          totalRevenue: 0,
          peakTimes: {},
          daysOfWeek: {}
        };
      }
      
      acc[classType].count += 1;
      acc[classType].members.add(item.memberId);
      acc[classType].locations.add(item.location);
      acc[classType].trainers.add(item.teacherName);
      acc[classType].totalDuration += item.duration || 0;
      acc[classType].totalRevenue += item.paidAmount || 0;
      
      // Track peak times
      if (item.time) {
        const hour = parseInt(item.time.split(':')[0]);
        const timeSlot = hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : 'Evening';
        acc[classType].peakTimes[timeSlot] = (acc[classType].peakTimes[timeSlot] || 0) + 1;
      }
      
      // Track days of week
      if (item.dayOfWeek) {
        acc[classType].daysOfWeek[item.dayOfWeek] = (acc[classType].daysOfWeek[item.dayOfWeek] || 0) + 1;
      }
      
      return acc;
    }, {} as Record<string, any>);
    
    return Object.values(classGroups)
      .map((group: any) => {
        const peakTime = Object.entries(group.peakTimes).reduce((a, b) => 
          group.peakTimes[a[0]] > group.peakTimes[b[0]] ? a : b, ['N/A', 0]
        )[0];
        
        const peakDay = Object.entries(group.daysOfWeek).reduce((a, b) => 
          group.daysOfWeek[a[0]] > group.daysOfWeek[b[0]] ? a : b, ['N/A', 0]
        )[0];
        
        return {
          ...group,
          uniqueMembers: group.members.size,
          uniqueLocations: group.locations.size,
          uniqueTrainers: group.trainers.size,
          avgDuration: group.count > 0 ? Math.round(group.totalDuration / group.count) : 0,
          avgRevenue: group.count > 0 ? group.totalRevenue / group.count : 0,
          peakTime,
          peakDay
        };
      })
      .sort((a: any, b: any) => b.count - a.count);
  }, [data]);

  // Enhanced cancellations by membership type
  const cancellationsByMembership = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    const membershipGroups = data.reduce((acc, item) => {
      const membershipType = item.cleanedProduct || 'Unknown Membership';
      
      if (!acc[membershipType]) {
        acc[membershipType] = {
          membershipType,
          category: item.cleanedCategory || 'Unknown',
          count: 0,
          members: new Set(),
          revenue: 0,
          locations: new Set(),
          classes: new Set(),
          avgCancellationsPerMember: 0
        };
      }
      
      acc[membershipType].count += 1;
      acc[membershipType].members.add(item.memberId);
      acc[membershipType].revenue += item.paidAmount || 0;
      acc[membershipType].locations.add(item.location);
      acc[membershipType].classes.add(item.cleanedClass);
      
      return acc;
    }, {} as Record<string, any>);
    
    return Object.values(membershipGroups)
      .map((group: any) => ({
        ...group,
        uniqueMembers: group.members.size,
        uniqueLocations: group.locations.size,
        uniqueClasses: group.classes.size,
        avgRevenuePerCancellation: group.count > 0 ? group.revenue / group.count : 0,
        avgCancellationsPerMember: group.uniqueMembers > 0 ? group.count / group.uniqueMembers : 0
      }))
      .sort((a: any, b: any) => b.count - a.count);
  }, [data]);

  // Pagination logic
  const getPaginatedData = (tableData: any[]) => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return tableData.slice(startIndex, endIndex);
  };

  const getTotalPages = (tableData: any[]) => {
    return Math.ceil(tableData.length / ITEMS_PER_PAGE);
  };

  const getCurrentData = () => {
    switch (activeTab) {
      case 'multiple-day':
        return multipleCancellationsPerDay;
      case 'multiple-checkins':
        return multipleCheckinsPerDay;
      case 'by-class':
        return cancellationsByClass;
      case 'by-membership':
        return cancellationsByMembership;
      default:
        return [];
    }
  };

  const currentData = getCurrentData();
  const paginatedData = getPaginatedData(currentData);
  const totalPages = getTotalPages(currentData);

  // Reset page when tab changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const PaginationControls = () => (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <span>
          Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, currentData.length)} of {currentData.length} results
        </span>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
          className="gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>
        
        <div className="flex items-center gap-1">
          {[...Array(Math.min(5, totalPages))].map((_, i) => {
            const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
            if (pageNum > totalPages) return null;
            
            return (
              <Button
                key={pageNum}
                variant={pageNum === currentPage ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentPage(pageNum)}
                className="w-8 h-8 p-0"
              >
                {pageNum}
              </Button>
            );
          })}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
          className="gap-1"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  const renderMultipleCancellationsTable = (tableData: any[], title: string, tabType: string) => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 justify-between px-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-500" />
          <h3 className="text-lg font-semibold">{title}</h3>
          <Badge variant="outline" className="bg-orange-50 text-orange-700">
            {currentData.length} total members
          </Badge>
        </div>
      </div>
      
      {Array.isArray(tableData) && tableData.length > 0 ? (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Count</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Sessions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableData.map((member, index) => (
                <TableRow 
                  key={index} 
                  className="h-[35px] max-h-[35px] hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => {
                    if (onDrillDown) {
                      onDrillDown({
                        type: 'member',
                        title: `Member: ${member.memberName}`,
                        data: member,
                        rawData: member.cancellations || member.sessionDetails
                      });
                    }
                  }}
                >
                  <TableCell className="font-medium h-[35px] py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {member.memberName ? member.memberName.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <p className="font-semibold text-sm truncate max-w-[150px]">{member.memberName}</p>
                        <p className="text-xs text-gray-500">ID: {member.memberId}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="h-[35px] py-2">
                    <span className="text-sm truncate max-w-[200px] block">{member.email}</span>
                  </TableCell>
                  <TableCell className="h-[35px] py-2">
                    <Badge variant="outline" className="text-xs">
                      {new Date(member.date).toLocaleDateString()}
                    </Badge>
                  </TableCell>
                  <TableCell className="h-[35px] py-2">
                    <Badge variant="destructive" className="text-xs">
                      {member.count} {tabType === 'multiple-day' ? 'cancellations' : 'sessions'}
                    </Badge>
                  </TableCell>
                  <TableCell className="h-[35px] py-2">
                    <div className="flex gap-1">
                      {member.uniqueLocations && (
                        <Badge variant="outline" className="text-xs">
                          {member.uniqueLocations} loc
                        </Badge>
                      )}
                      {member.uniqueClasses && (
                        <Badge variant="outline" className="text-xs">
                          {member.uniqueClasses} classes
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="h-[35px] py-2">
                    <div className="text-xs text-gray-600 max-w-[200px]">
                      {Array.isArray(tabType === 'multiple-day' ? member.cancellations : member.sessionDetails) ? 
                        `${(tabType === 'multiple-day' ? member.cancellations : member.sessionDetails).length} sessions` :
                        'No data'
                      }
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <PaginationControls />
        </>
      ) : (
        <p className="text-gray-500 text-center py-8">No data available</p>
      )}
    </div>
  );

  const renderClassTypeTable = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 justify-between px-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold">Cancellations by Class Type</h3>
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            {currentData.length} class types
          </Badge>
        </div>
      </div>
      
      {paginatedData.length > 0 ? (
        <>
          <Table>
            <TableHeader>
              <TableRow className="h-[35px]">
                <TableHead>Class Type</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Cancellations</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Locations</TableHead>
                <TableHead>Peak Time</TableHead>
                <TableHead>Peak Day</TableHead>
                <TableHead>Avg Duration</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
            {paginatedData.map((classType, index) => (
              <TableRow 
                key={index} 
                className="h-[35px] max-h-[35px] hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => {
                  if (onDrillDown) {
                    onDrillDown({
                      type: 'class',
                      title: `Class Type: ${classType.className}`,
                      data: classType,
                      rawData: data.filter(item => item.cleanedClass === classType.className)
                    });
                  }
                }}
              >
                <TableCell className="font-medium h-[35px] py-2">
                  <span className="truncate max-w-[150px] block">{classType.className}</span>
                </TableCell>
                  <TableCell className="h-[35px] py-2">
                    <Badge variant="secondary">{classType.category}</Badge>
                  </TableCell>
                  <TableCell className="h-[35px] py-2">
                    <Badge variant="destructive">
                      {formatNumber(classType.count)}
                    </Badge>
                  </TableCell>
                  <TableCell className="h-[35px] py-2">{formatNumber(classType.uniqueMembers)}</TableCell>
                  <TableCell className="h-[35px] py-2">{formatNumber(classType.uniqueLocations)}</TableCell>
                  <TableCell className="h-[35px] py-2">
                    <Badge variant="outline">{classType.peakTime}</Badge>
                  </TableCell>
                  <TableCell className="h-[35px] py-2">
                    <Badge variant="outline">{classType.peakDay}</Badge>
                  </TableCell>
                  <TableCell className="h-[35px] py-2">{classType.avgDuration} min</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <PaginationControls />
        </>
      ) : (
        <p className="text-gray-500 text-center py-8">No class type data available</p>
      )}
    </div>
  );

  const renderMembershipTypeTable = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 justify-between px-4">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-purple-500" />
          <h3 className="text-lg font-semibold">Cancellations by Membership Type</h3>
          <Badge variant="outline" className="bg-purple-50 text-purple-700">
            {currentData.length} membership types
          </Badge>
        </div>
      </div>
      
      {paginatedData.length > 0 ? (
        <>
          <Table>
            <TableHeader>
              <TableRow className="h-[35px]">
                <TableHead>Membership Type</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Cancellations</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Locations</TableHead>
                <TableHead>Avg per Member</TableHead>
                <TableHead>Revenue Impact</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((membership, index) => (
                <TableRow 
                  key={index} 
                  className="h-[35px] max-h-[35px] hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => {
                    // Drill-down functionality - show membership details
                    console.log('Membership type clicked:', membership);
                  }}
                >
                  <TableCell className="font-medium h-[35px] py-2">
                    <span className="truncate max-w-[200px] block">{membership.membershipType}</span>
                  </TableCell>
                  <TableCell className="h-[35px] py-2">
                    <Badge variant="secondary">{membership.category}</Badge>
                  </TableCell>
                  <TableCell className="h-[35px] py-2">
                    <Badge variant="destructive">
                      {formatNumber(membership.count)}
                    </Badge>
                  </TableCell>
                  <TableCell className="h-[35px] py-2">{formatNumber(membership.uniqueMembers)}</TableCell>
                  <TableCell className="h-[35px] py-2">{formatNumber(membership.uniqueLocations)}</TableCell>
                  <TableCell className="h-[35px] py-2">
                    <Badge variant="outline">
                      {(membership.avgCancellationsPerMember || 0).toFixed(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="h-[35px] py-2">
                    ₹{(membership.revenue || 0).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <PaginationControls />
        </>
      ) : (
        <p className="text-gray-500 text-center py-8">No membership type data available</p>
      )}
    </div>
  );

  // Additional tables for comprehensive analysis
  const renderTrainerAnalysisTable = () => {
    const trainerData = useMemo(() => {
      if (!data || data.length === 0) return [];
      
      const trainerGroups = data.reduce((acc, item) => {
        const trainer = item.teacherName || 'Unknown Trainer';
        
        if (!acc[trainer]) {
          acc[trainer] = {
            trainerName: trainer,
            count: 0,
            members: new Set(),
            locations: new Set(),
            classes: new Set(),
            revenue: 0,
            avgCancellationsPerSession: 0,
            totalSessions: 0
          };
        }
        
        acc[trainer].count += 1;
        acc[trainer].members.add(item.memberId);
        acc[trainer].locations.add(item.location);
        acc[trainer].classes.add(item.cleanedClass);
        acc[trainer].revenue += item.paidAmount || 0;
        acc[trainer].totalSessions += 1; // Approximate
        
        return acc;
      }, {} as Record<string, any>);
      
      return Object.values(trainerGroups)
        .map((group: any) => ({
          ...group,
          uniqueMembers: group.members.size,
          uniqueLocations: group.locations.size,
          uniqueClasses: group.classes.size,
          avgCancellationsPerSession: group.totalSessions > 0 ? group.count / group.totalSessions : 0
        }))
        .sort((a: any, b: any) => b.count - a.count);
    }, [data]);

    const paginatedTrainerData = getPaginatedData(trainerData);

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 justify-between px-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-green-500" />
            <h3 className="text-lg font-semibold">Cancellations by Trainer</h3>
            <Badge variant="outline" className="bg-green-50 text-green-700">
              {trainerData.length} trainers
            </Badge>
          </div>
        </div>
        
        {paginatedTrainerData.length > 0 ? (
          <>
            <Table>
              <TableHeader>
                <TableRow className="h-[35px]">
                  <TableHead>Trainer Name</TableHead>
                  <TableHead>Cancellations</TableHead>
                  <TableHead>Affected Members</TableHead>
                  <TableHead>Classes</TableHead>
                  <TableHead>Locations</TableHead>
                  <TableHead>Revenue Impact</TableHead>
                  <TableHead>Avg per Session</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTrainerData.map((trainer, index) => (
                  <TableRow key={index} className="h-[35px] max-h-[35px]">
                    <TableCell className="font-medium h-[35px] py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {trainer.trainerName.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                        </div>
                        <span className="truncate max-w-[120px]">{trainer.trainerName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="h-[35px] py-2">
                      <Badge variant="destructive">
                        {formatNumber(trainer.count)}
                      </Badge>
                    </TableCell>
                    <TableCell className="h-[35px] py-2">{formatNumber(trainer.uniqueMembers)}</TableCell>
                    <TableCell className="h-[35px] py-2">{formatNumber(trainer.uniqueClasses)}</TableCell>
                    <TableCell className="h-[35px] py-2">{formatNumber(trainer.uniqueLocations)}</TableCell>
                    <TableCell className="h-[35px] py-2">₹{trainer.revenue.toFixed(2)}</TableCell>
                    <TableCell className="h-[35px] py-2">
                      <Badge variant="outline">
                        {trainer.avgCancellationsPerSession.toFixed(2)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <PaginationControls />
          </>
        ) : (
          <p className="text-gray-500 text-center py-8">No trainer data available</p>
        )}
      </div>
    );
  };

  const renderLocationAnalysisTable = () => {
    const locationData = useMemo(() => {
      if (!data || data.length === 0) return [];
      
      const locationGroups = data.reduce((acc, item) => {
        const location = item.location || 'Unknown Location';
        
        if (!acc[location]) {
          acc[location] = {
            locationName: location,
            count: 0,
            members: new Set(),
            trainers: new Set(),
            classes: new Set(),
            revenue: 0,
            peakDays: {},
            peakTimes: {}
          };
        }
        
        acc[location].count += 1;
        acc[location].members.add(item.memberId);
        acc[location].trainers.add(item.teacherName);
        acc[location].classes.add(item.cleanedClass);
        acc[location].revenue += item.paidAmount || 0;
        
        // Track peak days and times
        if (item.dayOfWeek) {
          acc[location].peakDays[item.dayOfWeek] = (acc[location].peakDays[item.dayOfWeek] || 0) + 1;
        }
        if (item.time) {
          const hour = parseInt(item.time.split(':')[0]);
          const timeSlot = hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : 'Evening';
          acc[location].peakTimes[timeSlot] = (acc[location].peakTimes[timeSlot] || 0) + 1;
        }
        
        return acc;
      }, {} as Record<string, any>);
      
      return Object.values(locationGroups)
        .map((group: any) => {
          const peakDay = Object.entries(group.peakDays).reduce((a, b) => 
            group.peakDays[a[0]] > group.peakDays[b[0]] ? a : b, ['N/A', 0]
          )[0];
          
          const peakTime = Object.entries(group.peakTimes).reduce((a, b) => 
            group.peakTimes[a[0]] > group.peakTimes[b[0]] ? a : b, ['N/A', 0]
          )[0];
          
          return {
            ...group,
            uniqueMembers: group.members.size,
            uniqueTrainers: group.trainers.size,
            uniqueClasses: group.classes.size,
            peakDay,
            peakTime,
            avgRevenuePerCancellation: group.count > 0 ? group.revenue / group.count : 0
          };
        })
        .sort((a: any, b: any) => b.count - a.count);
    }, [data]);

    const paginatedLocationData = getPaginatedData(locationData);

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 justify-between px-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-indigo-500" />
            <h3 className="text-lg font-semibold">Cancellations by Location</h3>
            <Badge variant="outline" className="bg-indigo-50 text-indigo-700">
              {locationData.length} locations
            </Badge>
          </div>
        </div>
        
        {paginatedLocationData.length > 0 ? (
          <>
            <Table>
              <TableHeader>
                <TableRow className="h-[35px]">
                  <TableHead>Location</TableHead>
                  <TableHead>Cancellations</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Trainers</TableHead>
                  <TableHead>Classes</TableHead>
                  <TableHead>Peak Day</TableHead>
                  <TableHead>Peak Time</TableHead>
                  <TableHead>Revenue Impact</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedLocationData.map((location, index) => (
                  <TableRow key={index} className="h-[35px] max-h-[35px]">
                    <TableCell className="font-medium h-[35px] py-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-indigo-600" />
                        <span className="truncate max-w-[150px]">{location.locationName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="h-[35px] py-2">
                      <Badge variant="destructive">
                        {formatNumber(location.count)}
                      </Badge>
                    </TableCell>
                    <TableCell className="h-[35px] py-2">{formatNumber(location.uniqueMembers)}</TableCell>
                    <TableCell className="h-[35px] py-2">{formatNumber(location.uniqueTrainers)}</TableCell>
                    <TableCell className="h-[35px] py-2">{formatNumber(location.uniqueClasses)}</TableCell>
                    <TableCell className="h-[35px] py-2">
                      <Badge variant="outline">{location.peakDay}</Badge>
                    </TableCell>
                    <TableCell className="h-[35px] py-2">
                      <Badge variant="outline">{location.peakTime}</Badge>
                    </TableCell>
                    <TableCell className="h-[35px] py-2">₹{location.revenue.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <PaginationControls />
          </>
        ) : (
          <p className="text-gray-500 text-center py-8">No location data available</p>
        )}
      </div>
    );
  };

  return (
    <Card className="bg-gradient-to-br from-white via-slate-50/30 to-white border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Users className="w-5 h-5 text-red-600" />
          Enhanced Late Cancellations Analysis
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            Multiple analysis views with 35px row height
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="px-6">
            <TabsList className="grid grid-cols-6 w-full mb-6">
              <TabsTrigger value="multiple-day" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Multiple/Day
              </TabsTrigger>
              <TabsTrigger value="multiple-checkins" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Check-ins/Day
              </TabsTrigger>
              <TabsTrigger value="by-class" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                By Class
              </TabsTrigger>
              <TabsTrigger value="by-membership" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                By Membership
              </TabsTrigger>
              <TabsTrigger value="by-trainer" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                By Trainer
              </TabsTrigger>
              <TabsTrigger value="by-location" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                By Location
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="multiple-day" className="mt-0">
            {renderMultipleCancellationsTable(paginatedData, "Members with Multiple Late Cancellations per Day", "multiple-day")}
          </TabsContent>

          <TabsContent value="multiple-checkins" className="mt-0">
            {renderMultipleCancellationsTable(paginatedData, "Members with Multiple Check-ins per Day", "multiple-checkins")}
          </TabsContent>

          <TabsContent value="by-class" className="mt-0">
            {renderClassTypeTable()}
          </TabsContent>

          <TabsContent value="by-membership" className="mt-0">
            {renderMembershipTypeTable()}
          </TabsContent>

          <TabsContent value="by-trainer" className="mt-0">
            {renderTrainerAnalysisTable()}
          </TabsContent>

          <TabsContent value="by-location" className="mt-0">
            {renderLocationAnalysisTable()}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};