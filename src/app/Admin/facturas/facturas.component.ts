import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
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
  employees: Array<{ id: number; name: string; last_name: string }> = [];
  modalVisible = false;
  facturaSeleccionadaId!: number;
  selectedEmployeeId!: number;

  constructor(
    private facturasService: FacturasService,
    private deliveriesService: DeliveriesService,
    private workersService: WorkersService, 
    private router: Router
  ) {}

  ngOnInit(): void {
    this.facturas$ = this.facturasService.facturas$;
    this.loadEmployees(); // Cargar empleados al inicializar el componente
  }

  // Método para cargar la lista de empleados
  loadEmployees(): void {
    this.workersService.getEmployees().subscribe({
      next: (response) => {
        this.employees = response;
      },
      error: (error) => {
        console.error('Error al cargar empleados:', error);
      }
    });
  }

  // Abrir la URL de la factura en una nueva pestaña
  verFactura(url: string): void {
    window.open(url, '_blank');
  }

  // Abrir el modal para asignar factura
  abrirModal(facturaId: number): void {
    this.facturaSeleccionadaId = facturaId;
    this.modalVisible = true;
  }

  // Cerrar el modal
  cerrarModal(): void {
    this.modalVisible = false;
    this.selectedEmployeeId = 0; // Limpiar la selección del empleado
  }

  asignarFactura(): void {
    if (!this.selectedEmployeeId) {
      alert('Por favor, seleccione un empleado válido.');
      return;
    }
  
    const payload = { worker_id: this.selectedEmployeeId };
    this.deliveriesService.assignInvoice(this.facturaSeleccionadaId, payload).subscribe({
      next: () => {
        console.log('Factura asignada exitosamente');
  
        // Cerrar el modal
        this.cerrarModal();
  
        // Retrasar la recarga de la página por 3 segundos
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      },
      error: (error) => {
        console.error('Error al asignar factura:', error);
        alert('Hubo un error al asignar la factura. Por favor, verifica los datos.');
      }
    });
  }  

  trackByFn(factura: any): number {
    return factura.id;
  }
}