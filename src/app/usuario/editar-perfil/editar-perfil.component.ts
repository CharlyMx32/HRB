import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router'; // Importa el servicio Router
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-editar-perfil',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './editar-perfil.component.html',
  styleUrls: ['./editar-perfil.component.css']
})
export class EditarPerfilComponent implements OnInit {
  updatePasswordForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  formErrors: any = {};
  isLoading: boolean = false;

  // Variables para controlar la visibilidad de las contraseñas
  showCurrentPassword: boolean = false;
  showNewPassword: boolean = false;
  showPasswordConfirmation: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router // Inyecta el servicio Router
  ) {
    this.updatePasswordForm = this.fb.group({
      current_password: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      password_confirmation: ['', [Validators.required, Validators.minLength(6)]]
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.updatePasswordForm.statusChanges.subscribe(() => {
      this.errorMessage = '';
      this.formErrors = {};
    });
  }

  passwordMatchValidator(form: FormGroup) {
    return form.get('password')?.value === form.get('password_confirmation')?.value
      ? null
      : { mismatch: true };
  }

  updatePassword(): void {
    this.updatePasswordForm.markAllAsTouched();

    if (this.updatePasswordForm.invalid) {
      if (this.updatePasswordForm.errors?.['mismatch']) {
        this.errorMessage = 'Las contraseñas no coinciden.';
      } else {
        this.errorMessage = 'Por favor, corrija los errores en el formulario.';
      }

      setTimeout(() => {
        this.errorMessage = '';
      }, 5000);

      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const passwordData = {
      current_password: this.updatePasswordForm.get('current_password')?.value,
      password: this.updatePasswordForm.get('password')?.value,
      password_confirmation: this.updatePasswordForm.get('password_confirmation')?.value
    };

    this.authService.updatePassword(passwordData).subscribe(
      response => {
        this.successMessage = 'Contraseña actualizada exitosamente.';
        this.updatePasswordForm.reset();
        this.isLoading = false;

        setTimeout(() => {
          this.successMessage = '';
          this.router.navigate(['/worker/dashboard']); // Redirige al dashboard
        }, 3000);
      },
      error => {
        this.errorMessage = 'Error actualizando contraseña. Por favor, inténtelo de nuevo.';
        this.isLoading = false;

        setTimeout(() => {
          this.errorMessage = '';
        }, 5000);
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