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

const parseMarkdown = (text: string): string => {
  if (!text) return "";
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/__(.*?)__/g, "<strong>$1</strong>");

  // Inline code
  html = html.replace(/`(.*?)`/g, '<code style="background-color: rgba(37,99,235,0.06); color: var(--primary); padding: 2px 4px; border-radius: 4px; font-family: monospace; font-size: 0.9em; font-weight: 600;">$1</code>');

  // Lists
  const lines = html.split("\n");
  let inList = false;
  const resultLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith("* ") || line.startsWith("- ")) {
      if (!inList) {
        inList = true;
        resultLines.push('<ul style="margin: 6px 0 6px 16px; padding-left: 0; list-style-type: disc;">');
      }
      resultLines.push(`<li style="margin-bottom: 4px;">${line.substring(2)}</li>`);
    } else {
      if (inList) {
        inList = false;
        resultLines.push("</ul>");
      }
      resultLines.push(lines[i]);
    }
  }
  if (inList) {
    resultLines.push("</ul>");
  }

  return resultLines.join("<br>");
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
        /* ─── Root ──────────────────────────────────── */
        .cb-root {
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
          display: flex;
          flex-direction: column;
          height: 100%;
          font-family: "Inter", -apple-system, sans-serif;
          font-size: 13.5px;
          color: var(--text);
          background: var(--bg);
        }

        /* ── Toolbar ── */
        .cb-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          background: var(--card);
          border-bottom: 1px solid var(--border);
          flex-shrink: 0;
          gap: 8px;
        }
        .cb-checkbox-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12.5px;
          color: #4B5563;
          cursor: pointer;
          user-select: none;
          font-weight: 500;
        }
        .cb-checkbox-label input[type="checkbox"] {
          accent-color: var(--primary);
          width: 14px;
          height: 14px;
          cursor: pointer;
          margin: 0;
        }
        .cb-btn-clear {
          background: none;
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 4px 10px;
          font-size: 11px;
          color: var(--muted);
          font-weight: 500;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          display: inline-flex;
          align-items: center;
          font-family: inherit;
        }
        .cb-btn-clear:hover {
          background: #FEF2F2;
          border-color: #FCA5A5;
          color: var(--danger);
        }

        /* ── Chat Area ── */
        .cb-chat {
          flex: 1;
          overflow-y: auto;
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          background: var(--bg);
        }

        /* ── Rows & Bubbles ── */
        .cb-row { display: flex; }
        .cb-row.user { justify-content: flex-end; }
        .cb-row.assistant { justify-content: flex-start; }

        .cb-bubble-wrapper {
          max-width: 85%;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .cb-bubble-wrapper.user {
          align-items: flex-end;
        }
        .cb-bubble-wrapper.assistant {
          align-items: flex-start;
        }

        .cb-bubble {
          padding: 10px 14px;
          border-radius: 12px;
          font-size: 13.5px;
          line-height: 1.55;
          white-space: pre-wrap;
          word-break: break-word;
          animation: cb-fadeIn .25s ease-out;
        }
        .cb-bubble.user {
          background: var(--primary);
          color: #fff;
          border-bottom-right-radius: 4px;
          box-shadow: 0 1px 3px rgba(37,99,235,0.15);
        }
        .cb-bubble.assistant {
          background: var(--card);
          color: var(--text);
          border: 1px solid var(--border);
          border-bottom-left-radius: 4px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.02);
        }

        /* ── Sources ── */
        .cb-sources {
          margin-top: 6px;
          padding: 8px 10px;
          background: #ffffff;
          border: 1px solid var(--border);
          border-radius: 8px;
          width: 100%;
          box-sizing: border-box;
          box-shadow: 0 1px 2px rgba(0,0,0,0.01);
          animation: cb-fadeIn .2s ease-out;
        }
        .cb-sources-title {
          font-size: 11px;
          font-weight: 600;
          color: var(--muted);
          margin-bottom: 5px;
          display: flex;
          align-items: center;
        }
        .cb-source-item {
          font-size: 11px;
          color: #4B5563;
          line-height: 1.4;
          padding: 3px 0;
          border-bottom: 1px dashed var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 6px;
        }
        .cb-source-item:last-child {
          border-bottom: none;
        }
        .cb-source-path {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          flex: 1;
        }
        .cb-source-sim {
          background: var(--primary-light);
          border-radius: 3px;
          padding: 0 4px;
          font-size: 9px;
          font-weight: 600;
          color: var(--primary);
          flex-shrink: 0;
        }

        /* ── Loading ── */
        .cb-loading {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 12px;
          border-bottom-left-radius: 4px;
          font-size: 13px;
          color: var(--muted);
          animation: cb-fadeIn .25s ease-out;
        }
        .cb-dots { display: flex; gap: 4px; }
        .cb-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: #9CA3AF;
          animation: cb-pulse 1.2s infinite;
        }
        .cb-dot:nth-child(2) { animation-delay: .2s; }
        .cb-dot:nth-child(3) { animation-delay: .4s; }

        /* ── Input Panel ── */
        .cb-input-panel {
          padding: 10px 14px 14px;
          border-top: 1px solid var(--border);
          background: var(--card);
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
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 9px 12px;
          font-size: 13.5px;
          font-family: inherit;
          line-height: 1.5;
          background: #FCFCFC;
          outline: none;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .cb-textarea:focus {
          border-color: var(--primary);
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }
        .cb-btn-send {
          background: var(--primary);
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 8px 14px;
          font-size: 13px;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(37,99,235,.15);
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          white-space: nowrap;
          height: 35px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .cb-btn-send:not(:disabled):hover {
          background: var(--primary-hover);
        }
        .cb-btn-send:active:not(:disabled) {
          transform: scale(0.98);
        }
        .cb-btn-send:disabled {
          background: #E5E7EB;
          color: #9CA3AF;
          cursor: not-allowed;
          box-shadow: none;
        }
        .cb-hint {
          font-size: 10px;
          color: var(--muted);
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
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style={{marginRight: '2px', color: '#4B5563'}}>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
          <span>Đọc văn bản đang mở</span>
        </label>
        <button
          className="cb-btn-clear"
          onClick={() => void handleClearHistory()}
          disabled={isLoading}
          type="button"
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style={{marginRight: '4px'}}>
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            <line x1="10" y1="11" x2="10" y2="17"/>
            <line x1="14" y1="11" x2="14" y2="17"/>
          </svg>
          <span>Xóa lịch sử</span>
        </button>
      </div>

      {/* ── Chat Area ── */}
      <div className="cb-chat">
        {messages.map((msg) => {
          const isUser = msg.role === "user";
          return (
            <div key={msg.id} className={`cb-row ${isUser ? "user" : "assistant"}`}>
              <div className={`cb-bubble-wrapper ${isUser ? "user" : "assistant"}`}>
                <div
                  className={`cb-bubble ${isUser ? "user" : "assistant"}`}
                  {...(!isUser
                    ? { dangerouslySetInnerHTML: { __html: parseMarkdown(msg.content) } }
                    : { children: msg.content })}
                />
                {!isUser && msg.sources && msg.sources.length > 0 && (
                  <div className="cb-sources">
                    <div className="cb-sources-title">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style={{marginRight: '5px', color: '#6B7280'}}>
                        <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                      </svg>
                      <span>Tài liệu tham khảo:</span>
                    </div>
                    {msg.sources.map((src, i) => (
                      <div key={i} className="cb-source-item">
                        <div className="cb-source-path">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style={{marginRight: '4px', verticalAlign: 'middle', color: '#6B7280'}}>
                            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                          </svg>
                          <span>{src.folder} / {src.file}</span>
                        </div>
                        <span className="cb-source-sim">{src.similarity}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
              <span>Đang suy nghĩ...</span>
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
            placeholder="Đặt câu hỏi về quy định, biểu mẫu..."
            rows={1}
          />
          <button
            className="cb-btn-send"
            type="button"
            onClick={() => void handleSend()}
            disabled={isLoading || input.trim().length === 0}
          >
            <span>Gửi</span>
          </button>
        </div>
        <div className="cb-hint">Enter gửi · Shift+Enter xuống dòng</div>
      </div>
    </div>
  );
};

export default ChatBox;
