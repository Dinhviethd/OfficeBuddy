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
      { key: "ngaySinh", label: "Ngày sinh", placeholder: "VD: 01/01/2003" },
      { key: "noiSinh", label: "Nơi sinh", placeholder: "VD: Đà Nẵng" },
      { key: "gioiTinh", label: "Giới tính", placeholder: "VD: Nam / Nữ" },
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
      { key: "ngaySinh", label: "Ngày sinh", placeholder: "VD: 01/01/2003" },
      { key: "lop", label: "Lớp sinh hoạt", placeholder: "VD: 21T1" },
      { key: "khoa", label: "Khoa quản lý", placeholder: "VD: Công nghệ thông tin" },
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
      { key: "ngaySinh", label: "Ngày sinh", placeholder: "VD: 01/01/2003" },
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
      { key: "ngaySinh", label: "Ngày sinh", placeholder: "VD: 01/01/2003" },
      { key: "lop", label: "Lớp sinh hoạt", placeholder: "VD: 21T1" },
      { key: "khoa", label: "Khoa quản lý", placeholder: "VD: Công nghệ thông tin" },
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
      { key: "ngaySinh", label: "Ngày sinh", placeholder: "VD: 01/01/2003" },
      { key: "lop", label: "Lớp sinh hoạt", placeholder: "VD: 21T1" },
      { key: "khoa", label: "Khoa quản lý", placeholder: "VD: Công nghệ thông tin" },
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
      { key: "ngaySinh", label: "Ngày sinh", placeholder: "VD: 01/01/2003" },
      { key: "noiSinh", label: "Nơi sinh", placeholder: "VD: Đà Nẵng" },
      { key: "gioiTinh", label: "Giới tính", placeholder: "VD: Nam / Nữ" },
      { key: "lop", label: "Lớp sinh hoạt", placeholder: "VD: 21T1" },
      { key: "khoa", label: "Khoa quản lý", placeholder: "VD: Công nghệ thông tin" },
      { key: "tichLuy", label: "Số tín chỉ tích lũy", placeholder: "VD: 154 tín chỉ" },
      { key: "tbTL", label: "Điểm trung bình tích lũy", placeholder: "VD: 3.25 (Thang 4)" },
      { key: "ngay", label: "Ngày làm đơn", placeholder: "VD: 31/05/2026" },
    ],
  },
  {
    value: "other",
    label: "Loại văn bản khác...",
    fields: [
      { key: "customDocType", label: "Tên loại văn bản cần sinh", placeholder: "VD: Đơn xin rút học phần, Tờ trình mua thiết bị..." },
      { key: "customDescription", label: "Mô tả thông tin chi tiết", placeholder: "Nhập các thông tin cần thiết (Lý do, danh sách, yêu cầu cụ thể...)", multiline: true },
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

  const handleSubmitForm = async () => {
    setIsGenerating(true);
    setError("");
    setResult("");
    try {
      let response;
      if (selectedType === "other") {
        const customType = formData["customDocType"] || "";
        const customDesc = formData["customDescription"] || "";
        if (!customType.trim()) {
          throw new Error("Vui lòng nhập tên loại văn bản cần sinh");
        }
        if (!customDesc.trim()) {
          throw new Error("Vui lòng nhập mô tả thông tin chi tiết");
        }
        response = await fetch(`${API_BASE_URL}/ai/generate/free`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ request: `Hãy soạn thảo: ${customType}. Chi tiết và các thông tin đi kèm: ${customDesc}` }),
        });
      } else {
        response = await fetch(`${API_BASE_URL}/ai/generate/form`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ docType: selectedType, formData }),
        });
      }
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

  return (
    <div className="dg-root" ref={containerRef}>
      <style>{`
        /* ─── Root ──────────────────────────────────── */
        .dg-root {
          --primary: #2563EB;
          --primary-hover: #1D4ED8;
          --primary-light: rgba(37, 99, 235, 0.06);
          --bg: #FAFAFA;
          --card: #ffffff;
          --border: #E5E7EB;
          --text: #111827;
          --muted: #6B7280;
          --danger: #EF4444;
          --success: #10B981;
          font-family: "Inter", -apple-system, sans-serif;
          color: var(--text);
          font-size: 13.5px;
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow-y: auto;
          box-sizing: border-box;
          background: var(--bg);
        }

        /* ─── Section Title ─────────────────────────── */
        .dg-title {
          font-size: 15px;
          font-weight: 700;
          color: #111827;
          padding: 16px 16px 4px;
          margin: 0;
          letter-spacing: -0.015em;
        }

        /* ─── Mode Toggle ──────────────────────────── */
        .dg-toggle {
          display: flex;
          margin: 12px 16px;
          background: #F3F4F6;
          padding: 3px;
          border-radius: 10px;
          border: 1px solid var(--border);
        }
        .dg-toggle-btn {
          flex: 1;
          padding: 7px 0;
          font-size: 12.5px;
          font-weight: 500;
          font-family: inherit;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          background: transparent;
          color: var(--muted);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .dg-toggle-btn.active {
          background: var(--card);
          color: var(--primary);
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          font-weight: 600;
        }
        .dg-toggle-btn:not(.active):hover {
          color: var(--text);
        }

        /* ─── Form Container ───────────────────────── */
        .dg-form {
          padding: 4px 16px 12px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        /* ─── Select ───────────────────────────────── */
        .dg-select {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid var(--border);
          border-radius: 8px;
          font-size: 13.5px;
          font-family: inherit;
          color: var(--text);
          background: var(--card);
          outline: none;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 1px 2px rgba(0,0,0,0.02);
        }
        .dg-select:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        /* ─── Field Group ──────────────────────────── */
        .dg-field {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .dg-label {
          font-size: 12.5px;
          font-weight: 500;
          color: #374151;
        }
        .dg-input,
        .dg-textarea-field {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid var(--border);
          border-radius: 8px;
          font-size: 13.5px;
          font-family: inherit;
          color: var(--text);
          background: var(--card);
          outline: none;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          box-sizing: border-box;
        }
        .dg-input:focus,
        .dg-textarea-field:focus {
          border-color: var(--primary);
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }
        .dg-textarea-field {
          resize: vertical;
          min-height: 68px;
          line-height: 1.5;
        }

        /* ─── Free Text Area ───────────────────────── */
        .dg-free-area {
          padding: 4px 16px 12px;
        }
        .dg-free-textarea {
          width: 100%;
          min-height: 120px;
          padding: 12px;
          border: 1px solid var(--border);
          border-radius: 8px;
          font-size: 13.5px;
          font-family: inherit;
          color: var(--text);
          background: var(--card);
          outline: none;
          resize: vertical;
          line-height: 1.55;
          box-sizing: border-box;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .dg-free-textarea:focus {
          border-color: var(--primary);
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        /* ─── Submit Button ────────────────────────── */
        .dg-submit {
          margin: 4px 16px 16px;
          padding: 10px 0;
          background: var(--primary);
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 13.5px;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(37,99,235, 0.15);
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .dg-submit:not(:disabled):hover {
          background: var(--primary-hover);
        }
        .dg-submit:active:not(:disabled) {
          transform: scale(0.98);
        }
        .dg-submit:disabled {
          background: #E5E7EB;
          color: #9CA3AF;
          cursor: not-allowed;
          box-shadow: none;
        }

        /* ─── Generating Indicator ─────────────────── */
        .dg-generating {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 20px 16px;
          color: var(--primary);
          font-weight: 500;
          font-size: 13px;
        }
        
        .dg-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(37, 99, 235, 0.15);
          border-radius: 50%;
          border-top-color: var(--primary);
          animation: dg-spin 0.8s linear infinite;
        }
        
        @keyframes dg-spin {
          to { transform: rotate(360deg); }
        }

        /* ─── Error ────────────────────────────────── */
        .dg-error {
          margin: 4px 16px 12px;
          padding: 10px 14px;
          background: #FEE2E2;
          border: 1px solid #FCA5A5;
          color: #DC2626;
          border-radius: 8px;
          font-size: 12.5px;
          font-weight: 500;
          line-height: 1.45;
        }

        /* ─── Success Banner ───────────────────────── */
        .dg-success-banner {
          margin: 4px 16px 12px;
          padding: 10px 14px;
          background: #ECFDF5;
          border: 1px solid #A7F3D0;
          color: #059669;
          border-radius: 8px;
          font-size: 12.5px;
          font-weight: 500;
          line-height: 1.45;
        }

        /* ─── Result Area ──────────────────────────── */
        .dg-result-section {
          margin: 8px 16px 20px;
          border: 1px solid var(--border);
          border-radius: 12px;
          overflow: hidden;
          background: var(--card);
          box-shadow: 0 4px 20px rgba(0,0,0, 0.02);
        }
        .dg-result-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          background: #F9FAFB;
          border-bottom: 1px solid var(--border);
        }
        .dg-result-title {
          font-size: 12.5px;
          font-weight: 600;
          color: #374151;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        /* Paper sheet look for Document Preview */
        .dg-result-preview {
          background: #ffffff !important;
          border: 1px solid #E5E7EB !important;
          border-radius: 8px !important;
          box-shadow: 0 2px 10px rgba(0,0,0,0.02) !important;
          margin: 14px !important;
          padding: 24px 20px !important;
          box-sizing: border-box;
          outline: none;
        }
        
        .dg-result-actions {
          display: flex;
          gap: 8px;
          padding: 12px 14px;
          border-top: 1px solid var(--border);
          background: #F9FAFB;
        }
        .dg-action-btn {
          flex: 1;
          padding: 8px 0;
          border: none;
          border-radius: 6px;
          font-size: 12.5px;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .dg-action-btn:active {
          transform: scale(0.98);
        }
        .dg-btn-insert {
          background: var(--primary);
          color: #fff;
        }
        .dg-btn-insert:hover {
          background: var(--primary-hover);
        }
        .dg-btn-insert.success {
          background: var(--success);
        }
        .dg-btn-copy {
          background: #F3F4F6;
          border: 1px solid var(--border);
          color: var(--text);
        }
        .dg-btn-copy:hover {
          background: #E5E7EB;
        }
        .dg-btn-copy.success {
          background: var(--success);
          border-color: var(--success);
          color: #fff;
        }
      `}</style>

      {/* ── Title ── */}
      <h2 className="dg-title">Soạn thảo văn bản AI</h2>

      {/* ── Mode Toggle ── */}
      <div className="dg-toggle">
        <button
          className={`dg-toggle-btn ${mode === "form" ? "active" : ""}`}
          onClick={() => setMode("form")}
          type="button"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style={{marginRight: '5px'}}>
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="9" y1="9" x2="15" y2="9"/>
            <line x1="9" y1="13" x2="15" y2="13"/>
            <line x1="9" y1="17" x2="13" y2="17"/>
          </svg>
          <span>Nhập theo form</span>
        </button>
        <button
          className={`dg-toggle-btn ${mode === "free" ? "active" : ""}`}
          onClick={() => setMode("free")}
          type="button"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style={{marginRight: '5px'}}>
            <path d="M12 20h9"/>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
          <span>Yêu cầu tự do</span>
        </button>
      </div>

      {/* ── Error Banner (Top) ── */}
      {error && <div className="dg-error">⚠️ {error}</div>}

      {/* ── Success Banner (Top) ── */}
      {result && (
        <div className="dg-success-banner">
          ✨ Đã tạo văn bản thành công và tự động chèn vào Word! Bạn có thể chỉnh sửa trực tiếp hoặc sao chép ở phía dưới.
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
            {isGenerating ? (
              <>
                <span className="dg-spinner" style={{marginRight: '8px'}} />
                <span>Đang soạn thảo...</span>
              </>
            ) : (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style={{marginRight: '6px'}}>
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
                <span>Tạo văn bản</span>
              </>
            )}
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
            {isGenerating ? (
              <>
                <span className="dg-spinner" style={{marginRight: '8px'}} />
                <span>Đang soạn thảo...</span>
              </>
            ) : (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style={{marginRight: '6px'}}>
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
                <span>Tạo văn bản</span>
              </>
            )}
          </button>
        </>
      )}

      {/* ── Generating indicator ── */}
      {isGenerating && (
        <div className="dg-generating">
          <span className="dg-spinner" />
          <span>Trí tuệ nhân tạo đang phác thảo văn bản, vui lòng đợi...</span>
        </div>
      )}

      {/* ── Result ── */}
      {result && (
        <div className="dg-result-section" ref={resultSectionRef}>
          <div className="dg-result-header">
            <span className="dg-result-title">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
              <span>Xem trước văn bản (Bản nháp)</span>
            </span>
          </div>
          <div
            ref={resultRef}
            className="dg-result-preview"
            contentEditable
            suppressContentEditableWarning
            onInput={(e) => setResult(e.currentTarget.innerHTML)}
            dangerouslySetInnerHTML={{ __html: result }}
            style={{
              width: "calc(100% - 28px)",
              minHeight: "250px",
              maxHeight: "450px",
              overflowY: "auto",
              padding: "24px 20px",
              border: "none",
              fontSize: "14px",
              fontFamily: "inherit",
              lineHeight: "1.6",
              outline: "none",
              background: "#ffffff",
              boxSizing: "border-box"
            }}
          />
          <div className="dg-result-actions">
            <button
              className={`dg-action-btn dg-btn-insert ${insertSuccess ? "success" : ""}`}
              type="button"
              onClick={() => void handleInsertToWord()}
            >
              {insertSuccess ? (
                <span>Đã chèn thành công!</span>
              ) : (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style={{marginRight: '5px'}}>
                    <path d="M12 5v14M5 12h14"/>
                  </svg>
                  <span>Chèn lại vào Word</span>
                </>
              )}
            </button>
            <button
              className={`dg-action-btn dg-btn-copy ${copySuccess ? "success" : ""}`}
              type="button"
              onClick={() => void handleCopy()}
            >
              {copySuccess ? (
                <span>Đã copy!</span>
              ) : (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style={{marginRight: '5px'}}>
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                  <span>Copy văn bản</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocGenerator;
