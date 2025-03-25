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
  styleUrls: ['./empleados.component.css']
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
    this.getEmployees();
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
        this.errorMessage = 'Error fetching employees. Please try again later.';
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

    const employeeData = {
      email: this.employeeForm.get('email')?.value,
      name: this.employeeForm.get('name')?.value,
      last_name: this.employeeForm.get('last_name')?.value,
      birth_date: this.employeeForm.get('birth_date')?.value,
      phone: this.employeeForm.get('phone')?.value,
      RFID: this.employeeForm.get('RFID')?.value,
      RFC: this.employeeForm.get('RFC')?.value,
      NSS: this.employeeForm.get('NSS')?.value,
    };

    this.authService.registerWorker(employeeData).subscribe(
      response => {
        console.log('Empleado registrado:', response);
        this.successMessage = 'Registro exitoso. El empleado ha sido registrado correctamente.';
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

  // Métodos para obtener los controles del formulario
  get email() { return this.employeeForm.get('email'); }
  get name() { return this.employeeForm.get('name'); }
  get last_name() { return this.employeeForm.get('last_name'); }
  get birth_date() { return this.employeeForm.get('birth_date'); }
  get phone() { return this.employeeForm.get('phone'); }
  get RFID() { return this.employeeForm.get('RFID'); }
  get RFC() { return this.employeeForm.get('RFC'); }
  get NSS() { return this.employeeForm.get('NSS'); }
}