// API configuration - using hardcoded URL for Office Add-in environment
const API_BASE_URL = 'http://localhost:8000/api';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      idUser: string;
      username: string;
      createdAt: string;
      updatedAt: string;
    };
    accessToken: string;
    refreshToken: string;
  };
}

export class AuthService {
  static async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      let errorData;
      try {
        errorData = await response.json();
      } catch {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }

      if (!response.ok) {
        throw new Error(errorData.message || 'Đăng nhập thất bại');
      }

      return errorData;
    } catch (err: any) {
      throw new Error(err.message || 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối.');
    }
  }

  static async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      let errorData;
      try {
        errorData = await response.json();
      } catch {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }

      if (!response.ok) {
        throw new Error(errorData.message || 'Đăng ký thất bại');
      }

      return errorData;
    } catch (err: any) {
      throw new Error(err.message || 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối.');
    }
  }

  static saveTokens(accessToken: string, refreshToken: string): void {
    try {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
    } catch (err) {
      console.error('Failed to save tokens:', err);
      throw new Error('Không thể lưu phiên đăng nhập');
    }
  }

  static getAccessToken(): string | null {
    try {
      return localStorage.getItem('accessToken');
    } catch (err) {
      console.error('Failed to get access token:', err);
      return null;
    }
  }

  static getRefreshToken(): string | null {
    try {
      return localStorage.getItem('refreshToken');
    } catch (err) {
      console.error('Failed to get refresh token:', err);
      return null;
    }
  }

  static clearTokens(): void {
    try {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } catch (err) {
      console.error('Failed to clear tokens:', err);
    }
  }

  static isAuthenticated(): boolean {
    try {
      return !!this.getAccessToken();
    } catch (err) {
      console.error('Failed to check authentication:', err);
      return false;
    }
  }
}
