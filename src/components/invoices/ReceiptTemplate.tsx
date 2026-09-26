import React from 'react';
import { Invoice, TeacherSettings } from '../../types';
import { RECEIPT_THEMES } from './ReceiptThemes';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { CheckCircle2, Clock, QrCode } from 'lucide-react';

interface ReceiptTemplateProps {
  invoice: Invoice;
  settings: TeacherSettings;
  elementId?: string;
  isPrintMode?: boolean;
}

// Helper to convert number to Vietnamese currency words
function numberToVietnameseWords(num: number): string {
  if (num === 0) return 'Không đồng';
  const units = ['', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
  const scales = ['', 'nghìn', 'triệu', 'tỷ'];

  function readGroup(n: number): string {
    const hundred = Math.floor(n / 100);
    const ten = Math.floor((n % 100) / 10);
    const unit = n % 10;
    let res = '';

    if (hundred > 0 || n >= 100) {
      res += units[hundred] + ' trăm ';
      if (ten === 0 && unit > 0) res += 'lẻ ';
    }
    if (ten === 1) {
      res += 'mười ';
    } else if (ten > 1) {
      res += units[ten] + ' mươi ';
    }
    if (ten > 0 && unit === 1 && ten !== 1) {
      res += 'mốt ';
    } else if (ten > 0 && unit === 5) {
      res += 'lăm ';
    } else if (unit > 0) {
      res += units[unit] + ' ';
    }
    return res.trim();
  }

  let s = Math.round(num).toString();
  let groups: number[] = [];
  while (s.length > 0) {
    const chunk = s.slice(Math.max(0, s.length - 3));
    groups.unshift(parseInt(chunk, 10));
    s = s.slice(0, Math.max(0, s.length - 3));
  }

  let words = '';
  for (let i = 0; i < groups.length; i++) {
    const groupVal = groups[i];
    const scaleIndex = groups.length - 1 - i;
    if (groupVal > 0) {
      words += readGroup(groupVal) + ' ' + scales[scaleIndex] + ' ';
    }
  }

  words = words.trim();
  if (!words) return '';
  return words.charAt(0).toUpperCase() + words.slice(1) + ' đồng chẵn.';
}

export const ReceiptTemplate: React.FC<ReceiptTemplateProps> = ({
  invoice,
  settings,
  elementId = 'printable-receipt',
  isPrintMode = false,
}) => {
  const theme = RECEIPT_THEMES[invoice.receiptTheme] || RECEIPT_THEMES.soft_pink;

  const formattedIssueDate = format(parseISO(invoice.issuedAt), "'Ngày' dd 'tháng' MM 'năm' yyyy", {
    locale: vi,
  });

  const amountInWords = numberToVietnameseWords(invoice.totalAmount);

  // Generate VietQR URL if teacher bank details exist
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
      className={`receipt-printable relative bg-white text-slate-800 rounded-3xl border ${theme.tableBorder} shadow-soft overflow-hidden mx-auto transition-all`}
      style={{ maxWidth: '780px', width: '100%' }}
    >
      {/* Top Pastel Header Banner */}
      <div className={`p-8 border-b ${theme.headerBorder} ${theme.headerBg} relative`}>
        {/* Subtle decorative circle */}
        <div
          className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-30 pointer-events-none"
          style={{ backgroundColor: theme.previewColor }}
        />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {settings.centerName || 'LỚP HỌC & GIA SƯ'}
            </div>
            <h1 className={`text-2xl sm:text-3xl font-extrabold mt-1 font-display ${theme.accentText}`}>
              PHIẾU HỌC PHÍ
            </h1>
            <div className="text-xs text-slate-600 mt-1 space-y-0.5">
              <div>
                Giáo viên: <span className="font-semibold text-slate-800">{settings.teacherName}</span>
              </div>
              <div>
                Hotline/Zalo: <span className="font-semibold text-slate-800">{settings.phone}</span>
              </div>
              {settings.address && <div>Địa chỉ: {settings.address}</div>}
            </div>
          </div>

          {/* Invoice Code & Status */}
          <div className="text-left sm:text-right shrink-0">
            <div className="text-xs text-slate-500 font-medium">Mã phiếu thu</div>
            <div className={`text-lg font-mono font-bold mt-0.5 ${theme.accentText}`}>
              {invoice.invoiceNumber}
            </div>
            <div className="text-xs text-slate-500 mt-1">{formattedIssueDate}</div>

            {/* Payment badge on receipt */}
            <div className="mt-2.5">
              {invoice.paymentStatus === 'PAID' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  ĐÃ THANH TOÁN
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  <Clock className="w-3.5 h-3.5" />
                  CHƯA THANH TOÁN
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Body: Student Info & Rate Snapshot */}
      <div className="p-8 space-y-6">
        {/* Student strip */}
        <div className={`p-4 rounded-2xl border ${theme.tableBorder} bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs`}>
          <div>
            <span className="text-slate-400 block font-medium">Họ và tên học sinh</span>
            <div className="text-base font-bold text-slate-900 mt-0.5">
              {invoice.studentNameSnapshot}
            </div>
            <div className="text-slate-500 mt-0.5">SĐT: {invoice.studentPhoneSnapshot}</div>
          </div>

          <div className="sm:text-right">
            <span className="text-slate-400 block font-medium">Mức thu áp dụng</span>
            <div className="text-sm font-bold text-slate-800 mt-0.5">
              {invoice.tuitionModeSnapshot === 'PER_SESSION'
                ? `${invoice.unitPriceSnapshot.toLocaleString('vi-VN')} đ / buổi`
                : `${invoice.unitPriceSnapshot.toLocaleString('vi-VN')} đ / tiết`}
            </div>
            <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${theme.pillBg} ${theme.pillText}`}>
              {invoice.tuitionModeSnapshot === 'PER_SESSION' ? 'Thu theo buổi' : 'Thu theo tiết'}
            </span>
          </div>
        </div>

        {/* Lessons List: MODE 1 (STANDARD Table) or MODE 2 (COMPACT Horizontal) */}
        {invoice.lessonDisplayMode === 'COMPACT' ? (
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
              <span>Các buổi học ({invoice.lessonCount} buổi)</span>
              <span className="text-[11px] font-normal text-slate-400">
                Dạng ngày gọn
              </span>
            </div>

            <div className={`p-4 rounded-2xl border ${theme.tableBorder} bg-slate-50/50 flex flex-wrap gap-2 items-center`}>
              {invoice.items.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className={`inline-flex items-center justify-center px-3 py-1.5 rounded-xl border ${theme.tableBorder} ${theme.pillBg} ${theme.pillText} font-bold text-xs font-mono shadow-2xs`}
                >
                  {format(parseISO(item.lessonDate), 'dd/MM')}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center justify-between">
              <span>Chi tiết các buổi học ({invoice.lessonCount} buổi)</span>
              <span className="text-[11px] font-normal lowercase text-slate-400">
                Đã kiểm tra điểm danh có mặt
              </span>
            </div>

            <div className={`rounded-2xl border ${theme.tableBorder} overflow-hidden`}>
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className={`${theme.tableHeaderBg} border-b ${theme.tableBorder} font-bold text-slate-700`}>
                    <th className="py-2.5 pl-4 w-12 text-center">STT</th>
                    <th className="py-2.5">Ngày học</th>
                    <th className="py-2.5">Thời gian</th>
                    <th className="py-2.5 text-center">Số tiết</th>
                    <th className="py-2.5 text-right">Đơn giá</th>
                    <th className="py-2.5 text-right pr-4">Thành tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoice.items.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 pl-4 text-center font-mono text-slate-400">{idx + 1}</td>
                      <td className="py-2.5 font-semibold text-slate-800">
                        {format(parseISO(item.lessonDate), 'dd/MM/yyyy')}
                      </td>
                      <td className="py-2.5 text-slate-600">
                        {item.startTime} – {item.endTime}
                      </td>
                      <td className="py-2.5 text-center text-slate-600 font-medium">
                        {item.periodCount} tiết
                      </td>
                      <td className="py-2.5 text-right text-slate-600 font-mono">
                        {item.unitPrice.toLocaleString('vi-VN')} đ
                      </td>
                      <td className="py-2.5 text-right pr-4 font-bold text-slate-900 font-mono">
                        {item.amount.toLocaleString('vi-VN')} đ
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Total Box */}
        <div className={`p-5 rounded-2xl border ${theme.totalBoxBorder} ${theme.totalBoxBg} space-y-2`}>
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span>Tổng số buổi học:</span>
            <span className="font-bold text-slate-800">{invoice.lessonCount} buổi</span>
          </div>

          {invoice.discount > 0 && (
            <div className="flex items-center justify-between text-xs text-rose-600">
              <span>Chiết khấu / Miễn giảm:</span>
              <span className="font-bold font-mono">
                -{invoice.discount.toLocaleString('vi-VN')} đ
              </span>
            </div>
          )}

          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
            <span className="text-sm font-bold uppercase tracking-wider text-slate-800">
              TỔNG TIỀN PHẢI THANH TOÁN:
            </span>
            <span className={`text-xl sm:text-2xl font-black font-display tracking-tight ${theme.accentText}`}>
              {invoice.totalAmount.toLocaleString('vi-VN')} đ
            </span>
          </div>

          <div className="text-[11px] text-slate-500 italic pt-1">
            Bằng chữ: <span className="font-semibold text-slate-700">{amountInWords}</span>
          </div>
        </div>

        {/* Optional Teacher Comment */}
        {invoice.showComment && invoice.teacherComment && (
          <div className={`p-4 rounded-2xl border ${theme.tableBorder} bg-white shadow-xs`}>
            <div className="text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <span>Nhận xét của giáo viên về tình hình học tập:</span>
            </div>
            <p className="text-xs text-slate-600 italic leading-relaxed pl-2 border-l-2 border-slate-300">
              "{invoice.teacherComment}"
            </p>
          </div>
        )}

        {/* Optional Bank & Payment Section (Enabled only when showBankInfo is ON) */}
        {invoice.showBankInfo && (
          <div className={`p-4 rounded-2xl border ${theme.tableBorder} bg-slate-50/70 text-xs`}>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className={`font-bold uppercase tracking-wider text-xs ${theme.accentText}`}>
                  THANH TOÁN / CHUYỂN KHOẢN HỌC PHÍ
                </div>
                {(invoice.bankNameSnapshot || settings.bankName) && (
                  <div className="text-slate-700">
                    Ngân hàng:{' '}
                    <span className="font-semibold text-slate-900">
                      {invoice.bankNameSnapshot || settings.bankName}
                    </span>
                  </div>
                )}
                {(invoice.bankAccountNumberSnapshot || settings.bankAccountNumber) && (
                  <div className="text-slate-700">
                    Số tài khoản:{' '}
                    <span className={`font-mono font-bold text-sm tracking-wider ${theme.accentText}`}>
                      {invoice.bankAccountNumberSnapshot || settings.bankAccountNumber}
                    </span>
                  </div>
                )}
                {(invoice.bankAccountHolderSnapshot || settings.bankAccountName || settings.teacherName) && (
                  <div className="text-slate-700">
                    Chủ tài khoản:{' '}
                    <span className="font-semibold text-slate-900 uppercase">
                      {invoice.bankAccountHolderSnapshot || settings.bankAccountName || settings.teacherName}
                    </span>
                  </div>
                )}
                <div className="text-slate-700">
                  Số tiền:{' '}
                  <span className={`font-bold font-mono text-sm ${theme.accentText}`}>
                    {invoice.totalAmount.toLocaleString('vi-VN')} đ
                  </span>
                </div>
                {(invoice.transferNoteSnapshot || settings.transferNoteTemplate || invoice.invoiceNumber) && (
                  <div className="text-slate-600 text-[11px] pt-0.5">
                    Nội dung chuyển khoản:{' '}
                    <span className="font-mono font-semibold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {invoice.transferNoteSnapshot ||
                        (settings.transferNoteTemplate
                          ? settings.transferNoteTemplate.replace('{studentName}', invoice.studentNameSnapshot)
                          : `${invoice.invoiceNumber} ${invoice.studentNameSnapshot}`)}
                    </span>
                  </div>
                )}
              </div>

              {/* QR Image displayed only if teacher provided/uploaded one */}
              {(invoice.qrImageUrlSnapshot || settings.qrImageUrl) && (
                <div className="flex flex-col items-center shrink-0 p-2 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                  <img
                    src={invoice.qrImageUrlSnapshot || settings.qrImageUrl}
                    alt="Mã QR Thanh Toán"
                    className="w-24 h-24 sm:w-28 sm:h-28 object-contain rounded-lg"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 font-medium">Mã QR Thanh Toán</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer Notes & Signatures Block */}
        <div className="pt-4 border-t border-slate-100">
          {settings.footerNotes && (
            <p className="text-xs text-center text-slate-500 italic mb-6">
              "{settings.footerNotes}"
            </p>
          )}

          <div className="grid grid-cols-2 text-center text-xs pt-2">
            <div>
              <div className="font-semibold text-slate-700">Phụ huynh học sinh</div>
              <div className="text-[11px] text-slate-400 mt-0.5">(Ký và ghi rõ họ tên)</div>
              <div className="h-16"></div>
            </div>

            <div>
              <div className="font-semibold text-slate-700">Giáo viên phụ trách</div>
              <div className="text-[11px] text-slate-400 mt-0.5">(Ký và xác nhận)</div>
              <div className="h-16 flex items-end justify-center">
                <span className="font-bold text-slate-800">{settings.teacherName}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
