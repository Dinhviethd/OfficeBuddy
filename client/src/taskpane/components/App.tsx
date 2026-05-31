import * as React from "react";
import { AuthService } from "../services/authService";
import Login from "./Login";
import DocGenerator from "./DocGenerator";
import ChatBox from "./ChatBox";

/* ─── Types ──────────────────────────────────────────────── */
interface User {
  idUser: string;
  username: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AppProps {
  title: string;
}

/* ─── Component ──────────────────────────────────────────── */
const App: React.FC<AppProps> = () => {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [user, setUser] = React.useState<User | null>(null);
  const [activeTab, setActiveTab] = React.useState<"editor" | "chat">("editor");

  /* ── Check authentication on mount ── */
  React.useEffect(() => {
    try {
      const token = AuthService.getAccessToken();
      if (!token) return;
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const userData = JSON.parse(userStr);
        setUser(userData);
        setIsAuthenticated(true);
      }
    } catch {
      AuthService.clearTokens();
      localStorage.removeItem("user");
    }
  }, []);

  const handleLoginSuccess = (userData: User) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    AuthService.clearTokens();
    localStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);
  };

  /* Get User Initials */
  const getInitials = (name: string) => {
    if (!name) return "U";
    return name.slice(0, 2).toUpperCase();
  };

  /* ── Guard: show login if not authenticated ── */
  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app-shell">
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap");

        /* ─── Shell ─────────────────────────────────── */
        .app-shell {
          width: 100%;
          height: 100vh;
          display: flex;
          flex-direction: column;
          background: #FAFAFA;
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          color: #111827;
          overflow: hidden;
        }

        /* ─── Header ────────────────────────────────── */
        .app-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: #ffffff;
          border-bottom: 1px solid #E5E7EB;
          flex-shrink: 0;
        }
        .app-header-left {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .app-header-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          color: #2563EB;
          background: rgba(37, 99, 235, 0.08);
          width: 28px;
          height: 28px;
          border-radius: 6px;
        }
        .app-header-title {
          font-size: 13.5px;
          font-weight: 600;
          letter-spacing: -0.01em;
          color: #111827;
        }
        .app-header-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .app-avatar-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          background: #eff6ff;
          color: #2563EB;
          font-size: 11px;
          font-weight: 600;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          border: 1px solid #dbeafe;
          cursor: default;
          text-transform: uppercase;
        }
        .app-btn-logout {
          background: none;
          color: #6B7280;
          border: 1px solid #E5E7EB;
          border-radius: 20px;
          padding: 4px 10px;
          font-size: 11px;
          font-weight: 500;
          cursor: pointer;
          font-family: inherit;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .app-btn-logout:hover {
          background: #FEF2F2;
          border-color: #FCA5A5;
          color: #EF4444;
        }

        /* ─── Navigation Tabs ───────────────────────── */
        .app-tabs-container {
          display: flex;
          background: #ffffff;
          border-bottom: 1px solid #E5E7EB;
          padding: 0 8px;
          flex-shrink: 0;
        }
        .app-tab {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 10px 0;
          font-size: 12.5px;
          font-weight: 500;
          color: #6B7280;
          border: none;
          background: none;
          cursor: pointer;
          position: relative;
          font-family: inherit;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .app-tab:hover {
          color: #111827;
        }
        .app-tab.active {
          color: #2563EB;
          font-weight: 600;
        }
        .app-tab-indicator {
          position: absolute;
          bottom: 0;
          left: 12%;
          right: 12%;
          height: 2px;
          background: #2563EB;
          border-radius: 2px;
          transform: scaleX(0);
          transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .app-tab.active .app-tab-indicator {
          transform: scaleX(1);
        }

        /* ─── Content ──────────────────────────────── */
        .app-content {
          flex: 1;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          background: #FAFAFA;
        }
      `}</style>

      {/* ── Header ── */}
      <header className="app-header">
        <div className="app-header-left">
          <span className="app-header-logo">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </span>
          <span className="app-header-title">eOffice Copilot</span>
        </div>
        <div className="app-header-right">
          {user && (
            <div className="app-avatar-badge" title={user.username}>
              {getInitials(user.username)}
            </div>
          )}
          <button className="app-btn-logout" onClick={handleLogout} type="button">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
            <span>Đăng xuất</span>
          </button>
        </div>
      </header>

      {/* ── Tabs Navigation ── */}
      <nav className="app-tabs-container">
        <button
          className={`app-tab ${activeTab === "editor" ? "active" : ""}`}
          onClick={() => setActiveTab("editor")}
          type="button"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style={{marginRight: '6px'}}>
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          <span>Soạn thảo</span>
          <span className="app-tab-indicator" />
        </button>
        <button
          className={`app-tab ${activeTab === "chat" ? "active" : ""}`}
          onClick={() => setActiveTab("chat")}
          type="button"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style={{marginRight: '6px'}}>
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <span>Trợ lý Chat</span>
          <span className="app-tab-indicator" />
        </button>
      </nav>

      {/* ── Content ── */}
      <div className="app-content">
        {activeTab === "editor" ? <DocGenerator /> : <ChatBox />}
      </div>
    </div>
  );
};

export default App;
