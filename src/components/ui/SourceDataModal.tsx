
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { designTokens } from '@/utils/designTokens';
import { cn } from '@/lib/utils';

interface SourceDefinition {
  name: string;              // Human-friendly name e.g. "Sales"
  sheetName?: string;        // Sheet/tab name inside spreadsheet e.g. "Sales"
  spreadsheetId?: string;    // Google Spreadsheet ID
  data: any[];               // Raw rows already loaded by the page/section
}

interface SourceDataModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sources: SourceDefinition[];
}

export const SourceDataModal: React.FC<SourceDataModalProps> = ({ open, onOpenChange, sources }) => {
  // Build columns from first row keys, fallback to empty
  const buildColumns = (rows: any[]) => {
    const sample = rows && rows.length > 0 ? rows[0] : null;
    const keys = sample ? Object.keys(sample) : [];
    return keys;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-[95vw]">
        <DialogHeader>
          <DialogTitle className="text-slate-900">Source Data Viewer</DialogTitle>
        </DialogHeader>

        {sources.length === 0 ? (
          <div className="text-sm text-slate-600">No sources provided.</div>
        ) : (
          <Tabs defaultValue={sources[0]?.name} className="w-full">
            <TabsList className="mb-4">
              {sources.map((s) => (
                <TabsTrigger key={s.name} value={s.name}>
                  {s.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {sources.map((s) => {
              const cols = buildColumns(s.data);
              const limitedRows = (s.data || []).slice(0, 500);
              return (
                <TabsContent key={s.name} value={s.name} className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    {s.spreadsheetId && (
                      <Badge variant="outline" className="border-slate-200 text-slate-700">{s.spreadsheetId}</Badge>
                    )}
                    {s.sheetName && (
                      <Badge variant="secondary" className="text-slate-700">Sheet: {s.sheetName}</Badge>
                    )}
                    <Badge className="bg-slate-900 text-white">Rows shown: {limitedRows.length}</Badge>
                  </div>

                  <div className={cn(
                    designTokens.card.background,
                    designTokens.card.shadow,
                    designTokens.card.border,
                    designTokens.card.radius,
                    'overflow-hidden'
                  )}>
                    <div className="overflow-auto" style={{ maxHeight: '60vh' }}>
                      <Table>
                        <TableHeader className={designTokens.table.header + ' sticky top-0 z-10'}>
                          <TableRow>
                            {cols.map((col) => (
                              <TableHead key={col} className={cn(designTokens.table.headerText, 'px-4 py-3')}>
                                {col}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {limitedRows.map((row, idx) => (
                            <TableRow key={idx} className={designTokens.table.row}>
                              {cols.map((col) => (
                                <TableCell key={col} className={cn(designTokens.table.cell)}>
                                  {row[col] !== undefined && row[col] !== null ? String(row[col]) : ''}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SourceDataModal;
