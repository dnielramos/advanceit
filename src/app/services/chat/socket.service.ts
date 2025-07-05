// src/app/core/services/socket.service.ts
import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { environment } from '../../../enviroments/enviroment';

export interface ChatMessage {
  id: string;
  sessionId: string;
  userId: string;
  message: string;
  response?: string;
  timestamp: Date;
  isFromUser: boolean;
  status: 'pending' | 'processing' | 'completed' | 'error';
}

export interface ChatStats {
  activeSessions: number;
  queueSize: number;
  processing: number;
  completed: number;
}

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;
  private connectedSubject = new BehaviorSubject<boolean>(false);
  private messagesSubject = new Subject<any>();
  private statsSubject = new Subject<ChatStats>();
  private errorSubject = new Subject<string>();
  private typingSubject = new Subject<{ isTyping: boolean; message?: string }>();

  constructor() {
    this.socket = io(environment.socketUrl, {
      transports: ['websocket'],
      autoConnect: true,
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    this.socket.on('connect', () => {
      console.log('Conectado al servidor WebSocket');
      this.connectedSubject.next(true);
    });

    this.socket.on('disconnect', () => {
      console.log('Desconectado del servidor WebSocket');
      this.connectedSubject.next(false);
    });

    this.socket.on('session_joined', (data) => {
      this.messagesSubject.next({
        type: 'session_joined',
        data
      });
    });

    this.socket.on('message_received', (data) => {
      this.messagesSubject.next({
        type: 'message_received',
        data
      });
    });

    this.socket.on('ai_response', (data) => {
      this.messagesSubject.next({
        type: 'ai_response',
        data
      });
    });

    this.socket.on('typing', (data) => {
      this.typingSubject.next(data);
    });

    this.socket.on('stats', (data) => {
      this.statsSubject.next(data);
    });

    this.socket.on('error', (data) => {
      this.errorSubject.next(data.message);
    });

    this.socket.on('message_error', (data) => {
      this.messagesSubject.next({
        type: 'message_error',
        data
      });
    });

    this.socket.on('chat_history', (data) => {
      this.messagesSubject.next({
        type: 'chat_history',
        data
      });
    });
  }

  // Observables públicos
  get connected$(): Observable<boolean> {
    return this.connectedSubject.asObservable();
  }

  get messages$(): Observable<any> {
    return this.messagesSubject.asObservable();
  }

  get stats$(): Observable<ChatStats> {
    return this.statsSubject.asObservable();
  }

  get errors$(): Observable<string> {
    return this.errorSubject.asObservable();
  }

  get typing$(): Observable<{ isTyping: boolean; message?: string }> {
    return this.typingSubject.asObservable();
  }

  // Métodos para emitir eventos
  joinSession(userId: string, customerInfo?: any) {
    this.socket.emit('join_session', {
      userId,
      customerInfo
    });
  }

  sendMessage(message: string, sessionId: string, userId?: string) {
    this.socket.emit('send_message', {
      message,
      sessionId,
      userId
    });
  }

  getHistory(sessionId: string) {
    this.socket.emit('get_history', { sessionId });
  }

  getStats() {
    this.socket.emit('get_stats');
  }

  disconnect() {
    this.socket.disconnect();
  }

  reconnect() {
    this.socket.connect();
  }
}
