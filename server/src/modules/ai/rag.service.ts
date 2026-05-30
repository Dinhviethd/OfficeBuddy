import { GoogleGenerativeAI, Content } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";

// ─── KHỞI TẠO ────────────────────────────────────────────────
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const embedModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
const llmModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Lưu lịch sử chat theo sessionId
const chatHistories = new Map<string, Content[]>();

// ─── TYPES ───────────────────────────────────────────────────
interface RetrievedChunk {
  content: string;
  source: string;
  folder: string;
  category: string;
  similarity: number;
}

interface ChatResult {
  answer: string;
  sources: { file: string; folder: string; similarity: string }[];
}

// ─── TÌM KIẾM TRONG SUPABASE ─────────────────────────────────
async function retrieve(
  query: string,
  topK = 5,
  categoryFilter?: string
): Promise<RetrievedChunk[]> {
  // Tạo embedding cho câu hỏi
  const result = await embedModel.embedContent(query);
  const queryEmbedding = result.embedding.values;

  // Gọi function match_documents trong Supabase
  const { data, error } = await supabase.rpc("match_documents", {
    query_embedding: queryEmbedding,
    match_threshold: 0.3,
    match_count: categoryFilter ? 100 : topK, // Tăng lên 100 để không bỏ sót các bản ghi danh mục cụ thể
  });

  if (error) throw new Error(`Supabase query lỗi: ${error.message}`);

  let chunks: RetrievedChunk[] = data ?? [];

  // Lọc theo category nếu có
  if (categoryFilter) {
    chunks = chunks.filter((c) => c.category === categoryFilter).slice(0, topK);
  }

  return chunks;
}

// ─── HỎI ĐÁP CÓ RAG ─────────────────────────────────────────
async function ragChat(
  sessionId: string,
  question: string,
  docContent = ""
): Promise<ChatResult> {
  // Lấy context từ kho RAG
  let chunks = await retrieve(question, 8);

  // Nếu câu hỏi liên quan đến nhân sự, liên hệ, danh bạ... chủ động lấy thêm thông tin từ danh bạ
  const lowerQ = question.toLowerCase();
  if (
    lowerQ.includes("hiệu trưởng") || 
    lowerQ.includes("trưởng phòng") || 
    lowerQ.includes("danh bạ") || 
    lowerQ.includes("sđt") || 
    lowerQ.includes("số điện thoại") || 
    lowerQ.includes("liên hệ") || 
    lowerQ.includes("email") ||
    lowerQ.includes("nhân sự") ||
    lowerQ.includes("thầy") ||
    lowerQ.includes("cô")
  ) {
    try {
      const contactChunks = await retrieve(question, 5, "danh-ba");
      const existingContents = new Set(chunks.map(c => c.content));
      for (const cc of contactChunks) {
        if (!existingContents.has(cc.content)) {
          chunks.push(cc);
        }
      }
    } catch (err) {
      console.error("Lỗi lấy thêm dữ liệu danh bạ:", err);
    }
  }

  const relevantChunks = chunks.filter((c) => c.similarity > 0.25);

  // Xây dựng context từ RAG
  let ragContext = "";
  if (relevantChunks.length > 0) {
    ragContext =
      "=== TÀI LIỆU THAM KHẢO ===\n" +
      relevantChunks
        .map((c, i) => `[TÀI LIỆU ${i + 1}]\n- Thư mục: ${c.folder}\n- Tên file nguồn: ${c.source}\n- Nội dung:\n${c.content}`)
        .join("\n\n---\n\n");
  }

  // Xây dựng message gửi lên Gemini
  let userMessage = "";
  if (ragContext) userMessage += ragContext + "\n\n";
  if (docContent) userMessage += `=== NỘI DUNG FILE WORD ĐANG MỞ ===\n${docContent.slice(0, 3000)}\n\n`;
  userMessage += `=== CÂU HỎI ===\n${question}`;

  // Lấy hoặc tạo lịch sử chat
  if (!chatHistories.has(sessionId)) {
    chatHistories.set(sessionId, []);
  }
  const history = chatHistories.get(sessionId)!;

  // Gọi Gemini với history
  const chat = llmModel.startChat({
    history,
    systemInstruction: {
      role: "system",
      parts: [{
        text: `Bạn là trợ lý văn phòng AI của Trường Đại học Bách Khoa - Đại học Đà Nẵng.
Nhiệm vụ: hỗ trợ cán bộ, giảng viên, sinh viên tra cứu quy định và soạn thảo văn bản hành chính.
Luôn trả lời bằng tiếng Việt, chính xác, ngắn gọn.

Quan trọng:
- Khi có nhiều nguồn mâu thuẫn nhau, ưu tiên thông tin từ thư mục "Danh bạ" (file "DanhBa_DUT_edited.xlsx") vì đây là thông tin cập nhật nhất
- Khi trả lời về nhân sự (hiệu trưởng, trưởng phòng...), CHỈ lấy từ thư mục "Danh bạ" (file "DanhBa_DUT_edited.xlsx"), bỏ qua các văn bản khác
- Trích dẫn nguồn cụ thể sau mỗi thông tin
- Nếu không tìm thấy trong tài liệu, nói rõ không có trong kho dữ liệu`
      }]
    },
  });

  const response = await chat.sendMessage(userMessage);
  const answer = response.response.text();

  // Cập nhật lịch sử
  history.push({ role: "user", parts: [{ text: userMessage }] });
  history.push({ role: "model", parts: [{ text: answer }] });

  // Giữ tối đa 10 lượt chat để tránh context quá dài
  if (history.length > 20) history.splice(0, 2);

  return {
    answer,
    sources: relevantChunks.map((c) => ({
      file: c.source,
      folder: c.folder,
      similarity: Math.round(c.similarity * 100) + "%",
    })),
  };
}

