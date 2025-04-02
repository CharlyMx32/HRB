import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FullCalendarModalComponent } from '../../components/full-calendar-modal/full-calendar-modal.component';
import { FacturasService } from '../../services/facturas.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTooltipModule,
    MatDialogModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  // Estado del calendario
  currentDate = new Date();
  daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  weeks: Date[][] = [];

  // Datos de auditoría
  eventosAuditoria = [
    { accion: 'Acceso RFID A47881', hora: '2:03 PM', detalle: 'Operario #1' },
    { accion: 'Detección PIR', hora: '2:03 PM', detalle: 'Zona Alberta' },
    { accion: 'Producto pesado', hora: '1:45 PM', detalle: 'Cajas electrónicas' }
  ];

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

  constructor(
    private facturasService: FacturasService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.generateCalendar();
    
    // Simular cambios de estado
    setInterval(() => {
      // Simular detección PIR aleatoria
      this.pirStatus = Math.random() > 0.8 ? '¡Detección!' : 'Inactivo';
      if (this.pirStatus === '¡Detección!') {
        this.lastDetection = new Date().toLocaleTimeString();
        this.agregarEventoAuditoria('Detección PIR', this.lastDetection, 'Zona Alberta');
      }

      // Simular cambios puerta/luz
      if (Math.random() > 0.9) {
        this.puertaAbierta = !this.puertaAbierta;
        this.ultimoCambioEstado = new Date().toLocaleTimeString();
        this.agregarEventoAuditoria('Cambio estado puerta', this.ultimoCambioEstado, 
          this.puertaAbierta ? 'Abierta' : 'Cerrada');
      }
      if (Math.random() > 0.9) {
        this.luzEncendida = !this.luzEncendida;
        this.ultimoCambioEstado = new Date().toLocaleTimeString();
        this.agregarEventoAuditoria('Cambio estado luz', this.ultimoCambioEstado, 
          this.luzEncendida ? 'Encendida' : 'Apagada');
      }
    }, 3000);
  }

  agregarEventoAuditoria(accion: string, hora: string, detalle: string) {
    this.eventosAuditoria.unshift({ accion, hora, detalle });
    if (this.eventosAuditoria.length > 5) {
      this.eventosAuditoria.pop();
    }
  }

  // Métodos del calendario
  generateCalendar() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const startDay = firstDay.getDay();
    const endDay = lastDay.getDate();
    
    this.weeks = [];
    let week: Date[] = [];
    
    // Días del mes anterior
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for(let i = startDay - 1; i >= 0; i--) {
      week.push(new Date(year, month - 1, prevMonthLastDay - i));
    }
    
    // Días del mes actual
    for(let day = 1; day <= endDay; day++) {
      week.push(new Date(year, month, day));
      if(week.length === 7) {
        this.weeks.push(week);
        week = [];
      }
    }
    
    // Días del siguiente mes
    if(week.length > 0) {
      const nextMonthDays = 7 - week.length;
      for(let i = 1; i <= nextMonthDays; i++) {
        week.push(new Date(year, month + 1, i));
      }
      this.weeks.push(week);
    }
  }

  prevMonth() {
    this.currentDate = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth() - 1,
      1
    );
    this.generateCalendar();
  }

  nextMonth() {
    this.currentDate = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth() + 1,
      1
    );
    this.generateCalendar();
  }

  hasEvents(day: Date): boolean {
    // AQUI METEREMOS LAS FACTURAS REALES
    // Ejemplo: días 5, 15 y 25 tienen eventos
    return day.getDate() % 5 === 0; // Solo para demostración
  }

  addEvent(day: Date) {
    // Lógica para manejar clics en días
    console.log('Día seleccionado:', day);
    this.agregarEventoAuditoria('Evento calendario', new Date().toLocaleTimeString(), 
      `Día ${day.getDate()} seleccionado`);
  }

  openFullCalendar() {
    this.dialog.open(FullCalendarModalComponent, {
      width: '10vw',
      maxWidth: '1200px',
      height: '10vh',
      panelClass: 'full-calendar-modal',
      data: { currentDate: this.currentDate }
    });
  }

  actualizarCalendario() {
    this.facturasService.loadInitialFacturas();
  }
}