import * as dotenv from "dotenv";
dotenv.config();

import * as fs from "fs";
import * as path from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import * as mammoth from "mammoth";
import * as XLSX from "xlsx";

// ─── CONFIG ──────────────────────────────────────────────────
const DATA_DIR = process.env.DATA_DIR!;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const EMBED_RPM = Number.parseInt(process.env.EMBED_RPM ?? "30", 10);
const EMBED_MAX_RETRIES = Number.parseInt(process.env.EMBED_MAX_RETRIES ?? "5", 10);

// Map thư mục → category
const CATEGORY_MAP: Record<string, string> = {
  "Biểu mẫu": "bieu-mau",
  "Công tác sinh viên": "cong-tac-sinh-vien",
  "Danh bạ": "danh-ba",
  "Đào tạo": "dao-tao",
  "Học liệu, truyền thông": "hoc-lieu",
  "Khảo thí": "khao-thi",
  "Quy định": "quy-dinh",
  "Tài chính, kế toán": "tai-chinh",
  "Văn thư, lưu trữ": "van-thu",
};

// ─── KHỞI TẠO CLIENT ─────────────────────────────────────────
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const visionModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
const embedModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ─── UTILS ───────────────────────────────────────────────────
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const embedIntervalMs = Math.ceil(60000 / Math.max(1, EMBED_RPM));
let lastEmbedAt = 0;

function chunkText(text: string, chunkSize = 800, overlap = 100): string[] {
  // Ưu tiên cắt theo paragraph (điều khoản, mục)
  const paragraphs = text.split(/\n{2,}/);
  const chunks: string[] = [];
  let current = "";

  for (const para of paragraphs) {
    if ((current + para).length > chunkSize && current.length > 0) {
      chunks.push(current.trim());
      const words = current.split(" ");
      current = words.slice(-Math.floor(overlap / 5)).join(" ") + "\n" + para;
    } else {
      current += (current ? "\n" : "") + para;
    }
  }
  if (current.trim()) chunks.push(current.trim());

  // Fallback: cắt cứng nếu không có paragraph
  if (chunks.length <= 1 && text.length > chunkSize) {
    chunks.length = 0;
    for (let i = 0; i < text.length; i += chunkSize - overlap) {
      chunks.push(text.slice(i, i + chunkSize));
    }
  }

  return chunks.filter((c) => c.trim().length > 50);
}

// ─── OCR PDF BẰNG GEMINI VISION ──────────────────────────────
async function ocrPDF(filePath: string): Promise<string | null> {
  console.log(`  📷 OCR: ${path.basename(filePath)}`);

  const pdfBytes = fs.readFileSync(filePath);
  const base64 = pdfBytes.toString("base64");

  const prompt = `Đây là tài liệu hành chính của Trường Đại học Bách Khoa - Đại học Đà Nẵng.
Hãy trích xuất TOÀN BỘ nội dung văn bản. Yêu cầu:
- Giữ nguyên cấu trúc: tiêu đề, điều, khoản, mục
- Giữ nguyên số hiệu văn bản, ngày tháng, tên người ký
- Bảng biểu chuyển thành text có cấu trúc rõ ràng
- Không thêm bình luận, chỉ trích xuất text thuần`;

  try {
    const result = await visionModel.generateContent([
      { inlineData: { mimeType: "application/pdf", data: base64 } },
      prompt,
    ]);
    return result.response.text();
  } catch (err: any) {
    console.error(`  ❌ OCR lỗi: ${err.message}`);
    return null;
  }
}

// ─── ĐỌC DOCX ────────────────────────────────────────────────
async function readDocx(filePath: string): Promise<string> {
  console.log(`  📄 Đọc DOCX: ${path.basename(filePath)}`);
  const result = await mammoth.extractRawText({ path: filePath });
  return result.value;
}

// ─── ĐỌC EXCEL ───────────────────────────────────────────────
function readExcel(filePath: string): string {
  console.log(`  📊 Đọc Excel: ${path.basename(filePath)}`);
  const workbook = XLSX.readFile(filePath);
  const chunks: string[] = [];

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: "" });

    for (const row of rows) {
      // Mỗi người = 1 dòng text rõ ràng
      const parts = Object.entries(row)
        .filter(([, v]) => v !== "")
        .map(([k, v]) => `${k}: ${v}`);
      if (parts.length > 0) {
        chunks.push(parts.join("\n"));
      }
    }
  }

  return chunks.join("\n---\n");
}

// ─── TẠO EMBEDDING ───────────────────────────────────────────
async function rateLimitEmbedding(): Promise<void> {
  const now = Date.now();
  const elapsed = now - lastEmbedAt;
  if (elapsed < embedIntervalMs) {
    await sleep(embedIntervalMs - elapsed);
  }
  lastEmbedAt = Date.now();
}

