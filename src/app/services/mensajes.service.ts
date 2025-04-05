import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MensajesService {
  private mensajesSubject = new BehaviorSubject<{message: string, type: 'success' | 'error'} | null>(null);
  mensajes$ = this.mensajesSubject.asObservable();

  showSuccess(message: string): void {
    this.mensajesSubject.next({ message, type: 'success' });
    setTimeout(() => this.clear(), 5000);
  }

  showError(message: string): void {
    this.mensajesSubject.next({ message, type: 'error' });
    setTimeout(() => this.clear(), 5000);
  }

  sendMessage(mensaje: {message: string, type: 'success' | 'error'}): void {
    this.mensajesSubject.next(mensaje);
  }

  clear(): void {
    this.mensajesSubject.next(null);
  }
}