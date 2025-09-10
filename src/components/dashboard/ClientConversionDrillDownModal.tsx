import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency, formatNumber, formatDate } from '@/utils/formatters';
import { 
  User, 
  Calendar, 
  MapPin, 
  CreditCard, 
  TrendingUp, 
  Target, 
  Clock,
  Star,
  Phone,
  Mail,
  X
} from 'lucide-react';
import { NewClientData } from '@/types/dashboard';

interface ClientConversionDrillDownModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: NewClientData | null;
}

export const ClientConversionDrillDownModal: React.FC<ClientConversionDrillDownModalProps> = ({
  isOpen,
  onClose,
  client
}) => {
  if (!client || !isOpen) return null;

  const getConversionStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('converted')) return 'bg-green-100 text-green-800 border-green-300';
    if (statusLower.includes('pending')) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  const getRetentionStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('retained')) return 'bg-blue-100 text-blue-800 border-blue-300';
    if (statusLower.includes('risk')) return 'bg-orange-100 text-orange-800 border-orange-300';
    return 'bg-gray-100 text-gray-800 border-gray-300';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 bg-white">
        <DialogHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
              <User className="w-6 h-6" />
              {client.firstName} {client.lastName}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:text-gray-200 hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-blue-100 mt-2">Complete client profile and conversion journey</p>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-blue-200 bg-blue-50/50">
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-900">
                  {formatCurrency(client.ltv || 0)}
                </div>
                <div className="text-sm text-blue-600">Lifetime Value</div>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50/50">
              <CardContent className="p-4 text-center">
                <Target className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-900">
                  {formatNumber(client.visitsPostTrial || 0)}
                </div>
                <div className="text-sm text-green-600">Post-Trial Visits</div>
              </CardContent>
            </Card>

            <Card className="border-purple-200 bg-purple-50/50">
              <CardContent className="p-4 text-center">
                <Clock className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-900">
                  {client.conversionSpan || 0}
                </div>
                <div className="text-sm text-purple-600">Conversion Days</div>
              </CardContent>
            </Card>

            <Card className="border-orange-200 bg-orange-50/50">
              <CardContent className="p-4 text-center">
                <Star className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-orange-900">
                  {formatNumber(Number(client.membershipsBoughtPostTrial || 0))}
                </div>
                <div className="text-sm text-orange-600">Memberships Bought</div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Information Tabs */}
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="conversion">Conversion</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="financial">Financial</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4" />
                        Email
                      </div>
                      <div className="font-semibold">{client.email || 'Not provided'}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        Phone
                      </div>
                      <div className="font-semibold">{client.phoneNumber || 'Not provided'}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        Home Location
                      </div>
                      <div className="font-semibold">{client.homeLocation || 'Not specified'}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        First Visit
                      </div>
                      <div className="font-semibold">{formatDate(client.firstVisitDate)}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="conversion" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Conversion Journey</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Is New Member</label>
                        <div className="mt-1">
                          <Badge className={client.isNew?.includes('New') ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {client.isNew || 'Unknown'}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Conversion Status</label>
                        <div className="mt-1">
                          <Badge className={getConversionStatusColor(client.conversionStatus || '')}>
                            {client.conversionStatus || 'Unknown'}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Retention Status</label>
                        <div className="mt-1">
                          <Badge className={getRetentionStatusColor(client.retentionStatus || '')}>
                            {client.retentionStatus || 'Unknown'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">First Visit Location</label>
                        <div className="mt-1 font-semibold">{client.firstVisitLocation || 'Not specified'}</div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">First Visit Type</label>
                        <div className="mt-1 font-semibold">{client.firstVisitType || 'Not specified'}</div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Trainer</label>
                        <div className="mt-1 font-semibold">{client.trainerName || 'Not assigned'}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Activity Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{client.visitsPostTrial || 0}</div>
                      <div className="text-sm text-blue-600">Total Visits</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{client.membershipsBoughtPostTrial || 0}</div>
                      <div className="text-sm text-green-600">Memberships Purchased</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{client.conversionSpan || 0}</div>
                      <div className="text-sm text-purple-600">Days to Convert</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="financial" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Financial Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Lifetime Value</label>
                      <div className="text-3xl font-bold text-green-600 mt-1">
                        {formatCurrency(client.ltv || 0)}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Payment Method</label>
                      <div className="mt-1">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          {client.paymentMethod || 'Not specified'}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Membership Used</label>
                      <div className="mt-1 font-semibold">{client.membershipUsed || 'None'}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Purchase Count</label>
                      <div className="mt-1 font-semibold">{client.purchaseCountPostTrial || 0} purchases</div>
                    </div>
                  </div>
                  
                  {client.firstPurchase && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">First Purchase Date</label>
                      <div className="mt-1 font-semibold">{formatDate(client.firstPurchase)}</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};