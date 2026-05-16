import * as React from "react";
import { sendMessage, type Message } from "../services/aiService";
import { readCurrentDocument, formatDocumentAsContext, type DocumentContent } from "../services/documentService";
import { AuthService } from "../services/authService";
import Login from "./Login";

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

interface User {
  idUser: string;
  name: string;
  username: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
}

const App: React.FC<AppProps> = () => {
  console.log("App component rendering");
  
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [user, setUser] = React.useState<User | null>(null);
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
  const [documentContent, setDocumentContent] = React.useState<DocumentContent | null>(null);
  const [isLoadingDocument, setIsLoadingDocument] = React.useState(false);
  const [useDocumentContext, setUseDocumentContext] = React.useState(true);
  const chatEndRef = React.useRef<HTMLDivElement | null>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);

  // Check if user is already logged in on mount
  React.useEffect(() => {
    console.log("App useEffect: checking authentication");
    try {
      console.log("Checking for existing authentication...");
      const token = AuthService.getAccessToken();
      console.log("Access token exists:", !!token);
      
      if (!token) {
        console.log("No token found, user will see login");
        return;
      }

      console.log("Token found, attempting to restore user data");
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          console.log("Parsing user data from localStorage");
          const userData = JSON.parse(userStr);
          console.log("User data parsed successfully:", userData.username);
          setUser(userData);
          setIsAuthenticated(true);
          console.log("User authentication restored");
        } catch (parseErr) {
          console.error("Failed to parse user data:", parseErr);
          AuthService.clearTokens();
          localStorage.removeItem("user");
        }
      }
    } catch (err) {
      console.error("Unexpected error in auth check:", err);
    }
  }, []);

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

  const handleLoginSuccess = (userData: User) => {
    console.log("handleLoginSuccess called with:", userData);
    try {
      localStorage.setItem("user", JSON.stringify(userData));
      console.log("User data saved to localStorage");
      setUser(userData);
      console.log("User state updated");
      setIsAuthenticated(true);
      console.log("Authentication state set to true");
    } catch (err) {
      console.error("Error saving user data:", err);
      alert("Đã xảy ra lỗi khi lưu dữ liệu. Vui lòng thử lại.");
    }
  };

  const handleLogout = () => {
    try {
      AuthService.clearTokens();
      localStorage.removeItem("user");
      setUser(null);
      setIsAuthenticated(false);
    } catch (err) {
      console.error("Error during logout:", err);
    }
  };

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Load document content from Word
  const handleLoadDocument = async () => {
    setIsLoadingDocument(true);
    try {
      console.log("handleLoadDocument: Starting to load document");
      const content = await readCurrentDocument();
      console.log("handleLoadDocument: Document loaded:", content);
      if (content) {
        console.log("handleLoadDocument: Setting document content and useDocumentContext");
        setDocumentContent(content);
        setUseDocumentContext(true);
        
        // Add message to chat
        const sysMessage: Message = {
          id: `system-${Date.now()}`,
          role: "assistant",
          content: `✅ Đã tải tài liệu thành công (${content.text.length} ký tự). Tôi sẽ sử dụng nội dung này để hỗ trợ bạn tốt hơn.`,
          createdAt: new Date(),
        };
        setMessages((prev) => [...prev, sysMessage]);
      } else {
        console.log("handleLoadDocument: Failed to load document");
        const errorMessage: Message = {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: "❌ Không thể đọc tài liệu. Vui lòng đảm bảo tài liệu đang mở.",
          createdAt: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error("Error loading document:", error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: "❌ Đã xảy ra lỗi khi đọc tài liệu.",
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoadingDocument(false);
    }
  };

  const getCurrentDocumentContext = async (): Promise<string | undefined> => {
    if (!useDocumentContext) {
      return undefined;
    }

    const content = await readCurrentDocument();
    if (!content) {
      return documentContent ? formatDocumentAsContext(documentContent) : undefined;
    }

    setDocumentContent(content);
    return formatDocumentAsContext(content);
  };

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
      const context = await getCurrentDocumentContext();
      console.log("Sending message with current document context:", {
        useDocumentContext,
        hasDocumentContent: !!documentContent,
        contextLength: context?.length,
      });

      const reply = await sendMessage(nextMessages, context);
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
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {user && <span style={{ fontSize: "12px", color: "#66747f" }}>{user.name}</span>}
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: "#c50f1f",
              color: "white",
              border: "none",
              borderRadius: "4px",
              padding: "6px 12px",
              fontSize: "12px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Đăng xuất
          </button>
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
        
        <div style={{
          display: "flex",
          gap: "10px",
          padding: "10px 0",
          borderTop: "1px solid #ddd",
          flexWrap: "wrap",
        }}>
          <button
            type="button"
            onClick={() => void handleLoadDocument()}
            disabled={isLoadingDocument || isTyping}
            style={{
              flex: 1,
              minWidth: "120px",
              padding: "8px 12px",
              backgroundColor: documentContent ? "#1f4d7a" : "#333",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: isLoadingDocument || isTyping ? "not-allowed" : "pointer",
              fontSize: "13px",
              fontWeight: "600",
              opacity: isLoadingDocument ? 0.7 : 1,
            }}
          >
            {isLoadingDocument ? "⏳ Đang tải..." : documentContent ? "📄 Đã tải tài liệu" : "📄 Tải tài liệu"}
          </button>
          
          {documentContent && (
            <button
              type="button"
              onClick={() => setUseDocumentContext(!useDocumentContext)}
              style={{
                flex: 1,
                minWidth: "120px",
                padding: "8px 12px",
                backgroundColor: useDocumentContext ? "#27ae60" : "#ccc",
                color: useDocumentContext ? "white" : "#666",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: "600",
              }}
            >
              {useDocumentContext ? "✅ Sử dụng tài liệu" : "❌ Không dùng tài liệu"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
