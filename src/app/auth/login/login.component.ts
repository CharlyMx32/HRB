import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { set } from 'animejs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage = '';
  isLoading = false;
  isPasswordVisible = false;

  constructor(
    private fb: FormBuilder, 
    private authService: AuthService, 
    private router: Router
  ) {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/admin/home']);
    }

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  login() {
    // Resetear mensajes de error
    this.errorMessage = '';
    
    // Marcar todos los campos como touched para mostrar errores
    this.loginForm.markAllAsTouched();

    if (this.loginForm.invalid) {
      this.errorMessage = 'Por favor, complete todos los campos correctamente.';
      setTimeout(() => {
        this.errorMessage = '';
      }
      , 3000); // Ocultar mensaje después de 3 segundos
      return;
    }

    this.isLoading = true;
    const { email, password } = this.loginForm.value;

    this.authService.login({ email, password }).subscribe({
      next: (response) => {
        this.authService.setToken(response.token);
        this.authService.setRole(response.role);
        this.isLoading = false;

        if (response.role === 'admin') {
          this.router.navigate(['/admin/home']);
        } else if (response.role === 'worker') {
          this.router.navigate(['/worker/dashboard']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error en login:', error);
        
        if (error.status === 403) {
          this.errorMessage = 'Tu cuenta está desactivada';
          setTimeout(() => {
            this.errorMessage = '';
          }
          , 5000); 
        } else if (error.status === 401) {
          this.errorMessage = 'Credenciales incorrectas';
        } else if (error.status === 0) {
          this.errorMessage = 'Error de conexión con el servidor';
        } else {
          this.errorMessage = 'Ocurrió un error inesperado';
        }
      }
    });
  }

  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  forgotPassword() {
    this.router.navigate(['/forgot-password']);
  }
}