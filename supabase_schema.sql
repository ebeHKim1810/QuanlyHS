-- ==============================================================================
-- TUITION MANAGER - POSTGRESQL & SUPABASE DATABASE SCHEMA (MULTI-TENANT & RLS)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. USER PROFILES TABLE (SUPABASE AUTH LINKED)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE, -- References auth.users(id) in Supabase Auth
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50),
    role VARCHAR(20) NOT NULL DEFAULT 'TEACHER' CHECK (role IN ('TEACHER', 'ADMIN')),
    account_status VARCHAR(30) NOT NULL DEFAULT 'PENDING_VERIFICATION' 
        CHECK (account_status IN ('PENDING_VERIFICATION', 'ACTIVE', 'DISABLED', 'DELETED')),
    email_verified_at TIMESTAMPTZ,
    theme_preference VARCHAR(20) DEFAULT 'system' CHECK (theme_preference IN ('light', 'dark', 'system')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- 3. TEACHER SETTINGS TABLE
CREATE TABLE IF NOT EXISTS teacher_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    teacher_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    center_name VARCHAR(255),
    address TEXT,
    logo_url TEXT,
    footer_notes TEXT,
    bank_name VARCHAR(100),
    bank_account_number VARCHAR(100),
    bank_account_name VARCHAR(255),
    transfer_note_template TEXT,
    qr_image_url TEXT,
    currency VARCHAR(10) DEFAULT 'VND',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. STUDENTS TABLE
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    student_code VARCHAR(50),
    notes TEXT,
    tuition_mode VARCHAR(20) NOT NULL CHECK (tuition_mode IN ('PER_SESSION', 'PER_PERIOD')),
    price_per_session NUMERIC(12, 2) DEFAULT 0,
    price_per_period NUMERIC(12, 2) DEFAULT 0,
    periods_per_lesson INT DEFAULT 2,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ARCHIVED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. RECURRING SCHEDULES TABLE
CREATE TABLE IF NOT EXISTS recurring_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0: Sunday, 1: Monday, ...
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration_minutes INT DEFAULT 90,
    period_count INT DEFAULT 2,
    start_date DATE,
    end_date DATE,
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. INVOICES TABLE (PHIẾU HỌC PHÍ)
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id),
    student_name_snapshot VARCHAR(255) NOT NULL,
    student_phone_snapshot VARCHAR(50) NOT NULL,
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    issued_at DATE NOT NULL DEFAULT CURRENT_DATE,
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0,
    discount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    payment_status VARCHAR(20) NOT NULL DEFAULT 'UNPAID' CHECK (payment_status IN ('UNPAID', 'PAID')),
    payment_date DATE,
    receipt_theme VARCHAR(50) NOT NULL DEFAULT 'soft_pink',
    show_comment BOOLEAN DEFAULT TRUE,
    teacher_comment TEXT,
    tuition_mode_snapshot VARCHAR(20) NOT NULL,
    unit_price_snapshot NUMERIC(12, 2) NOT NULL,
    period_count_snapshot INT,
    lesson_count INT NOT NULL DEFAULT 0,
    lesson_display_mode VARCHAR(20) NOT NULL DEFAULT 'STANDARD' CHECK (lesson_display_mode IN ('STANDARD', 'COMPACT')),
    show_bank_info BOOLEAN NOT NULL DEFAULT FALSE,
    bank_name_snapshot VARCHAR(100),
    bank_account_number_snapshot VARCHAR(100),
    bank_account_holder_snapshot VARCHAR(255),
    transfer_note_snapshot TEXT,
    qr_image_url_snapshot TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. LESSONS TABLE (BUỔI HỌC)
CREATE TABLE IF NOT EXISTS lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    schedule_id UUID REFERENCES recurring_schedules(id) ON DELETE SET NULL,
    lesson_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration_minutes INT DEFAULT 90,
    period_count INT DEFAULT 2,
    attendance_status VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED' 
        CHECK (attendance_status IN ('SCHEDULED', 'ATTENDED', 'ABSENT', 'CANCELLED')),
    billing_status VARCHAR(20) NOT NULL DEFAULT 'UNBILLED' 
        CHECK (billing_status IN ('UNBILLED', 'INVOICED')),
    tuition_mode VARCHAR(20) NOT NULL,
    unit_price_snapshot NUMERIC(12, 2) NOT NULL DEFAULT 0,
    calculated_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. INVOICE ITEMS TABLE (CHI TIẾT BUỔI HỌC BẤT BIẾN)
