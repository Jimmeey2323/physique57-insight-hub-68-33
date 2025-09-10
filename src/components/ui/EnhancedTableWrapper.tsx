import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdvancedTabExportControls } from '@/components/ui/AdvancedTabExportControls';
import { Badge } from '@/components/ui/badge';

interface EnhancedTableWrapperProps {
  title: string;
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string }>;
  data: any[];
  recordCount?: number;
  exportFilename?: string;
  className?: string;
  children: React.ReactNode;
  additionalData?: Record<string, any[]>;
  headerActions?: React.ReactNode;
}

export const EnhancedTableWrapper: React.FC<EnhancedTableWrapperProps> = ({
  title,
  subtitle,
  icon: Icon,
  data,
  recordCount,
  exportFilename,
  className = '',
  children,
  additionalData = {},
  headerActions
}) => {
  const displayCount = recordCount || data.length;
  const filename = exportFilename || title.toLowerCase().replace(/\s+/g, '-');

  return (
    <Card className={`bg-white shadow-lg border-0 ${className}`}>
      <CardHeader className="border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            {Icon && <Icon className="w-6 h-6 text-blue-600" />}
            <div>
              <CardTitle className="flex items-center gap-2">
                {title}
                <Badge variant="outline" className="text-blue-600">
                  {displayCount.toLocaleString()} records
                </Badge>
              </CardTitle>
              {subtitle && (
                <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {headerActions}
            <AdvancedTabExportControls 
              tabName={title}
              defaultFileName={filename}
              size="sm"
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {children}
      </CardContent>
    </Card>
  );
};