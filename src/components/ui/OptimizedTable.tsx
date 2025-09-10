
import React, { memo, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

interface OptimizedTableProps<T> {
  data: T[];
  columns: Array<{
    key: keyof T;
    header: string;
    render?: (value: any, item: T) => React.ReactNode;
    className?: string;
    align?: 'left' | 'center' | 'right';
  }>;
  loading?: boolean;
  maxHeight?: string;
  stickyHeader?: boolean;
  stickyFirstColumn?: boolean;
  showFooter?: boolean;
  footerData?: any;
  onRowClick?: (item: T) => void;
}

function OptimizedTableComponent<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  maxHeight = "600px",
  stickyHeader = true,
  stickyFirstColumn = false,
  showFooter = false,
  footerData,
  onRowClick
}: OptimizedTableProps<T>) {
  const memoizedRows = useMemo(() => {
    return data.map((item, index) => (
      <TableRow 
        key={index} 
        className="hover:bg-gray-50/80 transition-colors duration-150 border-b border-gray-200 cursor-pointer"
        onClick={() => onRowClick?.(item)}
      >
        {columns.map((column, colIndex) => (
          <TableCell 
            key={String(column.key)} 
            className={`
              py-3 px-4 align-middle font-medium text-sm
              ${column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left'}
              ${stickyFirstColumn && colIndex === 0 ? 'sticky left-0 bg-white z-10 border-r border-gray-200' : ''}
              ${column.className || ''}
            `}
          >
            {column.render ? column.render(item[column.key], item) : item[column.key]}
          </TableCell>
        ))}
      </TableRow>
    ));
  }, [data, columns, onRowClick, stickyFirstColumn]);

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div 
      className="relative w-full overflow-auto border border-gray-200 rounded-lg bg-white shadow-sm"
      style={{ maxHeight }}
    >
      <Table>
        <TableHeader className={stickyHeader ? "sticky top-0 z-20 bg-gradient-to-r from-gray-50 to-gray-100" : "bg-gradient-to-r from-gray-50 to-gray-100"}>
          <TableRow className="border-b-2 border-gray-300">
            {columns.map((column, colIndex) => (
              <TableHead 
                key={String(column.key)} 
                className={`
                  font-bold text-gray-800 py-4 px-4 text-sm
                  ${column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left'}
                  ${stickyFirstColumn && colIndex === 0 ? 'sticky left-0 bg-gradient-to-r from-gray-50 to-gray-100 z-30 border-r border-gray-300' : ''}
                `}
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {memoizedRows}
        </TableBody>
        {showFooter && footerData && (
          <tfoot className="sticky bottom-0 z-20 bg-black text-white border-t-4 border-indigo-600">
            <TableRow className="hover:bg-black">
              {columns.map((column, colIndex) => (
                <TableCell 
                  key={String(column.key)}
                  className={`
                    py-4 px-4 font-bold text-base align-middle
                    ${column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left'}
                    ${stickyFirstColumn && colIndex === 0 ? 'sticky left-0 bg-black z-30 border-r border-gray-600' : ''}
                  `}
                >
                  {column.render && footerData[column.key] !== undefined 
                    ? column.render(footerData[column.key], footerData) 
                    : footerData[column.key] || ''
                  }
                </TableCell>
              ))}
            </TableRow>
          </tfoot>
        )}
      </Table>
    </div>
  );
}

export const OptimizedTable = memo(OptimizedTableComponent) as <T extends Record<string, any>>(
  props: OptimizedTableProps<T>
) => JSX.Element;
