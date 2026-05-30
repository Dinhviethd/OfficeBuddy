import { Request, Response, NextFunction } from "express";
import { aiService, type ChatMessage } from "../services/ai.service";

export class AIController {
  async chat(req: Request, res: Response, next: NextFunction) {
    try {
      const { messages, documentContext, useRAG } = req.body;
      console.log("AI Chat request received:", {
        messagesCount: messages?.length,
        hasDocumentContext: !!documentContext,
        documentContextLength: documentContext?.length,
      });

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

      console.log("Calling aiService.chat with documentContext:", !!documentContext, "useRAG:", !!useRAG);
      const reply = await aiService.chat(chatMessages, documentContext, !!useRAG);

      res.json({
        success: true,
        reply,
      });
    } catch (error) {
      next(error);
    }
  }

  async generateDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const { documentType, details } = req.body;
      console.log("Generate Document request received:", { documentType, detailsLength: details?.length });

      if (!documentType) {
        return res.status(400).json({
          success: false,
          message: "Document type is required",
        });
      }

      const content = await aiService.generateDocument(documentType, details);

      res.json({
        success: true,
        content,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const aiController = new AIController();
