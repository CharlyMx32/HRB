import { Component } from '@angular/core';
import { MensajesService } from '../../services/mensajes.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-mensajes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mensajes.component.html',
  styleUrls: ['./mensajes.component.css']
})
export class MensajesComponent {
  mensaje: {message: string, type: 'success' | 'error'} | null = null;
  isClosing = false;

  constructor(private mensajesService: MensajesService) {
    this.mensajesService.mensajes$.subscribe(mensaje => {
      this.isClosing = false;
      this.mensaje = mensaje;
      
      if (mensaje) {
        setTimeout(() => this.close(), 5000);
      }
    });
  }

  close(): void {
    this.isClosing = true;
    setTimeout(() => {
      this.mensajesService.clear();
    }, 250); 
  }
}