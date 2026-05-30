const isDev = process.env.NODE_ENV === 'development';

export const API_BASE_URL = isDev
  ? 'http://localhost:8000/api'
  : 'https://your-production-url.com/api';
