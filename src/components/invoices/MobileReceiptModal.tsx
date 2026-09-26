import React, { useState } from 'react';
import { Invoice, ReceiptThemeId, LessonDisplayMode } from '../../types';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { MobileReceiptTemplate } from './MobileReceiptTemplate';
import { ExportService, sanitizeFileName } from '../../services/exportPdf';
import { THEME_LIST } from './ReceiptThemes';
import { Download, Palette, MessageSquareQuote, Check, Sparkles } from 'lucide-react';

interface MobileReceiptModalProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
}

export const MobileReceiptModal: React.FC<MobileReceiptModalProps> = ({
  invoice,
  isOpen,
  onClose,
}) => {
  const { settings, addToast } = useApp();

  const [selectedTheme, setSelectedTheme] = useState<ReceiptThemeId>(
    invoice?.receiptTheme || 'soft_pink'
  );
  const [showComment, setShowComment] = useState<boolean>(invoice?.showComment ?? true);
  const [lessonDisplayMode, setLessonDisplayMode] = useState<LessonDisplayMode>(
    invoice?.lessonDisplayMode || 'STANDARD'
  );
  const [showBankInfo, setShowBankInfo] = useState<boolean>(
    invoice?.showBankInfo ?? false
  );
  const [isExporting, setIsExporting] = useState(false);

  if (!invoice) return null;

  // Clone invoice with selected modal theme, display mode, bank info & comment visibility for live preview & capture
  const displayInvoice: Invoice = {
    ...invoice,
    receiptTheme: selectedTheme,
    showComment: showComment,
    lessonDisplayMode,
    showBankInfo,
  };

  const captureElementId = `mobile-receipt-modal-${invoice.id}`;
  const baseName = `Phieu-hoc-phi-${invoice.studentNameSnapshot}-${invoice.issuedAt}`;

  const handleDownloadPng = async () => {
    try {
      setIsExporting(true);
      await ExportService.exportToImage({
        elementId: captureElementId,
        fileName: `${baseName}.png`,
      });
      addToast('Tải ảnh PNG thành công', `Đã lưu ảnh phiếu học phí cho ${invoice.studentNameSnapshot}`, 'success');
    } catch (err: any) {
      console.error('Image export failed:', err);
      addToast('Lỗi xuất ảnh', 'Không thể tạo ảnh phiếu học phí. Vui lòng thử lại.', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Bản Ảnh Điện Thoại (Zalo / Messenger)"
      subtitle={`Học sinh: ${invoice.studentNameSnapshot} • ${invoice.totalAmount.toLocaleString('vi-VN')} đ`}
      maxWidth="3xl"
    >
      <div className="space-y-6">
        {/* Controls Bar: Theme, Mode, Bank Info & Comment Selector */}
        <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-3.5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                Giao diện Pastel:
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Display Mode Switcher */}
              <div className="flex items-center gap-1 bg-slate-200/80 dark:bg-slate-900/60 p-0.5 rounded-lg text-xs">
                <button
                  type="button"
                  onClick={() => setLessonDisplayMode('STANDARD')}
                  className={`px-2 py-1 rounded-md font-semibold transition-all ${
                    lessonDisplayMode === 'STANDARD'
                      ? 'bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-400 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Đầy đủ
                </button>
                <button
                  type="button"
                  onClick={() => setLessonDisplayMode('COMPACT')}
                  className={`px-2 py-1 rounded-md font-semibold transition-all ${
                    lessonDisplayMode === 'COMPACT'
                      ? 'bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-400 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Ngày gọn
                </button>
              </div>

              {/* Bank info toggle */}
              <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-600 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={showBankInfo}
                  onChange={(e) => setShowBankInfo(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <span>Ngân hàng/QR</span>
              </label>

              {/* Comment toggle */}
              <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-600 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={showComment}
                  onChange={(e) => setShowComment(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <span>Hiện nhận xét</span>
              </label>
            </div>
          </div>

          {/* Theme Pills */}
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {THEME_LIST.map((th) => {
              const isSelected = selectedTheme === th.id;
              return (
                <button
                  key={th.id}
                  onClick={() => setSelectedTheme(th.id)}
                  type="button"
                  className={`flex flex-col items-center gap-1 p-1.5 rounded-xl border text-center transition-all ${
                    isSelected
                      ? 'border-indigo-600 dark:border-indigo-400 bg-white dark:bg-slate-900 shadow-xs ring-2 ring-indigo-500/20'
                      : 'border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/60 hover:border-slate-300'
                  }`}
                  title={th.name}
                >
                  <span
                    className="w-5 h-5 rounded-full border border-black/10 shrink-0 flex items-center justify-center"
                    style={{ backgroundColor: th.previewColor }}
                  >
                    {isSelected && <Check className="w-3 h-3 text-slate-800" />}
                  </span>
                  <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate w-full">
                    {th.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between px-1">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Xem trước ảnh hiển thị trên điện thoại (độ phân giải cao, phù hợp gửi qua Zalo, Messenger):
          </div>

          <button
            onClick={handleDownloadPng}
            disabled={isExporting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-md shadow-indigo-100 dark:shadow-none transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Đang tạo ảnh...' : 'Tải ảnh PNG'}</span>
          </button>
        </div>

        {/* Centered Phone Preview Box */}
        <div className="flex justify-center p-4 bg-slate-100/80 dark:bg-slate-950/60 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-x-auto">
          <MobileReceiptTemplate
            invoice={displayInvoice}
            settings={settings}
            elementId={captureElementId}
          />
        </div>
      </div>
    </Modal>
  );
};
