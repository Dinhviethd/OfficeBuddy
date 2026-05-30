import { Request, Response } from "express";
import {
  ragChat,
  clearChatHistory,
  ragGenerateFromForm,
  ragGenerateFromFreeText,
} from "./rag.service";

// POST /api/ai/chat
export async function chat(req: Request, res: Response) {
  try {
    const { sessionId, message, docContent } = req.body;

    if (!sessionId || !message) {
      return res.status(400).json({ error: "Thiếu sessionId hoặc message" });
    }

    const result = await ragChat(sessionId, message, docContent ?? "");
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

// DELETE /api/ai/chat/:sessionId
export async function clearChat(req: Request, res: Response) {
  clearChatHistory(req.params.sessionId);
  return res.json({ success: true });
}

// POST /api/ai/generate/form
export async function generateFromForm(req: Request, res: Response) {
  try {
    const { docType, formData } = req.body;
    if (!docType || !formData) {
      return res.status(400).json({ error: "Thiếu docType hoặc formData" });
    }
    const result = await ragGenerateFromForm(docType, formData);
    return res.json({ result });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

// POST /api/ai/generate/free
export async function generateFromFreeText(req: Request, res: Response) {
  try {
    const { request } = req.body;
    if (!request) {
      return res.status(400).json({ error: "Thiếu request" });
    }
    const result = await ragGenerateFromFreeText(request);
    return res.json({ result });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

// POST /api/ai/generate-document
export async function generateDocument(req: Request, res: Response) {
  try {
    const { documentType, details } = req.body;
    if (!documentType) {
      return res.status(400).json({ error: "Thiếu documentType" });
    }

    const request = details ? `${documentType}: ${details}` : documentType;
    const result = await ragGenerateFromFreeText(request);
    return res.json({ content: result });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
