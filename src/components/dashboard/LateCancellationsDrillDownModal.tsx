import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LateCancellationsData } from '@/types/dashboard';
import { formatNumber } from '@/utils/formatters';
import { X, Users, Calendar, MapPin, Clock, Package } from 'lucide-react';

interface LateCancellationsDrillDownModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
}

export const LateCancellationsDrillDownModal: React.FC<LateCancellationsDrillDownModalProps> = ({
  isOpen,
  onClose,
  data
}) => {
  if (!data) return null;

  const renderMemberDetails = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            Member Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Member Name</p>
            <p className="font-semibold">{data.data.memberName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Email</p>
            <p className="font-semibold">{data.data.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Member ID</p>
            <p className="font-semibold">{data.data.memberId}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Cancellations</p>
            <Badge variant="destructive">{data.data.count}</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Session Details</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Session</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Trainer</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data.rawData || []).map((session: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell>{session.sessionName}</TableCell>
                    <TableCell>{session.time}</TableCell>
                    <TableCell>{session.location}</TableCell>
                    <TableCell>{session.teacherName}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );

  const renderClassDetails = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-green-500" />
            Class Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Class Type</p>
            <p className="font-semibold">{data.data.className}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Category</p>
            <Badge variant="secondary">{data.data.category}</Badge>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Cancellations</p>
            <Badge variant="destructive">{formatNumber(data.data.count)}</Badge>
          </div>
          <div>
            <p className="text-sm text-gray-600">Unique Members</p>
            <p className="font-semibold">{formatNumber(data.data.uniqueMembers)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Peak Time</p>
            <Badge variant="outline">{data.data.peakTime}</Badge>
          </div>
          <div>
            <p className="text-sm text-gray-600">Average Duration</p>
            <p className="font-semibold">{data.data.avgDuration} min</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Cancellations</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Location</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data.rawData || []).slice(0, 10).map((cancellation: LateCancellationsData, index: number) => (
                  <TableRow key={index}>
                    <TableCell>{cancellation.firstName} {cancellation.lastName}</TableCell>
                    <TableCell>{new Date(cancellation.dateIST).toLocaleDateString()}</TableCell>
                    <TableCell>{cancellation.time}</TableCell>
                    <TableCell>{cancellation.location}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );

  const renderMetricDetails = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{formatNumber(data.totalCancellations)}</div>
            <div className="text-sm text-gray-600">Total Cancellations</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{formatNumber(data.uniqueMembers)}</div>
            <div className="text-sm text-gray-600">Unique Members</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{formatNumber(data.uniqueLocations)}</div>
            <div className="text-sm text-gray-600">Locations</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {data.uniqueMembers > 0 ? (data.totalCancellations / data.uniqueMembers).toFixed(1) : '0'}
            </div>
            <div className="text-sm text-gray-600">Avg per Member</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Trainer</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data.rawData || []).slice(0, 15).map((item: LateCancellationsData, index: number) => (
                  <TableRow key={index}>
                    <TableCell>{item.firstName} {item.lastName}</TableCell>
                    <TableCell>{new Date(item.dateIST).toLocaleDateString()}</TableCell>
                    <TableCell>{item.cleanedClass}</TableCell>
                    <TableCell>{item.location}</TableCell>
                    <TableCell>{item.teacherName}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{data.title}</span>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          {data.type === 'member' && renderMemberDetails()}
          {data.type === 'class' && renderClassDetails()}
          {data.type === 'metric' && renderMetricDetails()}
        </div>
      </DialogContent>
    </Dialog>
  );
};