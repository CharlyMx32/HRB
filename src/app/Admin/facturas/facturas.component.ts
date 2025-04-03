import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FacturasService } from '../../services/facturas.service';
import { DeliveriesService } from '../../services/deliveries.service';
import { WorkersService } from '../../services/workers.service'; // Importamos el servicio de trabajadores
import { Router } from '@angular/router'; // Importamos Router para navegación
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-facturas',
  templateUrl: './facturas.component.html',
  styleUrls: ['./facturas.component.css'],
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FacturasComponent implements OnInit {
  facturas$!: Observable<any[]>;
  employees: Array<{ id: number; name: string; last_name: string }> = []; // Almacenamos la lista de empleados
  modalVisible = false;
  facturaSeleccionadaId!: number; // ID de la factura seleccionada
  selectedEmployeeId!: number; // ID del empleado seleccionado en el combo box
  loading = false; // Nuevo flag para saber si estamos cargando

  constructor(
    private facturasService: FacturasService,
    private deliveriesService: DeliveriesService,
    private workersService: WorkersService, // Inyectamos el servicio de trabajadores
    private sanitizer: DomSanitizer,
    private router: Router // Inyectamos Router para redirección
  ) {}

  ngOnInit(): void {
    this.facturas$ = this.facturasService.facturas$;
    this.loadEmployees(); // Cargar empleados al inicializar el componente
  }

  // Método para cargar la lista de empleados
  loadEmployees(): void {
    this.workersService.getEmployees().subscribe({
      next: (response) => {
        this.employees = response; // Asegúrate de que `response` contenga los empleados
      },
      error: (error) => {
        console.error('Error al cargar empleados:', error);
      }
    });
  }

  // Abrir el modal y guardar el ID de la factura seleccionada
  abrirModal(facturaId: number): void {
    this.facturaSeleccionadaId = facturaId;
    this.modalVisible = true;
  }

  // Cerrar el modal y limpiar el estado
  cerrarModal(): void {
    this.modalVisible = false;
    this.selectedEmployeeId = 0; // Limpia la selección del empleado
  }

  // Método para asignar la factura al empleado seleccionado
  asignarFactura(): void {
    if (this.selectedEmployeeId) {
      const payload = { worker_id: this.selectedEmployeeId }; // Cambiar 'workerId' por 'worker_id' para coincidir con el backend
      console.log('Payload enviado:', payload); // Debugging

      this.loading = true; // Activar el loader

      this.deliveriesService.assignInvoice(this.facturaSeleccionadaId, payload).subscribe({
        next: (response) => {
          console.log('Factura asignada exitosamente:', response);
          this.loading = false; // Desactivar el loader
          this.cerrarModal(); // Cierra el modal tras éxito
          setTimeout(() => {
            this.router.navigate(['/admin/ordenes']); // Redirige después de 2 segundos
          }, 2000);
        },
        error: (error) => {
          console.error('Error al asignar factura:', error);
          this.loading = false; // Desactivar el loader
          alert('Hubo un error al asignar la factura. Por favor, verifica los datos.');
        }
      });
    } else {
      alert('Por favor, seleccione un empleado válido.');
    }
  }

  // Otros métodos del componente
  sanitizarURL(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  verFactura(url: string): void {
    window.open(url, '_blank');
  }

  trackByFn(index: number, factura: any): string {
    return factura.URL;
  }
}
