# Tuition Manager (Hệ Thống Quản Lý Dạy Học & Học Phí)

**Tuition Manager** là ứng dụng web toàn diện, chuyên nghiệp, sẵn sàng sử dụng (production-ready) dành riêng cho giáo viên dạy kèm và gia sư tư nhân để quản lý học sinh, thời khóa biểu, điểm danh từng buổi học, cấu hình học phí linh hoạt và xuất phiếu học phí chuẩn pastel tinh tế.

---

## 1. Kiến Trúc & Công Nghệ Sử Dụng

- **Frontend**: React 19 + TypeScript + Vite 8
- **Styling**: Tailwind CSS + Custom Soft Pastel Design System + Google Fonts (Be Vietnam Pro, Plus Jakarta Sans)
- **Icons**: Lucide React
- **Xử lý ngày tháng**: `date-fns` với locale tiếng Việt
- **Xuất file**: `jspdf` + `html2canvas` (Hỗ trợ tiếng Việt Unicode sắc nét, không vỡ layout khổ A4)
- **Hiệu ứng**: `canvas-confetti` khi xuất phiếu thành công
- **Persistence & Cơ sở dữ liệu**:
  - Tích hợp sẵn `localDbPlugin` lưu trữ trực tiếp vào file đĩa `data/database.json` qua API `/api/db`.
  - Đồng bộ tức thì với `localStorage` trên trình duyệt giúp dữ liệu luôn tồn tại sau khi F5/refresh.
  - Cung cấp sẵn file cấu hình cơ sở dữ liệu quan hệ PostgreSQL chuẩn cho Supabase: `supabase_schema.sql`.
  - Tính năng **Sao lưu (Export JSON)** & **Phục hồi (Import JSON)** dữ liệu 1-click trong phần Cài đặt.

---

## 2. Quy Tắc Nghiệp Vụ Cốt Lõi (Core Billing Engine)

Ứng dụng tuân thủ nghiêm ngặt nguyên lý kế toán và tính toán học phí:

| Trạng thái điểm danh | Trạng thái học phí | Khả năng tính phí | Ý nghĩa |
| :--- | :--- | :--- | :--- |
| **CÓ HỌC (ATTENDED)** | **CHƯA TÍNH PHÍ (UNBILLED)** | **ĐỦ ĐIỀU KIỆN (Billable)** | Buổi học đã hoàn thành, tự động hiển thị trong quy trình lập phiếu thu. |
| **CÓ HỌC (ATTENDED)** | **ĐÃ XUẤT PHIẾU (INVOICED)** | **ĐÃ KHÓA (Locked)** | Đã tính tiền vào phiếu thu trước đó, **tuyệt đối không bao giờ được tính trùng**. |
| **VẮNG (ABSENT)** | *Bất kỳ* | **KHÔNG TÍNH PHÍ** | Học sinh nghỉ, hệ thống không đưa vào tiền học. |
| **HỦY (CANCELLED)** | *Bất kỳ* | **KHÔNG TÍNH PHÍ** | Buổi học bị hủy. |
| **CHƯA ĐIỂM DANH (SCHEDULED)** | *Bất kỳ* | **CHƯA TÍNH PHÍ** | Buổi học trong tương lai hoặc chưa diễn ra. |

### Tính Bất Biến Của Lịch Sử (Historical Immutability)
Khi giáo viên tăng hoặc giảm giá học phí của học sinh, **mọi phiếu học phí và các buổi học trong quá khứ được giữ nguyên 100%** nhờ cơ chế lưu bản sao độc lập (snapshot) tại từng dòng hóa đơn (`InvoiceItem`).

### Tách Biệt Giữa "Đã Xuất Phiếu" và "Đã Thanh Toán"
Một buổi học đã được xuất phiếu thu (`INVOICED`) không đồng nghĩa với việc phụ huynh đã nộp tiền. Hệ thống tách biệt hoàn toàn giữa `billingStatus` (UNBILLED / INVOICED) và `paymentStatus` (CHƯA THANH TOÁN / ĐÃ THANH TOÁN).

---

## 3. Danh Sách Tính Năng Đã Hoàn Thiện

1. **Tổng quan (Dashboard)**:
   - Thống kê: Tổng học sinh, Số buổi tuần này, Số buổi đã học chờ tính phí, Tổng học phí chưa xuất, Đã xuất trong tháng, Số phiếu đã xuất.
   - Mục chuyên biệt: *"Buổi chưa tính học phí"* kèm nút xuất phiếu nhanh.
   - Danh sách các buổi học sắp tới.
