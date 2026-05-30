import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

export interface RateLimitConfig {
  windowMs: number; // Thời gian (ms) để đặt lại bộ đếm
  maxRequests: number; // Số yêu cầu tối đa trong cửa sổ thời gian
  keyGenerator?: (req: Request) => string; // Hàm để tạo key (mặc định: IP)
}

/**
 * Tạo middleware rate limiting
 * @param config Cấu hình rate limiting
 * @returns Middleware function
 */
export const createRateLimiter = (config: RateLimitConfig) => {
  const { windowMs = 60 * 1000, maxRequests = 10, keyGenerator } = config;

  return (req: Request, res: Response, next: NextFunction) => {
    // Tạo key dựa trên IP hoặc user ID hoặc function tùy chỉnh
    const key = keyGenerator ? keyGenerator(req) : req.ip || 'unknown';

    const now = Date.now();
    const userRecord = store[key];

    if (!userRecord) {
      // Lần đầu tiên, tạo bản ghi mới
      store[key] = {
        count: 1,
        resetTime: now + windowMs,
      };
      res.set('X-RateLimit-Limit', maxRequests.toString());
      res.set('X-RateLimit-Remaining', (maxRequests - 1).toString());
      res.set('X-RateLimit-Reset', (now + windowMs).toString());
      return next();
    }

    // Kiểm tra xem cửa sổ thời gian có hết hạn không
    if (now > userRecord.resetTime) {
      // Cửa sổ thời gian đã hết, đặt lại
      userRecord.count = 1;
      userRecord.resetTime = now + windowMs;
      res.set('X-RateLimit-Limit', maxRequests.toString());
      res.set('X-RateLimit-Remaining', (maxRequests - 1).toString());
      res.set('X-RateLimit-Reset', (now + windowMs).toString());
      return next();
    }

    // Kiểm tra xem có vượt quá giới hạn không
    if (userRecord.count >= maxRequests) {
      res.set('X-RateLimit-Limit', maxRequests.toString());
      res.set('X-RateLimit-Remaining', '0');
      res.set('X-RateLimit-Reset', userRecord.resetTime.toString());
      res.set('Retry-After', Math.ceil((userRecord.resetTime - now) / 1000).toString());

      return res.status(429).json({
        success: false,
        message: `Quá nhiều yêu cầu. Vui lòng thử lại sau ${Math.ceil((userRecord.resetTime - now) / 1000)} giây`,
        retryAfter: Math.ceil((userRecord.resetTime - now) / 1000),
      });
    }

    // Tăng bộ đếm
    userRecord.count++;
    res.set('X-RateLimit-Limit', maxRequests.toString());
    res.set('X-RateLimit-Remaining', (maxRequests - userRecord.count).toString());
    res.set('X-RateLimit-Reset', userRecord.resetTime.toString());

    next();
  };
};

/**
 * Middleware rate limiting cho chatbot AI
 * Giới hạn: 5 yêu cầu mỗi 1 phút
 */
export const chatRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 phút
  maxRequests: 5, // Tối đa 5 lượt nhắn
});

/**
 * Middleware rate limiting tổng quát
 * Giới hạn: 100 yêu cầu mỗi 15 phút
 */
export const generalRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 phút
  maxRequests: 100,
});
