import { Request, Response, NextFunction } from "express";
import { aiService, type ChatMessage } from "../services/ai.service";

export class AIController {
  async chat(req: Request, res: Response, next: NextFunction) {
    try {
      const { messages } = req.body;

      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({
          success: false,
          message: "Messages array is required",
        });
      }

      const chatMessages: ChatMessage[] = messages.map(
        (msg: { role: string; content: string }) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        })
      );

      const reply = await aiService.chat(chatMessages);

      res.json({
        success: true,
        reply,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const aiController = new AIController();
