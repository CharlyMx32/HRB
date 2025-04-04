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
  formSubmitted: boolean = false;
  isLoading: boolean = false;

  constructor(private authService: AuthService) {}

  enviarEnlace() {
    this.formSubmitted = true;
    
    if (!this.email) {
      this.mensaje = 'Por favor ingresa un correo válido.';
      return;
    }

    this.isLoading = true;
    this.mensaje = '';

    this.authService.resetPassword(this.email).subscribe({
      next: () => {
        this.mensaje = 'Se ha enviado el correo exitosamente, revisa tu bandeja de entrada.';
        this.isLoading = false;
      },
      error: (err) => {
        this.mensaje = 'Hubo un error al enviar el enlace. Intenta de nuevo.';
        console.error(err);
        this.isLoading = false;
      }
    });
  }
}
