import * as React from "react";
import { sendMessage, type Message } from "../services/aiService";

interface AppProps {
  title: string;
}

const quickActions = [
  "Tờ trình",
  "Thông báo",
  "Biên bản họp",
  "Giấy đi đường",
  "Đề nghị thanh toán",
];

const App: React.FC<AppProps> = () => {
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Xin chào! Tôi là Trợ lý eOffice. Bạn cần tôi hỗ trợ gì hôm nay?",
      createdAt: new Date(),
    },
  ]);
  const [input, setInput] = React.useState<string>("");
  const [isTyping, setIsTyping] = React.useState<boolean>(false);
  const chatEndRef = React.useRef<HTMLDivElement | null>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);

  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  React.useEffect(() => {
    if (!textareaRef.current) {
      return;
    }
    textareaRef.current.style.height = "0px";
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
  }, [input]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isTyping) {
      return;
    }

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed,
      createdAt: new Date(),
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setIsTyping(true);

    try {
      const reply = await sendMessage(nextMessages);
      const aiMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: reply,
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      const fallback: Message = {
        id: `assistant-error-${Date.now()}`,
        role: "assistant",
        content: "Xin lỗi, hiện tôi chưa thể phản hồi. Vui lòng thử lại sau.",
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, fallback]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSend();
    }
  };

  return (
    <div className="officebuddy-app">
      <style>
        {`
          @import url("https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;600;700&family=Playfair+Display:wght@600&display=swap");

          .officebuddy-app {
            --ink: #1f2933;
            --muted: #66747f;
            --accent: #1f4d7a;
            --accent-strong: #173a5b;
            --accent-soft: #e6eef6;
            --card: #ffffff;
            --border: #dce3ea;
            width: 100%;
            max-width: 360px;
            margin: 0 auto;
            height: 100vh;
            display: flex;
            flex-direction: column;
            background: radial-gradient(circle at top, #f4f7fb, #eef2f6 45%, #e9eef3 100%);
            font-family: "Source Sans 3", "Noto Sans", sans-serif;
            color: var(--ink);
          }

          .app-header {
            padding: 14px 16px;
            background: var(--card);
            border-bottom: 1px solid var(--border);
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            box-shadow: 0 6px 20px rgba(20, 30, 40, 0.06);
          }

          .brand {
            display: flex;
            align-items: center;
            gap: 10px;
          }

          .brand-logo {
            width: 34px;
            height: 34px;
            border-radius: 10px;
            object-fit: cover;
            border: 1px solid rgba(255, 255, 255, 0.7);
            box-shadow: 0 8px 16px rgba(31, 77, 122, 0.18);
          }

          .brand-title {
            font-family: "Playfair Display", "Times New Roman", serif;
            font-size: 16px;
            font-weight: 600;
            color: var(--accent-strong);
          }

          .brand-subtitle {
            font-size: 12px;
            color: var(--muted);
          }

          .status {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 12px;
            color: #1d6f42;
            white-space: nowrap;
          }

          .status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #1bb35a;
            box-shadow: 0 0 10px rgba(27, 179, 90, 0.6);
          }

          .chat-area {
            flex: 1;
            padding: 16px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 12px;
            background-image: linear-gradient(transparent 23px, rgba(31, 77, 122, 0.04) 24px);
            background-size: 100% 24px;
          }

          .chat-row {
            display: flex;
          }

          .chat-row.user {
            justify-content: flex-end;
          }

          .chat-row.assistant {
            justify-content: flex-start;
          }

          .chat-bubble {
            max-width: 80%;
            padding: 10px 12px;
            border-radius: 14px;
            font-size: 14px;
            line-height: 1.5;
            white-space: pre-wrap;
            box-shadow: 0 10px 18px rgba(17, 24, 39, 0.08);
            animation: messageIn 0.25s ease-out;
          }

          .chat-bubble.user {
            background: linear-gradient(135deg, var(--accent), #2662a0);
            color: #ffffff;
            border-bottom-right-radius: 6px;
          }

          .chat-bubble.assistant {
            background: var(--card);
            color: var(--ink);
            border: 1px solid var(--border);
            border-bottom-left-radius: 6px;
          }

          .typing {
            padding: 10px 12px;
            border-radius: 14px;
            background: var(--card);
            border: 1px solid var(--border);
            display: flex;
            gap: 6px;
            align-items: center;
            box-shadow: 0 10px 18px rgba(17, 24, 39, 0.08);
          }

          .typing-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background-color: #7a8792;
            animation: typingPulse 1s infinite;
          }

          .quick-actions {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-bottom: 12px;
          }

          .quick-actions button {
            border: 1px solid var(--border);
            border-radius: 999px;
            padding: 6px 12px;
            font-size: 12px;
            background: var(--accent-soft);
            color: var(--accent-strong);
            cursor: pointer;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
          }

          .quick-actions button:hover {
            transform: translateY(-1px);
            box-shadow: 0 6px 12px rgba(31, 77, 122, 0.15);
          }

          .input-panel {
            padding: 12px 16px 16px;
            border-top: 1px solid var(--border);
            background: var(--card);
          }

          .input-row {
            display: flex;
            gap: 8px;
            align-items: flex-end;
          }

          .input-row textarea {
            flex: 1;
            resize: none;
            overflow: hidden;
            border-radius: 14px;
            border: 1px solid var(--border);
            padding: 10px 12px;
            font-size: 14px;
            font-family: inherit;
            line-height: 1.5;
            background: #fbfcfe;
          }

          .send-button {
            background: var(--accent);
            color: #ffffff;
            border: none;
            border-radius: 14px;
            padding: 10px 16px;
            font-size: 14px;
            cursor: pointer;
            box-shadow: 0 10px 20px rgba(31, 77, 122, 0.25);
            transition: transform 0.2s ease, box-shadow 0.2s ease;
          }

          .send-button:disabled {
            background: #c9d3dd;
            cursor: not-allowed;
            box-shadow: none;
          }

          .send-button:not(:disabled):hover {
            transform: translateY(-1px);
            box-shadow: 0 12px 22px rgba(31, 77, 122, 0.3);
          }

          @keyframes typingPulse {
            0% { opacity: 0.3; transform: translateY(0); }
            50% { opacity: 1; transform: translateY(-2px); }
            100% { opacity: 0.3; transform: translateY(0); }
          }

          @keyframes messageIn {
            from { opacity: 0; transform: translateY(6px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
      <header className="app-header">
        <div className="brand">
          <img className="brand-logo" src="assets/logo.jpg" alt="Office Buddy" />
          <div>
            <div className="brand-title">Office Buddy</div>
            <div className="brand-subtitle">Trợ lý eOffice cho văn bản hành chính</div>
          </div>
        </div>
        <div className="status">
          <span className="status-dot" />
          <span>Đang hoạt động</span>
        </div>
      </header>

      <div className="chat-area">
        {messages.map((message) => {
          const isUser = message.role === "user";
          return (
            <div key={message.id} className={`chat-row ${isUser ? "user" : "assistant"}`}>
              <div className={`chat-bubble ${isUser ? "user" : "assistant"}`}>{message.content}</div>
            </div>
          );
        })}
        {isTyping && (
          <div className="chat-row assistant">
            <div className="typing">
              {[0, 1, 2].map((dot) => (
                <span key={dot} className="typing-dot" style={{ animationDelay: `${dot * 0.2}s` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="input-panel">
        <div className="quick-actions">
          {quickActions.map((label) => (
            <button key={label} type="button" onClick={() => setInput(label)}>
              {label}
            </button>
          ))}
        </div>
        <div className="input-row">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nhập yêu cầu của bạn..."
            rows={1}
          />
          <button
            type="button"
            onClick={() => void handleSend()}
            disabled={isTyping || input.trim().length === 0}
            className="send-button"
          >
            Gửi
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