function clearChatHistory(sessionId: string): void {
  chatHistories.delete(sessionId);
}

// ─── SINH VĂN BẢN CÓ RAG ────────────────────────────────────
const DOC_TYPE_LABELS: Record<string, string> = {
  "don-xin-cap-lai-cc-gdqp": "Đơn xin cấp lại chứng chỉ Giáo dục Quốc phòng An ninh",
  "don-xin-mien-hoc-chuyen-diem-nn": "Đơn xin miễn học, chuyển điểm Ngoại ngữ",
  "don-xin-hoan-hoc-gdqp": "Đơn xin hoãn học Giáo dục Quốc phòng",
  "don-xin-chuyen-ctdt": "Đơn xin chuyển chương trình đào tạo",
  "don-xin-gia-han-hoc-phi": "Đơn xin gia hạn học phí",
  "don-xin-xet-tot-nghiep-ks": "Đơn xin xét tốt nghiệp Kỹ sư",
};

async function ragGenerateFromForm(
  docType: string,
  formData: Record<string, string>
): Promise<string> {
  const label = DOC_TYPE_LABELS[docType] ?? docType;

  // Tìm mẫu văn bản tương tự trong kho
  const templateChunks = await retrieve(`mẫu ${label} biểu mẫu`, 3, "bieu-mau");
  let templateContext = "";
  if (templateChunks.length > 0) {
    templateContext =
      "Mẫu văn bản thực tế của trường:\n" +
      templateChunks.map((c) => c.content).join("\n---\n") +
      "\n\n";
  }

  const prompt = `${templateContext}Soạn ${label} theo đúng thể thức văn bản hành chính Nhà nước Việt Nam.
Thông tin được cung cấp:
${Object.entries(formData)
  .filter(([, v]) => v)
  .map(([k, v]) => `- ${k}: ${v}`)
  .join("\n")}

Yêu cầu: đủ Quốc hiệu, tiêu ngữ, số hiệu, ngày tháng, nội dung, ký tên.
Thông tin còn thiếu dùng dấu [...] để người dùng bổ sung.`;

  const result = await llmModel.generateContent(prompt);
  return result.response.text();
}

async function ragGenerateFromFreeText(request: string): Promise<string> {
  // Tìm mẫu liên quan trong kho
  const chunks = await retrieve(request, 3, "bieu-mau");
  let context = "";
  if (chunks.length > 0) {
    context =
      "Tài liệu tham khảo từ kho:\n" +
      chunks.map((c) => c.content).join("\n---\n") +
      "\n\n";
  }

  const prompt = `${context}Yêu cầu của người dùng: "${request}"

Hãy:
1. Xác định loại văn bản cần soạn
2. Soạn thảo đầy đủ, đúng thể thức văn bản hành chính Nhà nước Việt Nam
3. Thông tin còn thiếu dùng dấu [...] để người dùng bổ sung
Trả về văn bản hoàn chỉnh.`;

  const result = await llmModel.generateContent(prompt);
  return result.response.text();
}

export {
  retrieve,
  ragChat,
  clearChatHistory,
  ragGenerateFromForm,
  ragGenerateFromFreeText,
};
