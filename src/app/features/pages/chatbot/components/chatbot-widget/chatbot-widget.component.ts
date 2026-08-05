import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ConversationResponse,
  MessageResponse
} from '../../models/chatbot.models';
import { ChatbotService } from '../../services/chatbot.service';

@Component({
  selector: 'app-chatbot-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot-widget.component.html',
  styleUrl: './chatbot-widget.component.scss'
})
export class ChatbotWidgetComponent implements OnInit {

  isOpen = false;
  loading = false;
  loadingMessages = false;

  currentMessage = '';
  selectedConversationId: number | null = null;

  conversations: ConversationResponse[] = [];
  messages: MessageResponse[] = [];

  constructor(private chatbotService: ChatbotService) {}

  ngOnInit(): void {
    this.loadConversations();
  }

  toggleChatbot(): void {
    this.isOpen = !this.isOpen;

    if (this.isOpen) {
      this.loadConversations();
    }
  }

  loadConversations(): void {
    this.chatbotService.getMyConversations().subscribe({
      next: (data) => {
        this.conversations = data;
      },
      error: () => {
        this.conversations = [];
      }
    });
  }

  selectConversation(conversationId: number): void {
    this.selectedConversationId = conversationId;
    this.loadingMessages = true;

    this.chatbotService.getConversationMessages(conversationId).subscribe({
      next: (data) => {
        this.messages = data;
        this.loadingMessages = false;
        this.scrollToBottomLater();
      },
      error: () => {
        this.loadingMessages = false;
      }
    });
  }

  startNewConversation(): void {
    this.selectedConversationId = null;
    this.messages = [];
    this.currentMessage = '';
  }

  sendMessage(): void {
    const message = this.currentMessage.trim();

    if (!message || this.loading) {
      return;
    }

    this.currentMessage = '';

    const temporaryUserMessage: MessageResponse = {
      id: Date.now(),
      sender: 'USER',
      content: message,
      modelUsed: null,
      createdAt: new Date().toISOString()
    };

    this.messages.push(temporaryUserMessage);
    this.loading = true;
    this.scrollToBottomLater();

    this.chatbotService.ask({
      conversationId: this.selectedConversationId,
      message
    }).subscribe({
      next: (response) => {
        this.selectedConversationId = response.conversationId;

        const assistantMessage: MessageResponse = {
          id: Date.now() + 1,
          sender: 'ASSISTANT',
          content: response.answer,
          modelUsed: null,
          createdAt: new Date().toISOString()
        };

        this.messages.push(assistantMessage);
        this.loading = false;

        this.loadConversations();
        this.scrollToBottomLater();
      },
      error: (error) => {
        const errorMessage: MessageResponse = {
          id: Date.now() + 2,
          sender: 'ASSISTANT',
          content: 'Désolé, le chatbot est momentanément indisponible.',
          modelUsed: null,
          createdAt: new Date().toISOString()
        };

        this.messages.push(errorMessage);
        this.loading = false;
        this.scrollToBottomLater();
      }
    });
  }

  deleteConversation(conversationId: number, event: MouseEvent): void {
    event.stopPropagation();

    this.chatbotService.deleteConversation(conversationId).subscribe({
      next: () => {
        this.conversations = this.conversations.filter(
          conversation => conversation.id !== conversationId
        );

        if (this.selectedConversationId === conversationId) {
          this.startNewConversation();
        }
      }
    });
  }

  onEnter(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;

    if (!keyboardEvent.shiftKey) {
      keyboardEvent.preventDefault();
      this.sendMessage();
    }
  }

  private scrollToBottomLater(): void {
    setTimeout(() => {
      const container = document.querySelector('.chatbot-messages');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 100);
  }
}
