import { useState } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { SalesData, SessionData, NewClientData, PayrollData, LateCancellationsData, DiscountAnalysisData } from '@/types/dashboard';
import { format } from 'date-fns';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface ExportOptions {
  format: 'pdf' | 'csv';
  fileName?: string;
  includeCharts?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
}

interface ExportData {
  salesData?: SalesData[];
  sessionsData?: SessionData[];
  newClientData?: NewClientData[];
  payrollData?: PayrollData[];
  lateCancellationsData?: LateCancellationsData[];
  discountData?: DiscountAnalysisData[];
  additionalData?: Record<string, any[]>;
}

export const useAdvancedExport = () => {
  const [isExporting, setIsExporting] = useState(false);

  const convertToCSV = (data: any[], headers: string[]): string => {
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          if (value === null || value === undefined) return '';
          if (typeof value === 'string' && value.includes(',')) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');
    
    return csvContent;
  };

  const downloadCSV = (content: string, fileName: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generatePDF = (exportData: ExportData, options: ExportOptions): jsPDF => {
    const pdf = new jsPDF('l', 'mm', 'a4'); // Landscape orientation for better table display
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Add title
    pdf.setFontSize(20);
    pdf.setTextColor(40, 40, 40);
    pdf.text('Complete Dashboard Export', pageWidth / 2, 20, { align: 'center' });
    
    // Add export info
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    const exportDate = format(new Date(), 'PPP p');
    pdf.text(`Generated on: ${exportDate}`, 20, 30);
    
    if (options.dateRange) {
      pdf.text(`Date Range: ${format(new Date(options.dateRange.start), 'PP')} - ${format(new Date(options.dateRange.end), 'PP')}`, 20, 35);
    }
    
    let yPosition = 45;

    // Sales Data Section
    if (exportData.salesData && exportData.salesData.length > 0) {
      yPosition = addTableToPDF(pdf, 'Sales Analytics Data', exportData.salesData, yPosition, [
        'customerName', 'paymentDate', 'membershipType', 'paymentValue', 'calculatedLocation', 'soldBy', 'paymentMethod'
      ]);
    }

    // Sessions Data Section
    if (exportData.sessionsData && exportData.sessionsData.length > 0) {
      yPosition = addTableToPDF(pdf, 'Sessions Data', exportData.sessionsData, yPosition, [
        'date', 'classType', 'instructor', 'location', 'capacity', 'checkedIn', 'fillPercentage'
      ]);
    }

    // New Client Data Section
    if (exportData.newClientData && exportData.newClientData.length > 0) {
      yPosition = addTableToPDF(pdf, 'Client Conversion Data', exportData.newClientData, yPosition, [
        'firstName', 'lastName', 'email', 'firstVisitDate', 'firstVisitLocation', 'conversionStatus', 'ltv'
      ]);
    }

    // Payroll Data Section
    if (exportData.payrollData && exportData.payrollData.length > 0) {
      yPosition = addTableToPDF(pdf, 'Trainer Performance Data', exportData.payrollData, yPosition, [
        'teacherName', 'location', 'totalSessions', 'totalCustomers', 'totalPaid', 'conversion', 'retention'
      ]);
    }

    // Late Cancellations Data Section
    if (exportData.lateCancellationsData && exportData.lateCancellationsData.length > 0) {
      yPosition = addTableToPDF(pdf, 'Late Cancellations Data', exportData.lateCancellationsData, yPosition, [
        'firstName', 'lastName', 'sessionName', 'teacherName', 'location', 'dateIST', 'time'
      ]);
    }

    // Discount Data Section
    if (exportData.discountData && exportData.discountData.length > 0) {
      yPosition = addTableToPDF(pdf, 'Discounts & Promotions Data', exportData.discountData, yPosition, [
        'firstName', 'lastName', 'cleanedProduct', 'mrpPostTax', 'discountAmount', 'discountPercentage', 'location'
      ]);
    }

    // Additional Data Sections
    if (exportData.additionalData) {
      Object.entries(exportData.additionalData).forEach(([sectionName, data]) => {
        if (data && data.length > 0) {
          const headers = Object.keys(data[0]).slice(0, 7); // Limit to first 7 columns for readability
          yPosition = addTableToPDF(pdf, sectionName, data, yPosition, headers);
        }
      });
    }

    return pdf;
  };

  const addTableToPDF = (pdf: jsPDF, title: string, data: any[], yPosition: number, columns: string[]): number => {
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Check if we need a new page
    if (yPosition > pageHeight - 100) {
      pdf.addPage();
      yPosition = 20;
    }

    // Add section title
    pdf.setFontSize(14);
    pdf.setTextColor(60, 60, 60);
    pdf.text(title, 20, yPosition);
    yPosition += 10;

    // Prepare table data
    const tableData = data.slice(0, 100).map(row => // Limit to first 100 rows per section
      columns.map(col => {
        const value = row[col];
        if (value === null || value === undefined) return '';
        if (typeof value === 'number') return value.toLocaleString();
        return String(value);
      })
    );

    // Add table
    pdf.autoTable({
      head: [columns.map(col => col.charAt(0).toUpperCase() + col.slice(1).replace(/([A-Z])/g, ' $1'))],
      body: tableData,
      startY: yPosition,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [66, 139, 202],
        textColor: 255,
        fontSize: 9,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      margin: { left: 20, right: 20 },
    });

    return (pdf as any).lastAutoTable.finalY + 15;
  };

  const exportAllData = async (exportData: ExportData, options: ExportOptions) => {
    setIsExporting(true);
    
    try {
      const fileName = options.fileName || `dashboard-export-${format(new Date(), 'yyyy-MM-dd-HH-mm')}`;
      
      if (options.format === 'pdf') {
        const pdf = generatePDF(exportData, options);
        pdf.save(`${fileName}.pdf`);
      } else if (options.format === 'csv') {
        // Create a zip file with multiple CSV files
        let csvContent = '';
        const sections: string[] = [];

        if (exportData.salesData?.length) {
          const headers = Object.keys(exportData.salesData[0]);
          csvContent += `Sales Analytics Data\n${convertToCSV(exportData.salesData, headers)}\n\n`;
          sections.push('Sales');
        }

        if (exportData.sessionsData?.length) {
          const headers = Object.keys(exportData.sessionsData[0]);
          csvContent += `Sessions Data\n${convertToCSV(exportData.sessionsData, headers)}\n\n`;
          sections.push('Sessions');
        }

        if (exportData.newClientData?.length) {
          const headers = Object.keys(exportData.newClientData[0]);
          csvContent += `Client Conversion Data\n${convertToCSV(exportData.newClientData, headers)}\n\n`;
          sections.push('Client Conversion');
        }

        if (exportData.payrollData?.length) {
          const headers = Object.keys(exportData.payrollData[0]);
          csvContent += `Trainer Performance Data\n${convertToCSV(exportData.payrollData, headers)}\n\n`;
          sections.push('Trainer Performance');
        }

        if (exportData.lateCancellationsData?.length) {
          const headers = Object.keys(exportData.lateCancellationsData[0]);
          csvContent += `Late Cancellations Data\n${convertToCSV(exportData.lateCancellationsData, headers)}\n\n`;
          sections.push('Late Cancellations');
        }

        if (exportData.discountData?.length) {
          const headers = Object.keys(exportData.discountData[0]);
          csvContent += `Discounts & Promotions Data\n${convertToCSV(exportData.discountData, headers)}\n\n`;
          sections.push('Discounts');
        }

        if (exportData.additionalData) {
          Object.entries(exportData.additionalData).forEach(([sectionName, data]) => {
            if (data?.length) {
              const headers = Object.keys(data[0]);
              csvContent += `${sectionName}\n${convertToCSV(data, headers)}\n\n`;
              sections.push(sectionName);
            }
          });
        }

        downloadCSV(csvContent, `${fileName}.csv`);
      }
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    } finally {
      setIsExporting(false);
    }
  };

  return {
    exportAllData,
    isExporting
  };
};