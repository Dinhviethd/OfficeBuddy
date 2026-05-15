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
  async chat(messages: ChatMessage[]): Promise<string> {
    try {
      // Find first user message index (skip welcome assistant message)
      const firstUserIndex = messages.findIndex((msg) => msg.role === "user");
      
      // Use only real conversation messages (exclude initial welcome)
      const conversationMessages = firstUserIndex >= 0 
        ? messages.slice(firstUserIndex) 
        : messages;

      const lastMessage = conversationMessages[conversationMessages.length - 1];
      const userInput = lastMessage.content.toLowerCase();

      // Check if we have a mock response for this input
      for (const [key, response] of Object.entries(mockResponses)) {
        if (userInput.includes(key)) {
          return response;
        }
      }

      // If no mock match, try real API
      try {
        const model = genAI.getGenerativeModel({ 
          model: "gemini-2.5-flash-lite",
          systemInstruction: "You are a helpful assistant for an eOffice application. You help users create documents, forms, and manage office tasks. Respond in the user's language (Vietnamese if needed). Be concise and professional.",
        });

        // Build history (all but last message)
        const history = conversationMessages
          .slice(0, -1)
          .map((msg) => ({
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: msg.content }],
          }));

        const chat = model.startChat({
          history: history.length > 0 ? history : undefined,
          generationConfig: {
            maxOutputTokens: 1024,
          },
        });

        const result = await chat.sendMessage(lastMessage.content);
        const response = result.response;
        const text = response.text();

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
