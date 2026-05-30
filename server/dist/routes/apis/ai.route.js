"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ai_controller_1 = require("../../modules/ai/controllers/ai.controller");
const rateLimiter_middleware_1 = require("../../middlewares/rateLimiter.middleware");
const router = (0, express_1.Router)();
// Áp dụng rate limiting cho endpoint chat
router.post("/chat", rateLimiter_middleware_1.chatRateLimiter, (req, res, next) => {
    ai_controller_1.aiController.chat(req, res, next);
});
exports.default = router;
