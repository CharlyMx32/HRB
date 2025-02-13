import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router,RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule,RouterModule], 
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';
  isLoading = false; // Nuevo estado para el loader
  isPasswordVisible = false;

  constructor(private authService: AuthService, private router: Router) {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/admin/home']);
    }
  }

  login() {
    this.isLoading = true; // Inicia el loader

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (response) => {
        this.authService.setToken(response.token);
        this.authService.setRole(response.role);
        this.isLoading = false; // Detiene el loader

        if (response.role === 'admin') {

          this.router.navigate(['/admin/home']);

        } else if (response.role === 'worker') {
          this.router.navigate(['/worker/dashboard']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: () => {
        this.errorMessage = 'Credenciales incorrectas';
        this.isLoading = false; 
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