CREATE TABLE IF NOT EXISTS invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL,
    lesson_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    period_count INT DEFAULT 2,
    tuition_mode VARCHAR(20) NOT NULL,
    unit_price NUMERIC(12, 2) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_students_teacher ON students(teacher_id);
CREATE INDEX IF NOT EXISTS idx_schedules_teacher ON recurring_schedules(teacher_id);
CREATE INDEX IF NOT EXISTS idx_lessons_teacher ON lessons(teacher_id);
CREATE INDEX IF NOT EXISTS idx_lessons_student_id ON lessons(student_id);
CREATE INDEX IF NOT EXISTS idx_lessons_date ON lessons(lesson_date);
CREATE INDEX IF NOT EXISTS idx_lessons_billing ON lessons(student_id, attendance_status, billing_status);
CREATE INDEX IF NOT EXISTS idx_invoices_teacher ON invoices(teacher_id);
CREATE INDEX IF NOT EXISTS idx_invoices_student_id ON invoices(student_id);
CREATE INDEX IF NOT EXISTS idx_invoices_payment ON invoices(payment_status);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_items(invoice_id);

-- 10. TRANSACTIONAL INTEGRITY RULE:
-- Ensure that an invoiced lesson is never linked to multiple active invoices
CREATE UNIQUE INDEX IF NOT EXISTS idx_lesson_single_invoice 
    ON lessons(id) 
    WHERE billing_status = 'INVOICED' AND invoice_id IS NOT NULL;

-- 11. ROW LEVEL SECURITY (RLS) POLICIES FOR DATA ISOLATION
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

-- Helper function: is current user an admin?
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE user_id = auth.uid() AND role = 'ADMIN'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles: Users see own profile, Admin sees all
CREATE POLICY "Users view own profile or admin all" ON profiles
    FOR SELECT USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "Users update own profile" ON profiles
    FOR UPDATE USING (user_id = auth.uid());

-- Students: Teachers only see their own students
CREATE POLICY "Teacher access own students" ON students
    FOR ALL USING (
        teacher_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR is_admin()
    );

-- Schedules: Teachers only access own schedules
CREATE POLICY "Teacher access own schedules" ON recurring_schedules
    FOR ALL USING (
        teacher_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR is_admin()
    );

-- Lessons: Teachers only access own lessons
CREATE POLICY "Teacher access own lessons" ON lessons
    FOR ALL USING (
        teacher_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR is_admin()
    );

-- Invoices: Teachers only access own invoices
CREATE POLICY "Teacher access own invoices" ON invoices
    FOR ALL USING (
        teacher_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR is_admin()
    );

-- Invoice items: accessible if the invoice is accessible
CREATE POLICY "Teacher access own invoice items" ON invoice_items
    FOR ALL USING (
        invoice_id IN (
            SELECT id FROM invoices 
            WHERE teacher_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR is_admin()
        )
    );

-- Teacher settings: isolated per teacher
CREATE POLICY "Teacher access own settings" ON teacher_settings
    FOR ALL USING (
        teacher_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR is_admin()
    );

-- ==============================================================================
-- 11. IDEMPOTENT MIGRATIONS FOR EXISTING INSTALLATIONS
-- ==============================================================================
ALTER TABLE teacher_settings ADD COLUMN IF NOT EXISTS transfer_note_template TEXT;
ALTER TABLE teacher_settings ADD COLUMN IF NOT EXISTS qr_image_url TEXT;

ALTER TABLE invoices ADD COLUMN IF NOT EXISTS lesson_display_mode VARCHAR(20) DEFAULT 'STANDARD';
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS show_bank_info BOOLEAN DEFAULT FALSE;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS bank_name_snapshot VARCHAR(100);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS bank_account_number_snapshot VARCHAR(100);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS bank_account_holder_snapshot VARCHAR(255);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS transfer_note_snapshot TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS qr_image_url_snapshot TEXT;
