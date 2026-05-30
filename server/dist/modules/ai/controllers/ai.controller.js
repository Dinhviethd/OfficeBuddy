"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiController = exports.AIController = void 0;
const ai_service_1 = require("../services/ai.service");
class AIController {
    async chat(req, res, next) {
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
            const chatMessages = messages.map((msg) => ({
                role: msg.role,
                content: msg.content,
            }));
            console.log("Calling aiService.chat with documentContext:", !!documentContext, "useRAG:", !!useRAG);
            const reply = await ai_service_1.aiService.chat(chatMessages, documentContext, !!useRAG);
            res.json({
                success: true,
                reply,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async generateDocument(req, res, next) {
        try {
            const { documentType, details } = req.body;
            console.log("Generate Document request received:", { documentType, detailsLength: details?.length });
            if (!documentType) {
                return res.status(400).json({
                    success: false,
                    message: "Document type is required",
                });
            }
            const content = await ai_service_1.aiService.generateDocument(documentType, details);
            res.json({
                success: true,
                content,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AIController = AIController;
exports.aiController = new AIController();
