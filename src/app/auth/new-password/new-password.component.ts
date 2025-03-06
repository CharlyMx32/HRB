import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-new-password',
  standalone: true,
  templateUrl: './new-password.component.html',
  styleUrls: ['./new-password.component.css'],
  imports: [CommonModule]
})
export class NewPasswordComponent {
  newPasswordForm: FormGroup;
  submitted = false;
  loading = false;

  constructor(private fb: FormBuilder) {
    this.newPasswordForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  get f() { return this.newPasswordForm.controls; }

  onSubmit() {
    this.submitted = true;

    if (this.newPasswordForm.invalid) {
      return;
    }

    if (this.f['newPassword'].value !== this.f['confirmPassword'].value) {
      this.newPasswordForm.setErrors({ mismatch: true });
      return;
    }

    this.loading = true;
    setTimeout(() => {
      this.loading = false;
      alert('Nueva contraseña establecida con éxito');
    }, 2000);
  }
}
