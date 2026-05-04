export type MessageRole = "user" | "assistant";

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: Date;
}

export const sendMessage = async (messages: Message[]): Promise<string> => {
  // TODO: Replace this mock with a real backend API call.
  await new Promise<void>((resolve) => {
    setTimeout(() => resolve(), 1000);
  });

  if (messages.length === 0) {
    return "Xin chào! Tôi là Trợ lý eOffice. Tính năng AI đang được tích hợp.";
  }

  return "Xin chào! Tôi là Trợ lý eOffice. Tính năng AI đang được tích hợp.";
};
