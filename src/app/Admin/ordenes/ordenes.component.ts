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
  facturas: any[] = [];
  private pollingSubscription!: Subscription;
  private readonly POLLING_INTERVAL = 15000;

  searchFactura: string = '';
  searchArea: string = '';
  searchEstado: string = '';
  
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
        startWith(0), 
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
        
        const pendientes = this.facturas.filter(f => f.estado === 'Pending').length;
        this.notificationService.updateInvoicesCount(pendientes);
      },
      (error) => {
        console.error('Error al obtener las entregas', error);
      }
    );
  }

  filteredFacturas() {
    return this.facturas.filter(factura => {
      const matchesSearch = this.searchFactura 
        ? factura.nombre.toLowerCase().includes(this.searchFactura.toLowerCase()) 
        : true;
      
      const matchesArea = this.searchArea 
        ? factura.area_producto.toLowerCase() === this.searchArea.toLowerCase() 
        : true;
      
      const matchesEstado = this.searchEstado 
        ? factura.estado.toLowerCase() === this.searchEstado.toLowerCase() 
        : true;

      return matchesSearch && matchesArea && matchesEstado;
    });
  }

  paginatedFacturas() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredFacturas().slice(startIndex, startIndex + this.itemsPerPage);
  }

  changePage(page: number) {
    this.currentPage = page;
  }

  redirectAndMarkOrders(): void {
    this.notificationService.resetInvoicesCount();
    this.redirectToNuevaOrden();
  }

  redirectToNuevaOrden() {
    this.router.navigate(['/admin/facturas']);
  }

  markOrdersAsSeen(): void {
    this.notificationService.resetInvoicesCount(); 
  }

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
    return traducciones[estado] || estado; 
  }

  get totalPages(): number {
    return Math.ceil(this.filteredFacturas().length / this.itemsPerPage);
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

}
