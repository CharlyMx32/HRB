import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  standalone: true, // Asegúrate de que esté marcado como standalone
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent {
  // Propiedades para los filtros
  searchProducto: string = '';
  searchAreaStock: string = '';
  searchFactura: string = '';
  searchEstadoFactura: string = '';

  // Datos de ejemplo para Stock
  stock = [
    { nombre: 'Resistencia 10kΩ', stock: 150, area: 'Electrónica', ultima_actualizacion: '2023-10-01' },
    { nombre: 'Cable USB', stock: 200, area: 'Cables', ultima_actualizacion: '2023-10-02' },
    { nombre: 'LED Rojo', stock: 500, area: 'Electrónica', ultima_actualizacion: '2023-10-03' },
    { nombre: 'Conector HDMI', stock: 75, area: 'Cables', ultima_actualizacion: '2023-10-04' },
  ];

  // Datos de ejemplo para Facturas
  facturas = [
    { numero: 1001, fecha: '2023-10-01', total: 150.75, estado: 'Completada' },
    { numero: 1002, fecha: '2023-10-02', total: 200.50, estado: 'Pendiente' },
    { numero: 1003, fecha: '2023-10-03', total: 300.00, estado: 'Completada' },
    { numero: 1004, fecha: '2023-10-04', total: 450.25, estado: 'Pendiente' },
  ];

  // Filtrado para Stock
  filteredStock() {
    return this.stock.filter((producto) => {
      const matchesProducto = producto.nombre.toLowerCase().includes(this.searchProducto.toLowerCase());
      const matchesArea = this.searchAreaStock ? producto.area === this.searchAreaStock : true;
      return matchesProducto && matchesArea;
    });
  }

  // Filtrado para Facturas
  filteredFacturas() {
    return this.facturas.filter((factura) => {
      const matchesFactura = factura.numero.toString().includes(this.searchFactura);
      const matchesEstado = this.searchEstadoFactura ? factura.estado === this.searchEstadoFactura : true;
      return matchesFactura && matchesEstado;
    });
  }
}