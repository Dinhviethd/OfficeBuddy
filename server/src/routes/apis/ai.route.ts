import { Router } from "express";
import { chat, generateDocument } from "@/modules/ai/ai.controller";
import { chatRateLimiter } from "@/middlewares/rateLimiter.middleware";

const router = Router();

// Áp dụng rate limiting cho endpoint chat
router.post("/chat", chatRateLimiter, chat);

// Endpoint để generate tài liệu
router.post("/generate-document", chatRateLimiter, generateDocument);

export default router;
