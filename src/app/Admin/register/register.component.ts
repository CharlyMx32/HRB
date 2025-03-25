import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  email: string = '';
  name: string = '';
  last_name: string = '';
  birth_date: string = '';
  phone: string = '';
  RFID: string = '';
  RFC: string = '';
  NSS: string = '';
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private authService: AuthService) {}

  register() {
    if (!this.email || !this.name || !this.last_name || !this.birth_date || !this.phone || !this.RFID || !this.RFC || !this.NSS) {
      this.errorMessage = 'Todos los campos son obligatorios.';
      return;
    }
  
    const employeeData = {
      email: this.email,
      name: this.name,
      last_name: this.last_name,
      birth_date: this.birth_date,
      phone: this.phone,
      rfid: this.RFID,
      rfc: this.RFC,
      nss: this.NSS
    };
  
    this.authService.registerWorker(employeeData).subscribe({
      next: (response) => {
        console.log('Empleado registrado con éxito:', response);
        this.resetForm();
      },
      error: (error) => {
        console.error('Error al registrar empleado:', error);
        this.errorMessage = error.error?.message || 'Error desconocido';
      }
    });
  }
  
  resetForm() {
    this.email = '';
    this.name = '';
    this.last_name = '';
    this.birth_date = '';
    this.phone = '';
    this.RFID = '';
    this.RFC = '';
    this.NSS = '';
    this.errorMessage = '';
  }

  get email() {
    return this.registerForm.get('email');
  }
  
  get password() {
    return this.registerForm.get('password');
  }
  
  get name() {
    return this.registerForm.get('name');
  }
  
  get last_name() {
    return this.registerForm.get('last_name');
  }
  
  get birth_date() {
    return this.registerForm.get('birth_date');
  }
  
  get phone() {
    return this.registerForm.get('phone');
  }
  
  get RFID() {
    return this.registerForm.get('RFID');
  }
  
  get RFC() {
    return this.registerForm.get('RFC');
  }
  
  get NSS() {
    return this.registerForm.get('NSS');
  }
}  