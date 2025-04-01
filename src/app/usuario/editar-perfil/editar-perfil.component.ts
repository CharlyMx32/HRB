import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
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
  isLoading: boolean = false; // Nueva propiedad para controlar el spinner

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.updatePasswordForm = this.fb.group({
      current_password: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      password_confirmation: ['', [Validators.required, Validators.minLength(6)]]
    }, { validator: this.passwordMatchValidator }); // Agregamos validador personalizado
  }

  ngOnInit(): void { }

  // Validador personalizado para confirmar que las contraseñas coincidan
  passwordMatchValidator(form: FormGroup) {
    return form.get('password')?.value === form.get('password_confirmation')?.value
      ? null
      : { mismatch: true };
  }

  updatePassword(): void {
    // Marcar todos los campos como touched para mostrar errores
    this.updatePasswordForm.markAllAsTouched();

    if (this.updatePasswordForm.invalid) {
      if (this.updatePasswordForm.errors?.['mismatch']) {
        this.errorMessage = 'Las contraseñas no coinciden.';
      } else {
        this.errorMessage = 'Por favor, corrija los errores en el formulario.';
      }

      // Limpiar el mensaje de error después de 5 segundos
      setTimeout(() => {
        this.errorMessage = '';
      }, 5000);

      return;
    }

    this.isLoading = true; // Activar spinner
    this.errorMessage = '';
    this.successMessage = '';

    const passwordData = {
      current_password: this.updatePasswordForm.get('current_password')?.value,
      password: this.updatePasswordForm.get('password')?.value,
      password_confirmation: this.updatePasswordForm.get('password_confirmation')?.value
    };

    this.authService.updatePassword(passwordData).subscribe(
      response => {
        console.log('Contraseña actualizada:', response);
        this.successMessage = 'Contraseña actualizada exitosamente.';
        this.formErrors = {};
        this.updatePasswordForm.reset();
        this.isLoading = false; // Desactivar spinner

        // Limpiar el mensaje de éxito después de 5 segundos
        setTimeout(() => {
          this.successMessage = '';
        }, 5000);
      },
      error => {
        console.error('Error actualizando contraseña:', error);
        if (error.error && error.error.errors) {
          this.formErrors = error.error.errors;
        } else {
          this.errorMessage = 'Error actualizando contraseña. Por favor, inténtelo de nuevo.';
        }
        this.successMessage = '';
        this.isLoading = false; // Desactivar spinner

        // Limpiar el mensaje de error después de 5 segundos
        setTimeout(() => {
          this.errorMessage = '';
        }, 5000);
      }
    );
  }
}