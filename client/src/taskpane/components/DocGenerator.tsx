import * as React from "react";
import { API_BASE_URL } from "../../config";

/* ─── Types ──────────────────────────────────────────────── */
type Mode = "form" | "free";

interface FieldDef {
  key: string;
  label: string;
  placeholder?: string;
  multiline?: boolean;
}

interface DocTypeDef {
  value: string;
  label: string;
  fields: FieldDef[];
}

/* ─── Document type definitions ──────────────────────────── */
const DOC_TYPES: DocTypeDef[] = [
  {
    value: "don-xin-cap-lai-cc-gdqp",
    label: "Đơn xin cấp lại CC GDQP-AN",
    fields: [
      { key: "hoTen", label: "Họ và tên", placeholder: "VD: Nguyễn Văn A" },
      { key: "maSV", label: "Mã số sinh viên", placeholder: "VD: 102210001" },
      { key: "lop", label: "Lớp sinh hoạt", placeholder: "VD: 21T1" },
      { key: "khoa", label: "Khoa quản lý", placeholder: "VD: Công nghệ thông tin" },
      { key: "khoaHocGDQP", label: "Khóa học quân sự", placeholder: "VD: Khóa 256 năm 2023 tại Trung tâm GDQP-AN" },
      { key: "lyDo", label: "Lý do xin cấp lại", placeholder: "VD: Bị thất lạc, rách hỏng...", multiline: true },
      { key: "ngay", label: "Ngày làm đơn", placeholder: "VD: 31/05/2026" },
    ],
  },
  {
    value: "don-xin-mien-hoc-chuyen-diem-nn",
    label: "Đơn xin miễn học, chuyển điểm Ngoại ngữ",
    fields: [
      { key: "hoTen", label: "Họ và tên", placeholder: "VD: Nguyễn Văn A" },
      { key: "maSV", label: "Mã số sinh viên", placeholder: "VD: 102210001" },
      { key: "lop", label: "Lớp sinh hoạt", placeholder: "VD: 21T1" },
      { key: "chungChi", label: "Chứng chỉ ngoại ngữ", placeholder: "VD: IELTS 6.5 / TOEIC 700..." },
      { key: "diemChungChi", label: "Điểm số/Kết quả", placeholder: "VD: 6.5" },
      { key: "hocPhanMien", label: "Các học phần xin miễn", placeholder: "VD: Anh văn 1, Anh văn 2, Anh văn 3", multiline: true },
      { key: "ngay", label: "Ngày làm đơn", placeholder: "VD: 31/05/2026" },
    ],
  },
  {
    value: "don-xin-hoan-hoc-gdqp",
    label: "Đơn xin hoãn học GDQP",
    fields: [
      { key: "hoTen", label: "Họ và tên", placeholder: "VD: Nguyễn Văn A" },
      { key: "maSV", label: "Mã số sinh viên", placeholder: "VD: 102210001" },
      { key: "lop", label: "Lớp sinh hoạt", placeholder: "VD: 21T1" },
      { key: "khoa", label: "Khoa quản lý", placeholder: "VD: Công nghệ thông tin" },
      { key: "thoiGianHoan", label: "Thời gian hoãn (Học kỳ)", placeholder: "VD: Học kỳ 1 năm học 2025-2026" },
      { key: "lyDo", label: "Lý do xin hoãn học", placeholder: "Trình bày lý do chi tiết (sức khỏe, công tác...)", multiline: true },
      { key: "ngay", label: "Ngày làm đơn", placeholder: "VD: 31/05/2026" },
    ],
  },
  {
    value: "don-xin-chuyen-ctdt",
    label: "Đơn xin chuyển chương trình đào tạo",
    fields: [
      { key: "hoTen", label: "Họ và tên", placeholder: "VD: Nguyễn Văn A" },
      { key: "maSV", label: "Mã số sinh viên", placeholder: "VD: 102210001" },
      { key: "lop", label: "Lớp sinh hoạt", placeholder: "VD: 21T1" },
      { key: "nganhHienTai", label: "Ngành đào tạo hiện tại", placeholder: "VD: Kỹ sư Công nghệ thông tin (KS)" },
      { key: "nganhMuonChuyen", label: "Ngành/Chương trình muốn chuyển", placeholder: "VD: Cử nhân Công nghệ thông tin (CN-KS2)" },
      { key: "lyDo", label: "Lý do xin chuyển", placeholder: "Trình bày nguyện vọng, lý do chuyển ngành...", multiline: true },
      { key: "ngay", label: "Ngày làm đơn", placeholder: "VD: 31/05/2026" },
    ],
  },
  {
    value: "don-xin-gia-han-hoc-phi",
    label: "Đơn xin gia hạn học phí",
    fields: [
      { key: "hoTen", label: "Họ và tên", placeholder: "VD: Nguyễn Văn A" },
      { key: "maSV", label: "Mã số sinh viên", placeholder: "VD: 102210001" },
      { key: "lop", label: "Lớp sinh hoạt", placeholder: "VD: 21T1" },
      { key: "soTien", label: "Số tiền học phí xin gia hạn", placeholder: "VD: 12.500.000 VNĐ" },
      { key: "hocKy", label: "Gia hạn cho học kỳ", placeholder: "VD: Học kỳ 2 năm học 2025-2026" },
      { key: "thoiGianGiaHan", label: "Thời hạn cam kết hoàn thành", placeholder: "VD: cam kết nộp trước ngày 30/06/2026" },
      { key: "lyDo", label: "Lý do / Hoàn cảnh gia đình", placeholder: "VD: Gia đình gặp khó khăn tài chính đột xuất...", multiline: true },
      { key: "ngay", label: "Ngày làm đơn", placeholder: "VD: 31/05/2026" },
    ],
  },
  {
    value: "don-xin-xet-tot-nghiep-ks",
    label: "Đơn xin xét tốt nghiệp Kỹ sư",
    fields: [
      { key: "hoTen", label: "Họ và tên", placeholder: "VD: Nguyễn Văn A" },
      { key: "maSV", label: "Mã số sinh viên", placeholder: "VD: 102210001" },
      { key: "lop", label: "Lớp sinh hoạt", placeholder: "VD: 21T1" },
      { key: "khoa", label: "Khoa quản lý", placeholder: "VD: Công nghệ thông tin" },
      { key: "tichLuy", label: "Số tín chỉ tích lũy", placeholder: "VD: 154 tín chỉ" },
      { key: "tbTL", label: "Điểm trung bình tích lũy", placeholder: "VD: 3.25 (Thang 4)" },
      { key: "ngay", label: "Ngày làm đơn", placeholder: "VD: 31/05/2026" },
    ],
  },
];

