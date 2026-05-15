import * as React from "react";
import { AuthService, LoginRequest } from "../services/authService";

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#f5f5f5",
    padding: "20px",
    fontFamily: "'Source Sans 3', sans-serif",
  } as React.CSSProperties,
  box: {
    backgroundColor: "white",
    padding: "40px",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    maxWidth: "400px",
    width: "100%",
  } as React.CSSProperties,
  title: {
    textAlign: "center" as const,
    color: "#1f4d7a",
    fontSize: "28px",
    fontWeight: "700",
    margin: "0 0 10px 0",
  },
  subtitle: {
    textAlign: "center" as const,
    color: "#66747f",
    fontSize: "18px",
    fontWeight: "600",
    margin: "0 0 30px 0",
  },
  label: {
    display: "block",
    fontSize: "14px",
    fontWeight: "600",
    color: "#1f2933",
    marginBottom: "5px",
  },
};

interface RegisterProps {
  onRegisterSuccess: (user: any) => void;
  onBackToLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ onRegisterSuccess, onBackToLogin }) => {
  console.log("Register component rendering");
  
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate
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
      console.log("Attempting registration with:", { username });
      const response = await AuthService.register({
        username,
        password,
        confirmPassword,
      });
      console.log("Registration response:", response);

      // Save tokens
      AuthService.saveTokens(response.data.accessToken, response.data.refreshToken);
      console.log("Tokens saved, calling success callback");

      // Call the success callback
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
          @import url("https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;600;700&display=swap");
          
          .register-form {
            font-family: 'Source Sans 3', sans-serif;
          }
          
          .register-input {
            width: 100%;
            padding: 12px;
            margin: 10px 0;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-family: 'Source Sans 3', sans-serif;
            font-size: 14px;
            box-sizing: border-box;
          }
          
          .register-input:focus {
            outline: none;
            border-color: #1f4d7a;
            box-shadow: 0 0 0 2px rgba(31, 77, 122, 0.1);
          }
          
          .register-button {
            width: 100%;
            padding: 12px;
            margin-top: 20px;
            background-color: #1f4d7a;
            color: white;
            border: none;
            border-radius: 4px;
            font-family: 'Source Sans 3', sans-serif;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: background-color 0.3s;
          }
          
          .register-button:hover:not(:disabled) {
            background-color: #173a5b;
          }
          
          .register-button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
          
          .error-message {
            color: #c50f1f;
            font-size: 14px;
            margin-bottom: 15px;
          }
          
          .back-link {
            text-align: center;
            margin-top: 15px;
            font-size: 14px;
          }
          
          .back-link a {
            color: #1f4d7a;
            text-decoration: none;
            cursor: pointer;
            font-weight: 600;
          }
          
          .back-link a:hover {
            text-decoration: underline;
          }
        `}
      </style>
      
      <div style={styles.box}>
        <h1 style={styles.title}>OfficeBuddy</h1>
        <h2 style={styles.subtitle}>Đăng ký tài khoản</h2>

        <form className="register-form" onSubmit={handleRegister}>
          {error && <div className="error-message">{error}</div>}

          <div>
            <label style={styles.label}>Tên tài khoản</label>
            <input
              className="register-input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nhập tên tài khoản"
              disabled={isLoading}
              required
            />
          </div>

          <div>
            <label style={styles.label}>Mật khẩu</label>
            <input
              className="register-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              disabled={isLoading}
              required
            />
          </div>

          <div>
            <label style={styles.label}>Xác nhận mật khẩu</label>
            <input
              className="register-input"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Xác nhận mật khẩu"
              disabled={isLoading}
              required
            />
          </div>

          <button
            className="register-button"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Đang đăng ký..." : "Đăng ký"}
          </button>
        </form>

        <div className="back-link">
          Đã có tài khoản? <button type="button" onClick={onBackToLogin} style={{background: "none", border: "none", color: "#1f4d7a", cursor: "pointer", fontWeight: "600", padding: "0", fontSize: "14px"}}>Đăng nhập</button>
        </div>
      </div>
    </div>
  );
};

interface LoginProps {
  onLoginSuccess: (user: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  console.log("Login component rendering");
  
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
      console.log("Attempting login with:", credentials);
      const response = await AuthService.login(credentials);
      console.log("Login response:", response);

      // Save tokens
      AuthService.saveTokens(response.data.accessToken, response.data.refreshToken);
      console.log("Tokens saved, calling success callback");

      // Call the success callback
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
          @import url("https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;600;700&display=swap");
          
          .login-form {
            font-family: 'Source Sans 3', sans-serif;
          }
          
          .login-input {
            width: 100%;
            padding: 12px;
            margin: 10px 0;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-family: 'Source Sans 3', sans-serif;
            font-size: 14px;
            box-sizing: border-box;
          }
          
          .login-input:focus {
            outline: none;
            border-color: #1f4d7a;
            box-shadow: 0 0 0 2px rgba(31, 77, 122, 0.1);
          }
          
          .login-button {
            width: 100%;
            padding: 12px;
            margin-top: 20px;
            background-color: #1f4d7a;
            color: white;
            border: none;
            border-radius: 4px;
            font-family: 'Source Sans 3', sans-serif;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: background-color 0.3s;
          }
          
          .login-button:hover:not(:disabled) {
            background-color: #173a5b;
          }
          
          .login-button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
          
          .error-message {
            color: #c50f1f;
            font-size: 14px;
            margin-bottom: 15px;
          }
          
          .register-link {
            text-align: center;
            margin-top: 15px;
            font-size: 14px;
          }
          
          .register-link a {
            color: #1f4d7a;
            text-decoration: none;
            cursor: pointer;
            font-weight: 600;
          }
          
          .register-link a:hover {
            text-decoration: underline;
          }
        `}
      </style>
      
      <div style={styles.box}>
        <h1 style={styles.title}>OfficeBuddy</h1>
        <h2 style={styles.subtitle}>Đăng nhập</h2>

        <form className="login-form" onSubmit={handleLogin}>
          {error && <div className="error-message">{error}</div>}

          <div>
            <label style={styles.label}>Tên tài khoản</label>
            <input
              className="login-input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nhập tên tài khoản"
              disabled={isLoading}
              required
            />
          </div>

          <div>
            <label style={styles.label}>Mật khẩu</label>
            <input
              className="login-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              disabled={isLoading}
              required
            />
          </div>

          <button
            className="login-button"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <div className="register-link">
          Chưa có tài khoản? <button type="button" onClick={() => setShowRegister(true)} style={{background: "none", border: "none", color: "#1f4d7a", cursor: "pointer", fontWeight: "600", padding: "0", fontSize: "14px"}}>Đăng ký ngay</button>
        </div>
      </div>
    </div>
  );
};


export default Login;
