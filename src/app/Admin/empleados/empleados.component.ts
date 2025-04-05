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

  // Modal states
  showAddModal: boolean = false;
  showEditModal: boolean = false;

  selectedEmployeeId: string | null = null;

  employeeForm: FormGroup;
  editEmployeeForm: FormGroup;

  errorMessage: string = '';
  successMessage: string = '';
  editErrorMessage: string = '';

  today = new Date();
  minBirthDate = new Date();
  maxBirthDate = new Date();

  loading: boolean = false;
  editLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private workersService: WorkersService,
    private router: Router,

  ) {
    this.minBirthDate.setFullYear(this.today.getFullYear() - 65);
    this.maxBirthDate.setFullYear(this.today.getFullYear() - 18);

    this.employeeForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(255), Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$')]],
      last_name: ['', [Validators.required, Validators.maxLength(255), Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$')]],
      birth_date: ['', [Validators.required, this.ageValidator.bind(this)]],
      phone: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern('^[0-9]+$')]],
      email: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]],
      RFID: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
      RFC: ['', [Validators.required, Validators.minLength(12), Validators.maxLength(13)]],
      NSS: ['', [Validators.required, Validators.minLength(11), Validators.maxLength(11), Validators.pattern('^[0-9]+$')]],
    });

    this.editEmployeeForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(255), Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$')]],
      last_name: ['', [Validators.required, Validators.maxLength(255), Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$')]],
      phone: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
      RFID: ['', [Validators.required, Validators.maxLength(255)]],
    });

    this.employeeForm.statusChanges.subscribe(() => {
      this.errorMessage = '';
    });

    this.editEmployeeForm.statusChanges.subscribe(() => {
      this.editErrorMessage = '';
    });
  }

  ngOnInit(): void {
    this.getEmployees();
  }

  openAddModal(): void {
    this.showAddModal = true;
    this.errorMessage = '';
    this.employeeForm.reset();
  }

  closeAddModal(): void {
    this.showAddModal = false;
  }

  openEditModal(employee: any): void {
    this.selectedEmployeeId = employee.id;
    this.showEditModal = true;
    this.editErrorMessage = '';

    this.editEmployeeForm.patchValue({
      name: employee.name,
      last_name: employee.last_name,
      phone: employee.phone,
      RFID: employee.RFID,

    });
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedEmployeeId = null;
  }

  getEmployees(): void {
    this.workersService.getEmployees().subscribe(
      (response: any) => {
        this.employees = response.data.map((employee: any) => ({
          id: employee.id,
          email: employee.email,
          name: employee.name,
          last_name: employee.last_name,
          birth_date: employee.birth_date,
          age: employee.age,
          phone: employee.phone,
          assigned_orders: employee.assigned_orders,
          RFID: employee.RFID,
          RFC: employee.RFC,
          NSS: employee.NSS,
          activate: employee.activate,
          deleted_at: employee.deleted_at,
        }));
      },
      (error) => {
        console.error('Error al obtener las empleados', error);
      }
    );
  }

  register(): void {
    if (this.employeeForm.invalid) {
      this.errorMessage = 'Por favor complete todos los campos correctamente';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.registerWorker(this.employeeForm.value).subscribe({
      next: () => {
        this.successMessage = 'Empleado registrado correctamente';
        this.loading = false;
        this.showAddModal = false;
        this.getEmployees();
        setTimeout(() => this.successMessage = '', 5000);
      },
      error: (error) => {
        this.loading = false;

        if (error.status === 422 && error.error?.errors) {
          // Maneja errores de validación del backend
          const backendErrors = error.error.errors;

          // Asigna errores a cada campo
          Object.keys(backendErrors).forEach(field => {
            const control = this.employeeForm.get(field);
            if (control) {
              // Agrega el error al control sin eliminar otras validaciones
              control.setErrors({
                ...control.errors,
                backendError: backendErrors[field][0]
              });
              control.markAsTouched();
            }
          });
        } else {
          this.errorMessage = error.error?.message || 'Error al registrar empleado';
        }
      }
    });
  }

  updateEmployee(): void {
    if (this.editEmployeeForm.invalid || !this.selectedEmployeeId) {
      this.editErrorMessage = 'Por favor complete todos los campos';
      return;
    }

    this.editLoading = true;
    this.editErrorMessage = '';

    this.workersService.updateEmployee(
      this.selectedEmployeeId,
      this.editEmployeeForm.value
    ).subscribe({
      next: () => {
        this.successMessage = 'Empleado actualizado correctamente';
        this.editLoading = false;
        this.showEditModal = false;
        this.getEmployees();
        setTimeout(() => this.successMessage = '', 5000);
      },
      error: (error) => {
        this.editErrorMessage = error.error?.message || 'Error al actualizar empleado';
        this.editLoading = false;
      }
    });
  }

  // Cambia el método ageValidator y añade validateDate como función estática
  private static validateDate(date: Date): { [key: string]: boolean } | null {
    if (isNaN(date.getTime())) return { 'invalidDate': true };

    const MIN_YEAR = 1960;
    const MAX_AGE = 65;
    const today = new Date();

    // Validar año mínimo
    if (date.getFullYear() < MIN_YEAR) {
      return { 'minYear': true };
    }

    // Validar que no sea fecha futura
    if (date > today) {
      return { 'futureDate': true };
    }

    // Validar edad máxima (65 años)
    const maxBirthDate = new Date();
    maxBirthDate.setFullYear(today.getFullYear() - MAX_AGE);
    if (date < maxBirthDate) {
      return { 'maxAge': true };
    }

    // Validar edad mínima (18 años)
    const minBirthDate = new Date();
    minBirthDate.setFullYear(today.getFullYear() - 18);
    if (date > minBirthDate) {
      return { 'ageInvalid': true };
    }

    return null;
  }

  ageValidator(control: any): { [key: string]: boolean } | null {
    const value = control.value;
    if (!value) return null;

    // Solo para type="date" (formato YYYY-MM-DD)
    const birthDate = new Date(value);
    return EmpleadosComponent.validateDate(birthDate);
  }

  reenviarCorreo(email: string): void {
    this.authService.resendMail(email).subscribe({
      next: () => {
        console.log(`Correo reenviado reenviado`);
      },
      error: (err) => {
        console.error(`Error al reenviar el correo`, err);
      }
    });
  }

  desactivateAccount(id: number): void {
    this.authService.desactivateAccount(id).subscribe({
      next: (response) => {
        alert(response.message);
        this.employees = this.employees.map(emp =>
          emp.id === id ? { ...emp, activate: true } : emp
        );
        this.getEmployees()
      },
      error: (err) => {
        console.error('Error al desactivar la cuenta:', err);
        alert(err.error?.message || 'No se pudo desactivar la cuenta.');
      }
    });
  }

  activateAccount(id: number): void {
    this.authService.activateAccount(id).subscribe({
      next: (response) => {
        alert(response.message);
        this.employees = this.employees.map(emp =>
          emp.id === id ? { ...emp, activate: false } : emp
        );
        this.getEmployees()
      },
      error: (err) => {
        console.error('Error al activar la cuenta:', err);
        alert(err.error?.message || 'No se pudo activar la cuenta.');
      }
    });
  }
}