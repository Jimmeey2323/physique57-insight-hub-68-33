
import React, { useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { DisplayedDataExportControls } from '@/components/ui/DisplayedDataExportControls';

interface Column {
  key: string;
  header: string;
  render?: (value: any, row: any) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
  sortable?: boolean;
}

interface ModernDataTableProps {
  data: any[];
  columns: Column[];
  loading?: boolean;
  stickyHeader?: boolean;
  showFooter?: boolean;
  footerData?: any;
  maxHeight?: string;
  className?: string;
  headerGradient?: string;
  onSort?: (field: string) => void;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  onRowClick?: (row: any) => void;
  showExportControls?: boolean;
  exportTitle?: string;
  exportFilename?: string;
}

export const ModernDataTable: React.FC<ModernDataTableProps> = ({
  data,
  columns,
  loading = false,
  stickyHeader = false,
  showFooter = false,
  footerData,
  maxHeight,
  className,
  headerGradient = "from-slate-600 to-slate-700",
  onSort,
  sortField,
  sortDirection,
  onRowClick,
  showExportControls = true,
  exportTitle = "Table Data",
  exportFilename
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const formatCurrencyValue = (value: any) => {
    if (typeof value === 'string' && (value.includes('₹') || value.includes('$'))) {
      const numericValue = parseFloat(value.replace(/[₹$,]/g, ''));
      if (!isNaN(numericValue) && numericValue < 1000) {
        return `₹${Math.round(numericValue)}`;
      }
    }
    return value;
  };

  const handleSort = (column: Column) => {
    if (column.sortable && onSort) {
      onSort(column.key);
    }
  };

  // Extract displayed data with formatting
  const displayedData = useMemo(() => {
    return data.map(row => {
      const processedRow: Record<string, any> = {};
      columns.forEach(column => {
        let value = row[column.key];
        if (column.render) {
          // For rendered columns, we need to extract text content
          const rendered = column.render(value, row);
          if (typeof rendered === 'string') {
            processedRow[column.header] = rendered;
          } else if (typeof rendered === 'number') {
            processedRow[column.header] = rendered;
          } else {
            // For React components, use the original value but formatted
            processedRow[column.header] = formatCurrencyValue(value);
          }
        } else {
          processedRow[column.header] = formatCurrencyValue(value);
        }
      });
      return processedRow;
    });
  }, [data, columns]);

  const tableHeaders = columns.map(col => col.header);

  return (
    <div className="space-y-4">
      {showExportControls && data.length > 0 && (
        <div className="flex justify-end">
          <DisplayedDataExportControls 
            tableData={displayedData}
            tableHeaders={tableHeaders}
            tableName={exportTitle}
            filename={exportFilename}
            size="sm"
            variant="outline"
          />
        </div>
      )}
      <div className={cn("relative overflow-auto rounded-xl", className)} style={{ maxHeight }}>
        <Table className="w-full">
        <TableHeader className={cn(
          stickyHeader && "sticky top-0 z-20",
          "bg-gradient-to-r text-primary-foreground border-none shadow-sm",
          headerGradient
        )}>
          <TableRow className="border-none h-12">
            {columns.map((column) => (
              <TableHead 
                key={column.key} 
                className={cn(
                  "font-bold h-12 px-4 text-sm whitespace-nowrap text-primary-foreground",
                  column.align === 'center' && 'text-center',
                  column.align === 'right' && 'text-right',
                  column.sortable && 'cursor-pointer hover:bg-primary-foreground/10 transition-colors',
                  column.className
                )}
                onClick={() => handleSort(column)}
              >
                <div className="flex items-center gap-2">
                  {column.header}
                  {column.sortable && sortField === column.key && (
                    sortDirection === 'asc' ? 
                      <ChevronUp className="w-4 h-4" /> : 
                      <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, index) => (
            <TableRow 
              key={index} 
              className={cn(
                "hover:bg-muted/40 transition-all duration-200 h-12 table-row-stripe",
                onRowClick && "cursor-pointer hover:scale-[1.01] hover:shadow-sm"
              )}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((column) => (
                <TableCell 
                  key={column.key}
                  className={cn(
                    "h-12 px-4 py-3 text-sm font-medium",
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right',
                    column.className
                  )}
                >
                  <div className="flex items-center h-full">
                    {column.render 
                      ? column.render(row[column.key], row)
                      : <span className="truncate">{formatCurrencyValue(row[column.key])}</span>
                    }
                  </div>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
        {showFooter && footerData && (
          <TableFooter className="sticky bottom-0 z-10 bg-primary/90 backdrop-blur-sm border-t border-border">
            <TableRow className="hover:bg-primary/95 h-12 border-none">
              {columns.map((column) => (
                <TableCell 
                  key={column.key}
                  className={cn(
                    "font-bold text-primary-foreground h-12 px-4 py-3 text-sm",
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right',
                    column.className
                  )}
                >
                  <div className="flex items-center h-full">
                    {column.render 
                      ? column.render(footerData[column.key], footerData)
                      : <span className="truncate">{formatCurrencyValue(footerData[column.key])}</span>
                    }
                  </div>
                </TableCell>
              ))}
            </TableRow>
          </TableFooter>
        )}
      </Table>
      </div>
    </div>
  );
};
