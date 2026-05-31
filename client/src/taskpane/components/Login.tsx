import * as React from "react";
import { AuthService, LoginRequest } from "../services/authService";

/* ─── Shared Styles ───────────────────────────────────────── */
const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#FAFAFA",
    padding: "20px",
    fontFamily: "'Inter', -apple-system, sans-serif",
    boxSizing: "border-box",
  } as React.CSSProperties,
  box: {
    backgroundColor: "#FFFFFF",
    padding: "32px 28px",
    borderRadius: "16px",
    border: "1px solid #E5E7EB",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.02), 0 1px 3px rgba(0, 0, 0, 0.01)",
    maxWidth: "360px",
    width: "100%",
    boxSizing: "border-box",
  } as React.CSSProperties,
  logoContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    marginBottom: "16px",
  } as React.CSSProperties,
  logoIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#2563EB",
    background: "rgba(37, 99, 235, 0.08)",
    width: "36px",
    height: "36px",
    borderRadius: "8px",
  } as React.CSSProperties,
  title: {
    textAlign: "center" as const,
    color: "#111827",
    fontSize: "20px",
    fontWeight: "700",
    letterSpacing: "-0.022em",
    margin: "0",
  },
  subtitle: {
    textAlign: "center" as const,
    color: "#6B7280",
    fontSize: "13.5px",
    fontWeight: "400",
    margin: "6px 0 24px 0",
    lineHeight: "1.4",
  },
  label: {
    display: "block",
    fontSize: "12.5px",
    fontWeight: "500",
    color: "#374151",
    marginBottom: "6px",
  },
};

