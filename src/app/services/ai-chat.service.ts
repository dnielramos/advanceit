import { Injectable, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { OpenRouter } from '@openrouter/sdk';
import { ENVIRONMENT } from '../../enviroments/enviroment';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class AiChatService {
  // State
  isOpen = signal<boolean>(false);
  messages = signal<ChatMessage[]>([]);
  isTyping = signal<boolean>(false);
  currentContext = signal<string>('Dashboard');
  private openRouter = new OpenRouter({
    apiKey: ENVIRONMENT.openRouterApiKey,
  });

  constructor(private router: Router) {
    // Track current route for context
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.updateContext(event.urlAfterRedirects);
    });

    this.addMessage({
      id: 'welcome',
      role: 'assistant',
      content: 'Hola, soy Luna AI. Estoy conectada al contexto de tu trabajo actual. ¿En qué puedo ayudarte?',
      timestamp: new Date()
    });
  }

  toggle() {
    this.isOpen.update(v => !v);
  }

  open() {
    this.isOpen.set(true);
  }

  close() {
    this.isOpen.set(false);
  }

  async sendMessage(content: string) {
    const trimmed = content.trim();
    if (!trimmed) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: trimmed,
      timestamp: new Date()
    };

    this.addMessage(userMessage);
    this.isTyping.set(true);

    const systemMessage = {
      role: 'system' as const,
      content:
        `Eres Luna AI, asistente de Advance-IT dentro de un dashboard B2B. ` +
        `Responde SIEMPRE en español, de forma clara y profesional. ` +
        `Usa el contexto actual de la aplicación para adaptar tus respuestas: "${this.currentContext()}". ` +
        `Mantén la conversación fluida usando el historial, sin repetir todo el contexto en cada mensaje.`,
    };

    const chatMessages = [
      systemMessage,
      ...this.messages().map(m => ({
        role: m.role === 'user' ? 'user' as const : 'assistant' as const,
        content: m.content,
      })),
    ];

    try {
      const completion: any = await this.openRouter.chat.send({
        model: 'x-ai/grok-4.1-fast',
        messages: chatMessages,
        stream: false,
      });

      const contentResponse =
        completion?.choices?.[0]?.message?.content ||
        'Lo siento, no pude generar una respuesta en este momento.';

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: contentResponse,
        timestamp: new Date(),
      };

      this.addMessage(assistantMessage);
    } catch (err) {
      console.error('Error en OpenRouter chat', err);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Ocurrió un error al conectar con el asistente. Intenta nuevamente en unos instantes.',
        timestamp: new Date(),
      };
      this.addMessage(errorMessage);
    } finally {
      this.isTyping.set(false);
    }
  }

  private addMessage(msg: ChatMessage) {
    this.messages.update(msgs => [...msgs, msg]);
  }

  private updateContext(url: string) {
    const normalized = url.toLowerCase();

    if (normalized.includes('/solicitudes/nueva')) {
      this.currentContext.set('Creación de Solicitud (RMA)');
    } else if (normalized.includes('/solicitudes/')) {
      this.currentContext.set('Detalle de Solicitud (RMA)');
    } else if (normalized.includes('/solicitudes')) {
      this.currentContext.set('Gestión de Solicitudes (RMA)');
    } else if (normalized.includes('/orders/procesar-orden')) {
      this.currentContext.set('Procesamiento de Pedido');
    } else if (normalized.includes('/ordenes/')) {
      this.currentContext.set('Detalle de Pedido');
    } else if (normalized.includes('/orders')) {
      this.currentContext.set('Listado de Pedidos');
    } else if (normalized.includes('/cotizaciones/crear-cotizacion')) {
      this.currentContext.set('Creación de Cotización');
    } else if (normalized.includes('/cotizaciones')) {
      this.currentContext.set('Gestión de Cotizaciones');
    } else if (normalized.includes('/users')) {
      this.currentContext.set('Gestión de Usuarios');
    } else if (normalized.includes('/companies/')) {
      this.currentContext.set('Detalle de Empresa');
    } else if (normalized.includes('/companies')) {
      this.currentContext.set('Gestión de Empresas');
    } else if (normalized.includes('/payments')) {
      this.currentContext.set('Gestión de Pagos');
    } else if (normalized.includes('/shippings')) {
      this.currentContext.set('Gestión de Envíos');
    } else if (normalized.includes('/advance-products')) {
      this.currentContext.set('Exploración de Productos');
    } else if (normalized.includes('/inventory-uploader/product/')) {
      this.currentContext.set('Detalle de Producto de Inventario');
    } else if (normalized.includes('/inventory-uploader')) {
      this.currentContext.set('Carga de Inventario');
    } else if (normalized.includes('/cart')) {
      this.currentContext.set('Carrito de Compras');
    } else if (normalized.includes('/lunai')) {
      this.currentContext.set('Asistente Luna AI');
    } else if (normalized.includes('/home')) {
      this.currentContext.set('Dashboard General');
    } else {
      this.currentContext.set('Dashboard General');
    }
  }
}
