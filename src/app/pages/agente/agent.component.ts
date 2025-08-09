import { CommonModule, NgClass } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { io, Socket } from 'socket.io-client';

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}

@Component({
  selector: 'app-chat-ai',
  imports: [NgClass, FormsModule, CommonModule],
  templateUrl: './agent.component.html',
})
export class ChatAiComponent implements OnInit, OnDestroy {
  private socket!: Socket;
  public messages: ChatMessage[] = [];
  public prompt = '';
  public loading = false;

  ngOnInit(): void {
    // Cambia la URL por la de tu backend NestJS
    this.socket = io('http://localhost:3002', { transports: ['websocket'] });

    this.socket.on('connect', () => {
      console.log('✅ Conectado al servidor WebSocket');
    });

    // Recibe eventos intermedios del agente
    this.socket.on('ai_agent_event', (event: any) => {
      if (event.type === 'output') {
        this.addMessage('ai', event.data);
      }
    });

    // Fin de la respuesta del agente
    this.socket.on('ai_response_end', () => {
      this.loading = false;
    });

    this.socket.on('ai_error', (err) => {
      this.addMessage('ai', `⚠️ Error: ${err.message}`);
      this.loading = false;
    });
  }

  ngOnDestroy(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  sendMessage(): void {
    if (!this.prompt.trim()) return;

    // Añadimos el mensaje del usuario al chat
    this.addMessage('user', this.prompt);

    // Enviamos el mensaje al backend
    this.socket.emit('send_prompt_to_agent', this.prompt);

    this.prompt = '';
    this.loading = true;
  }

  private addMessage(sender: 'user' | 'ai', text: string) {
    this.messages.push({ sender, text });
  }
}
