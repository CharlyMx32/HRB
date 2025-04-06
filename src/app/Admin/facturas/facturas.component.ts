import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FacturasService } from '../../services/facturas.service';
import { DeliveriesService } from '../../services/deliveries.service';
import { WorkersService } from '../../services/workers.service'; // Importamos el servicio de trabajadores
import { Router } from '@angular/router'; // Importamos Router para navegación
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-facturas',
  templateUrl: './facturas.component.html',
  styleUrls: ['./facturas.component.css'],
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FacturasComponent implements OnInit {
  @Output() facturaAsignadaExitosamente = new EventEmitter<void>(); 
  facturas$!: Observable<any[]>;

  employees: Array<{ id: number; name: string; last_name: string; assigned_orders: number }> = [];

  modalVisible = false;
  facturaSeleccionadaId!: number;
  selectedEmployeeId!: number;

  successMessage: string = '';
  errorMessage: string = '';

  isLoading: boolean = false;

  constructor(
    private facturasService: FacturasService,
    private deliveriesService: DeliveriesService,
    private workersService: WorkersService,
    private router: Router,
    private cdr: ChangeDetectorRef 
  ) { }

  ngOnInit(): void {
    this.facturas$ = this.facturasService.facturas$;
    this.getEmployees();
  }

  getEmployees(): void {
    this.workersService.getEmployees().subscribe(
      (response: any) => {
        this.employees = response.data
          .filter((employee: any) => employee.activate)
          .map((employee: any) => ({
            id: employee.id,
            email: employee.email,
            name: employee.name,
            last_name: employee.last_name,
            birth_date: employee.birth_date,
            age: employee.age,
            phone: employee.phone,
            assigned_orders: employee.assigned_orders,
            RFID: employee.RFID,
            RFC: employee.RFC,
            NSS: employee.NSS,
            activate: employee.activate,
            deleted_at: employee.deleted_at,
          }));
      },
      (error) => {
        console.error('Error al obtener los empleados', error);
      }
    );
  }

  translateStatus(status: string): string {
    const translations: { [key: string]: string } = {
      Pending: 'Pendiente',
      Completed: 'Completado',
    };

    return translations[status] || status;
  }

  verFactura(url: string): void {
    window.open(url, '_blank');
  }

  abrirModal(facturaId: number): void {
    this.facturaSeleccionadaId = facturaId;
    this.modalVisible = true;
  }

  cerrarModal(): void {
    this.modalVisible = false;
    this.selectedEmployeeId = 0;
  }

  asignarFactura(): void {
    this.successMessage = '';
    this.errorMessage = '';
  
    if (!this.selectedEmployeeId) {
      this.errorMessage = 'Por favor, seleccione un empleado válido.';
      setTimeout(() => this.errorMessage = '', 5000);
      this.cdr.detectChanges(); // Forzar detección de cambios
      return;
    }
  
    this.isLoading = true;
    this.cdr.detectChanges(); // Forzar detección de cambios
  
    const payload = { worker_id: this.selectedEmployeeId };
    this.deliveriesService.assignInvoice(this.facturaSeleccionadaId, payload).subscribe({
      next: () => {
        console.log('Factura asignada exitosamente');
        this.isLoading = false;
        this.successMessage = 'Factura asignada exitosamente.';
        
        // Forzar actualización del observable
        this.facturasService.actualizarFacturas(); // Asegúrate de que este método exista en tu servicio
        this.facturas$ = this.facturasService.facturas$;
        
        this.cdr.detectChanges(); // Forzar detección de cambios
        
        setTimeout(() => {
          this.cerrarModal();
          this.facturaAsignadaExitosamente.emit();
          this.cdr.detectChanges(); // Forzar detección de cambios
        }, 3000);
      },
      error: (error) => {
        console.error('Error al asignar factura:', error);
        this.errorMessage = 'Hubo un error al asignar la factura. Por favor, verifica los datos.';
        this.isLoading = false;
        this.cdr.detectChanges(); // Forzar detección de cambios
        setTimeout(() => this.errorMessage = '', 5000);
      }
    });
  }

  trackByFn(factura: any): number {
    return factura.id;
  }
}
