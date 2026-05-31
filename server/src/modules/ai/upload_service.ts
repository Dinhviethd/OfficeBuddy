import * as fs from "fs";
import * as path from "path";
import mammoth from "mammoth";
import * as XLSX from "xlsx";
const pdf = require("pdf-parse");
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import { AppError } from "@/utils/error.response";

// Initialize Supabase Client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Initialize Gemini Client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const embedModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });

/**
 * Split text into chunks based on word count with overlap
 */
function chunkTextByWords(text: string, maxWords = 500, overlap = 50): string[] {
  const words = text.trim().split(/\s+/);
  if (words.length === 0 || words[0] === "") return [];

  const chunks: string[] = [];
  let i = 0;

  while (i < words.length) {
    const chunkWords = words.slice(i, i + maxWords);
    chunks.push(chunkWords.join(" "));

    if (i + maxWords >= words.length) {
      break;
    }

    i += (maxWords - overlap);
  }

  return chunks;
}

/**
 * Generate vector embedding for a single text chunk
 */
async function getEmbedding(text: string): Promise<number[]> {
  try {
    const result = await embedModel.embedContent(text);
    return result.embedding.values;
  } catch (err: any) {
    throw new AppError(500, `Lỗi tạo embedding từ Gemini: ${err.message}`);
  }
}

/**
 * Ingest document file: extract text, chunk, embed, and store in Supabase
 */
export async function ingestDocument(
  filePath: string,
  fileName: string,
  category: string,
  uploadedBy: string,
  fileDescription: string
): Promise<{ success: boolean; chunksInserted: number }> {
  const ext = path.extname(fileName).toLowerCase();
  let extractedText = "";

  // 1. Parse file content based on extension
  try {
    if (ext === ".docx") {
      const result = await mammoth.extractRawText({ path: filePath });
      extractedText = result.value;
    } else if (ext === ".xlsx" || ext === ".xls") {
      const workbook = XLSX.readFile(filePath);
      const sheetChunks: string[] = [];
      for (const sheetName of workbook.SheetNames) {
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: "" });
        for (const row of rows) {
          const parts = Object.entries(row)
            .filter(([, v]) => v !== "")
            .map(([k, v]) => `${k}: ${v}`);
          if (parts.length > 0) {
            sheetChunks.push(parts.join("\n"));
          }
        }
      }
      extractedText = sheetChunks.join("\n---\n");
    } else if (ext === ".pdf") {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdf(dataBuffer);
      extractedText = pdfData.text;
    } else if (ext === ".txt") {
      extractedText = await fs.promises.readFile(filePath, "utf-8");
    } else {
      throw new AppError(400, `Hệ thống không hỗ trợ định dạng file ${ext}`);
    }
  } catch (err: any) {
    if (err instanceof AppError) throw err;
    throw new AppError(500, `Lỗi trích xuất văn bản từ file: ${err.message}`);
  }

  if (!extractedText || extractedText.trim().length < 10) {
    throw new AppError(400, "File trống hoặc không có nội dung văn bản hợp lệ để trích xuất.");
  }

  // 2. Chunk text (max 500 words, overlap 50 words)
  const chunks = chunkTextByWords(extractedText, 500, 50);
  if (chunks.length === 0) {
    throw new AppError(400, "Không thể tạo các chunks văn bản từ file này.");
  }

  // 3. Process and insert each chunk
  let chunksInsertedCount = 0;
  for (let i = 0; i < chunks.length; i++) {
    const chunkText = chunks[i];

    // Embed chunk
    const embedding = await getEmbedding(chunkText);

    // Save chunk to Supabase documents table
    const { error } = await supabase.from("documents").insert({
      content: chunkText,
      embedding,
      source: fileName,
      folder: category,
      category: category,
      chunk_index: i,
      uploaded_by: uploadedBy,
      file_description: fileDescription,
      uploaded_at: new Date().toISOString()
    });

    if (error) {
      throw new AppError(500, `Lỗi lưu chunk thứ ${i + 1} vào database: ${error.message}`);
    }
    chunksInsertedCount++;
  }

  return {
    success: true,
    chunksInserted: chunksInsertedCount
  };
}
