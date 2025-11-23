import { Component, ElementRef, ViewChild, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { 
  faTimes, 
  faPaperPlane, 
  faMagic, 
  faRobot,
  faUser
} from '@fortawesome/free-solid-svg-icons';
import { AiChatService } from '../../../services/ai-chat.service';

@Component({
  selector: 'app-ai-chat-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  template: `
    <!-- Backdrop -->
    <div *ngIf="chatService.isOpen()" 
         class="fixed inset-0 bg-gray-900/20 backdrop-blur-sm z-[9998] transition-opacity duration-300"
         (click)="chatService.close()">
    </div>

    <!-- Sidebar Panel -->
    <div class="fixed inset-y-0 right-0 w-full md:w-[450px] bg-white shadow-2xl z-[9999] transform transition-transform duration-300 ease-in-out flex flex-col"
         [class.translate-x-0]="chatService.isOpen()"
         [class.translate-x-full]="!chatService.isOpen()">
      
      <!-- Header -->
      <div class="relative bg-gradient-to-r from-gray-900 via-purple-800 to-orange-600 p-6 text-white shrink-0">
        <div class="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
           <div class="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle,rgba(255,255,255,0.8)_0%,transparent_60%)] animate-spin-slow"></div>
        </div>

        <div class="relative z-10 flex justify-between items-start">
          <div class="flex items-center gap-3">
            <div class="bg-white/10 p-2.5 rounded-xl backdrop-blur-md border border-white/20 shadow-inner">
              <fa-icon [icon]="faMagic" class="text-xl text-orange-400"></fa-icon>
            </div>
            <div>
              <h2 class="text-xl font-bold tracking-tight">Luna AI</h2>
              <div class="flex items-center gap-2 text-xs font-medium text-white/80 bg-white/10 px-2 py-0.5 rounded-full w-fit mt-1 border border-white/10 shadow-sm">
                <span class="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse"></span>
                <span>Contexto: {{ chatService.currentContext() }}</span>
              </div>
            </div>
          </div>
          <button (click)="chatService.close()" class="text-white/70 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-all">
            <fa-icon [icon]="faTimes" class="text-lg"></fa-icon>
          </button>
        </div>
      </div>

      <!-- Messages Area -->
      <div class="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50 scroll-smooth" #scrollContainer>
        
        @for (msg of chatService.messages(); track msg.id) {
          <div class="flex gap-4" [ngClass]="{'flex-row-reverse': msg.role === 'user'}">
            
            <!-- Avatar -->
            <div class="shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-sm border-2"
                 [ngClass]="{
                   'bg-gradient-to-br from-indigo-500 to-purple-600 border-white': msg.role === 'assistant',
                   'bg-white border-gray-100': msg.role === 'user'
                 }">
              <fa-icon [icon]="msg.role === 'assistant' ? faRobot : faUser" 
                       [class]="msg.role === 'assistant' ? 'text-white text-sm' : 'text-gray-600 text-sm'">
              </fa-icon>
            </div>

            <!-- Bubble -->
            <div class="flex flex-col max-w-[80%]" [ngClass]="{'items-end': msg.role === 'user', 'items-start': msg.role === 'assistant'}">
              <div class="px-5 py-3.5 rounded-2xl shadow-sm text-sm leading-relaxed relative"
                   [ngClass]="{
                     'bg-white text-gray-700 rounded-tl-none border border-gray-100': msg.role === 'assistant',
                     'bg-gradient-to-r from-purple-700 to-orange-600 text-white rounded-tr-none': msg.role === 'user'
                   }">
                {{ msg.content }}
              </div>
              <span class="text-[10px] text-gray-400 mt-1 px-1">
                {{ msg.timestamp | date:'shortTime' }}
              </span>
            </div>
          </div>
        }

        <!-- Typing Indicator -->
        @if (chatService.isTyping()) {
          <div class="flex gap-4 animate__animated animate__fadeIn">
            <div class="shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 border-2 border-white flex items-center justify-center shadow-sm">
              <fa-icon [icon]="faRobot" class="text-white text-sm"></fa-icon>
            </div>
            <div class="bg-white px-4 py-3 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 flex items-center gap-1">
              <span class="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></span>
              <span class="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></span>
              <span class="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style="animation-delay: 0.4s"></span>
            </div>
          </div>
        }
      </div>

      <!-- Input Area -->
      <div class="p-4 bg-white border-t border-gray-100 shrink-0">
        <div class="relative flex items-end gap-2 bg-gray-50 p-2 rounded-xl border border-gray-200 focus-within:border-purple-700 focus-within:ring-4 focus-within:ring-purple-100 transition-all">
          <textarea 
            [(ngModel)]="newMessage" 
            (keydown.enter)="sendMessage($event)"
            placeholder="Escribe tu mensaje aquí..." 
            class="w-full bg-transparent border-none focus:ring-0 text-sm text-gray-700 placeholder-gray-400 resize-none max-h-32 py-2.5 px-2"
            rows="1"
            #messageInput>
          </textarea>
          <button (click)="sendMessage()" 
                  [disabled]="!newMessage.trim() || chatService.isTyping()"
                  class="p-3 bg-gradient-to-r from-purple-700 to-orange-600 text-white rounded-lg hover:from-purple-800 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg active:scale-95 mb-0.5">
            <fa-icon [icon]="faPaperPlane"></fa-icon>
          </button>
        </div>
        <p class="text-center text-[10px] text-gray-400 mt-2">
          Luna AI puede cometer errores. Verifica la información importante.
        </p>
      </div>

    </div>
  `,
  styles: [`
    .animate-spin-slow {
      animation: spin 15s linear infinite;
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `]
})
export class AiChatSidebarComponent {
  chatService = inject(AiChatService);
  
  faTimes = faTimes;
  faPaperPlane = faPaperPlane;
  faMagic = faMagic;
  faRobot = faRobot;
  faUser = faUser;

  newMessage = '';
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  constructor() {
    effect(() => {
      // Auto-scroll when messages change
      const _ = this.chatService.messages();
      setTimeout(() => this.scrollToBottom(), 100);
    });
  }

  sendMessage(event?: Event) {
    if (event) {
      event.preventDefault();
    }
    
    if (!this.newMessage.trim()) return;

    this.chatService.sendMessage(this.newMessage);
    this.newMessage = '';
  }

  scrollToBottom() {
    if (this.scrollContainer) {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    }
  }
}
