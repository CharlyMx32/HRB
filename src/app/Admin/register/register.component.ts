import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  employees: any[] = [];
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      name: ['', [Validators.required, Validators.maxLength(255)]],
      last_name: ['', [Validators.required, Validators.maxLength(255)]],
      birth_date: ['', [Validators.required, this.ageValidator]],
      phone: ['', [Validators.required, Validators.maxLength(20)]],
      RFID: ['', [Validators.required, Validators.maxLength(255)]],
      RFC: ['', [Validators.required, Validators.maxLength(255)]],
      NSS: ['', [Validators.required, Validators.maxLength(255)]]
    });
  }

  ngOnInit(): void {
    this.getEmployees();
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

  register(): void {
    if (this.registerForm.invalid) {
      this.errorMessage = 'Por favor, corrija los errores en el formulario.';
      return;
    }
  
    const employeeData = {
      email: this.registerForm.get('email')?.value,
      name: this.registerForm.get('name')?.value,
      last_name: this.registerForm.get('last_name')?.value,
      birth_date: this.registerForm.get('birth_date')?.value,
      phone: this.registerForm.get('phone')?.value,
      RFID: this.registerForm.get('RFID')?.value,
      RFC: this.registerForm.get('RFC')?.value,
      NSS: this.registerForm.get('NSS')?.value
    };
  
    // Aquí haces el mapeo a las propiedades que necesitas
    const formattedEmployeeData = {
      email: employeeData.email,
      name: employeeData.name,
      last_name: employeeData.last_name,
      birth_date: employeeData.birth_date,
      phone: employeeData.phone,
      RFID: employeeData.RFID,
      RFC: employeeData.RFC,
      NSS: employeeData.NSS
    };
  
    this.authService.registerWorker(formattedEmployeeData).subscribe(
      response => {
        console.log('Empleado registrado:', response);
        this.successMessage = 'Registro exitoso.';
        this.errorMessage = '';
  
        // Limpiar el formulario después del registro
        this.registerForm.reset();
  
        // Recargar la lista de empleados
        this.getEmployees();
      },
      error => {
        console.error('Error registrando empleado:', error);
        this.errorMessage = 'Error registrando empleado. Por favor, inténtelo de nuevo.';
        this.successMessage = '';
      }
    );
  }

  get email() {
    return this.registerForm.get('email');
  }
  
  get password() {
    return this.registerForm.get('password');
  }
  
  get name() {
    return this.registerForm.get('name');
  }
  
  get last_name() {
    return this.registerForm.get('last_name');
  }
  
  get birth_date() {
    return this.registerForm.get('birth_date');
  }
  
  get phone() {
    return this.registerForm.get('phone');
  }
  
  get RFID() {
    return this.registerForm.get('RFID');
  }
  
  get RFC() {
    return this.registerForm.get('RFC');
  }
  
  get NSS() {
    return this.registerForm.get('NSS');
  }
}  