2. **Quản lý học sinh (Student Management)**:
   - Thêm, sửa, xóa học sinh (kèm xác nhận an toàn tài chính).
   - Tìm kiếm nhanh theo tên, số điện thoại, mã học sinh.
   - Lọc theo hình thức học phí và trạng thái chờ xuất phiếu.
   - Trang chi tiết học sinh: Hồ sơ, lịch sử học tập, các buổi chưa tính phí, các phiếu đã xuất.
3. **Cấu hình học phí (Tuition Configuration)**:
   - Theo buổi (`PER_SESSION`): Mức thu cố định cho mỗi buổi học.
   - Theo tiết (`PER_PERIOD`): Đơn giá mỗi tiết × Số tiết thực tế của buổi học.
   - Công cụ mô phỏng & thử nghiệm tính học phí tương tác.
4. **Lịch học & Thời khóa biểu (Study Schedule & Calendar)**:
   - Tạo buổi học 1 lần hoặc lịch học định kỳ hàng tuần (tự động sinh lịch trước 2, 4, 8, 12 tuần).
   - Lịch học tương tác 4 chế độ: Tháng (Month), Tuần (Week), Ngày (Day), Danh sách (Agenda).
   - Mã màu trạng thái trực quan: Xám (Chưa học), Cam (Có học - Chờ tính phí), Tím (Có học - Đã chốt phiếu), Đỏ (Vắng).
5. **Điểm danh (Attendance)**:
   - Điểm danh trực tiếp từ Lịch học hoặc màn hình Điểm danh chuyên biệt.
   - Hỗ trợ đổi trạng thái nhanh: Có học, Vắng, Hủy, Chưa điểm danh.
6. **Lập & Xuất phiếu học phí (Tuition Receipt Builder)**:
   - Quy trình 8 bước trực quan.
   - Tự động gom các buổi đã học chưa thanh toán.
   - Chọn/bỏ chọn từng buổi học.
   - Tùy chọn chiết khấu / miễn giảm.
   - Nhận xét của giáo viên (bật/tắt hiển thị).
   - **8 Giao diện Pastel thanh lịch**: Soft Pink, Lavender, Mint, Baby Blue, Peach, Cream, Sage, Powder Purple.
   - Xem trước trực tiếp phiếu thu (Live Preview).
7. **In ấn & Xuất file (Receipt Export)**:
   - Xuất PDF độ phân giải cao, hỗ trợ tiếng Việt Unicode sắc nét.
   - Tải ảnh PNG chất lượng cao.
   - In trực tiếp qua trình duyệt định dạng chuẩn A4 (ẩn menu và nút điều hướng).
   - Hiển thị thông tin tài khoản ngân hàng và mã VietQR thanh toán tự động.
   - Tự động chuyển đổi số tiền thành chữ tiếng Việt (ví dụ: *Ba trăm nghìn đồng chẵn*).
8. **Lịch sử xuất phiếu (Receipt History)**:
   - Danh sách toàn bộ phiếu thu đã xuất.
   - Bộ lọc theo học sinh, trạng thái thanh toán, tìm kiếm mã phiếu.
   - Nút đổi nhanh trạng thái: ĐÃ THANH TOÁN / CHƯA THANH TOÁN.
   - Thao tác Hủy/Xóa phiếu an toàn (tự động mở khóa các buổi học về trạng thái chưa tính phí).
9. **Cài đặt & Hồ sơ giáo viên (Settings)**:
   - Thiết lập họ tên giáo viên, số điện thoại, trung tâm/lớp học, địa chỉ, lời cảm ơn.
   - Thông tin tài khoản ngân hàng tích hợp VietQR.
   - Sao lưu dữ liệu ra file JSON.
   - Phục hồi dữ liệu từ file JSON.
   - Nút nạp lại dữ liệu mẫu kiểm thử chuẩn (Demo Scenario) hoặc Xóa trắng hệ thống.

---

## 4. Kịch Bản Kiểm Thử Chuẩn (Business Test Scenario)