/* ─── Register Component ───────────────────────────────────── */
interface RegisterProps {
  onRegisterSuccess: (user: any) => void;
  onBackToLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ onRegisterSuccess, onBackToLogin }) => {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    if (username.length < 3) {
      setError("Tên tài khoản phải có ít nhất 3 ký tự");
      return;
    }

    setIsLoading(true);

    try {
      const response = await AuthService.register({
        username,
        password,
        confirmPassword,
      });
      AuthService.saveTokens(response.data.accessToken, response.data.refreshToken);
      onRegisterSuccess(response.data.user);
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message || "Đăng ký thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <style>
        {`
          @import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap");
          
          .auth-input-group {
            margin-bottom: 16px;
          }
          
          .auth-input {
            width: 100%;
            padding: 10px 14px;
            border: 1px solid #E5E7EB;
            border-radius: 8px;
            font-family: 'Inter', sans-serif;
            font-size: 13.5px;
            color: #111827;
            background-color: #FCFCFC;
            box-sizing: border-box;
            outline: none;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          }
          
          .auth-input::placeholder {
            color: #9CA3AF;
          }
          
          .auth-input:focus {
            border-color: #2563EB;
            background-color: #FFFFFF;
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
          }
          
          .auth-button {
            width: 100%;
            padding: 11px;
            margin-top: 8px;
            background-color: #2563EB;
            color: white;
            border: none;
            border-radius: 8px;
            font-family: 'Inter', sans-serif;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          }
          
          .auth-button:hover:not(:disabled) {
            background-color: #1D4ED8;
          }
          
          .auth-button:active:not(:disabled) {
            transform: scale(0.98);
          }
          
          .auth-button:disabled {
            background-color: #E5E7EB;
            color: #9CA3AF;
            cursor: not-allowed;
          }
          
          .auth-error {
            background-color: #FEE2E2;
            border: 1px solid #FCA5A5;
            color: #DC2626;
            font-size: 12.5px;
            padding: 10px 12px;
            border-radius: 8px;
            margin-bottom: 16px;
            font-weight: 500;
            line-height: 1.4;
          }
          
          .auth-switch-link {
            text-align: center;
            margin-top: 18px;
            font-size: 13px;
            color: #6B7280;
          }
          
          .auth-switch-btn {
            background: none;
            border: none;
            color: #2563EB;
            cursor: pointer;
            font-weight: 600;
            padding: 0;
            font-size: 13px;
            font-family: inherit;
          }
          
          .auth-switch-btn:hover {
            color: #1D4ED8;
            text-decoration: underline;
          }
        `}
      </style>
      
      <div style={styles.box}>
        <div style={styles.logoContainer}>
          <div style={styles.logoIcon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <h1 style={styles.title}>OfficeBuddy</h1>
        </div>
        <p style={styles.subtitle}>Đăng ký tài khoản để bắt đầu sử dụng</p>

        <form onSubmit={handleRegister}>
          {error && <div className="auth-error">⚠️ {error}</div>}

          <div className="auth-input-group">
            <label style={styles.label}>Tên tài khoản</label>
            <input
              className="auth-input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nhập tên tài khoản"
              disabled={isLoading}
              required
            />
          </div>

          <div className="auth-input-group">
            <label style={styles.label}>Mật khẩu</label>
            <input
              className="auth-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              disabled={isLoading}
              required
            />
          </div>

          <div className="auth-input-group">
            <label style={styles.label}>Xác nhận mật khẩu</label>
            <input
              className="auth-input"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Xác nhận mật khẩu"
              disabled={isLoading}
              required
            />
          </div>

          <button
            className="auth-button"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Đang tạo tài khoản..." : "Đăng ký"}
          </button>
        </form>

        <div className="auth-switch-link">
          Đã có tài khoản?{" "}
          <button type="button" className="auth-switch-btn" onClick={onBackToLogin}>
            Đăng nhập
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Login Component ──────────────────────────────────────── */
interface LoginProps {
  onLoginSuccess: (user: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [showRegister, setShowRegister] = React.useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const credentials: LoginRequest = { username, password };
      const response = await AuthService.login(credentials);
      AuthService.saveTokens(response.data.accessToken, response.data.refreshToken);
      onLoginSuccess(response.data.user);
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Đăng nhập thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  if (showRegister) {
    return <Register onRegisterSuccess={(user) => onLoginSuccess(user)} onBackToLogin={() => setShowRegister(false)} />;
  }

  return (
    <div style={styles.container}>
      <style>
        {`
          @import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap");
          
          .auth-input-group {
            margin-bottom: 16px;
          }
          
          .auth-input {
            width: 100%;
            padding: 10px 14px;
            border: 1px solid #E5E7EB;
            border-radius: 8px;
            font-family: 'Inter', sans-serif;
            font-size: 13.5px;
            color: #111827;
            background-color: #FCFCFC;
            box-sizing: border-box;
            outline: none;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          }
          
          .auth-input::placeholder {
            color: #9CA3AF;
          }
          
          .auth-input:focus {
            border-color: #2563EB;
            background-color: #FFFFFF;
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
          }
          
          .auth-button {
            width: 100%;
            padding: 11px;
            margin-top: 8px;
            background-color: #2563EB;
            color: white;
            border: none;
            border-radius: 8px;
            font-family: 'Inter', sans-serif;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          }
          
          .auth-button:hover:not(:disabled) {
            background-color: #1D4ED8;
          }
          
          .auth-button:active:not(:disabled) {
            transform: scale(0.98);
          }
          
          .auth-button:disabled {
            background-color: #E5E7EB;
            color: #9CA3AF;
            cursor: not-allowed;
          }
          
          .auth-error {
            background-color: #FEE2E2;
            border: 1px solid #FCA5A5;
            color: #DC2626;
            font-size: 12.5px;
            padding: 10px 12px;
            border-radius: 8px;
            margin-bottom: 16px;
            font-weight: 500;
            line-height: 1.4;
          }
          
          .auth-switch-link {
            text-align: center;
            margin-top: 18px;
            font-size: 13px;
            color: #6B7280;
          }
          
          .auth-switch-btn {
            background: none;
            border: none;
            color: #2563EB;
            cursor: pointer;
            font-weight: 600;
            padding: 0;
            font-size: 13px;
            font-family: inherit;
          }
          
          .auth-switch-btn:hover {
            color: #1D4ED8;
            text-decoration: underline;
          }
        `}
      </style>
      
      <div style={styles.box}>
        <div style={styles.logoContainer}>
          <div style={styles.logoIcon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <h1 style={styles.title}>OfficeBuddy</h1>
        </div>
        <p style={styles.subtitle}>Đăng nhập để kết nối tài khoản eOffice của bạn</p>

        <form onSubmit={handleLogin}>
          {error && <div className="auth-error">⚠️ {error}</div>}

          <div className="auth-input-group">
            <label style={styles.label}>Tên tài khoản</label>
            <input
              className="auth-input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nhập tên tài khoản"
              disabled={isLoading}
              required
            />
          </div>

          <div className="auth-input-group">
            <label style={styles.label}>Mật khẩu</label>
            <input
              className="auth-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              disabled={isLoading}
              required
            />
          </div>

          <button
            className="auth-button"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Đang kết nối..." : "Đăng nhập"}
          </button>
        </form>

        <div className="auth-switch-link">
          Chưa có tài khoản?{" "}
          <button type="button" className="auth-switch-btn" onClick={() => setShowRegister(true)}>
            Đăng ký ngay
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
