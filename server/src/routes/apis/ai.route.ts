import { Router } from "express";
import { aiController } from "@/modules/ai/controllers/ai.controller";
import { chatRateLimiter } from "@/middlewares/rateLimiter.middleware";

const router = Router();

// Áp dụng rate limiting cho endpoint chat
router.post("/chat", chatRateLimiter, (req, res, next) => {
  aiController.chat(req, res, next);
});

// Endpoint để generate tài liệu
router.post("/generate-document", chatRateLimiter, (req, res, next) => {
  aiController.generateDocument(req, res, next);
});

export default router;
