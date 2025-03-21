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

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.updatePasswordForm = this.fb.group({
      current_password: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      password_confirmation: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {}

  updatePassword(): void {
    if (this.updatePasswordForm.invalid) {
      this.errorMessage = 'Por favor, corrija los errores en el formulario.';
      return;
    }

    const passwordData = {
      current_password: this.updatePasswordForm.get('current_password')?.value,
      password: this.updatePasswordForm.get('password')?.value,
      password_confirmation: this.updatePasswordForm.get('password_confirmation')?.value
    };

    this.authService.updatePassword(passwordData).subscribe(
      response => {
        console.log('Contraseña actualizada:', response);
        this.successMessage = 'Contraseña actualizada exitosamente.';
        this.errorMessage = '';
        this.formErrors = {};

        // Limpiar el formulario después de la actualización
        this.updatePasswordForm.reset();
      },
      error => {
        console.error('Error actualizando contraseña:', error);
        if (error.error && error.error.errors) {
          this.formErrors = error.error.errors;
        } else {
          this.errorMessage = 'Error actualizando contraseña. Por favor, inténtelo de nuevo.';
        }
        this.successMessage = '';
      }
    );
  }
}