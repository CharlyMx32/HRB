import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WorkersService } from '../../services/workers.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-editar-perfil-usuario',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './editar-perfil-usuario.component.html',
  styleUrls: ['./editar-perfil-usuario.component.css']
})
export class EditarPerfilUsuarioComponent implements OnInit {
  passwordForm: FormGroup;
  userData: any;
  isLoading: boolean = true;
  showPasswordForm: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  
  // Variables para controlar la visibilidad de las contraseñas
  showCurrentPassword: boolean = false;
  showNewPassword: boolean = false;
  showPasswordConfirmation: boolean = false;

  constructor(
    private workersService: WorkersService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.passwordForm = this.fb.group({
      current_password: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      password_confirmation: ['', [Validators.required, Validators.minLength(8)]]
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.loadUserData();
  }

  passwordMatchValidator(form: FormGroup) {
    return form.get('password')?.value === form.get('password_confirmation')?.value
      ? null : { mismatch: true };
  }

  loadUserData(): void {
    this.isLoading = true;
    this.workersService.getWorkerData().subscribe(
      (response: any) => {
        this.userData = response;
        this.isLoading = false;
      },
      (error) => {
        this.errorMessage = 'Error al cargar los datos del usuario';
        this.isLoading = false;
        setTimeout(() => this.errorMessage = '', 5000);
      }
    );
  }

  togglePasswordForm(): void {
    this.showPasswordForm = !this.showPasswordForm;
    if (!this.showPasswordForm) {
      this.passwordForm.reset();
      this.errorMessage = '';
      this.successMessage = '';
    }
  }

  updatePassword(): void {
    this.passwordForm.markAllAsTouched();

    if (this.passwordForm.invalid) {
      if (this.passwordForm.errors?.['mismatch']) {
        this.errorMessage = 'Las contraseñas no coinciden.';
      } else {
        this.errorMessage = 'Por favor, corrija los errores en el formulario.';
      }
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const passwordData = {
      current_password: this.passwordForm.get('current_password')?.value,
      password: this.passwordForm.get('password')?.value,
      password_confirmation: this.passwordForm.get('password_confirmation')?.value
    };

    this.authService.updatePassword(passwordData).subscribe(
      response => {
        this.successMessage = 'Contraseña actualizada exitosamente.';
        this.passwordForm.reset();
        this.isLoading = false;
        setTimeout(() => {
          this.successMessage = '';
          this.showPasswordForm = false;
        }, 3000);
      },
      error => {
        this.errorMessage = error.error?.message || 'Error actualizando contraseña. Por favor, inténtelo de nuevo.';
        this.isLoading = false;
      }
    );
  }

  // Métodos para alternar la visibilidad de cada campo
  toggleCurrentPasswordVisibility(): void {
    this.showCurrentPassword = !this.showCurrentPassword;
  }

  toggleNewPasswordVisibility(): void {
    this.showNewPassword = !this.showNewPassword;
  }

  togglePasswordConfirmationVisibility(): void {
    this.showPasswordConfirmation = !this.showPasswordConfirmation;
  }
}