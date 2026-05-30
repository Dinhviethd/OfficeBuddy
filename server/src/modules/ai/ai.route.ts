import { Router } from "express";
import { chat, clearChat, generateFromForm, generateFromFreeText } from "./ai.controller";

const router = Router();

router.post("/chat", chat);
router.delete("/chat/:sessionId", clearChat);
router.post("/generate/form", generateFromForm);
router.post("/generate/free", generateFromFreeText);

export default router;
