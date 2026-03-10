import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ChatService } from './services/chat.service'; // Asegúrate de que la ruta sea correcta
import { IMessage } from './Interfaces/imessage';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {

  // Estados de la UI
  chatOpen: boolean = false;
  loading: boolean = false;

  // Datos del Chat
  messages: IMessage[] = [];
  userInput: string = '';

  // Configuración de API (Persistente)
  apiUrl: string = 'https://tu-url-de-colab.loca.lt/ask';

  constructor(private chatService: ChatService) { }

  // Variables en tu componente
  showConfig: boolean = false;


  saveApiConfig() {
    if (this.apiUrl.includes('http')) {
      localStorage.setItem('siaguard_api_url', this.apiUrl);
      this.showConfig = false;
      // Opcional: Agregar un mensaje al chat confirmando la reconexión
      this.messages.push({
        text: 'ENLACE REESTABLECIDO: Conexión con el núcleo de seguridad exitosa.',
        sender: 'bot',
        timestamp: new Date()
      });
    } else {
      alert('Por favor, ingresa una URL válida de Colab.');
    }
  }

  ngOnInit() {
    // 1. Recuperar URL guardada de Colab si existe
    const savedUrl = localStorage.getItem('siaguard_api_url');
    if (savedUrl) {
      this.apiUrl = savedUrl;
    }

    // 2. Suscribirse a los mensajes del servicio
    this.chatService.getConversation().subscribe(msgs => {
      this.messages = msgs;
      this.scrollToBottom();
    });

    // 3. Mensaje de bienvenida del sistema
    if (this.messages.length === 0) {
      this.messages.push({
        text: 'Sistemas SiaGuard en línea. Protocolos de seguridad activos. ¿En qué puedo ayudarte, Luis?',
        sender: 'bot',
        timestamp: new Date()
      });
    }
  }

  // Alternar visibilidad del chat flotante
  toggleChat() {
    this.chatOpen = !this.chatOpen;
  }

  // Enviar mensaje a la IA en Colab
  async sendMessage() {
    if (!this.userInput.trim() || this.loading) return;

    const userText = this.userInput;
    this.userInput = '';
    this.loading = true;

    // Agregar mensaje del usuario localmente
    this.messages.push({
      text: userText,
      sender: 'user',
      timestamp: new Date()
    });

    try {
      // Llamada al servicio (asegúrate que tu servicio use this.apiUrl)
      await this.chatService.sendMessage(userText);
    } catch (error) {
      this.messages.push({
        text: 'Error de conexión con el núcleo SiaGuard. Verifica la URL de Colab.',
        sender: 'bot',
        timestamp: new Date()
      });
    } finally {
      this.loading = false;
      this.scrollToBottom();
    }
  }

  // Utility: Auto-scroll al último mensaje
  private scrollToBottom() {
    setTimeout(() => {
      const chatContainer = document.querySelector('.chat-messages');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }, 100);
  }

  // Navegación externa (UPTA)
  goToUpta() {
    window.open('https://upta.edu.ve/', '_blank');
  }

}
