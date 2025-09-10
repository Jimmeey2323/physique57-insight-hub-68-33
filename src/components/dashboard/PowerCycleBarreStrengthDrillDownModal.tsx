import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PayrollData } from '@/types/dashboard';
import { formatNumber } from '@/utils/formatters';
import { 
  X, 
  Zap, 
  Activity, 
  Dumbbell, 
  Users, 
  DollarSign, 
  Target, 
  Calendar,
  TrendingUp,
  AlertTriangle,
  UserPlus,
  UserCheck
} from 'lucide-react';

interface PowerCycleBarreStrengthDrillDownModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  allData: PayrollData[];
}

export const PowerCycleBarreStrengthDrillDownModal: React.FC<PowerCycleBarreStrengthDrillDownModalProps> = ({
  isOpen,
  onClose,
  data,
  allData
}) => {
  if (!data) return null;

  const renderTrainerDrillDown = () => {
    const trainer = data.trainer;
    if (!trainer) return null;

    const totalSessions = trainer.totalSessions || 0;
    const totalEmptySessions = trainer.totalEmptySessions || 0;
    const totalCustomers = trainer.totalCustomers || 0;
    const totalRevenue = trainer.totalPaid || 0;
    const fillRate = totalSessions > 0 ? ((totalSessions - totalEmptySessions) / totalSessions) * 100 : 0;

    return (
      <div className="space-y-6">
        {/* Trainer Overview */}
        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Users className="w-5 h-5 text-blue-600" />
              {trainer.teacherName}
            </CardTitle>
            <p className="text-sm text-gray-600">{trainer.location} • {trainer.monthYear}</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{formatNumber(totalSessions)}</div>
                <div className="text-sm text-gray-600">Total Sessions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">₹{formatNumber(totalRevenue)}</div>
                <div className="text-sm text-gray-600">Total Revenue</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{formatNumber(totalCustomers)}</div>
                <div className="text-sm text-gray-600">Total Customers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{fillRate.toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Fill Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Format Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* PowerCycle */}
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 text-blue-800">
                <Zap className="w-4 h-4" />
                PowerCycle
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-xs text-blue-600">Sessions:</span>
                <span className="text-sm font-medium">{formatNumber(trainer.cycleSessions || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-blue-600">Empty:</span>
                <span className="text-sm font-medium">{formatNumber(trainer.emptyCycleSessions || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-blue-600">Customers:</span>
                <span className="text-sm font-medium">{formatNumber(trainer.cycleCustomers || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-blue-600">Revenue:</span>
                <span className="text-sm font-medium">₹{formatNumber(trainer.cyclePaid || 0)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Barre */}
          <Card className="bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 text-pink-800">
                <Activity className="w-4 h-4" />
                Barre
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-xs text-pink-600">Sessions:</span>
                <span className="text-sm font-medium">{formatNumber(trainer.barreSessions || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-pink-600">Empty:</span>
                <span className="text-sm font-medium">{formatNumber(trainer.emptyBarreSessions || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-pink-600">Customers:</span>
                <span className="text-sm font-medium">{formatNumber(trainer.barreCustomers || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-pink-600">Revenue:</span>
                <span className="text-sm font-medium">₹{formatNumber(trainer.barrePaid || 0)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Strength */}
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 text-green-800">
                <Dumbbell className="w-4 h-4" />
                Strength Lab
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-xs text-green-600">Sessions:</span>
                <span className="text-sm font-medium">{formatNumber(trainer.strengthSessions || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-green-600">Empty:</span>
                <span className="text-sm font-medium">{formatNumber(trainer.emptyStrengthSessions || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-green-600">Customers:</span>
                <span className="text-sm font-medium">{formatNumber(trainer.strengthCustomers || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-green-600">Revenue:</span>
                <span className="text-sm font-medium">₹{formatNumber(trainer.strengthPaid || 0)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics */}
        <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-gray-600" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-green-500" />
                <div>
                  <div className="text-sm font-medium">{formatNumber(trainer.new || 0)}</div>
                  <div className="text-xs text-gray-600">New Members</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-blue-500" />
                <div>
                  <div className="text-sm font-medium">{formatNumber(trainer.converted || 0)}</div>
                  <div className="text-xs text-gray-600">Converted</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-500" />
                <div>
                  <div className="text-sm font-medium">{formatNumber(trainer.retained || 0)}</div>
                  <div className="text-xs text-gray-600">Retained</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-orange-500" />
                <div>
                  <div className="text-sm font-medium">{trainer.conversion || '0%'}</div>
                  <div className="text-xs text-gray-600">Conversion Rate</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderMetricDrillDown = () => {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold">Metric Analysis</h3>
          <p className="text-sm text-gray-600">Detailed breakdown of {data.metric}</p>
        </div>
        {/* Add specific metric analysis here */}
      </div>
    );
  };

  const renderFormatDrillDown = () => {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold">Format Analysis</h3>
          <p className="text-sm text-gray-600">Detailed breakdown of {data.format}</p>
        </div>
        {/* Add specific format analysis here */}
      </div>
    );
  };

  const getModalTitle = () => {
    if (data.type?.includes('trainer')) {
      return `${data.trainer?.teacherName || 'Trainer'} - Detailed Analysis`;
    }
    if (data.type === 'metric') {
      return `${data.metric} - Metric Analysis`;
    }
    if (data.type === 'format') {
      return `${data.format} - Format Analysis`;
    }
    return 'Detailed Analysis';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {getModalTitle()}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          {data.type?.includes('trainer') && renderTrainerDrillDown()}
          {data.type === 'metric' && renderMetricDrillDown()}
          {data.type === 'format' && renderFormatDrillDown()}
        </div>
      </DialogContent>
    </Dialog>
  );
};