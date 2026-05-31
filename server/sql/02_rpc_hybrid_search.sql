-- ============================================================
-- Việc 2: Tạo RPC function hybrid_search
-- Kết hợp Vector Search (cosine) + BM25 Full-Text Search
-- Xếp hạng bằng Reciprocal Rank Fusion (RRF)
-- Chạy trong Supabase SQL Editor (SAU KHI đã chạy 01_migration_fts.sql)
-- ============================================================

CREATE OR REPLACE FUNCTION hybrid_search(
  query_text text,
  query_embedding vector(768),
  match_count int DEFAULT 10,
  rrf_k int DEFAULT 60
)
RETURNS TABLE(
  id bigint,                    -- ⚠️ Đổi thành uuid nếu bảng documents dùng uuid
  content text,
  source text,
  folder text,
  category text,
  similarity float,
  bm25_rank float,
  rrf_score float
)
LANGUAGE sql AS $$
  -- CTE 1: Tìm kiếm bằng vector (cosine similarity)
  WITH vector_results AS (
    SELECT
      id, content, source, folder, category,
      1 - (embedding <=> query_embedding) AS similarity,
      ROW_NUMBER() OVER (ORDER BY embedding <=> query_embedding) AS vec_rank
    FROM documents
    WHERE 1 - (embedding <=> query_embedding) > 0.3
    LIMIT match_count * 2
  ),
  -- CTE 2: Tìm kiếm bằng BM25 full-text search
  bm25_results AS (
    SELECT
      id, content, source, folder, category,
      ts_rank_cd(fts, plainto_tsquery('simple', query_text)) AS bm25_score,
      ROW_NUMBER() OVER (
        ORDER BY ts_rank_cd(fts, plainto_tsquery('simple', query_text)) DESC
      ) AS bm25_rank
    FROM documents
    WHERE fts @@ plainto_tsquery('simple', query_text)
    LIMIT match_count * 2
  ),
  -- CTE 3: Kết hợp bằng RRF (Reciprocal Rank Fusion)
  combined AS (
    SELECT
      COALESCE(v.id, b.id) AS id,
      COALESCE(v.content, b.content) AS content,
      COALESCE(v.source, b.source) AS source,
      COALESCE(v.folder, b.folder) AS folder,
      COALESCE(v.category, b.category) AS category,
      COALESCE(v.similarity, 0) AS similarity,
      COALESCE(b.bm25_score, 0) AS bm25_rank,
      (
        COALESCE(1.0 / (rrf_k + v.vec_rank), 0) +
        COALESCE(1.0 / (rrf_k + b.bm25_rank), 0)
      ) AS rrf_score
    FROM vector_results v
    FULL OUTER JOIN bm25_results b ON v.id = b.id
  )
  SELECT id, content, source, folder, category, similarity, bm25_rank, rrf_score
  FROM combined
  ORDER BY rrf_score DESC
  LIMIT match_count;
$$;
