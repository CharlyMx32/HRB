import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface Device {
  id: string;
  name: string;
  type: string;
  readTime: number;
  responseTime: number;
  zone: string;
  password?: string;
}

@Component({
  selector: 'app-dispositivos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dispositivos.component.html',
  styleUrl: './dispositivos.component.css'
})
export class DispositivosComponent {
  devices = signal<Device[]>([
    {
      id: 'DEV-001',
      name: 'SIKRA',
      type: 'Lector RFID',
      readTime: 500,
      responseTime: 200,
      zone: 'Zona A'
    },
    {
      id: 'DEV-002',
      name: 'Terminal B',
      type: 'Terminal',
      readTime: 300,
      responseTime: 150,
      zone: 'Zona B'
    }
  ]);

  showModal = signal(false);
  editingDevice = signal<Device | null>(null);
  deviceForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.deviceForm = this.fb.group({
      name: ['', Validators.required],
      type: ['Lector RFID', Validators.required],
      readTime: [500, [Validators.required, Validators.min(0)]],
      responseTime: [200, [Validators.required, Validators.min(0)]],
      zone: ['Zona A', Validators.required],
      password: ['', Validators.required]
    });
  }

  openDeviceModal(device?: Device): void {
    if (device) {
      this.editingDevice.set(device);
      this.deviceForm.patchValue({
        name: device.name,
        type: device.type,
        readTime: device.readTime,
        responseTime: device.responseTime,
        zone: device.zone,
        password: '' // No mostramos la contraseña existente por seguridad
      });
    } else {
      this.editingDevice.set(null);
      this.deviceForm.reset({
        type: 'Lector RFID',
        readTime: 500,
        responseTime: 200,
        zone: 'Zona A'
      });
    }
    this.showModal.set(true);
  }

  closeDeviceModal(): void {
    this.showModal.set(false);
    this.deviceForm.reset();
  }

  saveDevice(): void {
    if (this.deviceForm.invalid) return;

    const formValue = this.deviceForm.value;
    const newDevice: Device = {
      id: this.editingDevice()?.id || `DEV-${('000' + (this.devices().length + 1)).slice(-3)}`,
      name: formValue.name,
      type: formValue.type,
      readTime: formValue.readTime,
      responseTime: formValue.responseTime,
      zone: formValue.zone
    };

    if (this.editingDevice()) {
      // Actualizar dispositivo existente
      this.devices.update(devices => 
        devices.map(d => d.id === this.editingDevice()?.id ? newDevice : d)
      );
    } else {
      // Agregar nuevo dispositivo
      this.devices.update(devices => [...devices, newDevice]);
    }

    this.closeDeviceModal();
  }

  editDevice(device: Device): void {
    this.openDeviceModal(device);
  }

  deleteDevice(id: string): void {
    if (confirm('¿Estás seguro de eliminar este dispositivo?')) {
      this.devices.update(devices => devices.filter(d => d.id !== id));
    }
  }
}