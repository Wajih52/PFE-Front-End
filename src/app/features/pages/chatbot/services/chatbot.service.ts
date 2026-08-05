import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ChatbotRequest,
  ChatbotResponse,
  ConversationResponse,
  MessageResponse
} from '../models/chatbot.models';
import {variables} from '../../../../core/environement/variables'

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {

  private readonly apiUrl = `${variables.apiUrl}/chatbot`;

  constructor(private http: HttpClient) {}

  ask(request: ChatbotRequest): Observable<ChatbotResponse> {
    return this.http.post<ChatbotResponse>(`${this.apiUrl}/ask`, request);
  }

  getMyConversations(): Observable<ConversationResponse[]> {
    return this.http.get<ConversationResponse[]>(`${this.apiUrl}/conversations`);
  }

  getConversationMessages(conversationId: number): Observable<MessageResponse[]> {
    return this.http.get<MessageResponse[]>(
      `${this.apiUrl}/conversations/${conversationId}/messages`
    );
  }

  deleteConversation(conversationId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/conversations/${conversationId}`
    );
  }
}
