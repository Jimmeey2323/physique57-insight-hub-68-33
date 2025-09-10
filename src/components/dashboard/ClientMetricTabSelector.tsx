import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, TrendingUp, Calendar, Users, Award, Eye } from 'lucide-react';

interface ClientMetricTabSelectorProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const ClientMetricTabSelector: React.FC<ClientMetricTabSelectorProps> = ({
  activeTab,
  onTabChange
}) => {
  return (
    <div className="glass-card rounded-2xl border p-6 mb-8 animate-fade-in hover-lift">
      <div className="flex items-center gap-6 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-primary to-accent animate-pulse-slow"></div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Analysis Views
          </h3>
        </div>
        <div className="h-px bg-gradient-to-r from-border via-primary/20 to-border flex-1"></div>
      </div>
      
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-6 gap-2">
          <TabsTrigger value="monthonmonth" className="group">
            <Calendar className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform duration-300" />
            <span className="hidden sm:inline">Month-on-Month</span>
            <span className="sm:hidden">MoM</span>
          </TabsTrigger>
          <TabsTrigger value="yearonyear" className="group">
            <TrendingUp className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
            <span className="hidden sm:inline">Year-on-Year</span>
            <span className="sm:hidden">YoY</span>
          </TabsTrigger>
          <TabsTrigger value="hostedclasses" className="group">
            <BarChart3 className="w-4 h-4 mr-2 group-hover:animate-pulse transition-all duration-300" />
            <span className="hidden sm:inline">Hosted Classes</span>
            <span className="sm:hidden">Classes</span>
          </TabsTrigger>
          <TabsTrigger value="memberships" className="group">
            <Award className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform duration-300" />
            <span className="hidden sm:inline">Memberships</span>
            <span className="sm:hidden">Members</span>
          </TabsTrigger>
          <TabsTrigger value="detailed" className="group">
            <Eye className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
            <span className="hidden sm:inline">Detailed View</span>
            <span className="sm:hidden">Details</span>
          </TabsTrigger>
          <TabsTrigger value="overview" className="group">
            <Users className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
            <span className="hidden sm:inline">Overview</span>
            <span className="sm:hidden">Overview</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};