import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forget-password',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './forget-password.component.html',
  styleUrls: ['./forget-password.component.css']
})
export class ForgetPasswordComponent {
  forgotPasswordForm: FormGroup;
  changePasswordForm: FormGroup;
  
  loading = false;
  waitingForVerification = false;
  emailVerified = false;
  successMessage: string | null = null;
  submitted: boolean = false;

  constructor(private fb: FormBuilder, private authService: AuthService) {
    // Inicialización del formulario de recuperación de contraseña
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });

    // Inicialización del formulario de cambio de contraseña
    this.changePasswordForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    }, {
      // Validación para asegurarse de que las contraseñas coinciden
      validator: this.passwordMatchValidator
    });
  }

  // Validador personalizado para comprobar que las contraseñas coinciden
  passwordMatchValidator(group: FormGroup) {
    const { newPassword, confirmPassword } = group.controls;
    if (newPassword.value !== confirmPassword.value) {
      return { mismatch: true };
    }
    return null;
  }

  // Enviar correo de recuperación
  onSubmit() {
    this.loading = true;
    const email = this.forgotPasswordForm.value.email;

    this.authService.sendPasswordRecoveryEmail(email).subscribe(
      (response) => {
        this.loading = false;
        this.waitingForVerification = true;
        this.successMessage = 'Correo enviado. Por favor, verifica tu correo.';
        this.checkEmailVerification(email); // Comienza a verificar el estado
      },
      (error) => {
        this.loading = false;
        console.error('Error al enviar el correo:', error);
      }
    );
  }

  // Verificar si el correo fue confirmado
  checkEmailVerification(email: string) {
    // Llamada a la API para verificar si el correo fue verificado
    const interval = setInterval(() => {
      this.authService.checkEmailVerification(email).subscribe(
        (response: any) => {
          if (response.status === 200) { // Si el correo está verificado
            this.waitingForVerification = false;
            this.emailVerified = true;
            clearInterval(interval); // Detener la consulta
          }
        },
        (error) => console.error('Error verificando el correo:', error)
      );
    }, 3000); // Haciendo la petición cada 3 segundos
  }

  // Cambiar la contraseña
  changePassword() {
    if (this.changePasswordForm.invalid) {
      return;
    }
    this.loading = true;
    const newPassword = this.changePasswordForm.value.newPassword;

    // Aquí, enviarías la nueva contraseña al servidor
    // this.authService.changePassword(newPassword).subscribe(
    //   (response) => {
    //     this.loading = false;
    //     this.successMessage = 'Contraseña cambiada exitosamente.';
    //   },
    //   (error) => {
    //     this.loading = false;
    //     console.error('Error al cambiar la contraseña:', error);
    //   }
    // );
  }
}
