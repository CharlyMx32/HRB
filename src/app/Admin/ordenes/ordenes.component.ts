import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-ordenes',
  imports: [CommonModule, FormsModule],
  templateUrl: './ordenes.component.html',
  styleUrls: ['./ordenes.component.css']
})
export class OrdenesComponent {
  facturas = [
    { nombre: 'Orden #1234', fecha_emision: 'Mar 2, 2025', area_producto: 'Electrónica', productos: ['Sensores', 'Huella'], estado: 'Pendiente', transportista: 'DHL', fecha_entrega: 'Mar 5, 2025' },
    { nombre: 'Orden #1235', fecha_emision: 'Mar 1, 2025', area_producto: 'Cables', productos: ['Cable de red'], estado: 'Pagado', transportista: 'UPS', fecha_entrega: 'Mar 3, 2025' },
    { nombre: 'Orden #1236', fecha_emision: 'Feb 28, 2025', area_producto: 'Cables', productos: ['Cable inalámbrico', 'Cobre'], estado: 'Cancelado', transportista: 'FedEx', fecha_entrega: 'Mar 2, 2025' },
  ];

  searchFactura: string = '';
  searchArea: string = '';
  searchEstado: string = '';

  constructor(private router: Router) {}

  // Filtrar las facturas con base en los filtros aplicados
  filteredFacturas() {
    return this.facturas.filter(factura => {
      return (
        (this.searchFactura ? factura.nombre.toLowerCase().includes(this.searchFactura.toLowerCase()) : true) &&
        (this.searchArea ? factura.area_producto.toLowerCase() === this.searchArea.toLowerCase() : true) &&
        (this.searchEstado ? factura.estado.toLowerCase() === this.searchEstado.toLowerCase() : true)
      );
    });
  }

  // Redirigir al usuario cuando hace clic en el botón "+ Nueva Orden"
  redirectToNuevaOrden() {
    this.router.navigate(['/admin/facturas']);  // Asegúrate de que la ruta '/nueva-orden' esté configurada en tu RouterModule
  }

  getEstadoColor(estado: string): string {
    switch (estado) {
      case 'Pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'Pagado': return 'bg-green-100 text-green-800';
      case 'Cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
}
