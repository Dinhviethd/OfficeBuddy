-- ============================================================
-- Việc 4: Migration — Thêm metadata quản lý thông tin cũ/mới cho RAG
-- Chạy trong Supabase SQL Editor
-- ============================================================

ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS uploaded_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS uploaded_by text DEFAULT 'system',
  ADD COLUMN IF NOT EXISTS file_description text DEFAULT '';
