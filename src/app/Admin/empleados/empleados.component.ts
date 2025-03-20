import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-empleados',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './empleados.component.html',
  styleUrls: ['./empleados.component.css'] // Corregido styleUrls
})

export class EmpleadosComponent implements OnInit {
  employees: any[] = [];
  showForm: boolean = false;
  employeeForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.employeeForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(255)]],
      last_name: ['', [Validators.required, Validators.maxLength(255)]],
      birth_date: ['', [Validators.required, this.ageValidator]],
      phone: ['', [Validators.maxLength(20)]],
      email: ['', [Validators.required, Validators.email]],
      RFID: ['', [Validators.maxLength(255)]],
      RFC: ['', [Validators.maxLength(255)]],
      NSS: ['', [Validators.maxLength(255)]]
    });
  }

  ngOnInit(): void {
    this.getEmployees(); // Llamar al método getEmployees para cargar los empleados
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
  }

  getEmployees(): void {
    console.log('Fetching employees...');
    this.authService.getEmployees().subscribe(
      data => {
        console.log('Data received from API:', data);
        this.employees = data;
        console.log('Employees:', this.employees);
      },
      error => {
        console.error('Error fetching employees:', error);
        console.log('Error details:', error.message);
        console.log('Error response:', error.error);
      }
    );
  }

  ageValidator(control: any): { [key: string]: boolean } | null {
    const birthDate = new Date(control.value);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 18 ? null : { 'ageInvalid': true };
  }

  register(): void {
    if (this.employeeForm.invalid) {
      this.errorMessage = 'Por favor, corrija los errores en el formulario.';
      return;
    }

    const employeeData = this.employeeForm.value;

    this.authService.registerWorker(employeeData).subscribe(
      response => {
        console.log('Empleado registrado:', response);
        this.successMessage = 'Registro exitoso. Redirigiendo...';
        this.errorMessage = '';

        // Limpiar el formulario después del registro
        this.employeeForm.reset();

        // Ocultar el formulario después del registro
        this.toggleForm();

        // Recargar la página después de 2 segundos
        setTimeout(() => {
          location.reload();
        }, 2000);
      },
      error => {
        console.error('Error registrando empleado:', error);
        this.errorMessage = 'Error registrando empleado. Por favor, inténtelo de nuevo.';
        this.successMessage = '';
      }
    );
  }
}