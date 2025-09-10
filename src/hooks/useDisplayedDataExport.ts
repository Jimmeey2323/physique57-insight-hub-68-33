import { useState } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: Record<string, unknown>) => jsPDF;
  }
}

interface DisplayedTable {
  id: string;
  name: string;
  element: HTMLTableElement | null;
  rowCount: number;
  columnCount: number;
  isVisible: boolean;
}

interface ExportConfig {
  format: 'pdf' | 'csv' | 'excel';
  fileName: string;
  options: {
    includeHeaders: boolean;
    preserveFormatting: boolean;
    includeRowNumbers: boolean;
    separateSheets: boolean;
    includeMetadata: boolean;
  };
  tables: DisplayedTable[];
  tabName: string;
}

interface TableData {
  name: string;
  headers: string[];
  rows: string[][];
  metadata?: {
    originalRowCount: number;
    originalColumnCount: number;
    exportedAt: string;
  };
}

export const useDisplayedDataExport = () => {
  const [isExporting, setIsExporting] = useState(false);

  const scanForTables = (container: HTMLElement = document.body): DisplayedTable[] => {
    const tables = Array.from(container.querySelectorAll('table'));
    
    return tables.map((table, index) => {
      // Try to find a meaningful name for the table
      let tableName = 'Table ' + (index + 1);
      
      // Look for nearby headings or captions
      const caption = table.querySelector('caption');
      if (caption) {
        tableName = caption.textContent?.trim() || tableName;
      } else {
        // Look for heading elements before the table
        const previousElements = [];
        let current = table.previousElementSibling;
        let searchCount = 0;
        
        while (current && searchCount < 5) {
          if (current.tagName.match(/^H[1-6]$/)) {
            tableName = current.textContent?.trim() || tableName;
            break;
          }
          if (current.textContent?.trim() && current.textContent.trim().length < 100) {
            previousElements.push(current.textContent.trim());
          }
          current = current.previousElementSibling;
          searchCount++;
        }
        
        // If no heading found, use the first non-empty text element
        if (tableName.startsWith('Table ') && previousElements.length > 0) {
          tableName = previousElements[previousElements.length - 1];
        }
      }

      const rows = table.querySelectorAll('tr');
      const firstRow = rows[0];
      const columnCount = firstRow ? firstRow.querySelectorAll('td, th').length : 0;
      
      // Check if table is actually visible and has content
      const isVisible = table.offsetParent !== null && 
                       window.getComputedStyle(table).display !== 'none' &&
                       window.getComputedStyle(table).visibility !== 'hidden';
      
      return {
        id: `table-${index}-${Date.now()}`,
        name: tableName,
        element: table,
        rowCount: rows.length,
        columnCount,
        isVisible
      };
    });
  };

  const scanForTablesIncludingSubTabs = async (container: HTMLElement = document.body): Promise<DisplayedTable[]> => {
    const collected: DisplayedTable[] = [];
    const seen = new Set<HTMLTableElement>();

    const root: HTMLElement = container || document.body;

    // Helper to collect visible tables and prefix names
    const collectVisible = (prefix?: string, searchContext?: HTMLElement) => {
      const searchRoot = searchContext || root;
      const found = scanForTables(searchRoot).filter(t => t.isVisible && t.rowCount > 0);
      found.forEach((t, idx) => {
        if (t.element && !seen.has(t.element)) {
          seen.add(t.element);
          collected.push({
            ...t,
            name: prefix ? `${prefix} — ${t.name}` : t.name,
            // Mark as visible at time of scan
            isVisible: true,
            id: `${t.id}-${prefix || 'active'}`
          });
        }
      });
    };

    // Track all active tabs across different levels to restore later
    const getAllActiveTriggers = (searchRoot: HTMLElement = root) => {
      return Array.from(searchRoot.querySelectorAll('[role="tab"][data-state="active"], [role="tab"][aria-selected="true"], .active')).filter(el => 
        el instanceof HTMLElement && el.getAttribute('role') === 'tab'
      ) as HTMLElement[];
    };

    const initialActiveTriggers = getAllActiveTriggers();

    // Collect from currently active content first
    collectVisible('Initial Active Content');

    // Recursive function to find and process all tab levels
    const processTabLevel = async (searchRoot: HTMLElement, levelPrefix: string = '', level: number = 0) => {
      // Safety check to prevent infinite recursion
      if (level > 5) {
        console.warn(`Maximum tab nesting level reached (${level}), stopping recursion`);
        return;
      }

      // Find all tab triggers within this search root that are not currently active
      const triggers = Array.from(searchRoot.querySelectorAll('[role="tab"]')).filter((el): el is HTMLElement => {
        const element = el as HTMLElement;
        // Only include actual tab triggers that are not currently active
        return element.tagName === 'BUTTON' && 
               element.getAttribute('data-state') !== 'active' &&
               element.getAttribute('aria-selected') !== 'true';
      }) as HTMLElement[];

      console.log(`Level ${level}: Found ${triggers.length} inactive tab triggers in ${levelPrefix || 'root'}`);

      // Process each trigger at this level
      for (const trigger of triggers) {
        const subTabName = (trigger.textContent || trigger.getAttribute('aria-label') || '').trim() || 'Sub Tab';
        const fullTabName = levelPrefix ? `${levelPrefix} > ${subTabName}` : subTabName;
        
        try {
          console.log(`Level ${level}: Clicking tab: ${fullTabName}`);
          
          // Ensure the trigger is scrollable into view and clickable
          trigger.scrollIntoView({ behavior: 'instant', block: 'nearest' });
          
          // Use focus and click for better Radix UI compatibility
          trigger.focus();
          trigger.click();
          
          // Wait longer for DOM to update and tables to render - increased wait time
          await new Promise(res => setTimeout(res, 1200));
          
          // Force multiple layout reflows to ensure all content is rendered
          // eslint-disable-next-line @typescript-eslint/no-unused-expressions
          searchRoot.offsetHeight;
          // eslint-disable-next-line @typescript-eslint/no-unused-expressions
          window.getComputedStyle(searchRoot).height;
          
          // Additional forced repaint
          searchRoot.getBoundingClientRect();
          
          // Wait a bit more for dynamic content
          await new Promise(res => setTimeout(res, 300));
          
          // Collect tables from this tab
          const beforeCount = collected.length;
          collectVisible(fullTabName, searchRoot);
          const afterCount = collected.length;
          
          console.log(`Level ${level}: Collected ${afterCount - beforeCount} tables from sub-tab: ${fullTabName}`);

          // Look for nested tabs within the newly activated tab content
          // Find the tab content that corresponds to this trigger
          const tabsContainer = trigger.closest('[role="tablist"]')?.parentElement;
          if (tabsContainer) {
            const activeTabContent = tabsContainer.querySelector('[role="tabpanel"][data-state="active"], [data-state="active"] [role="tabpanel"]');
            if (activeTabContent && activeTabContent instanceof HTMLElement) {
              // Recursively process nested tabs within this active content
              await processTabLevel(activeTabContent, fullTabName, level + 1);
            }
          }
          
        } catch (e) {
          console.warn(`Level ${level}: Sub-tab switch failed for ${fullTabName}:`, e);
        }
      }
    };

    // Process tabs starting from the root level
    await processTabLevel(root);

    // Also check for any tabs that might be within currently active content areas
    const activeTabContents = Array.from(root.querySelectorAll('[role="tabpanel"][data-state="active"], [data-state="active"] [role="tabpanel"]')) as HTMLElement[];
    for (const activeContent of activeTabContents) {
      await processTabLevel(activeContent, 'Active Tab Content', 1);
    }

    // Restore the initially active tabs in reverse order to maintain proper nesting
    for (let i = initialActiveTriggers.length - 1; i >= 0; i--) {
      const trigger = initialActiveTriggers[i];
      try {
        console.log(`Restoring active tab: ${trigger.textContent?.trim()}`);
        trigger.scrollIntoView({ behavior: 'instant', block: 'nearest' });
        trigger.focus();
        trigger.click();
        await new Promise(res => setTimeout(res, 200));
      } catch (e) {
        console.warn('Failed to restore initial active tab:', trigger.textContent?.trim(), e);
      }
    }

    // Final collection from restored state
    await new Promise(res => setTimeout(res, 500));
    collectVisible('Final Restored State');

    console.log(`Total tables collected: ${collected.length} across all tab levels`);
    return collected;
  };

  const extractTableData = (table: HTMLTableElement, options: ExportConfig['options']): TableData => {
    // Handle horizontally scrollable tables by temporarily expanding them
    const tableContainer = table.closest('.overflow-x-auto, .overflow-auto, .overflow-scroll') as HTMLElement || table.parentElement;
    const originalScrollLeft = tableContainer?.scrollLeft || 0;
    const originalWidth = table.style.width;
    const originalMaxWidth = table.style.maxWidth;
    const originalOverflow = tableContainer?.style.overflow;
    
    try {
      // Temporarily remove scroll constraints to capture all content
      if (tableContainer) {
        tableContainer.style.overflow = 'visible';
        tableContainer.scrollLeft = 0;
      }
      
      // Temporarily expand table to show all columns
      table.style.width = 'max-content';
      table.style.maxWidth = 'none';
      
      // Force layout recalculation
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      table.offsetWidth;
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      tableContainer?.offsetWidth;

      const rows = Array.from(table.querySelectorAll('tr'));
      const extractedData: string[][] = [];
      let headers: string[] = [];

      rows.forEach((row, rowIndex) => {
        const cells = Array.from(row.querySelectorAll('td, th'));
        const rowData: string[] = [];
        
        cells.forEach(cell => {
          let cellValue = '';
          
          if (options.preserveFormatting) {
            // Try to preserve formatted content
            cellValue = cell.textContent?.trim() || '';
            
            // Handle special cases like currency, percentages, etc.
            const innerHTML = cell.innerHTML;
            if (innerHTML.includes('$') || innerHTML.includes('€') || innerHTML.includes('£')) {
              // Keep currency symbols
              const text = cell.textContent?.trim() || '';
              if (text && !text.includes('$') && !text.includes('€') && !text.includes('£')) {
                // Add currency symbol if it was in HTML but not in text
                const currencyMatch = innerHTML.match(/[\\$€£]/);
                if (currencyMatch) {
                  cellValue = currencyMatch[0] + text;
                }
              }
            }
          } else {
            cellValue = cell.textContent?.trim() || '';
          }
          
          rowData.push(cellValue);
        });
        
        // First row as headers if it contains th elements or if specified
        if (rowIndex === 0 && (row.querySelector('th') || options.includeHeaders)) {
          headers = rowData;
        } else {
          // Add row numbers if requested
          if (options.includeRowNumbers) {
            rowData.unshift((extractedData.length + 1).toString());
          }
          extractedData.push(rowData);
        }
      });

      // Add row number header if needed
      if (options.includeRowNumbers && headers.length > 0) {
        headers.unshift('#');
      }

      return {
        name: '', // Will be set by caller
        headers,
        rows: extractedData,
        metadata: options.includeMetadata ? {
          originalRowCount: rows.length,
          originalColumnCount: headers.length,
          exportedAt: format(new Date(), 'PPP p')
        } : undefined
      };
    } finally {
      // Restore original styles and scroll position
      table.style.width = originalWidth;
      table.style.maxWidth = originalMaxWidth;
      if (tableContainer) {
        tableContainer.style.overflow = originalOverflow || '';
        tableContainer.scrollLeft = originalScrollLeft;
      }
    }
  };

  const exportToPDF = (tablesData: TableData[], config: ExportConfig): void => {
    const pdf = new jsPDF('l', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    let yPosition = 20;

    // Add title
    pdf.setFontSize(18);
    pdf.setTextColor(40, 40, 40);
    pdf.text(`${config.tabName} - Exported Data`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Add metadata
    if (config.options.includeMetadata) {
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Generated: ${format(new Date(), 'PPP p')}`, 20, yPosition);
      yPosition += 8;
      pdf.text(`Tables: ${tablesData.length} | Total Rows: ${tablesData.reduce((sum, t) => sum + t.rows.length, 0)}`, 20, yPosition);
      yPosition += 15;
    }

    tablesData.forEach((tableData, index) => {
      // Check if we need a new page
      if (yPosition > pdf.internal.pageSize.getHeight() - 60 || (index > 0 && config.options.separateSheets)) {
        pdf.addPage();
        yPosition = 20;
      }

      // Add table title
      pdf.setFontSize(14);
      pdf.setTextColor(60, 60, 60);
      pdf.text(tableData.name, 20, yPosition);
      yPosition += 10;

      // Add table
      const tableConfig: {
        startY: number;
        head?: string[][];
        body: string[][];
        styles: Record<string, unknown>;
        headStyles: Record<string, unknown>;
        alternateRowStyles: Record<string, unknown>;
        margin: { left: number; right: number };
        tableWidth: string;
        columnStyles: Record<number, { columnWidth: number }>;
      } = {
        startY: yPosition,
        head: config.options.includeHeaders && tableData.headers.length > 0 ? [tableData.headers] : undefined,
        body: tableData.rows,
        styles: {
          fontSize: 8,
          cellPadding: 2,
          overflow: 'linebreak',
          columnWidth: 'wrap'
        },
        headStyles: {
          fillColor: [66, 139, 202],
          textColor: 255,
          fontSize: 9,
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        margin: { left: 20, right: 20 },
        tableWidth: 'auto',
        columnStyles: {}
      };

      // Adjust column widths based on content
      if (tableData.headers.length > 0) {
        const maxColumns = Math.min(tableData.headers.length, 8); // Limit columns for readability
        const columnWidth = (pageWidth - 40) / maxColumns;
        
        for (let i = 0; i < maxColumns; i++) {
          tableConfig.columnStyles[i] = { columnWidth: columnWidth };
        }
      }

      pdf.autoTable(tableConfig);
      yPosition = ((pdf as { lastAutoTable: { finalY: number } }) as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;
    });

    pdf.save(`${config.fileName}.pdf`);
  };

  const exportToCSV = (tablesData: TableData[], config: ExportConfig): void => {
    if (config.options.separateSheets && tablesData.length > 1) {
      // Create separate CSV files for each table
      tablesData.forEach(tableData => {
        const csvContent = createCSVContent(tableData, config.options);
        downloadCSV(csvContent, `${config.fileName}-${tableData.name.replace(/[^a-z0-9]/gi, '_')}.csv`);
      });
    } else {
      // Single CSV file with all tables
      let csvContent = '';
      
      if (config.options.includeMetadata) {
        csvContent += `${config.tabName} - Exported Data\n`;
        csvContent += `Generated: ${format(new Date(), 'PPP p')}\n`;
        csvContent += `Tables: ${tablesData.length}\n\n`;
      }
      
      tablesData.forEach((tableData, index) => {
        if (index > 0) csvContent += '\n';
        csvContent += `${tableData.name}\n`;
        csvContent += createCSVContent(tableData, config.options);
        csvContent += '\n';
      });
      
      downloadCSV(csvContent, `${config.fileName}.csv`);
    }
  };

  const createCSVContent = (tableData: TableData, options: ExportConfig['options']): string => {
    const lines: string[] = [];
    
    // Add headers
    if (options.includeHeaders && tableData.headers.length > 0) {
      lines.push(tableData.headers.map(escapeCSVValue).join(','));
    }
    
    // Add data rows
    tableData.rows.forEach(row => {
      lines.push(row.map(escapeCSVValue).join(','));
    });
    
    return lines.join('\n');
  };

  const escapeCSVValue = (value: string): string => {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  };

  const downloadCSV = (content: string, fileName: string): void => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportDisplayedData = async (config: ExportConfig): Promise<void> => {
    setIsExporting(true);
    
    try {
      // Extract data from all selected tables
      const tablesData: TableData[] = config.tables
        .filter(table => table.element)
        .map(table => {
          const data = extractTableData(table.element!, config.options);
          return {
            ...data,
            name: table.name
          };
        });

      if (tablesData.length === 0) {
        throw new Error('No table data to export');
      }

      // Export based on format
      switch (config.format) {
        case 'pdf':
          exportToPDF(tablesData, config);
          break;
        case 'csv':
          exportToCSV(tablesData, config);
          break;
        case 'excel':
          // For now, export as CSV with Excel-friendly format
          // TODO: Implement proper Excel export with libraries like ExcelJS
          exportToCSV(tablesData, config);
          break;
        default:
          throw new Error(`Unsupported export format: ${config.format}`);
      }
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    } finally {
      setIsExporting(false);
    }
  };

  return {
    exportDisplayedData,
    isExporting,
    scanForTables,
    scanForTablesIncludingSubTabs
  };
};
