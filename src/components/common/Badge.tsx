import React from 'react';
import { AttendanceStatus, BillingStatus, PaymentStatus, TuitionMode } from '../../types';

interface BadgeProps {
  children?: React.ReactNode;
  className?: string;
  variant?: 'gray' | 'green' | 'red' | 'orange' | 'purple' | 'blue' | 'amber';
}

export const Badge: React.FC<BadgeProps> = ({ children, className = '', variant = 'gray' }) => {
  const variantStyles = {
    gray: 'bg-slate-100 text-slate-700 border-slate-200',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    red: 'bg-rose-50 text-rose-700 border-rose-200',
    orange: 'bg-amber-50 text-amber-800 border-amber-200',
    purple: 'bg-violet-50 text-violet-700 border-violet-200',
    blue: 'bg-sky-50 text-sky-700 border-sky-200',
    amber: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

export const LessonStatusBadge: React.FC<{
  attendanceStatus: AttendanceStatus;
  billingStatus: BillingStatus;
  className?: string;
}> = ({ attendanceStatus, billingStatus, className }) => {
  if (attendanceStatus === 'ATTENDED') {
    if (billingStatus === 'INVOICED') {
      return (
        <Badge variant="purple" className={className}>
          <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse"></span>
          Có học • Đã xuất phiếu
        </Badge>
      );
    } else {
      return (
        <Badge variant="orange" className={className}>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          Có học • Chưa tính phí
        </Badge>
      );
    }
  }

  if (attendanceStatus === 'ABSENT') {
    return (
      <Badge variant="red" className={className}>
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
        Vắng học
      </Badge>
    );
  }

  if (attendanceStatus === 'CANCELLED') {
    return (
      <Badge variant="gray" className={className}>
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
        Đã hủy
      </Badge>
    );
  }

  return (
    <Badge variant="gray" className={className}>
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
      Chưa điểm danh
    </Badge>
  );
};

export const PaymentStatusBadge: React.FC<{ status: PaymentStatus; className?: string }> = ({
  status,
  className,
}) => {
  if (status === 'PAID') {
    return (
      <Badge variant="green" className={className}>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
        Đã thanh toán
      </Badge>
    );
  }
  return (
    <Badge variant="orange" className={className}>
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
      Chưa thanh toán
    </Badge>
  );
};

export const TuitionModeBadge: React.FC<{ mode: TuitionMode; className?: string }> = ({ mode, className }) => {
  if (mode === 'PER_PERIOD') {
    return (
      <Badge variant="purple" className={className}>
        Theo tiết
      </Badge>
    );
  }
  return (
    <Badge variant="blue" className={className}>
      Theo buổi
    </Badge>
  );
};
