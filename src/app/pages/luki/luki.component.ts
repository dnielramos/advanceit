import { Component, OnInit, OnDestroy, signal, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faClock,
  faCheck,
  faCheckDouble,
  faExclamationTriangle,
  faRobot,
  faPaperPlane,
  faPaperclip
} from '@fortawesome/free-solid-svg-icons';
import { io, Socket } from 'socket.io-client';

enum MessageState {
  PENDING = 'PENDING',
  SENT = 'SENT',
  RECEIVED = 'RECEIVED',
  ERROR = 'ERROR',
}

interface Message {
  id: string;
  userId: string;
  content: string;
  state: MessageState;
  response?: string;
  timestamp: Date;
}

interface DisplayMessage {
  id: string;
  content: string;
  timestamp: Date;
  isUser: boolean;
  state : MessageState;
}

@Component({
  selector: 'app-luki',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, FontAwesomeModule],
  templateUrl: './luki.component.html',
  styleUrls: [],
})
export class LukiComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  private socket!: Socket;
  userId = crypto.randomUUID();
  messageText = signal('');
  messages = signal<Message[]>([]);
  showWelcome = signal(true);
  isTyping = signal(false);

  // FontAwesome Icons
  faClock = faClock;
  faCheck = faCheck;
  faCheckDouble = faCheckDouble;
  faExclamationTriangle = faExclamationTriangle;
  faRobot = faRobot;
  faPaperPlane = faPaperPlane;
  faPaperclip = faPaperclip;

  // Quick action buttons
  quickActions = ['¿Cómo estás?', 'Ayuda', 'Información', 'Soporte'];

  private shouldScrollToBottom = false;

  ngOnInit(): void {
    // Inicializar estados explícitamente
    this.showWelcome.set(true);
    this.isTyping.set(false);

    this.initializeSocket();
    this.showWelcomeMessage();
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  private initializeSocket(): void {
    this.socket = io('http://localhost:3002/chat', { transports: ['websocket'] });

    this.socket.on('connect', () => {
      console.log('Connected to chat gateway:', this.socket.id);
    });

    this.socket.on('messageStatus', (payload: any) => {
      const { id, state, response, error } = payload;

      // Mostrar indicador de escritura cuando llega una respuesta
      if (response && (state === MessageState.RECEIVED || state === MessageState.SENT)) {
        this.isTyping.set(true);
        // Simular tiempo de escritura y luego mostrar respuesta
        setTimeout(() => {
          this.isTyping.set(false);
          this.updateMessageStatus(id, state, response);
        }, Math.random() * 1000 + 1000); // Entre 1-2 segundos para simular escritura natural
      } else {
        this.isTyping.set(false);
        this.updateMessageStatus(id, state, response);
      }
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from chat gateway');
    });
  }

  private updateMessageStatus(id: string, state: MessageState, response?: string): void {
    this.messages.update(msgs => {
      const idx = msgs.findIndex(m => m.id === id);
      if (idx !== -1) {
        msgs[idx] = {
          ...msgs[idx],
          state,
          response: response || msgs[idx].response
        };
      }
      return [...msgs];
    });

    // Ocultar indicador de escritura cuando el mensaje se procesa
    if (state !== MessageState.PENDING) {
      this.isTyping.set(false);
    }

    this.shouldScrollToBottom = true;
  }

  // Método para obtener todos los mensajes en orden cronológico
  getAllMessagesInOrder(): DisplayMessage[] {
    const allMessages: DisplayMessage[] = [];

    this.messages().forEach(msg => {
      // Agregar mensaje del usuario
      allMessages.push({
        id: msg.id,
        content: msg.content,
        timestamp: msg.timestamp,
        isUser: true,
        state: msg.state
      });

      // Agregar respuesta de la IA si existe
      if (msg.response) {
        allMessages.push({
          id: msg.id + '_response',
          content: msg.response,
          state: msg.state,
          timestamp: new Date(msg.timestamp.getTime() + 1000), // 1 segundo después
          isUser: false
        });
      }
    });

    // Ordenar por timestamp
    return allMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  private showWelcomeMessage(): void {
    // Ocultar mensaje de bienvenida después de 8 segundos si no hay mensajes
    setTimeout(() => {
      if (this.messages().length === 0) {
        this.showWelcome.set(false);
      }
    }, 8000);
  }

  // Método para debug - puedes usarlo para verificar estados
  debugStates(): void {
    console.log('ShowWelcome:', this.showWelcome());
    console.log('IsTyping:', this.isTyping());
    console.log('Messages length:', this.messages().length);
    console.log('All messages in order:', this.getAllMessagesInOrder());
  }

  sendMessage(): void {
    const content = this.messageText().trim();
    if (!content) return;

    // Ocultar mensaje de bienvenida inmediatamente cuando se envía el primer mensaje
    this.showWelcome.set(false);

    const id = crypto.randomUUID();
    const newMsg: Message = {
      id,
      userId: this.userId,
      content,
      state: MessageState.PENDING,
      timestamp: new Date(),
    };

    this.messages.update(msgs => [...msgs, newMsg]);
    this.socket.emit('sendMessage', { id, userId: this.userId, content });
    this.messageText.set('');
    this.shouldScrollToBottom = true;
  }

  sendQuickMessage(action: string): void {
    this.messageText.set(action);
    this.sendMessage();
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  trackByMessageId(index: number, message: DisplayMessage): string {
    return message.id;
  }

  getMessageIcon(state: MessageState) {
    switch (state) {
      case MessageState.PENDING:
        return this.faClock;
      case MessageState.SENT:
        return this.faCheck;
      case MessageState.RECEIVED:
        return this.faCheckDouble;
      case MessageState.ERROR:
        return this.faExclamationTriangle;
      default:
        return this.faClock;
    }
  }

  getIconClass(state: MessageState): string {
    return state === MessageState.PENDING ? 'fa-spin' : '';
  }

  getTimeString(timestamp: Date): string {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  private scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        const element = this.messagesContainer.nativeElement;
        setTimeout(() => {
          element.scrollTop = element.scrollHeight;
        }, 100); // Pequeño delay para asegurar que el DOM se actualizó
      }
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }

  ngOnDestroy(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}
