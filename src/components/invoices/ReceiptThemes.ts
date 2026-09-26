import { ReceiptThemeId } from '../../types';

export interface ReceiptThemeConfig {
  id: ReceiptThemeId;
  name: string;
  subname: string;
  previewColor: string;
  headerBg: string;
  headerBorder: string;
  accentText: string;
  tableHeaderBg: string;
  tableBorder: string;
  totalBoxBg: string;
  totalBoxBorder: string;
  watermarkColor: string;
  pillBg: string;
  pillText: string;
}

export const RECEIPT_THEMES: Record<ReceiptThemeId, ReceiptThemeConfig> = {
  soft_pink: {
    id: 'soft_pink',
    name: 'Hồng Pastel',
    subname: 'Soft Pink',
    previewColor: '#fda4af',
    headerBg: 'bg-rose-50',
    headerBorder: 'border-rose-200',
    accentText: 'text-rose-600',
    tableHeaderBg: 'bg-rose-50/70',
    tableBorder: 'border-rose-100',
    totalBoxBg: 'bg-rose-50/80',
    totalBoxBorder: 'border-rose-200',
    watermarkColor: 'text-rose-200/40',
    pillBg: 'bg-rose-100',
    pillText: 'text-rose-700',
  },
  lavender: {
    id: 'lavender',
    name: 'Oải Hương',
    subname: 'Lavender',
    previewColor: '#c4b5fd',
    headerBg: 'bg-violet-50',
    headerBorder: 'border-violet-200',
    accentText: 'text-violet-600',
    tableHeaderBg: 'bg-violet-50/70',
    tableBorder: 'border-violet-100',
    totalBoxBg: 'bg-violet-50/80',
    totalBoxBorder: 'border-violet-200',
    watermarkColor: 'text-violet-200/40',
    pillBg: 'bg-violet-100',
    pillText: 'text-violet-700',
  },
  mint: {
    id: 'mint',
    name: 'Bạc Hà',
    subname: 'Fresh Mint',
    previewColor: '#86efac',
    headerBg: 'bg-emerald-50',
    headerBorder: 'border-emerald-200',
    accentText: 'text-emerald-700',
    tableHeaderBg: 'bg-emerald-50/70',
    tableBorder: 'border-emerald-100',
    totalBoxBg: 'bg-emerald-50/80',
    totalBoxBorder: 'border-emerald-200',
    watermarkColor: 'text-emerald-200/40',
    pillBg: 'bg-emerald-100',
    pillText: 'text-emerald-800',
  },
  baby_blue: {
    id: 'baby_blue',
    name: 'Xanh Nhạt',
    subname: 'Baby Blue',
    previewColor: '#7dd3fc',
    headerBg: 'bg-sky-50',
    headerBorder: 'border-sky-200',
    accentText: 'text-sky-600',
    tableHeaderBg: 'bg-sky-50/70',
    tableBorder: 'border-sky-100',
    totalBoxBg: 'bg-sky-50/80',
    totalBoxBorder: 'border-sky-200',
    watermarkColor: 'text-sky-200/40',
    pillBg: 'bg-sky-100',
    pillText: 'text-sky-700',
  },
  peach: {
    id: 'peach',
    name: 'Cam Đào',
    subname: 'Peach Sweet',
    previewColor: '#fdba74',
    headerBg: 'bg-amber-50',
    headerBorder: 'border-amber-200',
    accentText: 'text-amber-700',
    tableHeaderBg: 'bg-amber-50/70',
    tableBorder: 'border-amber-100',
    totalBoxBg: 'bg-amber-50/80',
    totalBoxBorder: 'border-amber-200',
    watermarkColor: 'text-amber-200/40',
    pillBg: 'bg-amber-100',
    pillText: 'text-amber-800',
  },
  cream: {
    id: 'cream',
    name: 'Kem Vàng',
    subname: 'Warm Cream',
    previewColor: '#fde047',
    headerBg: 'bg-yellow-50',
    headerBorder: 'border-yellow-200',
    accentText: 'text-yellow-700',
    tableHeaderBg: 'bg-yellow-50/70',
    tableBorder: 'border-yellow-100',
    totalBoxBg: 'bg-yellow-50/80',
    totalBoxBorder: 'border-yellow-200',
    watermarkColor: 'text-yellow-200/40',
    pillBg: 'bg-yellow-100',
    pillText: 'text-yellow-800',
  },
  sage: {
    id: 'sage',
    name: 'Xanh Xô Thơm',
    subname: 'Sage Green',
    previewColor: '#a8c297',
    headerBg: 'bg-[#f4f6f0]',
    headerBorder: 'border-[#cfdcc3]',
    accentText: 'text-[#486337]',
    tableHeaderBg: 'bg-[#e6ebe0]/70',
    tableBorder: 'border-[#cfdcc3]/50',
    totalBoxBg: 'bg-[#f4f6f0]',
    totalBoxBorder: 'border-[#cfdcc3]',
    watermarkColor: 'text-[#a8c297]/30',
    pillBg: 'bg-[#cfdcc3]',
    pillText: 'text-[#486337]',
  },
  powder_purple: {
    id: 'powder_purple',
    name: 'Tím Phấn',
    subname: 'Powder Purple',
    previewColor: '#d8b4fe',
    headerBg: 'bg-purple-50',
    headerBorder: 'border-purple-200',
    accentText: 'text-purple-700',
    tableHeaderBg: 'bg-purple-50/70',
    tableBorder: 'border-purple-100',
    totalBoxBg: 'bg-purple-50/80',
    totalBoxBorder: 'border-purple-200',
    watermarkColor: 'text-purple-200/40',
    pillBg: 'bg-purple-100',
    pillText: 'text-purple-800',
  },
};

export const THEME_LIST = Object.values(RECEIPT_THEMES);
