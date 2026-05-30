import * as React from "react";
import { API_BASE_URL } from "../../config";

/* ─── Types ──────────────────────────────────────────────── */
interface Source {
  file: string;
  folder: string;
  similarity: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
  sources?: Source[];
}

/* ─── Constants ──────────────────────────────────────────── */

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content: "Xin chào! Tôi là Trợ lý eOffice. Bạn cần tôi hỗ trợ gì hôm nay?",
  createdAt: new Date(),
};

/* ─── Component ──────────────────────────────────────────── */
const ChatBox: React.FC = () => {
  const [messages, setMessages] = React.useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [readDocument, setReadDocument] = React.useState(false);

  const sessionIdRef = React.useRef("session_" + Date.now());
  const chatEndRef = React.useRef<HTMLDivElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  /* ── Auto-scroll ── */
  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  /* ── Auto-resize textarea ── */
  React.useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "0px";
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
  }, [input]);

  /* ── Read Word document via Office.js ── */
  const getDocumentContent = async (): Promise<string> => {
    if (!readDocument) return "";
    try {
      let docText = "";
      await Word.run(async (context) => {
        const body = context.document.body;
        body.load("text");
        await context.sync();
        docText = body.text.slice(0, 3000);
      });
      return docText;
    } catch (err) {
      console.error("Lỗi đọc tài liệu Word:", err);
      return "";
    }
  };

  /* ── Send message ── */
  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const docContent = await getDocumentContent();

      const response = await fetch(`${API_BASE_URL}/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionIdRef.current,
          message: trimmed,
          docContent: docContent || undefined,
        }),
      });

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody.error || `Server error ${response.status}`);
      }

      const data: { answer: string; sources: Source[] } = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          role: "assistant",
          content: data.answer,
          createdAt: new Date(),
          sources: data.sources,
        },
      ]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: "❌ Xin lỗi, tôi không thể phản hồi lúc này. Vui lòng thử lại.",
          createdAt: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  /* ── Clear chat history ── */
  const handleClearHistory = async () => {
    try {
      await fetch(`${API_BASE_URL}/ai/chat/${sessionIdRef.current}`, { method: "DELETE" });
    } catch (err) {
      console.error("Lỗi xóa lịch sử:", err);
    }
    sessionIdRef.current = "session_" + Date.now();
    setMessages([{ ...WELCOME_MESSAGE, id: "welcome-" + Date.now(), createdAt: new Date() }]);
  };

  /* ── Keyboard: Enter = send, Shift+Enter = newline ── */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  return (
    <div className="cb-root">
      <style>{`
        .cb-root {
          display: flex;
          flex-direction: column;
          height: 100%;
          font-family: "Segoe UI", -apple-system, sans-serif;
          font-size: 14px;
          color: #1b1b1b;
        }

        /* ── Toolbar ── */
        .cb-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 14px;
          background: #fff;
          border-bottom: 1px solid #e0e0e0;
          flex-shrink: 0;
          gap: 8px;
        }
        .cb-checkbox-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #6e6e6e;
          cursor: pointer;
          user-select: none;
        }
        .cb-checkbox-label input[type="checkbox"] {
          accent-color: #0078d4;
          width: 15px; height: 15px;
          cursor: pointer;
        }
        .cb-btn-clear {
          background: none;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          padding: 4px 10px;
          font-size: 12px;
          color: #c50f1f;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: background .2s, border-color .2s;
        }
        .cb-btn-clear:hover {
          background: #fde7e9;
          border-color: #c50f1f;
        }

        /* ── Chat Area ── */
        .cb-chat {
          flex: 1;
          overflow-y: auto;
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          background: #f5f5f5;
        }

        /* ── Rows & Bubbles ── */
        .cb-row { display: flex; }
        .cb-row.user { justify-content: flex-end; }
        .cb-row.assistant { justify-content: flex-start; }

        .cb-bubble {
          max-width: 82%;
          padding: 10px 14px;
          border-radius: 16px;
          font-size: 14px;
          line-height: 1.55;
          white-space: pre-wrap;
          word-break: break-word;
          animation: cb-fadeIn .25s ease-out;
        }
        .cb-bubble.user {
          background: #0078d4;
          color: #fff;
          border-bottom-right-radius: 4px;
        }
        .cb-bubble.assistant {
          background: #f0f0f0;
          color: #1b1b1b;
          border-bottom-left-radius: 4px;
        }

        /* ── Sources ── */
        .cb-sources {
          margin-top: 6px;
          padding-left: 4px;
        }
        .cb-sources-title {
          font-size: 11px;
          font-weight: 600;
          color: #6e6e6e;
          margin-bottom: 3px;
        }
        .cb-source-item {
          font-size: 11px;
          color: #888;
          line-height: 1.4;
          padding: 1px 0;
        }
        .cb-source-sim {
          display: inline-block;
          background: #e8e8e8;
          border-radius: 3px;
          padding: 0 4px;
          font-size: 10px;
          margin-left: 4px;
          color: #666;
        }

        /* ── Loading ── */
        .cb-loading {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          background: #f0f0f0;
          border-radius: 16px;
          border-bottom-left-radius: 4px;
          font-size: 13px;
          color: #6e6e6e;
          animation: cb-fadeIn .25s ease-out;
        }
        .cb-dots { display: flex; gap: 4px; }
        .cb-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #999;
          animation: cb-pulse 1.2s infinite;
        }
        .cb-dot:nth-child(2) { animation-delay: .2s; }
        .cb-dot:nth-child(3) { animation-delay: .4s; }

        /* ── Input Panel ── */
        .cb-input-panel {
          padding: 10px 14px 14px;
          border-top: 1px solid #e0e0e0;
          background: #fff;
          flex-shrink: 0;
        }
        .cb-input-row {
          display: flex;
          gap: 8px;
          align-items: flex-end;
        }
        .cb-textarea {
          flex: 1;
          resize: none;
          overflow: hidden;
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          padding: 10px 14px;
          font-size: 14px;
          font-family: inherit;
          line-height: 1.5;
          background: #fafafa;
          outline: none;
          transition: border-color .2s, box-shadow .2s;
        }
        .cb-textarea:focus {
          border-color: #0078d4;
          box-shadow: 0 0 0 2px rgba(0,120,212,.15);
        }
        .cb-btn-send {
          background: #0078d4;
          color: #fff;
          border: none;
          border-radius: 12px;
          padding: 10px 18px;
          font-size: 14px;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,120,212,.25);
          transition: background .2s, transform .15s;
          white-space: nowrap;
        }
        .cb-btn-send:not(:disabled):hover {
          background: #005a9e;
          transform: translateY(-1px);
        }
        .cb-btn-send:disabled {
          background: #bbb;
          cursor: not-allowed;
          box-shadow: none;
        }
        .cb-hint {
          font-size: 11px;
          color: #aaa;
          margin-top: 6px;
          text-align: right;
        }

        @keyframes cb-fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes cb-pulse {
          0%, 100% { opacity: .3; transform: translateY(0); }
          50%      { opacity: 1;  transform: translateY(-3px); }
        }
      `}</style>

      {/* ── Toolbar ── */}
      <div className="cb-toolbar">
        <label className="cb-checkbox-label">
          <input
            type="checkbox"
            checked={readDocument}
            onChange={(e) => setReadDocument(e.target.checked)}
          />
          📄 Đọc tài liệu đang mở
        </label>
        <button
          className="cb-btn-clear"
          onClick={() => void handleClearHistory()}
          disabled={isLoading}
          type="button"
        >
          🗑 Xóa lịch sử
        </button>
      </div>

      {/* ── Chat Area ── */}
      <div className="cb-chat">
        {messages.map((msg) => {
          const isUser = msg.role === "user";
          return (
            <div key={msg.id}>
              <div className={`cb-row ${isUser ? "user" : "assistant"}`}>
                <div className={`cb-bubble ${isUser ? "user" : "assistant"}`}>
                  {msg.content}
                </div>
              </div>
              {!isUser && msg.sources && msg.sources.length > 0 && (
                <div className="cb-sources">
                  <div className="cb-sources-title">📎 Nguồn tham khảo:</div>
                  {msg.sources.map((src, i) => (
                    <div key={i} className="cb-source-item">
                      📁 {src.folder} / {src.file}
                      <span className="cb-source-sim">{src.similarity}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="cb-row assistant">
            <div className="cb-loading">
              <div className="cb-dots">
                <span className="cb-dot" />
                <span className="cb-dot" />
                <span className="cb-dot" />
              </div>
              ⏳ Đang suy nghĩ...
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* ── Input Panel ── */}
      <div className="cb-input-panel">
        <div className="cb-input-row">
          <textarea
            ref={textareaRef}
            className="cb-textarea"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nhập câu hỏi của bạn..."
            rows={1}
          />
          <button
            className="cb-btn-send"
            type="button"
            onClick={() => void handleSend()}
            disabled={isLoading || input.trim().length === 0}
          >
            Gửi
          </button>
        </div>
        <div className="cb-hint">Enter gửi · Shift+Enter xuống dòng</div>
      </div>
    </div>
  );
};

export default ChatBox;
