import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { MensajesService } from '../../services/mensajes.service';
import { WorkersService } from '../../services/workers.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { EliminarCuadroComponent } from '../../components/eliminar-cuadro/eliminar-cuadro.component';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SensoresService } from '../../services/sensores.service';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'app-empleados',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './empleados.component.html',
  styleUrls: ['./empleados.component.css']
})
export class EmpleadosComponent implements OnInit {
  employees: any[] = [];
  rfidCodes: string[] = [];
  noRfidAvailable: boolean = false;

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
    private mensajesService: MensajesService,
    private sensoresService: SensoresService,
    private router: Router,
    private dialog: MatDialog

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
      phone: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern('^[0-9]+$')]],
      birth_date: ['', [Validators.required, this.ageValidator.bind(this)]],
      RFID: ['', [Validators.required, Validators.maxLength(50)]],
      RFC: ['', [Validators.minLength(12), Validators.maxLength(13)]],
      NSS: ['', [Validators.minLength(11), Validators.maxLength(11), Validators.pattern('^[0-9]+$')]],
      email: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]],
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
    this.loadRfidCodes();
  }

  openAddModal(): void {
    this.showAddModal = true;
    this.errorMessage = '';
    this.employeeForm.reset();
  }

  closeAddModal(): void {
    this.showAddModal = false;
  }

  openEditModal(employeeId: string): void {
    this.selectedEmployeeId = employeeId;
    this.editLoading = true;
    this.showEditModal = true;
    this.editErrorMessage = '';
    this.successMessage = '';

    this.workersService.getEmployee(employeeId).subscribe({
      next: (employee) => {
        console.log('Empleado recibido:', employee);
        this.editEmployeeForm.patchValue({
          name: employee.name,
          last_name: employee.last_name,
          phone: employee.phone,
          birth_date: employee.birth_date,
          RFID: employee.RFID,
          RFC: employee.RFC || '',
          NSS: employee.NSS || '',
          email: employee.email || ''
        });
        this.editLoading = false;
      },
      error: (error) => {
        this.editLoading = false;
        this.showEditModal = false;
        this.mensajesService.showError('Error al cargar los datos del empleado');
        console.error('Error al obtener empleado:', error);
      }
    });
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedEmployeeId = null;
    this.editEmployeeForm.reset();
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

  private loadRfidCodes(): void {
    combineLatest([
      this.sensoresService.rfidCodes$,
      this.sensoresService.getAssignedRfidCodes()
    ]).subscribe({
      next: ([allCodes, assignedCodes]) => {
        this.rfidCodes = allCodes.filter(code => !assignedCodes.includes(code));
        this.noRfidAvailable = this.rfidCodes.length === 0;

        if (this.rfidCodes.length === 1) {
          this.employeeForm.patchValue({ RFID: this.rfidCodes[0] });
        }
      },
      error: (err) => {
        console.error('Error al obtener códigos RFID', err);
        this.noRfidAvailable = true;
      }
    });
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
        this.loadRfidCodes();
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
      this.editErrorMessage = 'Por favor complete todos los campos requeridos';
      return;
    }

    this.editLoading = true;
    this.editErrorMessage = '';
    this.successMessage = '';

    const formData = this.editEmployeeForm.value;

    // Manejo de campos opcionales
    if (!formData.RFC) formData.RFC = null;
    if (!formData.NSS) formData.NSS = null;
    if (!formData.email) formData.email = null;

    this.workersService.updateEmployee(this.selectedEmployeeId, formData).subscribe({
      next: (response) => {
        this.editLoading = false;
        this.successMessage = response.message || 'Empleado actualizado correctamente';
        this.getEmployees();
        setTimeout(() => {
          this.showEditModal = false;
          this.successMessage = '';
        }, 2000);
      },
      error: (error) => {
        this.editLoading = false;

        if (error.validationErrors) {
          // Manejar errores de validación del backend
          Object.keys(error.validationErrors).forEach(field => {
            const control = this.editEmployeeForm.get(field);
            if (control) {
              control.setErrors({
                ...control.errors,
                backendError: error.validationErrors[field]
              });
              control.markAsTouched();
            }
          });
          this.editErrorMessage = 'Por favor corrija los errores en el formulario';
        } else {
          this.editErrorMessage = error.message || 'Error al actualizar empleado';
        }
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

    const birthDate = new Date(value);
    return EmpleadosComponent.validateDate(birthDate);
  }

  reenviarCorreo(email: string): void {
    this.authService.resendMail(email).subscribe({
      next: () => {
        this.mensajesService.showSuccess('Correo reenviado exitosamente');
      },
      error: (err) => {
        this.mensajesService.showError('Error al reenviar el correo');
        console.error(`Error al reenviar el correo`, err);
      }
    });
  }

  desactivateAccount(id: number): void {
    this.authService.desactivateAccount(id).subscribe({
      next: (response) => {
        this.mensajesService.showSuccess(response.message || 'Cuenta desactivada correctamente');
        this.employees = this.employees.map(emp =>
          emp.id === id ? { ...emp, activate: true } : emp
        );
        this.getEmployees();
      },
      error: (err) => {
        console.error('Error al desactivar la cuenta:', err);
        this.mensajesService.showError(err.error?.message || 'No se pudo desactivar la cuenta.');
      }
    });
  }

  activateAccount(id: number): void {
    this.authService.activateAccount(id).subscribe({
      next: (response) => {
        this.mensajesService.showSuccess(response.message || 'Cuenta activada correctamente');
        this.employees = this.employees.map(emp =>
          emp.id === id ? { ...emp, activate: false } : emp
        );
        this.getEmployees();
      },
      error: (err) => {
        console.error('Error al activar la cuenta:', err);
        this.mensajesService.showError(err.error?.message || 'No se pudo activar la cuenta.');
      }
    });
  }

  eliminarTrabajador(id: number) {
    const dialogRef = this.dialog.open(EliminarCuadroComponent, {
      data: {
        titulo: 'Eliminar trabajador',
        mensaje: '¿Estás seguro de eliminar este trabajador? Esta acción no se puede deshacer.',
        textoConfirmar: 'Sí, eliminar',
        textoCancelar: 'Cancelar'
      },
      width: '400px',
      panelClass: 'eliminar-cuadro-overlay'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.authService.eliminarTrabajador(id).subscribe({
          next: () => {
            this.mensajesService.showSuccess('Trabajador eliminado correctamente');
            this.getEmployees();
          },
          error: (error) => {
            console.error('Error al eliminar trabajador:', error);
            this.mensajesService.showError(error.error?.message || 'Error al eliminar trabajador');
          }
        });
      }
    });
  }
}