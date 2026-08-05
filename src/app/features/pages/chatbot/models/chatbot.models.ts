export interface ChatbotRequest {
  conversationId: number | null;
  message: string;
}

export interface ChatbotResponse {
  conversationId: number;
  answer: string;
}

export interface ConversationResponse {
  id: number;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export type MessageSender = 'USER' | 'ASSISTANT';

export interface MessageResponse {
  id: number;
  sender: MessageSender;
  content: string;
  modelUsed: string | null;
  createdAt: string;
}