/* ─── Constants ──────────────────────────────────────────── */

/* ─── Component ──────────────────────────────────────────── */
const DocGenerator: React.FC = () => {
  // ── Mode ──
  const [mode, setMode] = React.useState<Mode>("form");

  // ── Form mode state ──
  const [selectedType, setSelectedType] = React.useState(DOC_TYPES[0].value);
  const [formData, setFormData] = React.useState<Record<string, string>>({});

  // ── Free mode state ──
  const [freeText, setFreeText] = React.useState("");

  // ── Result state ──
  const [result, setResult] = React.useState("");
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [error, setError] = React.useState("");
  const [copySuccess, setCopySuccess] = React.useState(false);
  const [insertSuccess, setInsertSuccess] = React.useState(false);

  const resultRef = React.useRef<HTMLDivElement>(null);
  const resultSectionRef = React.useRef<HTMLDivElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  /* ── Get current doc type definition ── */
  const currentDocType = DOC_TYPES.find((d) => d.value === selectedType) ?? DOC_TYPES[0];

  /* ── Reset form data when doc type changes ── */
  React.useEffect(() => {
    setFormData({});
  }, [selectedType]);

  /* ── Scroll result/error into view smoothly ── */
  React.useEffect(() => {
    if (result && resultSectionRef.current) {
      setTimeout(() => {
        resultSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }, 150);
    }
  }, [result]);

  React.useEffect(() => {
    if (error && containerRef.current) {
      const el = containerRef.current;
      setTimeout(() => {
        el.scrollTo({
          top: 0,
          behavior: "smooth"
        });
      }, 100);
    }
  }, [error]);

  /* ── Update a form field ── */
  const handleFieldChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  /* ── Friendly error parser ── */
  const getFriendlyError = (err: any): string => {
    const msg = err.message || "Đã xảy ra lỗi";
    if (msg.includes("429") || msg.includes("Quota exceeded") || msg.includes("quota")) {
      return "Hết hạn mức miễn phí của API Key Gemini hôm nay (429 Quota Exceeded). Vui lòng đổi API Key mới trong file .env ở server và khởi động lại server.";
    }
    if (msg.includes("503") || msg.includes("Service Unavailable")) {
      return "Dịch vụ Gemini đang quá tải hoặc tạm thời không khả dụng (503 Service Unavailable). Vui lòng thử lại sau vài giây hoặc đổi sang API Key khác.";
    }
    if (msg.includes("Failed to fetch") || msg.includes("fetch")) {
      return "Không thể kết nối đến server API (Failed to fetch). Vui lòng kiểm tra xem server backend đã chạy chưa (cổng 8000).";
    }
    return msg;
  };

  /* ── Clean HTML Markdown Wrapper ── */
  const cleanHtml = (rawHtml: string): string => {
    let clean = rawHtml.trim();
    if (clean.startsWith("```html")) {
      clean = clean.substring(7);
    } else if (clean.startsWith("```")) {
      clean = clean.substring(3);
    }
    if (clean.endsWith("```")) {
      clean = clean.substring(0, clean.length - 3);
    }
    return clean.trim();
  };
  const insertHtmlToWord = async (htmlContent: string) => {
    if (typeof Word === "undefined") return;
    await Word.run(async (context) => {
      const body = context.document.body;
      
      // Bước 1: Chèn HTML
      body.clear();
      body.insertHtml(htmlContent, Word.InsertLocation.start);
      await context.sync();
      
      // Bước 2: Force override toàn bộ font sau khi chèn
      // Lấy tất cả paragraphs và set lại font
      const paragraphs = body.paragraphs;
      paragraphs.load("items");
      await context.sync();
      
      paragraphs.items.forEach((p) => {
        p.font.name = "Times New Roman";
        p.font.size = 13;
      });
      
      // Bước 3: Set font cho toàn body làm fallback
      body.font.name = "Times New Roman";
      body.font.size = 13;
      
      await context.sync();
    });
  };

  /* ── Submit: Form mode ── */
  const handleSubmitForm = async () => {
    setIsGenerating(true);
    setError("");
    setResult("");
    try {
      const response = await fetch(`${API_BASE_URL}/ai/generate/form`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ docType: selectedType, formData }),
      });
      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody.error || `Lỗi server ${response.status}`);
      }
      const data = await response.json();
      const cleaned = cleanHtml(data.result);
      setResult(cleaned);

      // Tự động chèn vào Word khi tạo thành công
      if (typeof Word !== "undefined") {
        try {
          await insertHtmlToWord(cleaned);
          setInsertSuccess(true);
          setTimeout(() => setInsertSuccess(false), 2500);
        } catch (wordErr) {
          console.error("Lỗi tự động chèn vào Word:", wordErr);
        }
      }
    } catch (err: any) {
      setError(getFriendlyError(err));
    } finally {
      setIsGenerating(false);
    }
  };

  /* ── Submit: Free mode ── */
  const handleSubmitFree = async () => {
    if (!freeText.trim()) return;
    setIsGenerating(true);
    setError("");
    setResult("");
    try {
      const response = await fetch(`${API_BASE_URL}/ai/generate/free`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ request: freeText.trim() }),
      });
      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody.error || `Lỗi server ${response.status}`);
      }
      const data = await response.json();
      const cleaned = cleanHtml(data.result);
      setResult(cleaned);

      // Tự động chèn vào Word khi tạo thành công
      if (typeof Word !== "undefined") {
        try {
          await insertHtmlToWord(cleaned);
          setInsertSuccess(true);
          setTimeout(() => setInsertSuccess(false), 2500);
        } catch (wordErr) {
          console.error("Lỗi tự động chèn vào Word:", wordErr);
        }
      }
    } catch (err: any) {
      setError(getFriendlyError(err));
    } finally {
      setIsGenerating(false);
    }
  };

  /* ── Insert into Word ── */
  const handleInsertToWord = async () => {
    if (!result) return;
    try {
      await insertHtmlToWord(result);
      setInsertSuccess(true);
      setTimeout(() => setInsertSuccess(false), 2500);
    } catch (err) {
      console.error("Lỗi chèn vào Word:", err);
      setError("Không thể chèn vào tài liệu. Đảm bảo Word đang mở.");
    }
  };

  /* ── Copy to clipboard ── */
  const handleCopy = async () => {
    if (!result) return;
    try {
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = result;
      const plainText = tempDiv.innerText || tempDiv.textContent || result;
      await navigator.clipboard.writeText(plainText);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    } catch {
      // Fallback for older browsers
      if (resultRef.current) {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(resultRef.current);
        selection?.removeAllRanges();
        selection?.addRange(range);
        document.execCommand("copy");
        selection?.removeAllRanges();
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2500);
      }
    }
  };

  /* ── Render ── */
  return (
    <div className="dg-root" ref={containerRef}>
      <style>{`
        /* ─── Root ──────────────────────────────────── */
        .dg-root {
          --primary: #0078d4;
          --primary-dark: #005a9e;
          --bg: #f5f5f5;
          --card: #ffffff;
          --border: #e0e0e0;
          --text: #1b1b1b;
          --muted: #6e6e6e;
          --danger: #c50f1f;
          --success: #107c10;
          font-family: "Segoe UI", -apple-system, sans-serif;
          color: var(--text);
          font-size: 14px;
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow-y: auto;
        }

        /* ─── Section Title ─────────────────────────── */
        .dg-title {
          font-size: 16px;
          font-weight: 700;
          color: var(--primary);
          padding: 14px 16px 4px;
          margin: 0;
        }

        /* ─── Mode Toggle ──────────────────────────── */
        .dg-toggle {
          display: flex;
          margin: 10px 16px;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid var(--border);
        }
        .dg-toggle-btn {
          flex: 1;
          padding: 9px 0;
          font-size: 13px;
          font-weight: 600;
          font-family: inherit;
          border: none;
          cursor: pointer;
          transition: background .2s, color .2s;
          background: var(--card);
          color: var(--muted);
        }
        .dg-toggle-btn.active {
          background: var(--primary);
          color: #fff;
        }
        .dg-toggle-btn:not(.active):hover {
          background: #e8f0fe;
        }

        /* ─── Form Container ───────────────────────── */
        .dg-form {
          padding: 0 16px 12px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        /* ─── Select ───────────────────────────────── */
        .dg-select {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid var(--border);
          border-radius: 8px;
          font-size: 14px;
          font-family: inherit;
          background: #fafafa;
          outline: none;
          cursor: pointer;
          transition: border-color .2s;
        }
        .dg-select:focus {
          border-color: var(--primary);
        }

        /* ─── Field Group ──────────────────────────── */
        .dg-field {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .dg-label {
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
        }
        .dg-input,
        .dg-textarea-field {
          width: 100%;
          padding: 9px 12px;
          border: 1px solid var(--border);
          border-radius: 8px;
          font-size: 14px;
          font-family: inherit;
          background: #fafafa;
          outline: none;
          transition: border-color .2s, box-shadow .2s;
          box-sizing: border-box;
        }
        .dg-input:focus,
        .dg-textarea-field:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 2px rgba(0,120,212,.12);
        }
        .dg-textarea-field {
          resize: vertical;
          min-height: 64px;
          line-height: 1.5;
        }

        /* ─── Free Text Area ───────────────────────── */
        .dg-free-area {
          padding: 0 16px 12px;
        }
        .dg-free-textarea {
          width: 100%;
          min-height: 100px;
          padding: 12px;
          border: 1px solid var(--border);
          border-radius: 8px;
          font-size: 14px;
          font-family: inherit;
          background: #fafafa;
          outline: none;
          resize: vertical;
          line-height: 1.55;
          box-sizing: border-box;
          transition: border-color .2s, box-shadow .2s;
        }
        .dg-free-textarea:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 2px rgba(0,120,212,.12);
        }

        /* ─── Submit Button ────────────────────────── */
        .dg-submit {
          margin: 0 16px 14px;
          padding: 11px 0;
          background: var(--primary);
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,120,212,.2);
          transition: background .2s, transform .15s;
        }
        .dg-submit:not(:disabled):hover {
          background: var(--primary-dark);
          transform: translateY(-1px);
        }
        .dg-submit:disabled {
          background: #bbb;
          cursor: not-allowed;
          box-shadow: none;
        }

        /* ─── Generating Indicator ─────────────────── */
        .dg-generating {
          text-align: center;
          padding: 20px 16px;
          color: var(--primary);
          font-weight: 600;
          animation: dg-blink 1.2s infinite;
        }
        @keyframes dg-blink {
          0%, 100% { opacity: 1; }
          50%      { opacity: .4; }
        }

        /* ─── Error ────────────────────────────────── */
        .dg-error {
          margin: 0 16px 10px;
          padding: 10px 14px;
          background: #fde7e9;
          color: var(--danger);
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
        }

        /* ─── Success Banner ───────────────────────── */
        .dg-success-banner {
          margin: 0 16px 10px;
          padding: 10px 14px;
          background: #e6f4ea;
          color: var(--success);
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
        }

        /* ─── Result Area ──────────────────────────── */
        .dg-result-section {
          margin: 0 16px 16px;
          border: 1px solid var(--border);
          border-radius: 10px;
          overflow: hidden;
          background: var(--card);
          box-shadow: 0 2px 12px rgba(0,0,0,.06);
        }
        .dg-result-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          background: #f0f6fd;
          border-bottom: 1px solid var(--border);
        }
        .dg-result-title {
          font-size: 13px;
          font-weight: 700;
          color: var(--primary);
        }
        .dg-result-textarea {
          width: 100%;
          min-height: 200px;
          padding: 14px;
          border: none;
          font-size: 14px;
          font-family: inherit;
          line-height: 1.6;
          resize: vertical;
          outline: none;
          background: var(--card);
          box-sizing: border-box;
        }
        .dg-result-actions {
          display: flex;
          gap: 8px;
          padding: 10px 14px;
          border-top: 1px solid var(--border);
          background: #fafafa;
        }
        .dg-action-btn {
          flex: 1;
          padding: 9px 0;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          transition: background .2s, transform .15s;
        }
        .dg-action-btn:hover {
          transform: translateY(-1px);
        }
        .dg-btn-insert {
          background: var(--primary);
          color: #fff;
        }
        .dg-btn-insert:hover {
          background: var(--primary-dark);
        }
        .dg-btn-insert.success {
          background: var(--success);
        }
        .dg-btn-copy {
          background: #e8e8e8;
          color: var(--text);
        }
        .dg-btn-copy:hover {
          background: #ddd;
        }
        .dg-btn-copy.success {
          background: var(--success);
          color: #fff;
        }
      `}</style>

      {/* ── Title ── */}
      <h2 className="dg-title">📝 Soạn thảo văn bản</h2>

      {/* ── Mode Toggle ── */}
      <div className="dg-toggle">
        <button
          className={`dg-toggle-btn ${mode === "form" ? "active" : ""}`}
          onClick={() => setMode("form")}
          type="button"
        >
          📋 Nhập theo form
        </button>
        <button
          className={`dg-toggle-btn ${mode === "free" ? "active" : ""}`}
          onClick={() => setMode("free")}
          type="button"
        >
          ✏️ Yêu cầu tự do
        </button>
      </div>

      {/* ── Error Banner (Top) ── */}
      {error && <div className="dg-error">❌ {error}</div>}

      {/* ── Success Banner (Top) ── */}
      {result && (
        <div className="dg-success-banner">
          🎉 Đã tạo văn bản thành công và tự động chèn vào Word! Bạn có thể xem chi tiết hoặc sao chép ở phía dưới.
        </div>
      )}

      {/* ── MODE 1: Form ── */}
      {mode === "form" && (
        <>
          <div className="dg-form">
            {/* Document type selector */}
            <select
              className="dg-select"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              {DOC_TYPES.map((dt) => (
                <option key={dt.value} value={dt.value}>
                  {dt.label}
                </option>
              ))}
            </select>

            {/* Dynamic fields */}
            {currentDocType.fields.map((field) => (
              <div key={field.key} className="dg-field">
                <label className="dg-label">{field.label}</label>
                {field.multiline ? (
                  <textarea
                    className="dg-textarea-field"
                    placeholder={field.placeholder}
                    value={formData[field.key] ?? ""}
                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                    rows={3}
                  />
                ) : (
                  <input
                    className="dg-input"
                    type="text"
                    placeholder={field.placeholder}
                    value={formData[field.key] ?? ""}
                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>

          <button
            className="dg-submit"
            type="button"
            onClick={() => void handleSubmitForm()}
            disabled={isGenerating}
          >
            {isGenerating ? "⏳ Đang soạn thảo..." : "🚀 Tạo văn bản"}
          </button>
        </>
      )}

      {/* ── MODE 2: Free text ── */}
      {mode === "free" && (
        <>
          <div className="dg-free-area">
            <textarea
              className="dg-free-textarea"
              placeholder="Soạn tờ trình xin mua 5 máy tính cho phòng kế toán, trình lên Ban Giám hiệu..."
              value={freeText}
              onChange={(e) => setFreeText(e.target.value)}
            />
          </div>

          <button
            className="dg-submit"
            type="button"
            onClick={() => void handleSubmitFree()}
            disabled={isGenerating || !freeText.trim()}
          >
            {isGenerating ? "⏳ Đang soạn thảo..." : "🚀 Tạo văn bản"}
          </button>
        </>
      )}

      {/* ── Generating indicator ── */}
      {isGenerating && (
        <div className="dg-generating">⏳ AI đang soạn thảo văn bản, vui lòng chờ...</div>
      )}

      {/* ── Result ── */}
      {result && (
        <div className="dg-result-section" ref={resultSectionRef}>
          <div className="dg-result-header">
            <span className="dg-result-title">📄 Kết quả</span>
          </div>
          <div
            ref={resultRef}
            className="dg-result-preview"
            contentEditable
            suppressContentEditableWarning
            onInput={(e) => setResult(e.currentTarget.innerHTML)}
            dangerouslySetInnerHTML={{ __html: result }}
            style={{
              width: "100%",
              minHeight: "250px",
              maxHeight: "450px",
              overflowY: "auto",
              padding: "16px",
              border: "none",
              fontSize: "14px",
              fontFamily: "inherit",
              lineHeight: "1.6",
              outline: "none",
              background: "var(--card)",
              boxSizing: "border-box"
            }}
          />
          <div className="dg-result-actions">
            <button
              className={`dg-action-btn dg-btn-insert ${insertSuccess ? "success" : ""}`}
              type="button"
              onClick={() => void handleInsertToWord()}
            >
              {insertSuccess ? "✅ Đã chèn!" : "📥 Chèn vào Word"}
            </button>
            <button
              className={`dg-action-btn dg-btn-copy ${copySuccess ? "success" : ""}`}
              type="button"
              onClick={() => void handleCopy()}
            >
              {copySuccess ? "✅ Đã copy!" : "📋 Copy"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocGenerator;
