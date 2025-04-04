import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { startWith } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DeliveriesService } from '../../services/deliveries.service';
import { NotificationService } from '../../services/notification.service'; 

@Component({
  selector: 'app-ordenes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ordenes.component.html',
  styleUrls: ['./ordenes.component.css']
})
export class OrdenesComponent implements OnInit, OnDestroy {
  // Datos que serán cargados desde el backend
  facturas: any[] = [];
  private pollingSubscription!: Subscription;
  private readonly POLLING_INTERVAL = 15000;

  // Filtros
  searchFactura: string = '';
  searchArea: string = '';
  searchEstado: string = '';
  
  // Paginación
  currentPage: number = 1;
  itemsPerPage: number = 5;

  newInvoicesCount: number = 0;


  constructor(private router: Router, private deliveriesService: DeliveriesService, private notificationService: NotificationService) {}

  ngOnInit() {
    this.loadFacturas();
    this.notificationService.resetInvoicesCount();
    this.startPolling();
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  private startPolling(): void {
    this.pollingSubscription = interval(this.POLLING_INTERVAL)
      .pipe(
        startWith(0), // Ejecutar inmediatamente al iniciar
      )
      .subscribe(() => {
        this.loadFacturas();
      });
  }

  private stopPolling(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }
  
  // Método para cargar las facturas desde el servicio
  loadFacturas() {
    this.deliveriesService.getDeliveries().subscribe(
      (response: any) => {
        this.facturas = response.data.map((delivery: any) => ({
          nombre: `ORD-${delivery.invoice_id}`,
          fecha_entrega: delivery.delivery_date,
          productos: delivery.products.split(', '),
          trabajador_asignado: delivery.worker_name,
          transportista: delivery.carrier,
          estado: delivery.status,
        }));
        
        // Actualizar contador de facturas pendientes
        const pendientes = this.facturas.filter(f => f.estado === 'Pending').length;
        this.notificationService.updateInvoicesCount(pendientes);
      },
      (error) => {
        console.error('Error al obtener las entregas', error);
      }
    );
  }

  redirectAndMarkOrders(): void {
    this.notificationService.resetInvoicesCount();
    this.redirectToNuevaOrden();
  }

  // Redirigir a nueva orden
  redirectToNuevaOrden() {
    this.router.navigate(['/admin/facturas']);
  }

  markOrdersAsSeen(): void {
    this.notificationService.resetInvoicesCount(); // Resetea el contador de facturas
  }

  // Estilos para los estados
  getEstadoColor(estado: string): string {
    switch (estado) {
      case 'Pending': 
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'Completed': 
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      default: 
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  }

  getEstadoTraducido(estado: string): string {
    const traducciones: { [key: string]: string } = {
      Pending: 'Pendiente',
      Completed: 'Completado',
      Canceled: 'Cancelado'
    };
    return traducciones[estado] || estado; // Devuelve la traducción o el estado original si no hay traducción
  }

  get facturasPaginadas(): any[] {
    const inicio = (this.currentPage - 1) * this.itemsPerPage;
    const fin = inicio + this.itemsPerPage;
    return this.facturasFiltradas.slice(inicio, fin);
  }
  
  get facturasFiltradas(): any[] {
    return this.facturas.filter(factura =>
      factura.nombre.toLowerCase().includes(this.searchFactura.toLowerCase()) &&
      (this.searchArea ? factura.productos.some((p: string) => p.includes(this.searchArea)) : true) &&
      (this.searchEstado ? factura.estado === this.searchEstado : true)
    );
  }
  
  get totalPaginas(): number {
    return Math.ceil(this.facturasFiltradas.length / this.itemsPerPage);
  }  
}
