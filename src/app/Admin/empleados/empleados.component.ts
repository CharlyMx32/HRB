import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { WorkersService } from '../../services/workers.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-empleados',
  standalone: true,
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
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private workersService: WorkersService,
    private router: Router
  ) {
    this.employeeForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(255)]],
      last_name: ['', [Validators.required, Validators.maxLength(255)]],
      birth_date: ['', [Validators.required, this.ageValidator]],
      phone: ['', [Validators.required, Validators.minLength(10) ,Validators.maxLength(10)]],
      email: ['', [Validators.required, Validators.email]],
      RFID: ['', [Validators.required, Validators.maxLength(255)]],
      RFC: ['', [Validators.required, Validators.minLength(12) ,Validators.maxLength(13)]],
      NSS: ['', [Validators.required, Validators.minLength(11) ,Validators.maxLength(11)]],
    });
  }    

  ngOnInit(): void {
    this.getEmployees();
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.resetForm();
    }
  }

  cancelForm(): void {
    this.showForm = false;
    this.resetForm();
    this.errorMessage = '';
  }

  resetForm(): void {
    this.employeeForm.reset();
  }

  getEmployees(): void {
    console.log('Fetching employees...');
    this.workersService.getEmployees().subscribe(
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

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

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
        this.loading = false;
        
        // Limpiar el formulario después del registro
        this.resetForm();
        
        // Ocultar el formulario después del registro
        this.showForm = false;
        
        // Recargar la lista de empleados
        this.getEmployees();
      },
      error => {
        console.error('Error registrando empleado:', error);
        this.errorMessage = 'Error registrando empleado. Por favor, inténtelo de nuevo.';
        this.loading = false;
      }
    );
  }
}