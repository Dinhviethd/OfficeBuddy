// API configuration - point to backend server
const API_BASE_URL = 'http://localhost:8000/api';

export type MessageRole = "user" | "assistant";

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: Date;
}

export interface ChatRequest {
  messages: Array<{ role: MessageRole; content: string }>;
  documentContext?: string; // Optional document content for context
  useRAG?: boolean; // Enable RAG (Retrieval-Augmented Generation)
}

export const sendMessage = async (messages: Message[], documentContext?: string, useRAG?: boolean): Promise<string> => {
  try {
    console.log("sendMessage called with:", {
      messagesCount: messages.length,
      hasDocumentContext: !!documentContext,
      documentContextLength: documentContext?.length,
      documentContextPreview: documentContext?.substring(0, 50),
      useRAG: !!useRAG,
    });

    const request: ChatRequest = {
      messages: messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
    };

    // Add document context if provided
    if (documentContext) {
      console.log("Adding documentContext to request");
      request.documentContext = documentContext;
    }

    // Enable RAG if requested
    if (useRAG) {
      console.log("Enabling RAG");
      request.useRAG = useRAG;
    }

    console.log("Sending request to:", `${API_BASE_URL}/ai/chat`, "with body:", request);

    const response = await fetch(`${API_BASE_URL}/ai/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    console.log("Response status:", response.status);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to get response from AI");
    }

    const data = await response.json();
    return data.reply;
  } catch (error) {
    console.error("AI Service Error:", error);
    throw error;
  }
};
