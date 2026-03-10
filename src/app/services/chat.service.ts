import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { IMessage } from '../Interfaces/imessage';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  // Historial de mensajes observable para que los componentes se actualicen solos
  private conversation = new BehaviorSubject<IMessage[]>([]);

  constructor(private http: HttpClient) {}

  // Obtener el flujo de mensajes
  getConversation(): Observable<IMessage[]> {
    return this.conversation.asObservable();
  }

  // Enviar mensaje al Backend de Colab
  async sendMessage(userText: string) {
    // 1. Obtener la URL guardada (la que pegaste en el engranaje/configuración)
    const apiUrl = localStorage.getItem('siaguard_api_url');
    
    if (!apiUrl) {
      this.addMessageToConversation('Error: No se ha configurado la URL del núcleo SiaGuard.', 'bot');
      throw new Error('API URL no configurada');
    }

    try {
      // 2. Realizar la petición POST a FastAPI
      // Usamos el endpoint '/ask' que definimos en el código de Python
      const response = await this.http.post<{ reply: string }>(`${apiUrl}/ask`, { 
        message: userText 
      }).toPromise();

      // 3. Agregar la respuesta de la IA al historial
      if (response) {
        this.addMessageToConversation(response.reply, 'bot');
      }
    } catch (error) {
      this.addMessageToConversation('Error de enlace: El servidor SiaGuard no responde.', 'bot');
      console.error('Error en la comunicación con la IA:', error);
      throw error;
    }
  }

  // Método auxiliar para actualizar el historial
  private addMessageToConversation(text: string, sender: 'user' | 'bot') {
    const currentMessages = this.conversation.value;
    const newMessage: IMessage = {
      text,
      sender,
      timestamp: new Date()
    };
    this.conversation.next([...currentMessages, newMessage]);
  }
}