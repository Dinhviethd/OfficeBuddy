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

// ─── NORMALIZE DỮ LIỆU NGƯỜI DÙNG (xử lý ở TypeScript, không nhờ AI) ───
function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
    .trim();
}

function normalizeFormData(data: Record<string, string>): Record<string, string> {
  const NAME_FIELDS = ["hoTen", "ho_ten", "fullName", "name", "ten"];
  const UPPER_FIELDS = ["lop", "mssv", "soTheSV", "khoa", "nganh"];

  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(data)) {
    if (!value) { result[key] = value; continue; }

    if (NAME_FIELDS.some((f) => key.toLowerCase().includes(f.toLowerCase()))) {
      result[key] = toTitleCase(value);
    } else if (UPPER_FIELDS.some((f) => key.toLowerCase().includes(f.toLowerCase()))) {
      result[key] = value.toUpperCase().trim();
    } else {
      result[key] = value;
    }
  }
  return result;
}

// ─── HTML LAYOUT RULES (single source of truth) ──────────────
const HTML_LAYOUT_RULES = `
QUAN TRỌNG VỀ ĐỊNH DẠNG (BẮT BUỘC TUÂN THỦ 100%):
1. Trả về HTML THUẦN TÚY — KHÔNG dùng Markdown (**, *, #), KHÔNG bọc trong \`\`\`html ... \`\`\`.
2. Chỉ trả về HTML fragment, KHÔNG có <html>, <head>, <body>.
3. WRAPPER BẮT BUỘC — bọc toàn bộ nội dung trong:
   <div style="font-family:'Times New Roman',Times,serif;font-size:13pt;line-height:1.5;color:#000000">
     ...
   </div>
   Tuyệt đối không khai báo font-family hay font-size ở thẻ con nào. Thẻ con chỉ dùng: font-weight, font-style, text-align, text-indent, margin.

CÁC QUY TẮC LAYOUT:

[QT1] Quốc hiệu / Tiêu ngữ:
<p style="text-align:center;margin-bottom:0"><strong>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</strong></p>
<p style="text-align:center;margin-top:0;margin-bottom:0">Độc lập – Tự do – Hạnh phúc</p>
<p style="text-align:center;margin-top:4pt">────────────────</p>

[QT2] Tên loại văn bản:
<p style="text-align:center;margin-top:16pt;margin-bottom:16pt"><strong>TÊN VĂN BẢN VIẾT HOA TOÀN BỘ</strong></p>

[QT3] Kính gửi — mỗi đơn vị trọn một dòng:
<p style="margin-bottom:4pt"><strong>Kính gửi:</strong></p>
<ul style="margin-top:0;margin-left:40pt;list-style-type:disc">
  <li style="margin-bottom:4pt">TÊN ĐƠN VỊ NHẬN</li>
</ul>

[QT4] Thông tin cá nhân ngang hàng — dùng table borderless:
<table style="width:100%;border:none;border-collapse:collapse;margin-top:12pt;margin-bottom:4pt">
  <tr>
    <td style="width:50%;padding:2pt 0">Em tên là: <strong>[Họ Tên]</strong></td>
    <td style="width:50%;padding:2pt 0">Ngày sinh: <strong>[...]</strong></td>
  </tr>
  <tr>
    <td style="padding:2pt 0">Sinh viên lớp: <strong>[Lớp]</strong></td>
    <td style="padding:2pt 0">Số thẻ SV: <strong>[MSSV]</strong></td>
  </tr>
  <tr>
    <td colspan="2" style="padding:2pt 0">Thuộc Khoa: <strong>[Tên Khoa]</strong></td>
  </tr>
</table>

[QT5] Nội dung thân văn bản:
<p style="text-align:justify;text-indent:40pt;margin-bottom:8pt">...</p>

[QT6] Phần cuối — Xác nhận trường (trái) + Chữ ký (phải), table 2 cột độc lập:
<table style="width:100%;border:none;border-collapse:collapse;margin-top:24pt">
  <tr>
    <td style="width:50%;vertical-align:top;padding-right:10pt">
      <p style="margin-bottom:8pt"><strong>Xác nhận của trường ĐH Bách Khoa</strong></p>
      <p style="margin-bottom:8pt">Kính chuyển Quý Trường xem xét giải quyết./.</p>
      <p style="margin-bottom:4pt"><strong>TL.HIỆU TRƯỞNG</strong></p>
      <p><strong>TRƯỞNG PHÒNG ĐÀO TẠO</strong></p>
    </td>
    <td style="width:50%;vertical-align:top;text-align:center">
      <p style="margin-bottom:4pt">Đà Nẵng, ngày [...] tháng [...] năm [...]</p>
      <p style="margin-bottom:16pt"><strong>Người làm đơn</strong></p>
      <p style="margin-bottom:16pt"><em>(Ký tên và ghi rõ họ tên)</em></p>
      <p><strong>[Họ Tên]</strong></p>
    </td>
  </tr>
</table>

QUY TẮC TUYỆT ĐỐI:
- Placeholder chưa có thông tin: chỉ dùng <strong>[...]</strong>
- Không dùng float, position:absolute, column-count
- Dữ liệu người dùng đã được chuẩn hóa sẵn, dùng nguyên không sửa lại
`;

