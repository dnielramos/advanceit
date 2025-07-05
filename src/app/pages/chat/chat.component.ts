import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ChatService } from '../../services/chat/chat.service';
import { ChatMessage, ChatStats } from '../../services/chat/socket.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './chat.component.html',
  styles: [`
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @keyframes typing {
      0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
      40% { transform: scale(1); opacity: 1; }
    }

    .status-icon.processing {
      animation: spin 1s linear infinite;
    }

    .typing-animation span {
      animation: typing 1.4s infinite ease-in-out both;
    }

    .typing-animation span:nth-child(1) { animation-delay: -0.32s; }
    .typing-animation span:nth-child(2) { animation-delay: -0.16s; }
  `]
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  @ViewChild('messageInput') messageInput!: ElementRef;

  // Estado del componente
  messages: ChatMessage[] = [];
  currentMessage = '';
  isConnected = false;
  isTyping = false;
  typingMessage = '';
  stats: ChatStats | null = null;
  hasStartedChat = false;

  // Estado de la notificación personalizada
  notification: { message: string, type: 'success' | 'error' | 'info', show: boolean } = {
    message: '',
    type: 'info',
    show: false
  };
  private notificationTimeout: any;

  // Control de destrucción
  private destroy$ = new Subject<void>();
  private shouldScrollToBottom = false;

  // Sugerencias rápidas
  quickSuggestions = [
    '¿Qué productos tienen disponibles?',
    'Quiero información sobre precios',
    '¿Cómo puedo hacer un pedido?',
    'Necesito ayuda con mi cuenta',
  ];

  constructor(private chatService: ChatService) {}

  ngOnInit() {
    this.initializeChat();
    this.setupSubscriptions();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.notificationTimeout) {
      clearTimeout(this.notificationTimeout);
    }
  }

  ngAfterViewChecked() {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  private initializeChat() {
    const customerInfo = {
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      language: navigator.language
    };
    this.chatService.startChat(customerInfo);
  }

  private setupSubscriptions() {
    this.chatService.messages$.pipe(takeUntil(this.destroy$)).subscribe(messages => {
      this.messages = messages;
      this.hasStartedChat = messages.length > 0;
      this.shouldScrollToBottom = true;
    });

    this.chatService.connected$.pipe(takeUntil(this.destroy$)).subscribe(connected => {
      this.isConnected = connected;
      if (connected) {
        this.showNotification('Conectado al servicio de chat', 'success');
      } else {
        this.showNotification('Conexión perdida. Reintentando...', 'error');
      }
    });

    this.chatService.isTyping$.pipe(takeUntil(this.destroy$)).subscribe(typing => {
      this.isTyping = typing;
      if (typing) {
        this.shouldScrollToBottom = true;
      }
    });

    this.chatService.typingMessage$.pipe(takeUntil(this.destroy$)).subscribe(message => {
        this.typingMessage = message;
    });

    this.chatService.stats$.pipe(takeUntil(this.destroy$)).subscribe(stats => {
      this.stats = stats;
    });

    this.chatService.errors$.pipe(takeUntil(this.destroy$)).subscribe(error => {
      this.showNotification(`Error: ${error}`, 'error');
    });

    setInterval(() => {
      if (this.isConnected) {
        this.chatService.requestStats();
      }
    }, 30000);
  }

  private scrollToBottom() {
    try {
      const container = this.messagesContainer.nativeElement;
      container.scrollTop = container.scrollHeight;
    } catch (err) {
      console.warn('Error al hacer scroll:', err);
    }
  }

  // --- Métodos del Template ---

  sendMessage() {
    if (!this.canSendMessage()) {
      return;
    }
    const message = this.currentMessage.trim();
    try {
      this.chatService.sendMessage(message);
      this.currentMessage = '';
      this.shouldScrollToBottom = true;

      setTimeout(() => {
        if (this.messageInput) {
          this.messageInput.nativeElement.focus();
        }
      }, 100);

    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      this.showNotification('Error al enviar el mensaje. Inténtalo de nuevo.', 'error');
    }
  }

  canSendMessage(): boolean {
    return this.isConnected &&
           this.currentMessage.trim().length > 0 &&
           !this.isTyping &&
           this.currentMessage.trim().length <= 500;
  }

  selectSuggestion(suggestion: string) {
    this.currentMessage = suggestion;
    this.sendMessage();
  }

  trackByMessageId(index: number, message: ChatMessage): string {
    return message.id;
  }

  formatTime(date: Date): string {
    if (!date) return '';
    const messageDate = new Date(date);
    return messageDate.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // --- Sistema de Notificación Personalizado ---
  showNotification(message: string, type: 'success' | 'error' | 'info' = 'info') {
    if (this.notificationTimeout) {
      clearTimeout(this.notificationTimeout);
    }
    this.notification = { message, type, show: true };
    this.notificationTimeout = setTimeout(() => {
      this.hideNotification();
    }, type === 'error' ? 5000 : 3000);
  }

  hideNotification() {
    this.notification.show = false;
    if (this.notificationTimeout) {
        clearTimeout(this.notificationTimeout);
    }
  }
}
