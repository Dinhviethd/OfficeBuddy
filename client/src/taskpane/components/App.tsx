import * as React from "react";
import { AuthService } from "../services/authService";
import Login from "./Login";
import DocGenerator from "./DocGenerator";

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

  /* ── Guard: show login if not authenticated ── */
  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app-shell">
      <style>{`
        /* ─── Shell ─────────────────────────────────── */
        .app-shell {
          width: 100%;
          max-width: 420px;
          margin: 0 auto;
          height: 100vh;
          display: flex;
          flex-direction: column;
          background: #f5f5f5;
          font-family: "Segoe UI", -apple-system, sans-serif;
          color: #1b1b1b;
          overflow: hidden;
        }

        /* ─── Header ────────────────────────────────── */
        .app-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 16px;
          background: #0078d4;
          color: #fff;
          flex-shrink: 0;
        }
        .app-header-left {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .app-header-logo {
          font-size: 18px;
          line-height: 1;
        }
        .app-header-title {
          font-size: 14px;
          font-weight: 700;
          letter-spacing: .2px;
        }
        .app-header-right {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .app-username {
          font-size: 12px;
          opacity: .85;
        }
        .app-btn-logout {
          background: rgba(255,255,255,.18);
          color: #fff;
          border: 1px solid rgba(255,255,255,.3);
          border-radius: 4px;
          padding: 4px 10px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
          transition: background .2s;
        }
        .app-btn-logout:hover {
          background: rgba(255,255,255,.32);
        }

        /* ─── Content ──────────────────────────────── */
        .app-content {
          flex: 1;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
      `}</style>

      {/* ── Header ── */}
      <header className="app-header">
        <div className="app-header-left">
          <span className="app-header-logo">🤖</span>
          <span className="app-header-title">Trợ lý Soạn thảo Văn bản AI</span>
        </div>
        <div className="app-header-right">
          {user && <span className="app-username">{user.username}</span>}
          <button className="app-btn-logout" onClick={handleLogout} type="button">
            Đăng xuất
          </button>
        </div>
      </header>

      {/* ── Content ── */}
      <div className="app-content">
        <DocGenerator />
      </div>
    </div>
  );
};

export default App;
