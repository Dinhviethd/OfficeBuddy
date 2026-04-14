import axios from 'axios'
import type { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { useAuth } from '../features/auth/stores/authStore'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
    withCredentials: true,
    timeout: 10000,
})

let isRefreshing = false;

let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: AxiosError | Error) => void;
}> = [];

const processQueue = (error: AxiosError | Error | null, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const { accessToken } = useAuth.getState();
        
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
        // Bắt lỗi 401 (Hết hạn Access Token)
        if (error.response?.status === 401 && !originalRequest._retry) {
            // Nếu đang refresh rồi, đưa các request khác vào hàng đợi
            if (isRefreshing) {
                return new Promise<string>((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Gọi API refresh token
                const response = await axios.post(
                    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/auth/refresh-token`,
                    {},
                    { withCredentials: true }
                );

                const { accessToken } = response.data.data;
                useAuth.getState().setAccessToken(accessToken);
                
                processQueue(null, accessToken);
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return api(originalRequest);
                
            } catch (refreshError) {
                // NẾU REFRESH TOKEN CŨNG HẾT HẠN HOẶC LỖI
                processQueue(refreshError as AxiosError, null);
                useAuth.getState().clearAuth();
                
                if (typeof window !== 'undefined') {
                    const currentPath = window.location.pathname + window.location.search;
                    // Đẩy về Login và lưu đường dẫn cũ vào query param
                    // loại trừ trường hợp họ đã ở sẵn trang auth để tránh lặp URL
                    if (!currentPath.includes('/auth/')) {
                         window.location.href = `/auth/login?redirectTo=${encodeURIComponent(currentPath)}`;
                    } else {
                         window.location.href = '/auth/login';
                    }
                }
                
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }
        
        return Promise.reject(error);
    }
);

export default api;