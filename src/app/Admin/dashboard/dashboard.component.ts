import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
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
import { Subscription } from 'rxjs';

interface ThSensorData {
  temperature_c: number;
  humidity_percent: number;
  event_date: string;
}
interface PirSensorData {
  motion_detected: boolean;
  event_date: string;
  alert_message?: string;
  alert_triggered?: boolean;
  area_id?: string;
  area_name?: string;
  _id?: string;
}

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
  styleUrls: ['./dashboard.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit, OnDestroy {
  // Estado del calendario
  currentDate = new Date();
  daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  weeks: Date[][] = [];

  weightDataList: any[] = [];
  errorMessage: string = ''; // Para manejar errores si ocurren
  
  // Estado sensores
  luzEncendida = false;
  pirStatus = 'Inactivo';
  lastDetection = '--';
  temperatura = 0;
  humedad = 0;
  ultimoCambioEstado = 'Hoy 09:15 AM';

  // Indicadores de cambio
  showLightChangeIndicator = false;
  showEnvChangeIndicator = false;
  showPirChangeIndicator = false;

  // Datos de auditoría
  eventosAuditoria = [
    { accion: 'Acceso RFID A47881', hora: '2:03 PM', detalle: 'Operario #1' },
    { accion: 'Detección PIR', hora: '2:03 PM', detalle: 'Zona Alberta' },
    { accion: 'Producto pesado', hora: '1:45 PM', detalle: 'Cajas electrónicas' }
  ];

  // Datos para las tablas
  ultimosAccesos = [
    { nombre: 'Operario #1', hora: '10:45 AM', tipo: 'RFID: A3F2B1' },
    { nombre: 'Proveedor', hora: '09:30 AM', tipo: 'Tarjeta' },
    { nombre: 'Transportista', hora: 'Ayer 5:30 PM', tipo: 'RFID: 7B2C9D' },
  ];

  private sensorSubscriptions: Subscription = new Subscription();

  constructor(
    private facturasService: FacturasService,
    private dialog: MatDialog,
    private sensoresService: SensoresService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadInitialData();
    this.setupRealTimeUpdates();
    this.generateCalendar();
  }

  ngOnDestroy() {
    this.sensorSubscriptions.unsubscribe();
  }

  private loadInitialData() {
    // Carga inicial de datos
    this.sensorSubscriptions.add(
      this.sensoresService.getLastLightStatus().subscribe({
        next: (data) => this.handleLightUpdate(data),
        error: (err) => console.error('Error loading light sensor:', err)
      })
    );

    this.sensorSubscriptions.add(
      this.sensoresService.getLastPirSensorData().subscribe({
        next: (data) => this.handlePirUpdate(data),
        error: (err) => console.error('Error loading PIR sensor:', err)
      })
    );

    this.sensorSubscriptions.add(
      this.sensoresService.getLastTHSensorData().subscribe({
        next: (data) => this.handleThUpdate(data),
        error: (err) => console.error('Error loading TH sensor:', err)
      })
    );
  }

  private setupRealTimeUpdates() {
    this.sensorSubscriptions.add(
      this.sensoresService.thSensorUpdates$.subscribe({
        next: (data) => {
          console.log('TH Sensor update received:', data);
          if (data) {
            this.handleThUpdate(data);
          }
        },
        error: (err) => console.error('Error in TH sensor WS:', err)
      })
    );
    this.sensorSubscriptions.add(
      this.sensoresService.lightSensorUpdates$.subscribe({
        next: (data) => data && this.handleLightUpdate(data),
        error: (err) => console.error('Error in light sensor WS:', err)
      })
    );

    this.sensorSubscriptions.add(
      this.sensoresService.pirSensorUpdates$.subscribe({
        next: (data) => {
          console.log('PIR Sensor update received:', data);
          if (data) {
            this.handlePirUpdate(data);
          }
        },
        error: (err) => console.error('Error in PIR sensor WS:', err)
      })
    );


  }

  private handleLightUpdate(data: any) {
    if (!data) return;
    
    const nuevoEstado = data.status === 'on';
    const fechaEvento = new Date(data.event_date);
    
    if (nuevoEstado !== this.luzEncendida) {
      this.luzEncendida = nuevoEstado;
      this.ultimoCambioEstado = this.formatLastChangeTime(fechaEvento);
      this.showLightChangeIndicator = true;
      
      this.agregarEventoAuditoria(
        'Cambio estado luz', 
        fechaEvento.toLocaleTimeString(), 
        this.luzEncendida ? 'Encendida' : 'Apagada'
      );
      
      // Notifica a Angular que debe verificar los cambios
      this.cdr.markForCheck();
    }
  }
  
  private handlePirUpdate(data: PirSensorData) {
    if (!data) return;
    
    const fechaEvento = new Date(data.event_date);
    const nuevoEstado = data.motion_detected ? '¡Detección!' : 'Inactivo';
    
    if (nuevoEstado !== this.pirStatus) {
      this.pirStatus = nuevoEstado;
      this.showPirChangeIndicator = true;
      
      if (data.motion_detected) {
        this.lastDetection = this.formatLastChangeTime(fechaEvento);
        const alertMsg = data.alert_triggered ? ` (${data.alert_message})` : '';
        const areaName = data.area_name || 'Zona desconocida';
        
        this.agregarEventoAuditoria(
          'Detección PIR', 
          fechaEvento.toLocaleTimeString(), 
          `${areaName}${alertMsg}`
        );
      }
      
      this.cdr.markForCheck();
    }
  }
  
  private handleThUpdate(data: ThSensorData) {
    if (!data) return;
    
    const fechaEvento = new Date(data.event_date);
    let changed = false;
    
    // Usamos Number() para asegurarnos que son números
    const nuevaTemp = Number(data.temperature_c);
    const nuevaHum = Number(data.humidity_percent);
    
    if (Math.abs(nuevaTemp - this.temperatura) > 0.5) {
      this.temperatura = nuevaTemp;
      changed = true;
      this.agregarEventoAuditoria(
        'Cambio temperatura', 
        fechaEvento.toLocaleTimeString(), 
        `Nueva temperatura: ${nuevaTemp}°C`
      );
    }
    
    if (Math.abs(nuevaHum - this.humedad) > 1) {
      this.humedad = nuevaHum;
      changed = true;
      this.agregarEventoAuditoria(
        'Cambio humedad', 
        fechaEvento.toLocaleTimeString(), 
        `Nueva humedad: ${nuevaHum}%`
      );
    }
    
    if (changed) {
      this.showEnvChangeIndicator = true;
      // Notificamos a Angular que debe actualizar la vista
      this.cdr.markForCheck();
    }
  }
  // Métodos para manejar los clics en las tarjetas
  onLightCardClick() {
    this.showLightChangeIndicator = false;
  }

  onEnvCardClick() {
    this.showEnvChangeIndicator = false;
  }

  onPirCardClick() {
    this.showPirChangeIndicator = false;
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
      return 'Hoy ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    } else {
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }
  }

  // Métodos del calendario (se mantienen igual)
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
    return day.getDate() % 5 === 0;
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