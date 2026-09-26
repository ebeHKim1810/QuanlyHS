import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Invoice, ReceiptThemeId } from '../../types';
import { Modal } from '../common/Modal';
import { ReceiptTemplate } from './ReceiptTemplate';
import { MobileReceiptTemplate } from './MobileReceiptTemplate';
import { ExportService } from '../../services/exportPdf';
import { THEME_LIST } from './ReceiptThemes';
import {
  Printer,
  Download,
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  Trash2,
  Smartphone,
  FileText,
  Palette,
  Check,
} from 'lucide-react';

interface ReceiptPreviewModalProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReceiptPreviewModal: React.FC<ReceiptPreviewModalProps> = ({
  invoice,
  isOpen,
  onClose,
}) => {
  const { settings, updateInvoicePayment, deleteOrVoidInvoice, addToast } = useApp();

  const [activeView, setActiveView] = useState<'a4' | 'mobile'>('a4');
  const [selectedTheme, setSelectedTheme] = useState<ReceiptThemeId | null>(null);
  const [showComment, setShowComment] = useState<boolean | null>(null);
  const [displayMode, setDisplayMode] = useState<'STANDARD' | 'COMPACT' | null>(null);
  const [showBankInfo, setShowBankInfo] = useState<boolean | null>(null);

  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingImage, setIsExportingImage] = useState(false);

  if (!invoice) return null;

  // Active theme, comment, display mode, & bank info override if user adjusts them in modal
  const effectiveTheme = selectedTheme || invoice.receiptTheme || 'soft_pink';
  const effectiveShowComment = showComment !== null ? showComment : invoice.showComment;
  const effectiveDisplayMode = displayMode !== null ? displayMode : (invoice.lessonDisplayMode || 'STANDARD');
  const effectiveShowBankInfo = showBankInfo !== null ? showBankInfo : (invoice.showBankInfo ?? false);

  const currentInvoice: Invoice = {
    ...invoice,
    receiptTheme: effectiveTheme,
    showComment: effectiveShowComment,
    lessonDisplayMode: effectiveDisplayMode,
    showBankInfo: effectiveShowBankInfo,
  };

  const a4ReceiptElementId = `receipt-print-${invoice.id}`;
  const mobileReceiptElementId = `mobile-receipt-${invoice.id}`;
  const baseFileName = `Phieu-hoc-phi-${invoice.studentNameSnapshot}-${invoice.issuedAt}`;

  const handleDownloadPdf = async () => {
    try {
      setIsExportingPdf(true);
      await ExportService.exportToPdf({
        elementId: a4ReceiptElementId,
        fileName: `${baseFileName}.pdf`,
      });
      addToast('Tải PDF thành công', `Đã lưu tệp ${baseFileName}.pdf`, 'success');
    } catch (err: any) {
      alert('Không thể xuất file PDF: ' + err.message);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleDownloadImage = async () => {
    try {
      setIsExportingImage(true);
      // If mobile view is active, capture mobile component; otherwise capture standard component
      const targetElementId = activeView === 'mobile' ? mobileReceiptElementId : a4ReceiptElementId;
      await ExportService.exportToImage({
        elementId: targetElementId,
        fileName: `${baseFileName}.png`,
      });
      addToast('Tải ảnh PNG thành công', `Đã lưu ảnh phiếu học phí`, 'success');
    } catch (err: any) {
      alert('Không thể xuất ảnh: ' + (err.message || 'Lỗi không xác định'));
    } finally {
      setIsExportingImage(false);
    }
  };

  const handlePrint = () => {
    ExportService.printElement();
  };

  const handleTogglePayment = async () => {
    const nextStatus = invoice.paymentStatus === 'PAID' ? 'UNPAID' : 'PAID';
    await updateInvoicePayment(invoice.id, nextStatus);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Chi Tiết Phiếu Thu: ${invoice.invoiceNumber}`}
      subtitle={`Học sinh: ${invoice.studentNameSnapshot} • ${invoice.totalAmount.toLocaleString('vi-VN')} đ`}
      maxWidth="4xl"
    >
      <div className="space-y-5">
        {/* Top View Selector & Action Toolbar */}
        <div className="bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 flex flex-wrap items-center justify-between gap-3 no-print">
          {/* View Mode Switcher (A4 vs Mobile) */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 dark:bg-slate-900/60 rounded-xl">
            <button
              onClick={() => setActiveView('a4')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeView === 'a4'
                  ? 'bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Bản Chuẩn (A4 / PDF)</span>
            </button>

            <button
              onClick={() => setActiveView('mobile')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeView === 'mobile'
                  ? 'bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Bản Điện Thoại (Zalo / PNG)</span>
            </button>
          </div>

          {/* Payment Status Action */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleTogglePayment}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                invoice.paymentStatus === 'PAID'
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-amber-500 hover:bg-amber-600 text-white'
              }`}
            >
              {invoice.paymentStatus === 'PAID' ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>ĐÃ THANH TOÁN (Bấm để đổi)</span>
                </>
              ) : (
                <>
                  <Clock className="w-3.5 h-3.5" />
                  <span>CHƯA THANH TOÁN (Xác nhận)</span>
                </>
              )}
            </button>
          </div>

          {/* Export & Print Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-700 transition-all shadow-xs"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>In phiếu</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isExportingPdf}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-xl border border-indigo-200 dark:border-indigo-800 transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isExportingPdf ? 'Đang xuất PDF...' : 'Tải PDF'}</span>
            </button>

            <button
              onClick={handleDownloadImage}
              disabled={isExportingImage}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-xs disabled:opacity-50"
            >
              <ImageIcon className="w-4 h-4" />
              <span>{isExportingImage ? 'Đang xuất ảnh...' : 'Tải ảnh PNG'}</span>
            </button>

            <button
              onClick={() => deleteOrVoidInvoice(invoice.id)}
              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition-colors ml-1"
              title="Xóa/Hủy phiếu này (sẽ tự động mở khóa các buổi học)"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Theme Picker, Display Mode, Bank Info & Comment Toggle toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-1 no-print">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Đổi màu Pastel:
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              {THEME_LIST.map((th) => (
                <button
                  key={th.id}
                  onClick={() => setSelectedTheme(th.id)}
                  className={`w-6 h-6 rounded-full border border-black/10 flex items-center justify-center transition-transform ${
                    effectiveTheme === th.id ? 'scale-125 ring-2 ring-indigo-500' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: th.previewColor }}
                  title={th.name}
                >
                  {effectiveTheme === th.id && <Check className="w-3.5 h-3.5 text-slate-800" />}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Display Mode toggle */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setDisplayMode('STANDARD')}
                className={`px-2 py-1 rounded-md font-semibold transition-all ${
                  effectiveDisplayMode === 'STANDARD'
                    ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-400 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Bảng đầy đủ
              </button>
              <button
                type="button"
                onClick={() => setDisplayMode('COMPACT')}
                className={`px-2 py-1 rounded-md font-semibold transition-all ${
                  effectiveDisplayMode === 'COMPACT'
                    ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-400 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Ngày gọn (DD/MM)
              </button>
            </div>

            {/* Bank info toggle */}
            <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-slate-600 dark:text-slate-300">
              <input
                type="checkbox"
                checked={effectiveShowBankInfo}
                onChange={(e) => setShowBankInfo(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <span>Hiện ngân hàng/QR</span>
            </label>

            {/* Comment toggle */}
            <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-slate-600 dark:text-slate-300">
              <input
                type="checkbox"
                checked={effectiveShowComment}
                onChange={(e) => setShowComment(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <span>Hiện nhận xét</span>
            </label>
          </div>
        </div>

        {/* View Content Display */}
        {activeView === 'a4' ? (
          <div className="overflow-x-auto py-2 flex justify-center">
            <ReceiptTemplate
              invoice={currentInvoice}
              settings={settings}
              elementId={a4ReceiptElementId}
            />
          </div>
        ) : (
          <div className="py-2 flex flex-col items-center gap-3">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Bản xem trước ảnh gửi qua Zalo / Messenger (Chiều rộng ~1000px khi tải về, tỉ lệ dọc chuẩn điện thoại):
            </div>
            <div className="p-4 bg-slate-100/80 dark:bg-slate-950/60 rounded-3xl border border-slate-200/80 dark:border-slate-800 flex justify-center w-full overflow-x-auto">
              <MobileReceiptTemplate
                invoice={currentInvoice}
                settings={settings}
                elementId={mobileReceiptElementId}
              />
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
