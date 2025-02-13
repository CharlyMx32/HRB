import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  imports: [FormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  email: string = '';
  password: string = '';
  name: string = '';
  lastName: string = '';
  birthDate: string = '';
  phone: string = '';
  rfid: string = '';
  rfc: string = '';
  nss: string = '';
  errorMessage: string = '';

  register() {
    // Aquí puedes agregar la lógica para registrar al empleado
    if (!this.email || !this.password || !this.name || !this.lastName || !this.birthDate || !this.phone || !this.rfid || !this.rfc || !this.nss) {
      this.errorMessage = 'Todos los campos son obligatorios.';
      return;
    }

    // Lógica de registro (puedes hacer una llamada HTTP aquí)
    console.log('Empleado registrado:', {
      email: this.email,
      password: this.password,
      name: this.name,
      last_name: this.lastName,
      birth_date: this.birthDate,
      phone: this.phone,
      RFID: this.rfid,
      RFC: this.rfc,
      NSS: this.nss
    });

    // Limpiar el formulario después del registro
    this.email = '';
    this.password = '';
    this.name = '';
    this.lastName = '';
    this.birthDate = '';
    this.phone = '';
    this.rfid = '';
    this.rfc = '';
    this.nss = '';
    this.errorMessage = '';
  }
}
