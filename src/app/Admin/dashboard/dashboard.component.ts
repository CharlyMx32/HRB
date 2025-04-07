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

interface EventoAuditoria {
  accion: string;
  hora: string;
  detalle: string;
  fechaCompleta?: Date;
}

interface RfidAccessFromAPI {
  nombre: string;
  puesto: string;
  area: string;
  rfid_code: string;
  fecha: string;
}

interface RfidAccess {
  card_id: string;
  user_name: string;
  access_granted: boolean;
  event_date: string;
  area_name: string;
  position?: string;
}

interface WeightSensorData {
  exit_code: string;
  weight_kg: number;
  status: number;
  area_id?: string;
  event_date: string;
  processed: boolean;
  action: string;
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
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  // Estado del calendario
  currentDate = new Date();
  daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  weeks: Date[][] = [];

  weightDataList: WeightSensorData[] = [];
  errorMessage: string = '';

  // Empleados
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
  showRfidChangeIndicator = false;

  // Datos de auditoría
  eventosAuditoria: EventoAuditoria[] = [];

  // Datos para las tablas
  ultimosAccesos: RfidAccess[] = [];
  loadingAccesses: boolean = false;

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
    this.loadRfidAccesses();
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
      next: (res: any) => {
        if (res.success && res.data.length > 0) {
          this.weightDataList = res.data.slice(-5).reverse();
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

  private transformRfidData(apiData: RfidAccessFromAPI): RfidAccess {
    return {
      card_id: apiData.rfid_code,
      user_name: apiData.nombre,
      access_granted: true,
      event_date: apiData.fecha,
      area_name: apiData.area,
      position: apiData.puesto
    };
  }

  private loadRfidAccesses() {
    this.loadingAccesses = true;
    this.sensorSubscriptions.add(
      this.sensoresService.getLockSensorData().subscribe({
        next: (data: any) => {
          if (data && data.length > 0) {
            this.ultimosAccesos = data.map((item: any) => 
              this.transformRfidData(item)
            ).slice(0, 3);
            
            // Forzar detección de cambios
            this.ultimosAccesos = [...this.ultimosAccesos];
            
            this.showRfidChangeIndicator = true;
            
            const lastAccess = this.ultimosAccesos[0];
            this.agregarEventoAuditoria(
              'Acceso RFID',
              lastAccess.event_date,
              `Acceso concedido a ${lastAccess.user_name || 'Usuario desconocido'} en el área ${lastAccess.area_name || 'Área desconocida'}`
            );
          }
          this.loadingAccesses = false;
        },
        error: (err) => {
          console.error('Error loading RFID accesses:', err);
          this.loadingAccesses = false;
        }
      })
    );
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

    this.sensorSubscriptions.add(
      this.sensoresService.rfidCodes$.subscribe({
        next: (data) => this.handleRfidAccessUpdate(data),
        error: (err) => console.error('Error en la actualización de accesos RFID:', err)
      })
    );
  }

  private handleRfidAccessUpdate(data: any) {
    try {
      if (!data) return;

      // Validar datos mínimos
      if (!data.rfid_code || !data.fecha) {
        console.warn('Datos RFID incompletos:', data);
        return;
      }

      const nuevoAcceso = this.transformRfidData(data);
      
      // Actualizar la lista manteniendo solo los 3 más recientes
      this.ultimosAccesos = [nuevoAcceso, ...this.ultimosAccesos.slice(0, 2)];

      this.showRfidChangeIndicator = true;

      this.agregarEventoAuditoria(
        'Acceso RFID',
        nuevoAcceso.event_date,
        `Acceso concedido a ${nuevoAcceso.user_name} en el área ${nuevoAcceso.area_name}`
      );
    } catch (error) {
      console.error('Error procesando acceso RFID:', error);
    }
  }

  private handleLightUpdate(data: any) {
    if (!data) return;

    const nuevoEstado = data.status === 'on';
    const fechaEvento = data.event_date;

    if (nuevoEstado !== this.luzEncendida) {
      this.luzEncendida = nuevoEstado;
      this.ultimoCambioEstado = this.formatLastChangeTime(fechaEvento);
      this.showLightChangeIndicator = true;

      this.agregarEventoAuditoria(
        'Cambio estado luz',
        fechaEvento,
        this.luzEncendida ? 'Encendida' : 'Apagada'
      );
    }
  }

  private handlePirUpdate(data: any) {
    if (!data) return;

    const fechaEvento = data.event_date;
    const nuevoEstado = data.motion_detected ? '¡Detección!' : 'Inactivo';

    if (nuevoEstado !== this.pirStatus) {
      this.pirStatus = nuevoEstado;
      this.showPirChangeIndicator = true;

      if (data.motion_detected) {
        this.lastDetection = this.formatLastChangeTime(fechaEvento);
        const alertMsg = data.alert_triggered ? ` (${data.alert_message})` : '';
        this.agregarEventoAuditoria(
          'Detección PIR',
          fechaEvento,
          'Zona Alberta' + alertMsg
        );
      }
    }
  }

  private handleThUpdate(data: any) {
    if (!data) return;

    const fechaEvento = data.event_date;
    let changed = false;

    if (Math.abs(data.temperature_c - this.temperatura) > 0.5) {
      this.temperatura = data.temperature_c;
      changed = true;
      this.agregarEventoAuditoria(
        'Cambio temperatura',
        fechaEvento,
        `Nueva temperatura: ${data.temperature_c}°C`
      );
    }

    if (Math.abs(data.humidity_percent - this.humedad) > 1) {
      this.humedad = data.humidity_percent;
      changed = true;
      this.agregarEventoAuditoria(
        'Cambio humedad',
        fechaEvento,
        `Nueva humedad: ${data.humidity_percent}%`
      );
    }

    if (changed) {
      this.showEnvChangeIndicator = true;
    }
  }

  private handleWeightUpdate(data: any) {
    if (!data) return;
  
    const fechaEvento = data.event_date;
  
    // Insertar el nuevo dato al principio de la lista
    this.weightDataList = [data, ...this.weightDataList.slice(0, 4)];
  
    this.agregarEventoAuditoria(
      'Producto pesado',
      fechaEvento,
      data.descripcion || 'Producto detectado'
    );
  }

  loadEmployeeCount(): void {
    this.loadingEmployees = true;
    this.errorLoadingEmployees = false;
    
    this.workersService.getEmployees().subscribe({
      next: (response) => {
        console.log('Respuesta completa:', response);
        
        if (response && response.data && Array.isArray(response.data)) {
          this.employeeCount = response.data.length;
          this.activeEmployees = response.data.filter((emp: Employee) => emp.activate === 1).length;
          this.lastUpdated = this.formatLastUpdatedTime(new Date());
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

  refreshEmployeeCount(): void {
    this.loadEmployeeCount();
  }

  private formatLastUpdatedTime(date: Date): string {
    return this.formatTime(date.toISOString());
  }

  obtenerDatosSensor(): void {
    this.sensoresService.getWeightSensorData().subscribe({
      next: (res: any) => {
        if (res.success && res.data.length > 0) {
          this.weightDataList = res.data.slice(-5).reverse();
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

  onLightCardClick() {
    this.showLightChangeIndicator = false;
  }

  onEnvCardClick() {
    this.showEnvChangeIndicator = false;
  }

  onPirCardClick() {
    this.showPirChangeIndicator = false;
  }

  onRfidCardClick() {
    this.showRfidChangeIndicator = false;
  }

  agregarEventoAuditoria(accion: string, fechaString: string, detalle: string) {
    const fecha = new Date(fechaString);
    const horaFormateada = this.formatTime(fechaString);
    
    this.eventosAuditoria = [
      { 
        accion, 
        hora: horaFormateada, 
        detalle,
        fechaCompleta: fecha
      },
      ...this.eventosAuditoria.slice(0, 4)
    ];
  }

  private formatTime(dateString: string): string {
    if (!dateString) return '--:--';
    
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      console.warn('Fecha inválida para formatTime:', dateString);
      return '--:--';
    }
    
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'America/Mexico_City'
    };
    return date.toLocaleTimeString('es-MX', timeOptions);
  }

  private formatLastChangeTime(dateString: string): string {
    if (!dateString) return 'Fecha desconocida';
    
    // Intentar parsear la fecha en diferentes formatos
    let date: Date;
    
    // Formato ISO (2025-04-07 04:56:50)
    if (dateString.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)) {
      date = new Date(dateString.replace(' ', 'T') + 'Z');
    } 
    // Otros formatos pueden agregarse aquí
    else {
      date = new Date(dateString);
    }
    
    // Verificar si la fecha es válida
    if (isNaN(date.getTime())) {
      console.warn('Fecha inválida:', dateString);
      return 'Fecha inválida';
    }

    const hoy = new Date();
    const timeString = this.formatTime(date.toISOString());

    if (date.toDateString() === hoy.toDateString()) {
      return `Hoy ${timeString}`;
    } else if (date.getDate() === hoy.getDate() - 1 && 
              date.getMonth() === hoy.getMonth() && 
              date.getFullYear() === hoy.getFullYear()) {
      return `Ayer ${timeString}`;
    } else {
      const fechaFormateada = date.toLocaleDateString('es-MX', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      return `${fechaFormateada} ${timeString}`;
    }
  }

  formatAccessDate(dateString: string): string {
    return this.formatLastChangeTime(dateString);
  }

  getAccessStatus(access: RfidAccess): string {
    return access.access_granted ? 'Concedido' : 'Denegado';
  }

  getAccessType(access: RfidAccess): string {
    return access.card_id ? `RFID: ${access.card_id.substring(0, 6)}` : 'Tarjeta';
  }
}