import React from 'react';
import { Invoice, TeacherSettings } from '../../types';
import { RECEIPT_THEMES } from './ReceiptThemes';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Sparkles, Calendar, BookOpen, User, CreditCard, MessageSquareQuote } from 'lucide-react';

interface MobileReceiptTemplateProps {
  invoice: Invoice;
  settings: TeacherSettings;
  elementId?: string;
}

export const MobileReceiptTemplate: React.FC<MobileReceiptTemplateProps> = ({
  invoice,
  settings,
  elementId = 'mobile-receipt-capture',
}) => {
  const theme = RECEIPT_THEMES[invoice.receiptTheme] || RECEIPT_THEMES.soft_pink;

  const formattedIssueDate = format(parseISO(invoice.issuedAt), "'Ngày' dd/MM/yyyy", {
    locale: vi,
  });

  // Tuition mode text and unit price display
  const isPerPeriod = invoice.tuitionModeSnapshot === 'PER_PERIOD';
  const unitPriceFormatted = `${invoice.unitPriceSnapshot.toLocaleString('vi-VN')} đ / ${
    isPerPeriod ? 'tiết' : 'buổi'
  }`;

  // VietQR URL if bank information is provided
  const vietQrUrl =
    settings.bankName && settings.bankAccountNumber
      ? `https://img.vietqr.io/image/${encodeURIComponent(settings.bankName)}-${encodeURIComponent(
          settings.bankAccountNumber
        )}-compact.png?amount=${invoice.totalAmount}&addInfo=${encodeURIComponent(
          invoice.invoiceNumber + ' ' + invoice.studentNameSnapshot
        )}&accountName=${encodeURIComponent(settings.bankAccountName || settings.teacherName)}`
      : null;

  return (
    <div
      id={elementId}
      className={`relative bg-white text-slate-800 rounded-3xl border ${theme.tableBorder} shadow-lg overflow-hidden mx-auto`}
      style={{
        width: '420px',
        maxWidth: '100%',
        minHeight: '620px',
        boxSizing: 'border-box',
        fontFamily: '"Be Vietnam Pro", "Plus Jakarta Sans", system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Decorative top wave/gradient bar */}
      <div className={`h-3 w-full ${theme.pillBg}`} />

      {/* Main Header Card */}
      <div className={`p-6 border-b ${theme.headerBorder} ${theme.headerBg} relative`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase ${theme.pillBg} ${theme.pillText}`}>
              {invoice.invoiceNumber}
            </span>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {formattedIssueDate}
          </span>
        </div>

        <div className="text-center pt-1 pb-2">
          <h1 className={`text-2xl font-black tracking-tight ${theme.accentText} uppercase`}>
            PHIẾU HỌC PHÍ
          </h1>
          <p className="text-xs font-semibold text-slate-600 mt-1">
            {settings.centerName || 'Lớp Bồi Dưỡng Văn Hóa & Kỹ Năng'}
          </p>
          {settings.teacherName && (
            <p className="text-[11px] text-slate-500">
              Giáo viên: <span className="font-semibold text-slate-700">{settings.teacherName}</span>
              {settings.phone ? ` • ${settings.phone}` : ''}
            </p>
          )}
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Student & Tuition Rate Section */}
        <div className="bg-slate-50/90 rounded-2xl p-4 border border-slate-200/80 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Học sinh
              </span>
              <h2 className="text-lg font-black text-slate-900 leading-snug mt-0.5">
                {invoice.studentNameSnapshot}
              </h2>
              {invoice.studentPhoneSnapshot && (
                <span className="text-xs text-slate-500">SĐT: {invoice.studentPhoneSnapshot}</span>
              )}
            </div>

            <div className="text-right">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Học phí
              </span>
              <span className="inline-block text-xs font-bold text-slate-800 bg-white px-2.5 py-1 rounded-lg border border-slate-200/90 mt-0.5 shadow-2xs">
                {unitPriceFormatted}
              </span>
            </div>
          </div>
        </div>

        {/* Lesson List: MODE 1 (STANDARD) or MODE 2 (COMPACT HORIZONTAL) */}
        {invoice.lessonDisplayMode === 'COMPACT' ? (
          <div>
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Các buổi học ({invoice.items.length} buổi)
              </span>
              <span className="text-[11px] font-medium text-slate-400">
                Dạng ngày gọn
              </span>
            </div>

            <div className={`rounded-2xl border ${theme.tableBorder} p-3.5 bg-slate-50/60 flex flex-wrap gap-2`}>
              {invoice.items.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold font-mono border ${theme.tableBorder} ${theme.pillBg} ${theme.pillText} shadow-2xs`}
                >
                  {format(parseISO(item.lessonDate), 'dd/MM')}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Các buổi học ({invoice.items.length} buổi)
              </span>
              <span className="text-[11px] font-medium text-slate-500">
                {invoice.tuitionModeSnapshot === 'PER_PERIOD' ? 'Tiết học' : 'Giờ học'}
              </span>
            </div>

            <div className="rounded-2xl border border-slate-200/90 overflow-hidden bg-white divide-y divide-slate-100">
              {invoice.items.map((item, idx) => (
                <div key={item.id || idx} className="p-2.5 px-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div>
                      <span className="text-xs font-bold text-slate-800">
                        {format(parseISO(item.lessonDate), 'dd/MM/yyyy')}
                      </span>
                      <span className="text-xs text-slate-500 font-mono ml-2">
                        — {item.startTime}–{item.endTime}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-700">
                      {item.amount.toLocaleString('vi-VN')} đ
                    </span>
                    {item.periodCount && invoice.tuitionModeSnapshot === 'PER_PERIOD' && (
                      <span className="block text-[10px] text-slate-400">
                        {item.periodCount} tiết
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Total Amount Box */}
        <div className={`p-4 rounded-2xl border ${theme.totalBoxBorder} ${theme.totalBoxBg} space-y-2`}>
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span>Tổng số buổi:</span>
            <span className="font-bold text-slate-800">{invoice.lessonCount} buổi</span>
          </div>

          {invoice.discount > 0 && (
            <div className="flex items-center justify-between text-xs text-rose-600">
              <span>Giảm trừ:</span>
              <span className="font-bold">-{invoice.discount.toLocaleString('vi-VN')} đ</span>
            </div>
          )}

          <div className="pt-2 border-t border-slate-200/60 flex items-baseline justify-between">
            <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
              TỔNG TIỀN
            </span>
            <span className={`text-2xl font-black ${theme.accentText} font-display`}>
              {invoice.totalAmount.toLocaleString('vi-VN')} đ
            </span>
          </div>
        </div>

        {/* Teacher Comment (only if showComment === true and teacherComment exists) */}
        {invoice.showComment && invoice.teacherComment && (
          <div className="bg-amber-50/70 border border-amber-200/70 rounded-2xl p-3.5 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
              <MessageSquareQuote className="w-3.5 h-3.5" />
              <span>Lời nhắn của giáo viên</span>
            </div>
            <p className="text-xs text-amber-900 leading-relaxed italic">
              "{invoice.teacherComment}"
            </p>
          </div>
        )}

        {/* Optional Payment & Bank Section (Only when showBankInfo is ON) */}
        {invoice.showBankInfo && (
          <div className={`p-4 rounded-2xl border ${theme.tableBorder} bg-slate-50/80`}>
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1 min-w-0 flex-1">
                <span className={`text-[10px] font-bold uppercase tracking-wider block ${theme.accentText}`}>
                  THANH TOÁN
                </span>
                {(invoice.bankNameSnapshot || settings.bankName) && (
                  <p className="text-xs font-bold text-slate-800 truncate">
                    {invoice.bankNameSnapshot || settings.bankName}
                  </p>
                )}
                {(invoice.bankAccountNumberSnapshot || settings.bankAccountNumber) && (
                  <p className={`text-xs font-mono font-bold tracking-wider ${theme.accentText}`}>
                    {invoice.bankAccountNumberSnapshot || settings.bankAccountNumber}
                  </p>
                )}
                {(invoice.bankAccountHolderSnapshot || settings.bankAccountName || settings.teacherName) && (
                  <p className="text-[11px] text-slate-600 uppercase font-semibold">
                    {invoice.bankAccountHolderSnapshot || settings.bankAccountName || settings.teacherName}
                  </p>
                )}
                <p className="text-xs font-bold text-slate-900 pt-0.5">
                  Số tiền:{' '}
                  <span className={`font-mono font-black ${theme.accentText}`}>
                    {invoice.totalAmount.toLocaleString('vi-VN')} đ
                  </span>
                </p>
                {(invoice.transferNoteSnapshot || settings.transferNoteTemplate || invoice.invoiceNumber) && (
                  <p className="text-[10px] text-slate-500 pt-0.5">
                    Nội dung:{' '}
                    <span className="font-semibold text-slate-700 font-mono">
                      {invoice.transferNoteSnapshot ||
                        (settings.transferNoteTemplate
                          ? settings.transferNoteTemplate.replace('{studentName}', invoice.studentNameSnapshot)
                          : `${invoice.invoiceNumber} ${invoice.studentNameSnapshot}`)}
                    </span>
                  </p>
                )}
              </div>

              {/* QR Image displayed only if exists */}
              {(invoice.qrImageUrlSnapshot || settings.qrImageUrl) && (
                <div className="shrink-0 text-center">
                  <img
                    src={invoice.qrImageUrlSnapshot || settings.qrImageUrl}
                    alt="Mã QR Thanh Toán"
                    className="w-20 h-20 rounded-xl border border-slate-200 bg-white p-1 shadow-xs object-contain"
                  />
                  <span className="text-[9px] text-slate-400 font-medium block mt-0.5">
                    Quét mã QR
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Subtle Footer Note */}
        <div className="text-center pt-1 pb-2">
          <p className="text-[11px] text-slate-400 leading-relaxed">
            {settings.footerNotes || 'Cảm ơn Quý phụ huynh đã đồng hành cùng con!'}
          </p>
        </div>
      </div>
    </div>
  );
};
