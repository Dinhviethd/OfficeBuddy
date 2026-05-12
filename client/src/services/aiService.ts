export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

const API_BASE_URL = "/api";

export async function sendMessage(messages: Message[]): Promise<string> {
  try {
    const response = await fetch(`${API_BASE_URL}/ai/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
      }),
    });

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
}