async function createEmbedding(text: string): Promise<number[]> {
  let attempt = 0;
  let lastError: unknown;

  while (attempt <= EMBED_MAX_RETRIES) {
    try {
      await rateLimitEmbedding();
      const result = await embedModel.embedContent(text);
      return result.embedding.values;
    } catch (err: any) {
      lastError = err;
      const status = err?.status ?? err?.response?.status;
      const isRateLimit = status === 429;
      const backoffMs = Math.min(30000, 2000 * Math.pow(2, attempt));
      const jitter = Math.floor(Math.random() * 250);
      if (!isRateLimit && attempt >= EMBED_MAX_RETRIES) {
        break;
      }
      console.warn(
        `  ⚠️ Embedding lỗi${isRateLimit ? " (429)" : ""}, thử lại sau ${backoffMs}ms...`
      );
      await sleep(backoffMs + jitter);
      attempt++;
    }
  }

  throw lastError;
}

// ─── LƯU VÀO SUPABASE ────────────────────────────────────────
async function saveChunks(
  chunks: string[],
  source: string,
  folder: string,
  category: string
): Promise<void> {
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];

    // Tạo embedding
    const embedding = await createEmbedding(chunk);
    // Lưu vào Supabase
    const { error } = await supabase.from("documents").insert({
      content: chunk,
      embedding,
      source,
      folder,
      category,
      chunk_index: i,
    });

    if (error) {
      console.error(`  ❌ Lỗi lưu chunk ${i}: ${error.message}`);
    } else {
      process.stdout.write(`  💾 Chunk ${i + 1}/${chunks.length}\r`);
    }
  }
  console.log(`  ✅ Đã lưu ${chunks.length} chunks`);
}

// ─── KIỂM TRA FILE ĐÃ INDEX CHƯA ────────────────────────────
async function isAlreadyIndexed(source: string): Promise<boolean> {
  const { count } = await supabase
    .from("documents")
    .select("id", { count: "exact", head: true })
    .eq("source", source);
  return (count ?? 0) > 0;
}

// ─── MAIN ────────────────────────────────────────────────────
async function main() {
  // Kiểm tra env
  if (!GEMINI_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("❌ Thiếu biến môi trường. Kiểm tra lại .env");
    process.exit(1);
  }
  if (!DATA_DIR || !fs.existsSync(DATA_DIR)) {
    console.error(`❌ DATA_DIR không tồn tại: ${DATA_DIR}`);
    process.exit(1);
  }

  console.log("🚀 Bắt đầu pipeline RAG...\n");

  const folders = fs
    .readdirSync(DATA_DIR)
    .filter((f) => fs.statSync(path.join(DATA_DIR, f)).isDirectory());

  let totalDocs = 0;
  let totalChunks = 0;
  let skipped = 0;

  for (const folder of folders) {
    const folderPath = path.join(DATA_DIR, folder);
    const category = CATEGORY_MAP[folder] ?? folder.toLowerCase().replace(/\s+/g, "-");
    const files = fs.readdirSync(folderPath);

    console.log(`\n📁 ${folder} (${files.length} file)`);

    for (const file of files) {
      const filePath = path.join(folderPath, file);
      const ext = path.extname(file).toLowerCase();

      // Bỏ qua file không hỗ trợ
      if (![".pdf", ".docx", ".xlsx", ".xls"].includes(ext)) {
        console.log(`  ⏭ Bỏ qua: ${file}`);
        continue;
      }

      // Bỏ qua nếu đã index rồi (tiện khi chạy lại)
      const alreadyDone = await isAlreadyIndexed(file);
      if (alreadyDone) {
        console.log(`  ⏭ Đã index rồi: ${file}`);
        skipped++;
        continue;
      }

      // Trích xuất text
      let rawText: string | null = null;
      if (ext === ".pdf") {
        rawText = await ocrPDF(filePath);
        // Delay 7 giây sau mỗi OCR - tránh rate limit Gemini (10 req/phút)
        console.log("  ⏳ Chờ 7s tránh rate limit...");
        await sleep(7000);
      } else if (ext === ".docx") {
        rawText = await readDocx(filePath);
      } else {
        rawText = readExcel(filePath);
      }

      if (!rawText || rawText.trim().length < 50) {
        console.log(`  ⚠️ Không đọc được nội dung: ${file}`);
        continue;
      }

      // Chunking
      const chunks = chunkText(rawText);
      console.log(`  ✂️  ${chunks.length} chunks`);

      // Lưu vào Supabase
      await saveChunks(chunks, file, folder, category);

      totalDocs++;
      totalChunks += chunks.length;
    }
  }

  console.log(`\n${"=".repeat(50)}`);
  console.log(`🎉 HOÀN THÀNH!`);
  console.log(`   Tài liệu đã index : ${totalDocs}`);
  console.log(`   Bỏ qua (đã có)    : ${skipped}`);
  console.log(`   Tổng chunks        : ${totalChunks}`);
}

main().catch(console.error);
