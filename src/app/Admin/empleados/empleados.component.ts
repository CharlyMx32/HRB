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
  
  loading: boolean = false;
  editLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private workersService: WorkersService,
    private router: Router
  ) {

    this.employeeForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(255), Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$')]],
      last_name: ['', [Validators.required, Validators.maxLength(255), Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$')]],
      birth_date: ['', [Validators.required, this.ageValidator]],
      phone: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern('^[0-9]+$')]],
      email: ['', [Validators.required, Validators.email]],
      RFID: ['', [Validators.required, Validators.maxLength(255)]],
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
    this.workersService.getEmployees().subscribe({
      next: (data) => this.employees = data,
      error: (error) => {
        console.error('Error fetching employees:', error);
        this.errorMessage = 'Error al cargar los empleados';
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
        setTimeout(() => this.successMessage = '', 5000);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Error al registrar empleado';
        this.loading = false;
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

  // Validator
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