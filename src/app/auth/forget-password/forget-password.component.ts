import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forget-password',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './forget-password.component.html',
  styleUrls: ['./forget-password.component.css']
})
export class ForgetPasswordComponent {
  forgotPasswordForm: FormGroup;
  loading = false;
  waitingForVerification = false;
  emailVerified = false;
  successMessage: string | null = null;
  submitted: boolean = false;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  onSubmit() {
    this.submitted = true;

    if (this.forgotPasswordForm.invalid) {
      setTimeout(() => {
        this.submitted = false;
      }, 5000);
      return;
    }

    this.loading = true;
    const email = this.forgotPasswordForm.value.email;

    this.authService.sendPasswordRecoveryEmail(email).subscribe(
      (response) => {
        this.loading = false;
        this.successMessage = 'Correo enviado. Por favor, revisa tu bandeja de entrada.';
        this.waitingForVerification = true;

        setTimeout(() => {
          this.successMessage = null;
          this.checkEmailVerification(email);
        }, 3000);
      },
      (error) => {
        this.loading = false;
        this.successMessage = null;
        console.error('Error al enviar el correo:', error);
      }
    );
  }

  checkEmailVerification(email: string) {
    const interval = setInterval(() => {
      this.authService.checkEmailVerification(email).subscribe(
        (response: any) => {
          if (response.status === 200) {
            this.waitingForVerification = false;
            this.emailVerified = true;
            clearInterval(interval);
          }
        },
        (error) => console.error('Error verificando el correo:', error)
      );
    }, 3000);
  }
}