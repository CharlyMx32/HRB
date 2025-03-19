import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registro-empleados',
  imports: [ CommonModule, FormsModule ],
  templateUrl: './registro-empleados.component.html',
  styleUrl: './registro-empleados.component.css'
})
export class RegistroEmpleadosComponent {
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

  constructor(private router: Router) { }

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

  goBack() {
    console.log('Navigating back to /admin/empleados');
    this.router.navigate(['admin/empleados']).then(success => {
      if (success) {
        console.log('Navigation to /admin/empleados successful');
      } else {
        console.log('Navigation to /admin/empleados failed');
      }
    }).catch(error => {
      console.error('Navigation error:', error);
    });
  }

  navigate(path: string) {
    console.log(`Navigating to ${path}`);
    this.router.navigate([path]).then(success => {
      if (success) {
        console.log(`Navigation to ${path} successful`);
      } else {
        console.log(`Navigation to ${path} failed`);
      }
    }).catch(err => {
      console.error('Navigation error:', err);
    });
  }
}
