import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SensoresService } from '../../services/sensores.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-dispositivos',
  templateUrl: './dispositivos.component.html',
  styleUrls: ['./dispositivos.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
})
export class DispositivosComponent implements OnInit {
  devices: any[] = [];
  areas: any[] = [];
  editForm: FormGroup;
  showModal: boolean = false;
  selectedDevice: any = null;
  showDeleteConfirm: boolean = false;
  deviceToDelete: any = null;
  alertMessage: string = '';
  alertType: 'success' | 'error' | 'info' = 'info';
  showAlert: boolean = false;

  constructor(private fb: FormBuilder, private sensoresService: SensoresService) {
    this.editForm = this.fb.group({
      name: [''],
      password: [''],
      area_id: [''],
      reading_time: ['', [Validators.pattern(/^\d*$/)]],
      response_time: ['', [Validators.pattern(/^\d*$/)]],
    });
  }

  ngOnInit(): void {
    this.loadDevices();
    this.loadAreas();
  }

  loadDevices(): void {
    this.sensoresService.getDevices().subscribe({
      next: (data: any[]) => {
        this.devices = data;
      },
      error: (err) => {
        this.displayAlert('error', 'Error al cargar dispositivos');
        console.error('Error loading devices:', err);
      }
    });
  }

  loadAreas(): void {
    this.sensoresService.getAriaReferenceIds().subscribe({
      next: (areas: any[]) => {
        this.areas = areas;
      },
      error: (err) => {
        this.displayAlert('error', 'Error al cargar áreas');
        console.error('Error loading areas:', err);
      }
    });
  }

  openEditModal(device: any): void {
    this.selectedDevice = device;
    this.showModal = true;

    this.editForm.patchValue({
      name: device.name,
      password: device.password || '',
      area_id: device.area_id || '',
      reading_time: device.reading_time || '',
      response_time: device.response_time || ''
    });
  }

  saveChanges(): void {
    // Crear objeto solo con los campos modificados
    const updatedData: any = {};
    
    // Verificar cada campo individualmente
    if (this.editForm.value.name !== this.selectedDevice.name) {
      updatedData.name = this.editForm.value.name;
    }
    
    if (this.editForm.value.password !== '' && 
        this.editForm.value.password !== this.selectedDevice.password) {
      updatedData.password = this.editForm.value.password;
    }
    
    if (this.editForm.value.area_id !== '' && 
        this.editForm.value.area_id !== this.selectedDevice.area_id) {
      updatedData.area_id = this.editForm.value.area_id;
    }
    
    if (this.editForm.value.reading_time !== '' && 
        this.editForm.value.reading_time !== this.selectedDevice.reading_time) {
      updatedData.reading_time = this.editForm.value.reading_time;
    }
    
    if (this.editForm.value.response_time !== '' && 
        this.editForm.value.response_time !== this.selectedDevice.response_time) {
      updatedData.response_time = this.editForm.value.response_time;
    }
  
    // Verificar que al menos un campo fue modificado
    if (Object.keys(updatedData).length === 0) {
      this.displayAlert('info', 'No se realizaron cambios');
      return;
    }
  
    // Validar campos numéricos
    if (updatedData.reading_time && isNaN(updatedData.reading_time)) {
      this.displayAlert('error', 'Tiempo de lectura debe ser un número');
      return;
    }
  
    if (updatedData.response_time && isNaN(updatedData.response_time)) {
      this.displayAlert('error', 'Tiempo de respuesta debe ser un número');
      return;
    }
  
    this.sensoresService.updateDevice(this.selectedDevice.id.toString(), updatedData).subscribe({
      next: (response: any) => {
        this.displayAlert('success', 'Dispositivo actualizado correctamente');
        this.loadDevices();
        this.closeModal();
      },
      error: (err) => {
        let errorMsg = 'Error al actualizar el dispositivo';
        if (err.error?.message) {
          errorMsg = err.error.message;
        } else if (err.status === 404) {
          errorMsg = 'Dispositivo no encontrado';
        }
        this.displayAlert('error', errorMsg);
        console.error('Error updating device:', err);
      }
    });
  }
  getAreaName(areaId: number): string {
    const area = this.areas.find(a => a.id === areaId);
    return area ? area.name : '';
  }

  confirmDelete(device: any): void {
    this.deviceToDelete = device;
    this.showDeleteConfirm = true;
  }

  deleteDevice(): void {
    if (!this.deviceToDelete) return;

    this.sensoresService.deleteDevice(this.deviceToDelete.id.toString()).subscribe({
      next: () => {
        this.displayAlert('success', 'Dispositivo eliminado correctamente');
        this.loadDevices();
        this.closeDeleteConfirm();
      },
      error: (err) => {
        this.displayAlert('error', 'Error al eliminar dispositivo');
        console.error('Error deleting device:', err);
      }
    });
  }

  closeModal(): void {
    this.showModal = false;
    this.editForm.reset();
    this.selectedDevice = null;
  }

  closeDeleteConfirm(): void {
    this.showDeleteConfirm = false;
    this.deviceToDelete = null;
  }

  displayAlert(type: 'success' | 'error' | 'info', message: string): void {
    this.alertType = type;
    this.alertMessage = message;
    this.showAlert = true;
    
    setTimeout(() => {
      this.showAlert = false;
    }, 5000);
  }
}