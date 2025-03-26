import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-empleados',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, DatePipe],
  templateUrl: './empleados.component.html',
  styleUrls: ['./empleados.component.css']
})
export class EmpleadosComponent implements OnInit {
  employees: any[] = [];
  showForm: boolean = false;
  employeeForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;
  isLoadingEmployees: boolean = false;
  private messageTimeout: any;

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
    if (!this.showForm) {
      this.employeeForm.reset();
      this.clearMessages();
    }
  }

  getEmployees(): void {
    this.isLoadingEmployees = true;
    this.authService.getEmployees().subscribe(
      data => {
        this.employees = data;
        this.isLoadingEmployees = false;
      },
      error => {
        console.error('Error fetching employees:', error);
        this.showErrorMessage('Error al cargar empleados. Por favor intente nuevamente.');
        this.isLoadingEmployees = false;
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
      this.showErrorMessage('Por favor, corrija los errores en el formulario.');
      return;
    }

    this.isLoading = true;
    this.clearMessages();

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
        this.showSuccessMessage('Empleado registrado exitosamente.');
        this.isLoading = false;
        this.employeeForm.reset();
        setTimeout(() => {
          this.getEmployees();
          this.toggleForm();
        }, 1500);
      },
      error => {
        console.error('Error registrando empleado:', error);
        this.showErrorMessage(error.error?.message || 'Error al registrar empleado. Por favor intente nuevamente.');
        this.isLoading = false;
      }
    );
  }

  private showSuccessMessage(message: string): void {
    this.clearMessageTimeout();
    this.successMessage = message;
    this.errorMessage = '';
    this.messageTimeout = setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }

  private showErrorMessage(message: string): void {
    this.clearMessageTimeout();
    this.errorMessage = message;
    this.successMessage = '';
    this.messageTimeout = setTimeout(() => {
      this.errorMessage = '';
    }, 3000);
  }

  private clearMessages(): void {
    this.clearMessageTimeout();
    this.errorMessage = '';
    this.successMessage = '';
  }

  private clearMessageTimeout(): void {
    if (this.messageTimeout) {
      clearTimeout(this.messageTimeout);
    }
  }

  // Getters para los controles del formulario
  get email() { return this.employeeForm.get('email'); }
  get name() { return this.employeeForm.get('name'); }
  get last_name() { return this.employeeForm.get('last_name'); }
  get birth_date() { return this.employeeForm.get('birth_date'); }
  get phone() { return this.employeeForm.get('phone'); }
  get RFID() { return this.employeeForm.get('RFID'); }
  get RFC() { return this.employeeForm.get('RFC'); }
  get NSS() { return this.employeeForm.get('NSS'); }
}