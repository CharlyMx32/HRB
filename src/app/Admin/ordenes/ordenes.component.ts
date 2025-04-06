import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { startWith } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FacturasComponent } from '../facturas/facturas.component';
import { DeliveriesService } from '../../services/deliveries.service';
import { NotificationService } from '../../services/notification.service'; 

@Component({
  selector: 'app-ordenes',
  standalone: true,
  imports: [CommonModule, FormsModule, FacturasComponent],
  templateUrl: './ordenes.component.html',
  styleUrls: ['./ordenes.component.css']
})
export class OrdenesComponent implements OnInit, OnDestroy {
  facturas: any[] = [];
  private pollingSubscription!: Subscription;
  private readonly POLLING_INTERVAL = 15000;

  searchFactura: string = '';
  private _searchArea: string = '';
  private _searchEstado: string = '';
  
  currentPage: number = 1;
  itemsPerPage: number = 5;

  newInvoicesCount: number = 0;
  showFacturasModal: boolean = false;

  constructor(
    private router: Router, 
    private deliveriesService: DeliveriesService, 
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadFacturas();
    this.notificationService.resetInvoicesCount();
    this.startPolling();
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  // Getters y setters para los filtros
  get searchArea(): string {
    return this._searchArea;
  }

  set searchArea(value: string) {
    this._searchArea = value;
    this.resetToFirstPage();
  }

  get searchEstado(): string {
    return this._searchEstado;
  }

  set searchEstado(value: string) {
    this._searchEstado = value;
    this.resetToFirstPage();
  }

  private resetToFirstPage(): void {
    this.currentPage = 1;
  }

  private startPolling(): void {
    this.pollingSubscription = interval(this.POLLING_INTERVAL)
      .pipe(startWith(0))
      .subscribe(() => this.loadFacturas());
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
          nombre: `${delivery.invoice_id}`,
          fecha_entrega: delivery.delivery_date,
          productos: delivery.products.split(', '),
          trabajador_asignado: delivery.worker_name,
          transportista: delivery.carrier,
          estado: delivery.status,
        }));
        
        const pendientes = this.facturas.filter(f => f.estado === 'Pending').length;
        this.notificationService.updateInvoicesCount(pendientes);
      },
      (error) => console.error('Error al obtener las entregas', error)
    );
  }

  get facturasFiltradas(): any[] {
    let filtradas = this.facturas;
    
    // Filtro por nombre de factura
    if (this.searchFactura) {
      filtradas = filtradas.filter(f => 
        f.nombre.toLowerCase().includes(this.searchFactura.toLowerCase())
      );
    }
    
    // Filtro por área (case insensitive)
    if (this.searchArea) {
      filtradas = filtradas.filter(f => 
        f.productos.some((p: string) => 
          p.toLowerCase().includes(this.searchArea.toLowerCase())
        )
      );
    }
    
    // Filtro por estado
    if (this.searchEstado) {
      filtradas = filtradas.filter(f => f.estado === this.searchEstado);
    }
    
    return filtradas;
  }

  get facturasPaginadas(): any[] {
    // Ajustar página actual si es necesario
    if (this.currentPage > this.totalPaginas && this.totalPaginas > 0) {
      this.currentPage = this.totalPaginas;
    } else if (this.currentPage < 1 && this.totalPaginas > 0) {
      this.currentPage = 1;
    }
    
    const inicio = (this.currentPage - 1) * this.itemsPerPage;
    const fin = inicio + this.itemsPerPage;
    return this.facturasFiltradas.slice(inicio, fin);
  }
  
  get totalPaginas(): number {
    return Math.ceil(this.facturasFiltradas.length / this.itemsPerPage);
  }

  // Métodos de navegación
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

  // Métodos del modal
  openFacturasModal() {
    this.showFacturasModal = true;
    this.notificationService.resetInvoicesCount();
  }
  
  closeFacturasModal() {
    this.showFacturasModal = false;
    this.loadFacturas();
  }

  // Métodos de ayuda para la vista
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
}