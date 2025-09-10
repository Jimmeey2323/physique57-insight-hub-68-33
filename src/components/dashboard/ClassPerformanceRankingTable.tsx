import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trophy, BarChart3, Eye, Calendar, Clock, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { SessionData } from '@/hooks/useSessionsData';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ClassPerformanceRankingTableProps {
  data: SessionData[];
}

interface GroupedClassData {
  uniqueId: string;
  className: string;
  trainerName: string;
  dayOfWeek: string;
  time: string;
  location: string;
  sessions: SessionData[];
  avgCheckIns: number;
  fillPercentage: number;
  totalRevenue: number;
  totalCheckIns: number;
  totalCapacity: number;
  totalLateCancellations: number;
  sessionCount: number;
}

export const ClassPerformanceRankingTable: React.FC<ClassPerformanceRankingTableProps> = ({ data }) => {
  const [selectedClass, setSelectedClass] = useState<GroupedClassData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">No class performance data available</p>
        </CardContent>
      </Card>
    );
  }

  // Group sessions by UniqueID1 (column 17 in the sheet)
  const classGroups = data.reduce((acc, session) => {
    const uniqueId = session.uniqueId || 'unknown';
    if (!acc[uniqueId]) {
      acc[uniqueId] = [];
    }
    acc[uniqueId].push(session);
    return acc;
  }, {} as Record<string, SessionData[]>);

  // Calculate performance metrics for each unique class
  const classPerformance: GroupedClassData[] = Object.entries(classGroups).map(([uniqueId, sessions]) => {
    const firstSession = sessions[0];
    const totalCheckIns = sessions.reduce((sum, s) => sum + s.checkedInCount, 0);
    const totalRevenue = sessions.reduce((sum, s) => sum + (s.revenue || s.totalPaid || 0), 0);
    const totalCapacity = sessions.reduce((sum, s) => sum + s.capacity, 0);
    const totalLateCancellations = sessions.reduce((sum, s) => sum + (s.lateCancelledCount || 0), 0);
    const avgCheckIns = totalCheckIns / sessions.length;
    const fillPercentage = totalCapacity > 0 ? (totalCheckIns / totalCapacity) * 100 : 0;

    return {
      uniqueId,
      className: firstSession.cleanedClass || firstSession.classType || 'Unknown Class',
      trainerName: firstSession.trainerName || `${firstSession.trainerFirstName} ${firstSession.trainerLastName}`.trim(),
      dayOfWeek: firstSession.dayOfWeek,
      time: firstSession.time,
      location: firstSession.location,
      sessions,
      sessionCount: sessions.length,
      avgCheckIns,
      fillPercentage,
      totalRevenue,
      totalCheckIns,
      totalCapacity,
      totalLateCancellations
    };
  });

  // Sort by average check-ins (attendance priority)
  const sortedPerformance = classPerformance.sort((a, b) => b.avgCheckIns - a.avgCheckIns);

  // Pagination logic
  const totalPages = Math.ceil(sortedPerformance.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedPerformance.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedPerformance, currentPage, itemsPerPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Class Performance Rankings (Grouped by UniqueID1)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Class Name</TableHead>
                  <TableHead>Trainer</TableHead>
                  <TableHead>Day</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Sessions</TableHead>
                  <TableHead>Avg Check-ins</TableHead>
                  <TableHead>Fill Rate</TableHead>
                  <TableHead>Total Attendance</TableHead>
                  <TableHead>Late Cancelled</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((classData, index) => {
                  const actualRank = (currentPage - 1) * itemsPerPage + index + 1;
                  return (
                  <TableRow key={classData.uniqueId} className="hover:bg-muted/50">
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        {actualRank <= 3 && (
                          <Trophy className={`w-4 h-4 ${actualRank === 1 ? 'text-yellow-500' : actualRank === 2 ? 'text-gray-400' : 'text-amber-600'}`} />
                        )}
                        <span className="font-bold">{actualRank}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{classData.className}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">{classData.trainerName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">{classData.dayOfWeek}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">{classData.time}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {classData.location}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">{classData.sessionCount}</Badge>
                    </TableCell>
                    <TableCell className="text-center font-semibold">
                      {classData.avgCheckIns.toFixed(1)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={classData.fillPercentage >= 80 ? 'default' : classData.fillPercentage >= 60 ? 'secondary' : 'destructive'}>
                        {classData.fillPercentage.toFixed(1)}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center font-semibold">
                      {classData.totalCheckIns.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={classData.totalLateCancellations > 10 ? 'destructive' : classData.totalLateCancellations > 5 ? 'secondary' : 'default'}>
                        {classData.totalLateCancellations}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      ₹{classData.totalRevenue.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedClass(classData)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>
                              Class Details: {classData.className} - {classData.trainerName}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                              <div><strong>Day:</strong> {classData.dayOfWeek}</div>
                              <div><strong>Time:</strong> {classData.time}</div>
                              <div><strong>Location:</strong> {classData.location}</div>
                              <div><strong>Unique ID:</strong> {classData.uniqueId}</div>
                            </div>
                            <div className="overflow-auto border rounded-lg">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Session Name</TableHead>
                                    <TableHead>Capacity</TableHead>
                                    <TableHead>Checked In</TableHead>
                                    <TableHead>Booked</TableHead>
                                    <TableHead>Late Cancelled</TableHead>
                                    <TableHead>Revenue</TableHead>
                                    <TableHead>Fill %</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {classData.sessions.map((session, idx) => (
                                    <TableRow key={idx}>
                                      <TableCell>{session.date}</TableCell>
                                      <TableCell>{session.sessionName}</TableCell>
                                      <TableCell>{session.capacity}</TableCell>
                                      <TableCell>{session.checkedInCount}</TableCell>
                                      <TableCell>{session.bookedCount}</TableCell>
                                      <TableCell>{session.lateCancelledCount}</TableCell>
                                      <TableCell>₹{(session.revenue || session.totalPaid || 0).toLocaleString()}</TableCell>
                                      <TableCell>
                                        <Badge variant={session.fillPercentage && session.fillPercentage >= 80 ? 'default' : 'secondary'}>
                                          {session.fillPercentage?.toFixed(1) || '0.0'}%
                                        </Badge>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, sortedPerformance.length)} of {sortedPerformance.length} results
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
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
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
          
          <Card className="mt-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Performance Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-line text-sm text-muted-foreground">
                  • Classes grouped by UniqueID1 and ranked by average check-ins{'\n'}
                  • Each row represents a unique class schedule (trainer + day + time){'\n'}
                  • Click "Details" to view individual session data for each class{'\n'}
                  • Fill percentages and revenue show performance across all sessions
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};