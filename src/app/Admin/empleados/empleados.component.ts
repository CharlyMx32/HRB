import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalComponent } from '../../components/modal/modal.component';
import { FormControl } from '@angular/forms';
@Component({
  selector: 'app-empleados',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ModalComponent],
  templateUrl: './empleados.component.html',
  styleUrls: ['./empleados.component.css'] // Corregido styleUrls
})

export class EmpleadosComponent implements OnInit {
  employee!:Employee
  employees: any[] = [];
  showForm: boolean = false;
  employeeForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';

  totalPagesCount: number = 0;
  currentPage: number = 1;
  itemsPerPage: number = 4;

  filterName: string = '';
  filterLastName: string = '';
  filterAge: number | null = null;
  filteredEmployees: any[] = [];
  displayedEmployees: any[] = [];
  
  editEmployeeForm: FormGroup; // Nuevo formulario para editar empleados
  editingEmployee: any = null; // Almacena el empleado que se va a editar

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.employeeForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(255)]],
      lastName: ['', [Validators.required, Validators.maxLength(255)]],
      birthDate: ['', [Validators.required, this.ageValidator]],
      phone: ['', [Validators.maxLength(20)]],
      email: ['', [Validators.required, Validators.email]],
      RFID: ['', [Validators.maxLength(255)]],
      RFC: ['', [Validators.maxLength(255)]],
      NSS: ['', [Validators.maxLength(255)]]
    });

    this.editEmployeeForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(255)]],
      lastName: ['', [Validators.required, Validators.maxLength(255)]],
      birthDate: ['', [Validators.required, this.ageValidator]],
      phone: ['', [Validators.maxLength(20)]],
      email: ['', [Validators.required, Validators.email]],
      rfid: ['', [Validators.maxLength(255)]],
      rfc: ['', [Validators.maxLength(255)]],
      nss: ['', [Validators.maxLength(255)]]
    });
  }
  

  ngOnInit(): void {
    this.getEmployees(); // Llamar al método getEmployees para cargar los empleados
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
  }

  openEditModal(employee: any): void {
    this.editForm.controls['name'].setValue(employee.name);
    this.editForm.controls['lastName'].setValue(employee.last_name);
    this.editForm.controls['phone'].setValue(employee.phone);
    this.editForm.controls['rfid'].setValue(employee.RFID);
  }

  editForm = new FormGroup({
    name: new FormControl('',[]),
    lastName: new FormControl('',[]),
    phone: new FormControl('',[]),
    rfid: new FormControl('',[])
  })

  cancelEdit(): void {
    this.editingEmployee = null; // Cerrar el modal
    this.editEmployeeForm.reset(); // Limpiar el formulario
  }

  editEmployee(employee: any): void {
    this.authService.updateEmployee(employee.id, this.editForm.value).subscribe({
      next: (response)=>{
        this.successMessage = response.message;
      },
      error: (error)=>{
        console.log('Error:', error);}
    })
  }

  updateEmployee(): void {
    if (this.editEmployeeForm.invalid) {
      this.errorMessage = 'Por favor, corrija los errores en el formulario.';
      return;
    }
  
    const updatedData = this.editEmployeeForm.value;
  
    // Actualizar el empleado en la lista
    const index = this.employees.findIndex(e => e.id === this.editingEmployee.id);
    if (index !== -1) {
      this.employees[index] = { ...this.employees[index], ...updatedData };
    }
  
    // Cerrar el modal
    this.editingEmployee = null;
    this.successMessage = 'Empleado actualizado con éxito.';
  }
  
  // getEmployees(): void {
  //   // Datos estáticos de prueba (25 empleados)
  //   this.employees = [
  //   ];
  //   this.filteredEmployees = [...this.employees]; // Inicializamos filteredEmployees con todos los empleados
  //   this.totalPages(); // Actualizamos la paginación
  // }

  getEmployees(): void {
    console.log('Fetching employees...');
    this.authService.getEmployees().subscribe({
      next: (data) => {
        console.log('Data received from API:', data);
        this.employees = data;
        this.totalPages();
        this.applyFilters();
      },
      error: (error) => {
        console.error('Error fetching employees:', error);
        console.log('Error details:', error.message);
        console.log('Error response:', error.error);
      }

     });
  }

    totalPages(): void {
      // Actualiza el número total de páginas basándonos en los empleados filtrados
      this.totalPagesCount = Math.ceil(this.filteredEmployees.length / this.itemsPerPage);
      this.updatePage(); // Actualiza la página con los datos correspondientes
    }

    updatePage(): void {
      // Obtener los empleados para la página actual sin modificar el array original de filteredEmployees
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
    
      // Actualizar la lista temporal que se mostrará en la vista
      this.displayedEmployees = this.filteredEmployees.slice(start, end);
    }

    changePage(page: number): void {
      if (page > 0 && page <= this.totalPagesCount) {
        this.currentPage = page;
        this.updatePage(); // Actualiza la página cuando cambia
      }
    }

    applyFilters(): void {
      let filtered = this.employees.filter(employee => {
        const matchesName = this.filterName === '' || employee.name.toLowerCase().includes(this.filterName.toLowerCase());
        const matchesLastName = this.filterLastName === '' || employee.last_name.toLowerCase().includes(this.filterLastName.toLowerCase());
        const matchesAge = this.filterAge === null || employee.age.toString() === this.filterAge.toString();
    
        return matchesName && matchesLastName && matchesAge;
      });
    
      this.filteredEmployees = filtered; 
      this.currentPage = 1; 
      this.totalPages(); 
      this.updatePage(); // Actualizar la lista a mostrar con la nueva paginación
    }

    preventTyping(event: KeyboardEvent): void {
      const forbiddenKeys = ['e', 'E', '+', '-', '.']; // Las teclas que queremos bloquear
      if (forbiddenKeys.includes(event.key) || (event.key >= '0' && event.key <= '9')) {
        event.preventDefault();
      }
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

  getEmployeesFiltered(): void
  {
    console.log('Fetching employees...');
    this.authService.getEmployees().subscribe(
      data => {
        console.log('Data received from API:', data);
        this.employees = data;
        this.totalPages();
        this.applyFilters();
      },
      error => {
        console.error('Error fetching employees:', error);
        console.log('Error details:', error.message);
        console.log('Error response:', error.error);
      }
    );
  }
}

interface Employee {
  name: string
  last_name: string
  phone: number
  RFID: string
}