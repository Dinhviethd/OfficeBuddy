import { Router } from "express";
import { chat, generateDocument } from "@/modules/ai/ai.controller";
import { chatRateLimiter } from "@/middlewares/rateLimiter.middleware";
import { requireAuth } from "@/modules/auth/middleware/auth.middleware";

const router = Router();

// Áp dụng rate limiting và yêu cầu đăng nhập cho endpoint chat
router.post("/chat", chatRateLimiter, requireAuth, chat);

// Endpoint để generate tài liệu (sử dụng bởi Word Add-in - không bảo vệ bằng session/auth để tránh làm hỏng add-in)
router.post("/generate-document", chatRateLimiter, generateDocument);

export default router;
