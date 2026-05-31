import { Router } from "express";
import { chat, clearChat, generateFromForm, generateFromFreeText } from "./ai.controller";
import { requireAuth } from "../auth/middleware/auth.middleware";

const router = Router();

router.post("/chat", requireAuth, chat);
router.delete("/chat/:sessionId", requireAuth, clearChat);
router.post("/generate/form", generateFromForm);
router.post("/generate/free", generateFromFreeText);

export default router;
