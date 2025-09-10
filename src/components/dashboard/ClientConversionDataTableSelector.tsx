import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, TrendingUp, Users, BarChart3 } from 'lucide-react';

interface ClientConversionDataTableSelectorProps {
  activeTable: string;
  onTableChange: (table: string) => void;
  dataLength: number;
}

type TableOption = {
  key: string;
  label: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
};

export const ClientConversionDataTableSelector: React.FC<ClientConversionDataTableSelectorProps> = ({
  activeTable,
  onTableChange,
  dataLength
}) => {
  const tableOptions: TableOption[] = [
    {
      key: 'monthonmonthbytype',
      label: 'By Client Type',
      description: 'Monthly breakdown by client type',
      icon: Users,
      gradient: 'from-purple-500 to-pink-600'
    },
    {
      key: 'monthonmonth',
      label: 'Month on Month',
      description: 'Monthly trends and comparisons',
      icon: Calendar,
      gradient: 'from-blue-500 to-indigo-600'
    },
    {
      key: 'yearonyear',
      label: 'Year on Year',
      description: 'Annual performance comparison',
      icon: TrendingUp,
      gradient: 'from-green-500 to-emerald-600'
    },
    {
      key: 'hostedclasses',
      label: 'Hosted Classes',
      description: 'Class performance metrics',
      icon: Users,
      gradient: 'from-purple-500 to-violet-600'
    },
    {
      key: 'memberships',
      label: 'Membership Analysis',
      description: 'Membership type breakdown',
      icon: BarChart3,
      gradient: 'from-orange-500 to-red-600'
    }
  ];

  return (
    <div className="bg-gradient-to-r from-slate-50 to-gray-100 p-6 rounded-xl border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Data Analysis Tables</h3>
          <p className="text-sm text-gray-600">Select a table to view detailed metrics</p>
        </div>
        <Badge className="bg-blue-100 text-blue-800 border-blue-200">
          {dataLength} Records
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {tableOptions.map((option) => (
          <Button
            key={option.key}
            variant={activeTable === option.key ? "default" : "outline"}
            className={`h-auto p-4 flex-col items-start gap-2 transition-all duration-300 ${
              activeTable === option.key
                ? `bg-gradient-to-r ${option.gradient} text-white shadow-lg hover:shadow-xl`
                : 'bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onTableChange(option.key)}
          >
            <div className="flex items-center gap-2 w-full">
              <option.icon className={`w-5 h-5 ${
                activeTable === option.key ? 'text-white' : 'text-gray-600'
              }`} />
              <span className={`font-semibold text-sm ${
                activeTable === option.key ? 'text-white' : 'text-gray-900'
              }`}>
                {option.label}
              </span>
            </div>
            <p className={`text-xs text-left w-full ${
              activeTable === option.key ? 'text-white/90' : 'text-gray-500'
            }`}>
              {option.description}
            </p>
          </Button>
        ))}
      </div>
    </div>
  );
};