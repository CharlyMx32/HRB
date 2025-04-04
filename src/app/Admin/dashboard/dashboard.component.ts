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
import { SensoresService } from '../../services/sensores.service';


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


  currentDate = new Date();
  daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  weeks: Date[][] = [];
  lightCheckInterval = 5000;

  thCheckInterval = 5000;
  thConnectionError = false;
  isCheckingTHStatus = false;


  eventosAuditoria = [
    { accion: 'Acceso RFID A47881', hora: '2:03 PM', detalle: 'Operario #1' },
    { accion: 'Detección PIR', hora: '2:03 PM', detalle: 'Zona Alberta' },
    { accion: 'Producto pesado', hora: '1:45 PM', detalle: 'Cajas electrónicas' }
  ];

  checkLightStatus() {
    this.sensoresService.getLastLightStatus().subscribe(
      (data) => {
        const newStatus = data.status === 'on';
        if (newStatus !== this.luzEncendida) {
          this.luzEncendida = newStatus;
          this.ultimoCambioEstado = new Date().toLocaleTimeString();
        }
      },
      (error) => {
        console.error('Error al obtener el estado del sensor de luz:', error);
      }
    );
  }

  puertaAbierta = false;
  luzEncendida = false;
  pirStatus = 'Inactivo';
  lastDetection = '--';
  temperatura = 0;
  humedad = 0;
  ultimoCambioEstado = 'Hoy 09:15 AM';

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
    private dialog: MatDialog,
    private sensoresService: SensoresService
  ) { }

  ngOnInit() {
    this.actualizarDatosAmbiente();
    this.actualizarEstadoLuz();
    this.actualizarEstadoPir(); 
    this.generateCalendar();

    this.actualizarEstadoLuz();
    this.actualizarDatosAmbiente();

    setInterval(() => {
      this.actualizarEstadoLuz();
    }, this.lightCheckInterval);

    setInterval(() => {
      this.actualizarDatosAmbiente();
    }, this.thCheckInterval);

    setInterval(() => {
      this.pirStatus = Math.random() > 0.8 ? '¡Detección!' : 'Inactivo';
      if (this.pirStatus === '¡Detección!') {
        this.lastDetection = new Date().toLocaleTimeString();
        this.agregarEventoAuditoria('Detección PIR', this.lastDetection, 'Zona Alberta');
      }

      if (Math.random() > 0.9) {
        this.puertaAbierta = !this.puertaAbierta;
        this.ultimoCambioEstado = new Date().toLocaleTimeString();
        this.agregarEventoAuditoria('Cambio estado puerta', this.ultimoCambioEstado,
          this.puertaAbierta ? 'Abierta' : 'Cerrada');
      }

    }, 3000);
  }

  agregarEventoAuditoria(accion: string, hora: string, detalle: string) {
    this.eventosAuditoria.unshift({ accion, hora, detalle });
    if (this.eventosAuditoria.length > 5) {
      this.eventosAuditoria.pop();
    }
  }
  formatLastChangeTime(date: Date): string {
    const hoy = new Date();
    if (date.getDate() === hoy.getDate() &&
      date.getMonth() === hoy.getMonth() &&
      date.getFullYear() === hoy.getFullYear()) {
      return 'Hoy ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  }



  actualizarEstadoLuz() {
    this.sensoresService.getLastLightStatus().subscribe(
      (data) => {
        const nuevoEstado = data.status === 'on';
        const fechaEvento = new Date(data.event_date);

        if (nuevoEstado !== this.luzEncendida) {
          this.luzEncendida = nuevoEstado;
          this.ultimoCambioEstado = this.formatLastChangeTime(fechaEvento);
          this.agregarEventoAuditoria(
            'Cambio estado luz',
            fechaEvento.toLocaleTimeString(),
            this.luzEncendida ? 'Encendida' : 'Apagada'
          );
        }
      },
      (error) => {
        console.error('Error obteniendo datos del sensor de luz:', error);
      }
    );
  }
  
  actualizarDatosAmbiente() {
    this.isCheckingTHStatus = true;
    this.sensoresService.getLastTHSensorData().subscribe(
      (data) => {
        this.thConnectionError = false;
        const fechaEvento = new Date(data.event_date);
        if (Math.abs(data.temperature_c - this.temperatura) > 0.5) {
          this.temperatura = data.temperature_c;
          changed = true;
          this.agregarEventoAuditoria(
            'Cambio temperatura',
            fechaEvento.toLocaleTimeString(),
            `Nueva temperatura: ${data.temperature_c}°C`
          );
        }

        if (Math.abs(data.humidity_percent - this.humedad) > 1) {
          this.humedad = data.humidity_percent;
          changed = true;
          this.agregarEventoAuditoria(
            'Cambio humedad',
            fechaEvento.toLocaleTimeString(),
            `Nueva humedad: ${data.humidity_percent}%`
          );
        }

        if (data.alert_triggered) {
          this.agregarEventoAuditoria(
            'Alerta sensor',
            fechaEvento.toLocaleTimeString(),
            data.alert_message
          );
        }

        this.isCheckingTHStatus = false;
      },
      (error) => {
        this.thConnectionError = true;
        this.isCheckingTHStatus = false;
        console.error('Error obteniendo datos de humedad/temperatura:', error);
      }
    );
  }

  generateCalendar() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startDay = firstDay.getDay();
    const endDay = lastDay.getDate();

    this.weeks = [];
    let week: Date[] = [];

    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      week.push(new Date(year, month - 1, prevMonthLastDay - i));
    }

    for (let day = 1; day <= endDay; day++) {
      week.push(new Date(year, month, day));
      if (week.length === 7) {
        this.weeks.push(week);
        week = [];
      }
    }

    if (week.length > 0) {
      const nextMonthDays = 7 - week.length;
      for (let i = 1; i <= nextMonthDays; i++) {
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
  }

  nextMonth() {
    this.currentDate = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth() + 1,
      1
    );
  }

  hasEvents(day: Date): boolean {
    // AQUI METEREMOS LAS FACTURAS REALES
    return day.getDate() % 5 === 0; // Solo para demostración
  }

  addEvent(day: Date) {
    console.log('Día seleccionado:', day);
    this.agregarEventoAuditoria('Evento calendario', new Date().toLocaleTimeString(),
      `Día ${day.getDate()} seleccionado`);
  }

  openFullCalendar() {
    this.dialog.open(FullCalendarModalComponent, {
      panelClass: 'full-calendar-modal',
      width: '10vw',
      height: '10vh',
      data: { currentDate: this.currentDate }
    });
  }

  actualizarCalendario() {
    this.facturasService.loadInitialFacturas();
  }
}