Hệ thống được tích hợp sẵn bộ kiểm thử tự động tại `test-runner.ts` xác thực kịch bản:
- **Học sinh**: Nguyễn Minh Anh
- **Mức thu**: 100.000đ / buổi
- **Buổi học**:
  - `01/09/2026`: Có học (Đã xuất vào phiếu #HP-2026-0001)
  - `03/09/2026`: Có học (Đã xuất vào phiếu #HP-2026-0001)
  - `05/09/2026`: Có học (Đã xuất vào phiếu #HP-2026-0001)
  - `08/09/2026`: Vắng (Không tính phí)
  - `10/09/2026`: Có học (Chưa tính phí)
- **Phiếu #1**: 300.000đ (01, 03, 05/09).
- **Lập phiếu #2**: Hệ thống lọc chính xác **duy nhất buổi 10/09** -> Tổng tiền 100.000đ.
- **Sau khi xuất phiếu #2**: Buổi 10/09 chuyển sang `INVOICED`.
- **Lập phiếu #3**: Hệ thống báo *"Hiện không có buổi học nào chưa tính học phí"*.

Chạy kiểm thử tự động:
```bash
npm test
```
Kết quả: **33/33 tests passed** (100% pass).

---

## 5. Hướng Dẫn Cài Đặt & Chạy Ứng Dụng

### Yêu Cầu Môi Trường
- Node.js version 18 trở lên.
- Trình duyệt hiện đại (Chrome, Edge, Firefox, Safari).

### Cài Đặt & Khởi Động
```bash
# 1. Cài đặt các thư viện phụ thuộc
npm install

# 2. Khởi chạy máy chủ phát triển
npm run dev

# Hoặc khởi chạy bản build tối ưu
npm run build
npm run preview
```
Mở trình duyệt tại: `http://localhost:5173` hoặc `http://localhost:4173`.

---

## 6. Cấu Hình Cơ Sở Dữ Liệu Supabase / PostgreSQL (Tùy Chọn Cloud)

Nếu bạn muốn kết nối với cơ sở dữ liệu đám mây Supabase PostgreSQL:
1. Tạo một project mới trên [Supabase](https://supabase.com).
2. Vào mục **SQL Editor**.
3. Mở file `supabase_schema.sql` có sẵn trong thư mục gốc dự án, dán toàn bộ nội dung và bấm **Run**.
4. Toàn bộ bảng dữ liệu (`students`, `recurring_schedules`, `lessons`, `invoices`, `invoice_items`, `teacher_settings`) kèm khóa ngoại, ràng buộc tính toàn vẹn và chỉ mục hiệu năng sẽ được thiết lập tự động.

---

## 7. Cấu Trúc Thư Mục Dự Án

```
HTQuanly/
├── data/
│   └── database.json          # Cơ sở dữ liệu file cục bộ lưu trữ vĩnh viễn
├── src/
│   ├── components/
│   │   ├── attendance/        # Màn hình điểm danh buổi học
│   │   ├── calendar/          # Lịch tương tác (Tháng/Tuần/Ngày/Danh sách) & LessonModal
│   │   ├── common/            # Badge, Modal, StatCard, EmptyState, Toast
│   │   ├── dashboard/         # Bảng điều khiển tổng quan
│   │   ├── invoices/          # Bộ lập phiếu thu, xem trước, lịch sử & 8 giao diện pastel
│   │   ├── layout/            # Sidebar, Header, Mobile navigation
│   │   ├── schedules/         # Hộp thoại tạo lịch học định kỳ/đơn lẻ
│   │   ├── settings/          # Cài đặt hồ sơ giáo viên & sao lưu dữ liệu
│   │   ├── students/          # Quản lý danh sách & hồ sơ chi tiết học sinh
│   │   └── tuition/           # Quản lý mức thu học phí & công cụ tính toán
│   ├── context/
│   │   └── AppContext.tsx     # Quản lý trạng thái ứng dụng & đồng bộ lưu trữ
│   ├── services/
│   │   ├── billingEngine.ts   # Bộ xử lý nghiệp vụ tài chính & khóa buổi học
│   │   ├── demoData.ts        # Bộ dữ liệu mẫu kiểm thử kịch bản nghiệp vụ
│   │   ├── exportPdf.ts       # Xuất PDF độ nét cao, tải ảnh PNG & in ấn
│   │   └── storage.ts         # Động cơ lưu trữ kiên cố (Disk API + LocalStorage)
│   ├── types/
│   │   └── index.ts           # Định nghĩa TypeScript toàn bộ hệ thống
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── supabase_schema.sql        # Kịch bản SQL cấu trúc CSDL PostgreSQL / Supabase
├── test-runner.ts             # Bộ kiểm thử tự động toàn diện
├── package.json
├── tailwind.config.js
└── vite.config.ts
```