// ─── TÌM KIẾM TRONG SUPABASE ─────────────────────────────────
async function retrieve(
  query: string,
  topK = 5,
  categoryFilter?: string
): Promise<RetrievedChunk[]> {
  const result = await embedModel.embedContent(query);
  const queryEmbedding = result.embedding.values;

  const { data, error } = await supabase.rpc("match_documents", {
    query_embedding: queryEmbedding,
    match_threshold: 0.3,
    match_count: categoryFilter ? 100 : topK,
  });

  if (error) throw new Error(`Supabase query lỗi: ${error.message}`);

  let chunks: RetrievedChunk[] = data ?? [];

  if (categoryFilter) {
    chunks = chunks.filter((c) => c.category === categoryFilter).slice(0, topK);
  }

  return chunks;
}

// ─── KEYWORDS NHẬN DIỆN CÂU HỎI DANH BẠ ─────────────────────
const CONTACT_KEYWORDS = [
  "hiệu trưởng", "trưởng phòng", "danh bạ",
  "sđt", "số điện thoại", "liên hệ",
  "email", "nhân sự", "thầy", "cô",
];

// ─── HỎI ĐÁP CÓ RAG ─────────────────────────────────────────
async function ragChat(
  sessionId: string,
  question: string,
  docContent = ""
): Promise<ChatResult> {
  let chunks = await retrieve(question, 8);

  // Bổ sung danh bạ nếu câu hỏi liên quan nhân sự
  const lowerQ = question.toLowerCase();
  if (CONTACT_KEYWORDS.some((kw) => lowerQ.includes(kw))) {
    try {
      const contactChunks = await retrieve(question, 5, "danh-ba");
      const existingContents = new Set(chunks.map((c) => c.content));
      for (const cc of contactChunks) {
        if (!existingContents.has(cc.content)) chunks.push(cc);
      }
    } catch (err) {
      console.error("Lỗi lấy thêm dữ liệu danh bạ:", err);
    }
  }

  const relevantChunks = chunks.filter((c) => c.similarity > 0.25);

  let ragContext = "";
  if (relevantChunks.length > 0) {
    ragContext =
      "=== TÀI LIỆU THAM KHẢO ===\n" +
      relevantChunks
        .map(
          (c, i) =>
            `[TÀI LIỆU ${i + 1}]\n- Thư mục: ${c.folder}\n- Tên file nguồn: ${c.source}\n- Nội dung:\n${c.content}`
        )
        .join("\n\n---\n\n");
  }

  let userMessage = "";
  if (ragContext) userMessage += ragContext + "\n\n";
  if (docContent)
    userMessage += `=== NỘI DUNG FILE WORD ĐANG MỞ ===\n${docContent.slice(0, 3000)}\n\n`;
  userMessage += `=== CÂU HỎI ===\n${question}`;

  if (!chatHistories.has(sessionId)) chatHistories.set(sessionId, []);
  const history = chatHistories.get(sessionId)!;

  const chat = llmModel.startChat({
    history,
    systemInstruction: {
      role: "system",
      parts: [
        {
          text: `Bạn là trợ lý văn phòng AI của Trường Đại học Bách Khoa - Đại học Đà Nẵng.
Nhiệm vụ: hỗ trợ cán bộ, giảng viên, sinh viên tra cứu quy định và soạn thảo văn bản hành chính.
Luôn trả lời bằng tiếng Việt, chính xác, ngắn gọn.

Quan trọng:
- Khi có nhiều nguồn mâu thuẫn nhau, ưu tiên thông tin từ thư mục "Danh bạ" (file "DanhBa_DUT_edited.xlsx")
- Khi trả lời về nhân sự, CHỈ lấy từ thư mục "Danh bạ", bỏ qua các văn bản khác
- Trích dẫn nguồn cụ thể sau mỗi thông tin
- Nếu không tìm thấy trong tài liệu, nói rõ không có trong kho dữ liệu`,
        },
      ],
    },
  });

  const response = await chat.sendMessage(userMessage);
  const answer = response.response.text();

  history.push({ role: "user", parts: [{ text: userMessage }] });
  history.push({ role: "model", parts: [{ text: answer }] });

  // Giữ tối đa 10 lượt chat
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

  // Normalize dữ liệu trước khi gửi lên AI
  const normalizedData = normalizeFormData(formData);

  const templateChunks = await retrieve(`mẫu ${label} biểu mẫu`, 3, "bieu-mau");
  const templateContext =
    templateChunks.length > 0
      ? "Mẫu văn bản thực tế của trường:\n" +
        templateChunks.map((c) => c.content).join("\n---\n") +
        "\n\n"
      : "";

  const formDataText = Object.entries(normalizedData)
    .filter(([, v]) => v)
    .map(([k, v]) => `- ${k}: ${v}`)
    .join("\n");

  const prompt = `${templateContext}Soạn ${label} theo đúng thể thức văn bản hành chính Nhà nước Việt Nam.
Thông tin được cung cấp:
${formDataText}

Yêu cầu: đủ Quốc hiệu, tiêu ngữ, số hiệu, ngày tháng, nội dung, ký tên.

${HTML_LAYOUT_RULES}`;

  const result = await llmModel.generateContent(prompt);
  return result.response.text();
}

async function ragGenerateFromFreeText(request: string): Promise<string> {
  const chunks = await retrieve(request, 3, "bieu-mau");
  const context =
    chunks.length > 0
      ? "Tài liệu tham khảo từ kho:\n" +
        chunks.map((c) => c.content).join("\n---\n") +
        "\n\n"
      : "";

  const prompt = `${context}Yêu cầu của người dùng: "${request}"

Hãy:
1. Xác định loại văn bản cần soạn
2. Soạn thảo đầy đủ, đúng thể thức văn bản hành chính Nhà nước Việt Nam
3. Thông tin còn thiếu dùng <strong>[...]</strong> để người dùng bổ sung

${HTML_LAYOUT_RULES}`;

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