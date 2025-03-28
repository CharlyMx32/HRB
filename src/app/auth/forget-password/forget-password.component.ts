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
  changePasswordForm: FormGroup;
  
  loading = false;
  waitingForVerification = false;
  emailVerified = false;
  successMessage: string | null = null;
  submitted: boolean = false;
  passwordChanged = false;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });

    this.changePasswordForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    }, {
      validator: this.passwordMatchValidator
    });
  }

  passwordMatchValidator(group: FormGroup) {
    const { newPassword, confirmPassword } = group.controls;
    if (newPassword.value !== confirmPassword.value) {
      return { mismatch: true };
    }
    return null;
  }

  onSubmit() {
    this.submitted = true;
  
    if (this.forgotPasswordForm.invalid) {
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

  changePassword() {
    // this.submitted = true;
    
    // if (this.changePasswordForm.invalid) {
    //   return;
    // }
    
    // this.loading = true;
    // const newPassword = this.changePasswordForm.value.newPassword;

    // this.authService.changePassword(newPassword).subscribe(
    //   (response) => {
    //     this.loading = false;
    //     this.passwordChanged = true;
    //     this.successMessage = '¡Contraseña cambiada exitosamente!';
        
    //     setTimeout(() => {
    //       this.router.navigate(['/auth/login']);
    //     }, 3000);
    //   },
    //   (error) => {
    //     this.loading = false;
    //     console.error('Error al cambiar la contraseña:', error);
    //   }
    // );
  }
}