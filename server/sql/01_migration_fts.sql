-- ============================================================
-- Việc 1: Migration — Thêm Full-Text Search vào bảng documents
-- Chạy trong Supabase SQL Editor
-- ============================================================

-- 1. Thêm cột tsvector
ALTER TABLE documents ADD COLUMN IF NOT EXISTS fts tsvector;

-- 2. Tạo index GIN cho full-text search
CREATE INDEX IF NOT EXISTS documents_fts_idx ON documents USING GIN(fts);

-- 3. Cập nhật (backfill) dữ liệu hiện có
-- Dùng 'simple' config vì PostgreSQL không có built-in Vietnamese config
UPDATE documents SET fts = to_tsvector('simple', coalesce(content, ''));

-- 4. Trigger tự động cập nhật cột fts khi INSERT hoặc UPDATE
CREATE OR REPLACE FUNCTION update_fts() RETURNS trigger AS $$
BEGIN
  NEW.fts := to_tsvector('simple', coalesce(NEW.content, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Xóa trigger cũ nếu tồn tại rồi tạo lại
DROP TRIGGER IF EXISTS documents_fts_trigger ON documents;

CREATE TRIGGER documents_fts_trigger
  BEFORE INSERT OR UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_fts();
