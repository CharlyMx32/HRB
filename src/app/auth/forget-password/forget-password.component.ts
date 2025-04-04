import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service'; // Ajusta la ruta si es diferente
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-forget-password',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './forget-password.component.html',
  styleUrls: ['./forget-password.component.css']
})
export class ForgetPasswordComponent {
  email: string = '';
  mensaje: string = '';

  constructor(private authService: AuthService) {}

  enviarEnlace() {
    if (!this.email) {
      this.mensaje = 'Por favor ingresa un correo válido.';
      return;
    }

    this.authService.resetPassword(this.email).subscribe({
      next: () => {
        this.mensaje = 'Se ha enviado el correo exitosamente, revisa tu bandeja de entrada.';
      },
      error: (err) => {
        this.mensaje = 'Hubo un error al enviar el enlace. Intenta de nuevo.';
        console.error(err);
      }
    });
  }
}
