import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || "");

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// Mock responses để test khi API quota hết
const mockResponses: { [key: string]: string } = {
  "xin chào": "Xin chào bạn! Tôi là Office Buddy, trợ lý ảo cho hệ thống eOffice. Tôi sẵn sàng giúp bạn với các công việc văn phòng.",
  "hello": "Hello! I'm Office Buddy, your virtual assistant for the eOffice system. I'm ready to help you with office-related tasks.",
  "tờ trình": "Bạn muốn tạo tờ trình? Tôi có thể giúp bạn soạn tờ trình với nội dung: Thông tin yêu cầu, Lý do, Đề nghị...",
  "thông báo": "Bạn cần tạo thông báo? Tôi có thể hỗ trợ soạn thông báo chính thức với cấu trúc chuẩn.",
  "biên bản": "Để tạo biên bản họp, chúng ta cần: Chủ đề họp, Người tham dự, Các vấn đề thảo luận, Quyết định đạt được.",
  "help": "Tôi có thể giúp bạn với: Tờ trình, Thông báo, Biên bản họp, Giấy đi đường, Đề nghị thanh toán. Hãy nói tôi biết bạn cần gì!",
};

export class AIService {
  async chat(messages: ChatMessage[], documentContext?: string): Promise<string> {
    try {
      console.log("AIService.chat called with:", {
        messagesCount: messages.length,
        hasDocumentContext: !!documentContext,
        documentContextLength: documentContext?.length,
        documentContextPreview: documentContext?.substring(0, 100),
      });

      // Find first user message index (skip welcome assistant message)
      const firstUserIndex = messages.findIndex((msg) => msg.role === "user");
      
      // Use only real conversation messages (exclude initial welcome)
      const conversationMessages = firstUserIndex >= 0 
        ? messages.slice(firstUserIndex) 
        : messages;

      const lastMessage = conversationMessages[conversationMessages.length - 1];
      const userInput = lastMessage.content.toLowerCase();

      // Only use mock responses if NO document context is provided
      // If document context is provided, always use real API for accurate document-based responses
      if (!documentContext) {
        console.log("No documentContext - checking mock responses");
        // Check if we have a mock response for this input
        for (const [key, response] of Object.entries(mockResponses)) {
          if (userInput.includes(key)) {
            console.log("Matched mock response for key:", key);
            return response;
          }
        }
      } else {
        console.log("documentContext provided - skipping mock responses, using real API");
      }

      // If no mock match (or documentContext provided), try real API
      try {
        // Prepare system instruction with document context if provided
        let systemInstruction = "You are a helpful assistant for an eOffice application. You help users create documents, forms, and manage office tasks. Respond in the user's language (Vietnamese if needed). Be concise and professional.";
        
        if (documentContext) {
          console.log("Adding documentContext to system instruction, length:", documentContext.length);
          systemInstruction += `\n\nBạn có quyền truy cập vào nội dung tài liệu Word hiện tại. Dưới đây là nội dung:\n\n${documentContext}\n\nHãy sử dụng thông tin này để giúp người dùng tốt hơn. Nếu câu hỏi liên quan đến tài liệu, hãy trích dẫn nội dung liên quan.`;
          console.log("System instruction updated with document context, total length:", systemInstruction.length);
        } else {
          console.log("No documentContext provided");
        }

        const model = genAI.getGenerativeModel({ 
          model: "gemini-2.5-flash-lite",
          systemInstruction: systemInstruction,
        });

        // Build history (all but last message)
        const history = conversationMessages
          .slice(0, -1)
          .map((msg) => ({
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: msg.content }],
          }));

        console.log("Calling Gemini API with:", { historyLength: history.length, userMessage: lastMessage.content, systemInstructionLength: systemInstruction.length });

        const chat = model.startChat({
          history: history.length > 0 ? history : undefined,
          generationConfig: {
            maxOutputTokens: 1024,
          },
        });

        const result = await chat.sendMessage(lastMessage.content);
        const response = result.response;
        const text = response.text();

        console.log("Got response from Gemini API:", text.substring(0, 100));
        return text;
      } catch (apiError) {
        console.error("Google API failed, using mock response:", apiError);
        // Fallback to generic mock response
        return "Xin lỗi, hiện tại tôi không thể kết nối đến API. Tôi đang sử dụng chế độ demo. Hãy thử lại sau hoặc cập nhật API key mới.";
      }
    } catch (error) {
      console.error("AI Service Error:", error);
      throw error;
    }
  }
}

export const aiService = new AIService();
