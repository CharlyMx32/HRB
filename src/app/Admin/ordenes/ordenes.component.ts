import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-ordenes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ordenes.component.html',
  styleUrls: ['./ordenes.component.css']
})
export class OrdenesComponent {
  // Iconos
  // Datos de ejemplo
  facturas = [
    { 
      nombre: 'ORD-2023-1234', 
      fecha_emision: '02/03/2025', 
      area_producto: 'Electrónica', 
      productos: ['Sensores RFID', 'Lectores de huella'], 
      estado: 'Pendiente', 
      transportista: 'DHL Express', 
      fecha_entrega: '05/03/2025' 
    },
    { 
      nombre: 'ORD-2023-1235', 
      fecha_emision: '01/03/2025', 
      area_producto: 'Cables', 
      productos: ['Cable de red CAT6'], 
      estado: 'Pagado', 
      transportista: 'UPS', 
      fecha_entrega: '03/03/2025' 
    },
    { 
      nombre: 'ORD-2023-1236', 
      fecha_emision: '28/02/2025', 
      area_producto: 'Cables', 
      productos: ['Cable inalámbrico', 'Cable de cobre'], 
      estado: 'Cancelado', 
      transportista: 'FedEx', 
      fecha_entrega: '02/03/2025' 
    },
    { 
      nombre: 'ORD-2023-1237', 
      fecha_emision: '27/02/2025', 
      area_producto: 'Electrónica', 
      productos: ['Placas Arduino', 'Sensores'], 
      estado: 'Pagado', 
      transportista: 'Estafeta', 
      fecha_entrega: '01/03/2025' 
    },
    { 
      nombre: 'ORD-2023-1238', 
      fecha_emision: '26/02/2025', 
      area_producto: 'Componentes', 
      productos: ['Resistencias', 'Capacitores'], 
      estado: 'Pendiente', 
      transportista: 'DHL', 
      fecha_entrega: '28/02/2025' 
    }
  ];

  // Filtros
  searchFactura: string = '';
  searchArea: string = '';
  searchEstado: string = '';
  
  // Paginación
  currentPage: number = 1;
  itemsPerPage: number = 5;

  constructor(private router: Router) {}

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
      case 'Pendiente': 
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'Pagado': 
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'Cancelado': 
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: 
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  }

  // Iconos para los estados

  // Total de páginas
  get totalPages(): number {
    return Math.ceil(this.filteredFacturas().length / this.itemsPerPage);
  }

  // Números de página para la paginación
  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
}