import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Invoice, PaymentStatus } from '../../types';
import {
  History,
  Search,
  Filter,
  Eye,
  Trash2,
  CheckCircle2,
  Clock,
  Printer,
  FileText,
  DollarSign,
  Download,
  AlertCircle,
  Smartphone,
  Receipt,
} from 'lucide-react';
import { PaymentStatusBadge } from '../common/Badge';
import { ReceiptPreviewModal } from './ReceiptPreviewModal';
import { MobileReceiptModal } from './MobileReceiptModal';
import { format, parseISO } from 'date-fns';
import { EmptyState } from '../common/EmptyState';

export const InvoiceHistoryView: React.FC = () => {
  const { invoices, students, openInvoicePreview, deleteOrVoidInvoice, updateInvoicePayment } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [studentFilter, setStudentFilter] = useState<string>('ALL');
  const [paymentFilter, setPaymentFilter] = useState<'ALL' | PaymentStatus>('ALL');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [mobileModalInvoice, setMobileModalInvoice] = useState<Invoice | null>(null);

  // Filter invoices
  const filteredInvoices = invoices.filter((inv) => {
    // Search query (invoice number or student name)
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      inv.invoiceNumber.toLowerCase().includes(q) ||
      inv.studentNameSnapshot.toLowerCase().includes(q);

    // Student filter
    const matchStudent = studentFilter === 'ALL' || inv.studentId === studentFilter;

    // Payment filter
    const matchPayment = paymentFilter === 'ALL' || inv.paymentStatus === paymentFilter;

    return matchSearch && matchStudent && matchPayment;
  });

  // Totals
  const totalBilled = filteredInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const paidCount = filteredInvoices.filter((inv) => inv.paymentStatus === 'PAID').length;
  const unpaidCount = filteredInvoices.filter((inv) => inv.paymentStatus === 'UNPAID').length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Lịch Sử Xuất Phiếu Học Phí</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Quản lý, tra cứu, in ấn, tải ảnh Zalo và kiểm soát trạng thái thanh toán của toàn bộ phiếu thu đã lập
          </p>
        </div>

        {/* Quick summary stats */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-xs">
            Tổng thu: <span className="text-indigo-600 dark:text-indigo-400 font-bold">{totalBilled.toLocaleString('vi-VN')} đ</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
            Đã thanh toán: {paidCount}
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-xs font-semibold text-amber-800 dark:text-amber-300">
            Chưa thanh toán: {unpaidCount}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-soft flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo mã phiếu (HP-...), tên học sinh..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Student Filter */}
          <select
            value={studentFilter}
            onChange={(e) => setStudentFilter(e.target.value)}
            className="text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2"
          >
            <option value="ALL">Tất cả học sinh</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          {/* Payment Status Filter */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value as any)}
            className="text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2"
          >
            <option value="ALL">Mọi trạng thái thanh toán</option>
            <option value="PAID">Đã thanh toán</option>
            <option value="UNPAID">Chưa thanh toán</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-soft overflow-hidden">
        {filteredInvoices.length === 0 ? (
          <EmptyState
            title="Chưa có phiếu học phí nào"
            description="Bạn chưa tạo phiếu học phí nào hoặc không tìm thấy phiếu phù hợp với bộ lọc."
            icon={Receipt}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3 pl-4">Mã Phiếu</th>
                  <th className="py-3">Học Sinh</th>
                  <th className="py-3">Ngày Lập</th>
                  <th className="py-3 text-center">Số Buổi</th>
                  <th className="py-3 text-right">Tổng Tiền</th>
                  <th className="py-3">Trạng Thái</th>
                  <th className="py-3 text-right pr-4">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredInvoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    onClick={() => setSelectedInvoice(invoice)}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                  >
                    {/* Invoice Number */}
                    <td className="py-3.5 pl-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {invoice.invoiceNumber}
                    </td>

                    {/* Student Name */}
                    <td className="py-3.5">
                      <div className="font-bold text-slate-900 dark:text-white">{invoice.studentNameSnapshot}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{invoice.studentPhoneSnapshot}</div>
                    </td>

                    {/* Issue Date */}
                    <td className="py-3.5 text-slate-600 dark:text-slate-400 text-xs">
                      {format(parseISO(invoice.issuedAt), 'dd/MM/yyyy')}
                    </td>

                    {/* Lesson Count */}
                    <td className="py-3.5 text-center text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {invoice.lessonCount} buổi
                    </td>

                    {/* Total Amount */}
                    <td className="py-3.5 text-right font-bold text-slate-900 dark:text-white font-mono">
                      {invoice.totalAmount.toLocaleString('vi-VN')} đ
                    </td>

                    {/* Payment Status Badge */}
                    <td className="py-3.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() =>
                          updateInvoicePayment(
                            invoice.id,
                            invoice.paymentStatus === 'PAID' ? 'UNPAID' : 'PAID'
                          )
                        }
                        title="Bấm để đổi trạng thái thanh toán"
                      >
                        <PaymentStatusBadge status={invoice.paymentStatus} />
                      </button>
                    </td>

                    {/* Actions */}
                    <td
                      className="py-3.5 text-right pr-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedInvoice(invoice)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-lg transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Xem</span>
                        </button>

                        <button
                          onClick={() => setMobileModalInvoice(invoice)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                          title="Tải ảnh mobile cho Zalo / Messenger"
                        >
                          <Smartphone className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                          <span className="hidden sm:inline">Tải ảnh</span>
                        </button>

                        <button
                          onClick={() => deleteOrVoidInvoice(invoice.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                          title="Hủy/Xóa phiếu (mở khóa các buổi học)"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invoice Detail / Receipt Modal */}
      <ReceiptPreviewModal
        invoice={selectedInvoice}
        isOpen={Boolean(selectedInvoice)}
        onClose={() => setSelectedInvoice(null)}
      />

      {/* Mobile Receipt Modal */}
      <MobileReceiptModal
        invoice={mobileModalInvoice}
        isOpen={Boolean(mobileModalInvoice)}
        onClose={() => setMobileModalInvoice(null)}
      />
    </div>
  );
};
