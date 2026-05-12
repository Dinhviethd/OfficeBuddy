import { Router } from "express";
import { aiController } from "@/modules/ai/controllers/ai.controller";

const router = Router();

router.post("/chat", (req, res, next) => {
  aiController.chat(req, res, next);
});

export default router;
