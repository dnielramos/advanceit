// src/app/core/services/chat.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SocketService, ChatMessage, ChatStats } from './socket.service';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private currentSessionId: string | null = null;
  private userId: string;
  private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  private isTypingSubject = new BehaviorSubject<boolean>(false);
  private typingMessageSubject = new BehaviorSubject<string>('');

  constructor(private socketService: SocketService) {
    this.userId = this.generateUserId();
    this.setupSocketListeners();
  }

  private generateUserId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupSocketListeners() {
    this.socketService.messages$.subscribe((event) => {
      switch (event.type) {
        case 'session_joined':
          this.currentSessionId = event.data.sessionId;
          this.addSystemMessage(event.data.message);
          break;

        case 'ai_response':
          this.handleAIResponse(event.data);
          break;

        case 'message_received':
          this.handleMessageReceived(event.data);
          break;

        case 'message_error':
          this.handleMessageError(event.data);
          break;

        case 'chat_history':
          this.loadChatHistory(event.data);
          break;
      }
    });

    this.socketService.typing$.subscribe((typing) => {
      this.isTypingSubject.next(typing.isTyping);
      this.typingMessageSubject.next(typing.message || '');
    });
  }

  private addSystemMessage(message: string) {
    const systemMessage: ChatMessage = {
      id: `system_${Date.now()}`,
      sessionId: this.currentSessionId!,
      userId: 'system',
      message,
      timestamp: new Date(),
      isFromUser: false,
      status: 'completed',
    };

    const currentMessages = this.messagesSubject.value;
    this.messagesSubject.next([...currentMessages, systemMessage]);
  }

  private handleAIResponse(data: any) {
    const currentMessages = this.messagesSubject.value;
    const updatedMessages = currentMessages.map((msg) => {
      if (msg.id === data.messageId) {
        return {
          ...msg,
          response: data.response,
          status: 'completed' as const,
        };
      }
      return msg;
    });

    // Si no encontramos el mensaje original, crear uno nuevo
    if (!updatedMessages.find((msg) => msg.id === data.messageId)) {
      const newMessage: ChatMessage = {
        id: data.messageId,
        sessionId: this.currentSessionId!,
        userId: 'assistant',
        message: data.response,
        timestamp: new Date(data.timestamp),
        isFromUser: false,
        status: 'completed',
      };
      updatedMessages.push(newMessage);
    }

    this.messagesSubject.next(updatedMessages);
  }

  private handleMessageReceived(data: any) {
    // Mensaje confirmado como recibido por el servidor
    const currentMessages = this.messagesSubject.value;
    const updatedMessages = currentMessages.map((msg) => {
      if (msg.id === data.messageId) {
        return { ...msg, status: 'processing' as const };
      }
      return msg;
    });
    this.messagesSubject.next(updatedMessages);
  }

  private handleMessageError(data: any) {
    const currentMessages = this.messagesSubject.value;
    const updatedMessages = currentMessages.map((msg) => {
      if (msg.id === data.messageId) {
        return {
          ...msg,
          status: 'error' as const,
          response: data.error,
        };
      }
      return msg;
    });
    this.messagesSubject.next(updatedMessages);
  }

  private loadChatHistory(messages: ChatMessage[]) {
    const formattedMessages = messages.map((msg) => ({
      ...msg,
      timestamp: new Date(msg.timestamp),
    }));
    this.messagesSubject.next(formattedMessages);
  }

  // Métodos públicos
  get messages$(): Observable<ChatMessage[]> {
    return this.messagesSubject.asObservable();
  }

  get isTyping$(): Observable<boolean> {
    return this.isTypingSubject.asObservable();
  }

  get typingMessage$(): Observable<string> {
    return this.typingMessageSubject.asObservable();
  }

  get stats$(): Observable<ChatStats> {
    return this.socketService.stats$;
  }

  get connected$(): Observable<boolean> {
    return this.socketService.connected$;
  }

  get errors$(): Observable<string> {
    return this.socketService.errors$;
  }

  startChat(customerInfo?: any) {
    this.socketService.joinSession(this.userId, customerInfo);
  }

  sendMessage(message: string) {
    if (!this.currentSessionId) {
      // throw new Error('No hay sesión activa');
      this.startChat(); // Vuelve a emitir join_session
      // this.pendingMessages.push(message);
      return;
    }

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sessionId: this.currentSessionId,
      userId: this.userId,
      message,
      timestamp: new Date(),
      isFromUser: true,
      status: 'pending',
    };

    // Agregar mensaje del usuario inmediatamente
    const currentMessages = this.messagesSubject.value;
    this.messagesSubject.next([...currentMessages, userMessage]);

    // Enviar al servidor
    this.socketService.sendMessage(message, this.currentSessionId, this.userId);
  }

  loadHistory() {
    if (this.currentSessionId) {
      this.socketService.getHistory(this.currentSessionId);
    }
  }

  requestStats() {
    this.socketService.getStats();
  }

  getCurrentSessionId(): string | null {
    return this.currentSessionId;
  }

  getUserId(): string {
    return this.userId;
  }
}
