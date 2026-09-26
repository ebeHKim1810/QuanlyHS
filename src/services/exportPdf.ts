import _html2canvas from 'html2canvas';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

const html2canvas = typeof _html2canvas === 'function' ? _html2canvas : ((_html2canvas as any)?.default || _html2canvas);

export interface ExportReceiptOptions {
  elementId: string;
  fileName: string;
}

/**
 * Sanitize filename to ensure safe download across all operating systems and browsers
 */
export function sanitizeFileName(name: string): string {
  return name
    .trim()
    .replace(/[/\\?%*:|"<>#]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export class ExportService {
  /**
   * Export the receipt element as a high-resolution PDF
   */
  static async exportToPdf({ elementId, fileName }: ExportReceiptOptions): Promise<void> {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Không tìm thấy phần tử HTML với ID: ${elementId}`);
    }

    // Capture element with 2.5x scaling for sharp text and border rendering
    const canvas = await html2canvas(element, {
      scale: 2.5,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: element.scrollWidth,
    });

    const imgData = canvas.toDataURL('image/png', 1.0);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Available width with standard 10mm margins on left and right
    const margin = 10;
    const contentWidth = pdfWidth - margin * 2;
    const contentHeight = (canvas.height * contentWidth) / canvas.width;

    let yPosition = margin;

    // If receipt height fits comfortably on one A4 page
    if (contentHeight <= pdfHeight - margin * 2) {
      pdf.addImage(imgData, 'PNG', margin, yPosition, contentWidth, contentHeight, undefined, 'FAST');
    } else {
      // For very long receipts with dozens of lessons, paginate cleanly
      let remainingHeight = contentHeight;
      let position = 0;

      while (remainingHeight > 0) {
        pdf.addImage(imgData, 'PNG', margin, position + margin, contentWidth, contentHeight, undefined, 'FAST');
        remainingHeight -= (pdfHeight - margin * 2);
        position -= (pdfHeight - margin * 2);

        if (remainingHeight > 0) {
          pdf.addPage();
        }
      }
    }

    // Save with sanitized filename
    const cleanFileName = sanitizeFileName(fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`);
    pdf.save(cleanFileName);
  }

  /**
   * Export receipt as high-resolution PNG image optimized for mobile & messaging apps
   */
  static async exportToImage({ elementId, fileName }: ExportReceiptOptions): Promise<void> {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Không tìm thấy phần tử HTML với ID: ${elementId}`);
    }

    let dataUrl: string;

    try {
      // Primary: try html-to-image for crisp vector/font rendering at high pixel density
      dataUrl = await toPng(element, {
        pixelRatio: 2.5,
        backgroundColor: '#ffffff',
        cacheBust: true,
        skipFonts: true,
      });
    } catch (primaryErr) {
      console.warn('html-to-image encountered issue, falling back to html2canvas:', primaryErr);
      // Fallback: html2canvas with 2.5x scaling
      const canvas = await html2canvas(element, {
        scale: 2.5,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });
      dataUrl = canvas.toDataURL('image/png');
    }

    const cleanBaseName = sanitizeFileName(fileName.replace(/\.png$/i, ''));
    const link = document.createElement('a');
    link.download = `${cleanBaseName}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Trigger native browser print
   */
  static printElement(): void {
    window.print();
  }
}
