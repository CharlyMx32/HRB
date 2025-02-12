import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule], 
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';
  isPasswordVisible = false;

  constructor(private authService: AuthService, private router: Router) {}

  login() {
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (response) => {
        this.authService.setToken(response.token);
        this.authService.setRole(response.role); 
        
        if (response.role === 'admin') {
          this.router.navigate(['/usuario/dashboard']);
        } else if (response.role === 'worker') {
          this.router.navigate(['/worker-dashboard']);
        } else {
          this.router.navigate(['/dashboard']); 
        }
      },
      error: () => {
        this.errorMessage = 'Credenciales incorrectas';
      }
    });
  }

  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }
}
