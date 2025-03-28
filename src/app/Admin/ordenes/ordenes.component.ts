import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DeliveriesService } from '../../services/deliveries.service';

@Component({
  selector: 'app-ordenes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ordenes.component.html',
  styleUrls: ['./ordenes.component.css']
})
export class OrdenesComponent implements OnInit {
  // Datos que serán cargados desde el backend
  facturas: any[] = [];

  // Filtros
  searchFactura: string = '';
  searchArea: string = '';
  searchEstado: string = '';
  
  // Paginación
  currentPage: number = 1;
  itemsPerPage: number = 5;

  constructor(private router: Router, private deliveriesService: DeliveriesService) {}

  ngOnInit() {
    this.loadFacturas(); // Cargar las facturas al iniciar el componente
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
      },
      (error) => {
        console.error('Error al obtener las entregas', error);
      }
    );
  }

  // Filtrar facturas
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

  // Obtener facturas paginadas
  paginatedFacturas() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredFacturas().slice(startIndex, startIndex + this.itemsPerPage);
  }

  // Cambiar página
  changePage(page: number) {
    this.currentPage = page;
  }

  // Redirigir a nueva orden
  redirectToNuevaOrden() {
    this.router.navigate(['/admin/facturas']);
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

  // Total de páginas
  get totalPages(): number {
    return Math.ceil(this.filteredFacturas().length / this.itemsPerPage);
  }

  // Números de página para la paginación
  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
}
