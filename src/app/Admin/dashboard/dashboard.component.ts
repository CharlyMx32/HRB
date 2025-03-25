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
  // Estado sensores
  puertaAbierta = false;
  luzEncendida = false;
  pirStatus = 'Inactivo';
  lastDetection = '--';
  temperatura = 24.5;
  humedad = 45;
  ultimoCambioEstado = 'Hoy 09:15 AM';

  // Datos para las tablas
  ultimosAccesos = [
    { nombre: 'Operario #1', hora: '10:45 AM', tipo: 'RFID: A3F2B1' },
    { nombre: 'Proveedor', hora: '09:30 AM', tipo: 'Tarjeta' },
    { nombre: 'Transportista', hora: 'Ayer 5:30 PM', tipo: 'RFID: 7B2C9D' },
  ];

  productosPesados = [
    { nombre: 'Cajas electrónicas', peso: 12.5, hora: '10:20 AM', destino: 'Almacén B' },
    { nombre: 'Componentes PC', peso: 8.2, hora: '09:45 AM', destino: 'Expedición' },
    { nombre: 'Cables USB', peso: 5.7, hora: 'Ayer 4:15 PM', destino: 'Taller' },
  ];

  eventosRecoleccion = [
    { fecha: '28 Oct', producto: 'Resistencias 10kΩ', cantidad: 150, prioridad: 'alta' },
    { fecha: '30 Oct', producto: 'LEDs RGB', cantidad: 300, prioridad: 'media' },
    { fecha: '02 Nov', producto: 'Conectores HDMI', cantidad: 75, prioridad: 'baja' },
  ];

  constructor() {
    // Simular cambios de estado
    setInterval(() => {
      // Simular detección PIR aleatoria
      this.pirStatus = Math.random() > 0.8 ? '¡Detección!' : 'Inactivo';
      if (this.pirStatus === '¡Detección!') {
        this.lastDetection = new Date().toLocaleTimeString();
      }

      // Simular cambios puerta/luz
      if (Math.random() > 0.9) {
        this.puertaAbierta = !this.puertaAbierta;
        this.ultimoCambioEstado = new Date().toLocaleTimeString();
      }
      if (Math.random() > 0.9) {
        this.luzEncendida = !this.luzEncendida;
        this.ultimoCambioEstado = new Date().toLocaleTimeString();
      }
    }, 3000);
  }
}