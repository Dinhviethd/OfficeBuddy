import * as React from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error);
    console.error("Error info:", errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          backgroundColor: "#f5f5f5",
          padding: "20px",
        }}>
          <div style={{
            backgroundColor: "white",
            padding: "40px",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            maxWidth: "500px",
            width: "100%",
            fontFamily: "'Source Sans 3', sans-serif",
          }}>
            <h1 style={{
              color: "#c50f1f",
              margin: "0 0 20px 0",
            }}>Đã xảy ra lỗi</h1>
            <p style={{
              color: "#1f2933",
              marginBottom: "15px",
              lineHeight: "1.5",
            }}>
              Ứng dụng gặp sự cố. Vui lòng tải lại trang.
            </p>
            <details style={{
              backgroundColor: "#f5f5f5",
              padding: "10px",
              borderRadius: "4px",
              marginBottom: "20px",
              fontSize: "12px",
              color: "#666",
            }}>
              <summary style={{ cursor: "pointer", fontWeight: "bold" }}>Chi tiết lỗi</summary>
              <pre style={{
                marginTop: "10px",
                overflow: "auto",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}>
                {this.state.error?.toString()}
              </pre>
            </details>
            <button
              onClick={() => window.location.reload()}
              style={{
                backgroundColor: "#1f4d7a",
                color: "white",
                border: "none",
                padding: "12px 24px",
                borderRadius: "4px",
                cursor: "pointer",
                fontFamily: "'Source Sans 3', sans-serif",
                fontSize: "16px",
                fontWeight: "600",
              }}
            >
              Tải lại trang
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
