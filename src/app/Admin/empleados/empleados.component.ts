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
  editFormVisible: boolean = false; // Controla la visibilidad del formulario de edición
  selectedEmployeeId: string | null = null; // Almacena el ID del empleado seleccionado para edición
  employeeForm: FormGroup;
  editEmployeeForm: FormGroup; // Formulario para editar empleados
  errorMessage: string = '';
  successMessage: string = '';
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private workersService: WorkersService,
    private router: Router
  ) {
    // Formulario para agregar empleados
    this.employeeForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(255)]],
      last_name: ['', [Validators.required, Validators.maxLength(255)]],
      birth_date: ['', [Validators.required, this.ageValidator]],
      phone: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
      email: ['', [Validators.required, Validators.email]],
      RFID: ['', [Validators.required, Validators.maxLength(255)]],
      RFC: ['', [Validators.required, Validators.minLength(12), Validators.maxLength(13)]],
      NSS: ['', [Validators.required, Validators.minLength(11), Validators.maxLength(11)]],
    });

    // Formulario para editar empleados
    this.editEmployeeForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(255)]],
      last_name: ['', [Validators.required, Validators.maxLength(255)]],
      phone: ['', [Validators.required, Validators.maxLength(20)]],
      RFID: ['', [Validators.required, Validators.maxLength(50)]],
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

    const employeeData = this.employeeForm.value;

    this.authService.registerWorker(employeeData).subscribe(
      response => {
        console.log('Empleado registrado:', response);
        this.successMessage = 'Registro exitoso. El empleado ha sido registrado correctamente.';
        this.loading = false;

        this.resetForm();
        this.showForm = false;
        this.getEmployees();

        setTimeout(() => {
          this.successMessage = '';
        }, 5000);
      },
      error => {
        console.error('Error registrando empleado:', error);
        this.errorMessage = 'Error registrando empleado. Por favor, inténtelo de nuevo.';
        this.loading = false;
      }
    );
  }

  // Métodos para editar empleados
  openEditForm(employee: any): void {
    this.selectedEmployeeId = employee.id; // Guarda el ID del empleado seleccionado
    this.editFormVisible = true; // Muestra el formulario de edición

    // Precarga los datos del empleado en el formulario
    this.editEmployeeForm.patchValue({
      name: employee.name,
      last_name: employee.last_name,
      phone: employee.phone,
      RFID: employee.RFID,
    });
  }

  updateEmployee(): void {
    if (this.editEmployeeForm.invalid) {
      this.errorMessage = 'Por favor, corrija los errores en el formulario.';
      return;
    }

    const updatedData = this.editEmployeeForm.value;

    if (this.selectedEmployeeId) {
      this.loading = true;
      this.workersService.updateEmployee(this.selectedEmployeeId, updatedData).subscribe(
        response => {
          console.log('Empleado actualizado:', response);
          this.successMessage = 'El empleado ha sido actualizado correctamente.';
          this.loading = false;
          this.editFormVisible = false; // Oculta el formulario de edición
          this.selectedEmployeeId = null; // Limpia el ID seleccionado
          this.getEmployees(); // Actualiza la lista de empleados

          setTimeout(() => {
            this.successMessage = '';
          }, 5000);
        },
        error => {
          console.error('Error actualizando empleado:', error);
          this.errorMessage = 'Error actualizando empleado. Por favor, inténtelo de nuevo.';
          this.loading = false;
        }
      );
    }
  }

  cancelEdit(): void {
    this.editFormVisible = false; // Oculta el formulario de edición
    this.selectedEmployeeId = null; // Limpia el ID seleccionado
    this.errorMessage = '';
  }
}