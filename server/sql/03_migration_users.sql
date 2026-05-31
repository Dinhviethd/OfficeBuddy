-- ============================================================
-- Việc 3: Migration — Nâng cấp bảng users hỗ trợ email + role
-- Chạy trong Supabase SQL Editor (SAU KHI server đã chạy ít nhất 1 lần
-- để TypeORM tự tạo bảng users nếu chưa có)
-- ============================================================

-- 1. Thêm cột email (unique, not null) — nếu chưa có
ALTER TABLE users ADD COLUMN IF NOT EXISTS email text;

-- 2. Thêm cột role với CHECK constraint
ALTER TABLE users ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'user';

-- Thêm CHECK constraint nếu chưa tồn tại
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_role_check'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('user', 'admin'));
  END IF;
END $$;

-- 3. Thêm cột full_name
ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name text DEFAULT '';

-- 4. Thêm cột last_login
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login timestamptz;

-- 5. Tạo unique index cho email (nếu chưa có)
CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique ON users(email) WHERE email IS NOT NULL;

-- 6. Chuyển cột username thành nullable (nếu đang NOT NULL)
ALTER TABLE users ALTER COLUMN username DROP NOT NULL;

-- ============================================================
-- 7. Tạo admin mặc định
-- Password: Admin@123 (bcrypt hash, 10 rounds)
-- ============================================================
INSERT INTO users (email, password, role, full_name, username)
VALUES (
  'admin@dut.udn.vn',
  '$2b$10$N.H1d554xvOiO2c4ALJuDOP8UNFCUZBw0N0kGtp9yz30oRK1hMqqa',
  'admin',
  'Quản trị viên',
  'admin'
)
ON CONFLICT (email) DO NOTHING;
