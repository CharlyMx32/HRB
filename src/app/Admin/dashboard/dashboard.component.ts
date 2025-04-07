import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FullCalendarModalComponent } from '../../components/full-calendar-modal/full-calendar-modal.component';
import { FacturasService } from '../../services/facturas.service';
import { WorkersService } from '../../services/workers.service';
import { SensoresService } from '../../services/sensores.service';
import { Subscription } from 'rxjs';

interface Employee {
  activate: number;
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
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  // Estado del calendario
  currentDate = new Date();
  daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  weeks: Date[][] = [];

  weightDataList: any[] = [];
  errorMessage: string = ''; // Para manejar errores si ocurren

  // Nuevas propiedades para empleados
  employeeCount: number = 0;
  activeEmployees: number = 0;
  lastUpdated: string = '';
  loadingEmployees: boolean = false;
  errorLoadingEmployees: boolean = false;

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
    private workersService: WorkersService
  ) { }

  ngOnInit() {
    this.loadInitialData();
    this.setupRealTimeUpdates();
    this.loadEmployeeCount();
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

    this.sensoresService.getWeightSensorData().subscribe({
      next: (res) => {
        if (res.success && res.data.length > 0) {
          this.weightDataList = res.data.slice(-5).reverse(); // `.reverse()` para mostrar el más reciente arriba
        } else {
          this.weightDataList = [];
        }
      },
      error: (err) => {
        console.error('Error al obtener datos del sensor:', err);
        this.weightDataList = [];
      }
    });
  }

  private setupRealTimeUpdates() {
    // Configuración de listeners para actualizaciones en tiempo real
    this.sensorSubscriptions.add(
      this.sensoresService.lightSensorUpdates$.subscribe({
        next: (data) => data && this.handleLightUpdate(data),
        error: (err) => console.error('Error in light sensor WS:', err)
      })
    );

    this.sensorSubscriptions.add(
      this.sensoresService.pirSensorUpdates$.subscribe({
        next: (data) => data && this.handlePirUpdate(data),
        error: (err) => console.error('Error in PIR sensor WS:', err)
      })
    );

    this.sensorSubscriptions.add(
      this.sensoresService.thSensorUpdates$.subscribe({
        next: (data) => data && this.handleThUpdate(data),
        error: (err) => console.error('Error in TH sensor WS:', err)
      })
    );

    this.sensorSubscriptions.add(
      this.sensoresService.weightSensorUpdates$.subscribe({
        next: (data) => data && this.handleWeightUpdate(data),
        error: (err) => console.error('Error in weight sensor WS:', err)
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
    }
  }

  private handlePirUpdate(data: any) {
    if (!data) return;

    const fechaEvento = new Date(data.event_date);
    const nuevoEstado = data.motion_detected ? '¡Detección!' : 'Inactivo';

    if (nuevoEstado !== this.pirStatus) {
      this.pirStatus = nuevoEstado;
      this.showPirChangeIndicator = true;

      if (data.motion_detected) {
        this.lastDetection = this.formatLastChangeTime(fechaEvento);
        const alertMsg = data.alert_triggered ? ` (${data.alert_message})` : '';
        this.agregarEventoAuditoria(
          'Detección PIR',
          fechaEvento.toLocaleTimeString(),
          'Zona Alberta' + alertMsg
        );
      }
    }
  }

  private handleThUpdate(data: any) {
    if (!data) return;

    const fechaEvento = new Date(data.event_date);
    let changed = false;

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

    if (changed) {
      this.showEnvChangeIndicator = true;
    }
  }

  private handleWeightUpdate(data: any) {
    if (!data) return;
  
    const fechaEvento = new Date(data.event_date);
  
    // Insertar el nuevo dato al principio de la lista
    this.weightDataList.unshift(data);
  
    // Limitar la lista a los 5 últimos registros
    if (this.weightDataList.length > 5) {
      this.weightDataList = this.weightDataList.slice(0, 5);
    }
  
    this.agregarEventoAuditoria(
      'Producto pesado',
      fechaEvento.toLocaleTimeString(),
      data.descripcion || 'Producto detectado'
    );
  }
loadEmployeeCount(): void {
  this.loadingEmployees = true;
  this.errorLoadingEmployees = false;
  
  this.workersService.getEmployees().subscribe({
    next: (response) => {
      console.log('Respuesta completa:', response); // Para depuración
      
      if (response && response.data && Array.isArray(response.data)) {
        this.employeeCount = response.data.length;
        this.activeEmployees = response.data.filter((emp: Employee) => emp.activate === 1).length;
        this.lastUpdated = this.formatLastUpdatedTime(new Date());
        
        console.log('Empleados encontrados:', this.employeeCount); // Para depuración
        console.log('Empleados activos:', this.activeEmployees); // Para depuración
      } else {
        console.warn('La respuesta no tiene el formato esperado:', response);
        this.employeeCount = 0;
        this.activeEmployees = 0;
      }
      this.loadingEmployees = false;
    },
    error: (err) => {
      console.error('Error al cargar empleados:', err);
      this.errorLoadingEmployees = true;
      this.loadingEmployees = false;
      this.employeeCount = 0;
      this.activeEmployees = 0;
    }
  });
}

  // Método para refrescar el conteo
  refreshEmployeeCount(): void {
    this.loadEmployeeCount();
  }

  // Formatear la hora de actualización
  private formatLastUpdatedTime(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  obtenerDatosSensor(): void {
    this.sensoresService.getWeightSensorData().subscribe({
      next: (res) => {
        if (res.success && res.data.length > 0) {
          // Mostrar los últimos 5 (puedes ajustar el número si cambian los requerimientos)
          this.weightDataList = res.data.slice(-5).reverse(); // `.reverse()` para mostrar el más reciente arriba
        } else {
          this.weightDataList = [];
        }
      },
      error: (err) => {
        console.error('Error al obtener datos del sensor:', err);
        this.weightDataList = [];
      }
    });
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
      return 'Hoy ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
    for (let i = startDay - 1; i >= 0; i--) {
      week.push(new Date(year, month - 1, prevMonthLastDay - i));
    }

    // Días del mes actual
    for (let day = 1; day <= endDay; day++) {
      week.push(new Date(year, month, day));
      if (week.length === 7) {
        this.weeks.push(week);
        week = [];
      }
    }

    // Días del siguiente mes
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