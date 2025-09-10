
import React, { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Users, 
  Target, 
  Calendar, 
  MapPin, 
  TrendingUp, 
  DollarSign, 
  Activity, 
  CheckCircle,
  Clock,
  AlertTriangle,
  Eye,
  Zap,
  Info
} from 'lucide-react';
import { LeadsData } from '@/types/leads';
import { formatCurrency } from '@/utils/formatters';
import { cn } from '@/lib/utils';

interface FunnelMetricCardsProps {
  data: LeadsData[];
  onCardClick?: (title: string, data: LeadsData[], metricType: string) => void;
}

export const FunnelMetricCards: React.FC<FunnelMetricCardsProps> = ({ data, onCardClick }) => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const metrics = useMemo(() => {
    if (!data || !data.length) {
      return {
        leadsReceived: 0,
        trialsCompleted: 0,
        trialsScheduled: 0,
        proximityIssues: 0,
        convertedLeads: 0,
        trialToMemberConversion: 0,
        leadToTrialConversion: 0,
        leadToMemberConversion: 0,
        avgLTV: 0,
        avgVisitsPerLead: 0,
        pipelineHealth: 0
      };
    }

    const leadsReceived = data.length;
    const trialsCompleted = data.filter(lead => lead.stage === 'Trial Completed').length;
    const trialsScheduled = data.filter(lead => lead.stage?.includes('Trial')).length;
    const proximityIssues = data.filter(lead => lead.stage?.includes('Proximity') || lead.remarks?.toLowerCase().includes('proximity')).length;
    const convertedLeads = data.filter(lead => lead.conversionStatus === 'Converted').length;
    
    const trialToMemberConversion = trialsCompleted > 0 ? (convertedLeads / trialsCompleted) * 100 : 0;
    const leadToTrialConversion = leadsReceived > 0 ? (trialsScheduled / leadsReceived) * 100 : 0;
    const leadToMemberConversion = leadsReceived > 0 ? (convertedLeads / leadsReceived) * 100 : 0;
    
    const totalLTV = data.reduce((sum, lead) => sum + (lead.ltv || 0), 0);
    const avgLTV = leadsReceived > 0 ? totalLTV / leadsReceived : 0;
    
    const totalVisits = data.reduce((sum, lead) => sum + (lead.visits || 0), 0);
    const avgVisitsPerLead = leadsReceived > 0 ? totalVisits / leadsReceived : 0;
    
    const pipelineHealth = Math.min(100, Math.round(
      (leadToTrialConversion * 0.3) + 
      (trialToMemberConversion * 0.4) + 
      (avgVisitsPerLead * 10 * 0.2) + 
      ((leadsReceived - proximityIssues) / leadsReceived * 100 * 0.1)
    ));

    return {
      leadsReceived,
      trialsCompleted,
      trialsScheduled,
      proximityIssues,
      convertedLeads,
      trialToMemberConversion,
      leadToTrialConversion,
      leadToMemberConversion,
      avgLTV,
      avgVisitsPerLead,
      pipelineHealth
    };
  }, [data]);

  const MetricCard = ({ 
    id,
    title, 
    value, 
    icon: Icon, 
    color, 
    subtitle, 
    trend,
    format = 'number',
    tooltip
  }: {
    id: string;
    title: string;
    value: number;
    icon: React.ElementType;
    color: string;
    subtitle?: string;
    trend?: number;
    format?: 'number' | 'currency' | 'percentage';
    tooltip: string;
  }) => {
    const formatValue = (val: number) => {
      switch (format) {
        case 'currency': return formatCurrency(val);
        case 'percentage': return `${val.toFixed(1)}%`;
        default: return val.toLocaleString('en-IN');
      }
    };

    const isHovered = hoveredCard === id;

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Card 
              className={cn(
                "group relative overflow-hidden transition-all duration-500 cursor-pointer transform-gpu",
                "bg-gradient-to-br from-white via-slate-50 to-white border-0 shadow-lg hover:shadow-2xl",
                isHovered ? "scale-105 -translate-y-2" : "hover:scale-102"
              )}
              onMouseEnter={() => setHoveredCard(id)}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => onCardClick?.(title, data, id)}
            >
              {/* Animated background */}
              <div className={cn(
                "absolute inset-0 opacity-0 transition-opacity duration-500",
                isHovered && "opacity-10",
                color.replace('from-', 'bg-gradient-to-br from-').replace('to-', 'to-')
              )} />
              
              {/* Floating particles effect */}
              <div className="absolute inset-0 overflow-hidden">
                <div className={cn(
                  "absolute w-2 h-2 rounded-full opacity-20 transition-all duration-1000",
                  isHovered ? "animate-bounce" : "",
                  color.replace('from-', 'bg-').split(' ')[0].replace('-400', '-300')
                )} style={{ top: '20%', left: '80%', animationDelay: '0s' }} />
                <div className={cn(
                  "absolute w-1 h-1 rounded-full opacity-30 transition-all duration-1000",
                  isHovered ? "animate-pulse" : "",
                  color.replace('to-', 'bg-').split(' ')[1].replace('-600', '-400')
                )} style={{ top: '60%', left: '15%', animationDelay: '0.5s' }} />
                <div className={cn(
                  "absolute w-1.5 h-1.5 rounded-full opacity-25 transition-all duration-1000",
                  isHovered ? "animate-ping" : "",
                  color.replace('from-', 'bg-').split(' ')[0].replace('-400', '-200')
                )} style={{ top: '80%', left: '70%', animationDelay: '1s' }} />
              </div>
              
              <CardContent className="p-6 relative z-10">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={cn(
                        "p-3 rounded-xl transition-all duration-500 shadow-lg",
                        color.replace('from-', 'bg-').replace('-400', '-100').split(' ')[0],
                        color.replace('to-', 'text-').replace('-600', '-600').split(' ')[1],
                        isHovered && "rotate-12 scale-110"
                      )}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-slate-700 leading-tight">{title}</h3>
                        {subtitle && (
                          <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className={cn(
                        "text-3xl font-black transition-all duration-500",
                        color.replace('to-', 'text-').replace('-600', '-700').split(' ')[1],
                        isHovered && "scale-110"
                      )}>
                        {formatValue(value)}
                      </div>
                      
                      {trend !== undefined && (
                        <div className="flex items-center gap-2">
                          <TrendingUp className={cn(
                            "w-4 h-4 transition-colors duration-300",
                            trend > 0 ? "text-green-600" : trend < 0 ? "text-red-600" : "text-slate-600"
                          )} />
                          <span className={cn(
                            "text-sm font-semibold",
                            trend > 0 ? "text-green-600" : trend < 0 ? "text-red-600" : "text-slate-600"
                          )}>
                            {trend > 0 ? '+' : ''}{trend.toFixed(1)}%
                          </span>
                          <span className="text-xs text-slate-500">vs last period</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Info className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
                
                {/* Progress bar for percentage metrics */}
                {format === 'percentage' && (
                  <div className="mt-4">
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className={cn(
                          "h-2 rounded-full transition-all duration-1000 ease-out",
                          color.replace('from-', 'bg-gradient-to-r from-').replace('to-', 'to-')
                        )}
                        style={{ 
                          width: isHovered ? `${Math.min(value, 100)}%` : '0%',
                          transitionDelay: '200ms'
                        }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <p className="text-sm">{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          id="leadsReceived"
          title="Leads Received"
          value={metrics.leadsReceived}
          icon={Users}
          color="from-blue-400 to-blue-600"
          subtitle="Total incoming leads"
          tooltip="Total number of leads received in the selected period"
        />
        
        <MetricCard
          id="trialsCompleted"
          title="Trials Completed"
          value={metrics.trialsCompleted}
          icon={CheckCircle}
          color="from-green-400 to-green-600"
          subtitle="Successful trial sessions"
          tooltip="Number of trial sessions that were successfully completed"
        />
        
        <MetricCard
          id="trialsScheduled"
          title="Trials Scheduled"
          value={metrics.trialsScheduled}
          icon={Calendar}
          color="from-purple-400 to-purple-600"
          subtitle="Scheduled trial sessions"
          tooltip="Total number of trial sessions scheduled"
        />
        
        <MetricCard
          id="proximityIssues"
          title="Proximity Issues"
          value={metrics.proximityIssues}
          icon={MapPin}
          color="from-red-400 to-red-600"
          subtitle="Location-related concerns"
          tooltip="Leads lost due to location or proximity concerns"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          id="convertedLeads"
          title="Converted Leads"
          value={metrics.convertedLeads}
          icon={Target}
          color="from-emerald-400 to-emerald-600"
          subtitle="Successfully converted"
          tooltip="Number of leads successfully converted to paying members"
        />
        
        <MetricCard
          id="trialToMemberRate"
          title="Trial → Member Rate"
          value={metrics.trialToMemberConversion}
          icon={TrendingUp}
          color="from-cyan-400 to-cyan-600"
          subtitle="Trial conversion efficiency"
          format="percentage"
          tooltip="Percentage of completed trials that converted to memberships"
        />
        
        <MetricCard
          id="leadToTrialRate"
          title="Lead → Trial Rate"
          value={metrics.leadToTrialConversion}
          icon={Activity}
          color="from-indigo-400 to-indigo-600"
          subtitle="Lead engagement rate"
          format="percentage"
          tooltip="Percentage of leads that scheduled and completed trials"
        />
        
        <MetricCard
          id="leadToMemberRate"
          title="Lead → Member Rate"
          value={metrics.leadToMemberConversion}
          icon={Zap}
          color="from-yellow-400 to-yellow-600"
          subtitle="Overall conversion rate"
          format="percentage"
          tooltip="Overall percentage of leads converted to paying members"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          id="avgLTV"
          title="Average LTV"
          value={metrics.avgLTV}
          icon={DollarSign}
          color="from-green-400 to-green-600"
          subtitle="Lifetime value per lead"
          format="currency"
          tooltip="Average lifetime value generated per lead"
        />
        
        <MetricCard
          id="avgVisitsPerLead"
          title="Avg Visits/Lead"
          value={metrics.avgVisitsPerLead}
          icon={Eye}
          color="from-orange-400 to-orange-600"
          subtitle="Engagement frequency"
          tooltip="Average number of visits per lead during the funnel process"
        />
        
        <MetricCard
          id="pipelineHealth"
          title="Pipeline Health"
          value={metrics.pipelineHealth}
          icon={metrics.pipelineHealth >= 70 ? CheckCircle : metrics.pipelineHealth >= 50 ? Clock : AlertTriangle}
          color={
            metrics.pipelineHealth >= 70 
              ? "from-green-400 to-green-600"
              : metrics.pipelineHealth >= 50 
              ? "from-yellow-400 to-yellow-600"
              : "from-red-400 to-red-600"
          }
          subtitle="Overall funnel performance"
          format="percentage"
          tooltip="Composite score based on conversion rates, engagement, and lead quality"
        />
      </div>
    </div>
  );
};
