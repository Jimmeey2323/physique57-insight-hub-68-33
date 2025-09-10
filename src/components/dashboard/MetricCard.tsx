
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { TrendingUp, TrendingDown, Info, BarChart3, Users, CreditCard, Target } from 'lucide-react';
import { MetricCardData } from '@/types/dashboard';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  data: MetricCardData;
  delay?: number;
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({ data, delay = 0, onClick }) => {
  const [animatedValue, setAnimatedValue] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(true);
      const numericValue = typeof data.value === 'string' 
        ? parseFloat(data.value.replace(/[₹,KLCr]/g, '')) 
        : data.value;
      
      if (!isNaN(numericValue)) {
        const duration = 2000;
        const steps = 60;
        const increment = numericValue / steps;
        let current = 0;
        
        const counter = setInterval(() => {
          current += increment;
          if (current >= numericValue) {
            setAnimatedValue(numericValue);
            setIsAnimating(false);
            clearInterval(counter);
          } else {
            setAnimatedValue(current);
          }
        }, duration / steps);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [data.value, delay]);

  const isPositiveChange = data.change && data.change > 0;
  const isNegativeChange = data.change && data.change < 0;

  const getIcon = () => {
    switch (data.icon) {
      case 'revenue':
        return <BarChart3 className="w-6 h-6 text-blue-600" />;
      case 'members':
        return <Users className="w-6 h-6 text-green-600" />;
      case 'transactions':
        return <CreditCard className="w-6 h-6 text-purple-600" />;
      default:
        return <Target className="w-6 h-6 text-orange-600" />;
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card 
            className={cn(
              "relative overflow-hidden transition-all duration-700 cursor-pointer group",
              "bg-gradient-to-br from-white via-slate-50/50 to-white",
              "border-0 shadow-lg backdrop-blur-sm hover:shadow-2xl",
              "hover:scale-105 hover:-translate-y-2 transform-gpu",
              isHovered && "shadow-2xl",
              isAnimating && "animate-pulse"
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={onClick}
          >
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Top Border Animation */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left" />
            
            {/* Icon Background */}
            <div className="absolute top-4 right-4 p-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
              {getIcon()}
            </div>
            
            <CardContent className="p-6 relative z-10">
              <div className="mb-4">
                <p className="text-sm font-semibold text-slate-600 mb-2 tracking-wide uppercase">{data.title}</p>
                <div className="flex items-end gap-3 mb-3">
                  <span className={cn(
                    "text-3xl font-bold transition-all duration-500",
                    isAnimating ? "text-blue-600" : "text-slate-900"
                  )}>
                    {typeof data.value === 'string' ? data.value : animatedValue.toLocaleString('en-IN')}
                  </span>
                  {data.change && (
                    <div className={cn(
                      "flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all duration-300",
                      "shadow-sm border",
                      isPositiveChange && "bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200",
                      isNegativeChange && "bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border-red-200"
                    )}>
                      {isPositiveChange && <TrendingUp className="w-3 h-3" />}
                      {isNegativeChange && <TrendingDown className="w-3 h-3" />}
                      {Math.abs(data.change).toFixed(1)}%
                    </div>
                  )}
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="relative w-full bg-slate-200 rounded-full h-2 overflow-hidden mb-3">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 rounded-full transition-all duration-2000 ease-out shadow-sm"
                  style={{ 
                    width: isHovered ? '100%' : '75%',
                    transform: isAnimating ? 'translateX(-100%)' : 'translateX(0)',
                    animation: isAnimating ? 'slideIn 2s ease-out' : 'none'
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
              </div>

              {/* Hover Details */}
              <div className={cn(
                "transition-all duration-300 overflow-hidden",
                isHovered ? "max-h-20 opacity-100" : "max-h-0 opacity-0"
              )}>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {data.description.split(' ').slice(0, 12).join(' ')}...
                </p>
              </div>
            </CardContent>

            {/* Click Indicator */}
            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
            </div>
          </Card>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-sm p-4 bg-white border shadow-xl">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {getIcon()}
              <h4 className="font-bold text-slate-800">{data.title}</h4>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">{data.description}</p>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500 font-medium">
                <strong>Calculation Method:</strong>
              </p>
              <p className="text-xs text-slate-600 mt-1">{data.calculation}</p>
            </div>
            <p className="text-xs text-blue-600 font-medium">Click for detailed analytics →</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
