import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
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
  // Estado sensores
  luzEncendida = false;
  pirStatus = 'Inactivo';
  lastDetection = '--';
  temperatura = 0;
  humedad = 0;
  ultimoCambioEstado = 'Hoy 09:15';

  // Indicadores de cambio
  showLightChangeIndicator = false;
  showEnvChangeIndicator = false;
  showPirChangeIndicator = false;

  // Datos de auditoría
  eventosAuditoria: {accion: string, hora: string, detalle: string}[] = [];

  private sensorSubscriptions: Subscription = new Subscription();

  constructor(
    private sensoresService: SensoresService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadInitialData();
    this.setupRealTimeUpdates();
  }

  ngOnDestroy() {
    this.sensorSubscriptions.unsubscribe();
  }

  private loadInitialData() {
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
        next: (data) => data && this.handlePirUpdate(data),
        error: (err) => console.error('Error in PIR sensor WS:', err)
      })
    );
  }

  private formatLastChangeTime(dateString: string): string {
    const date = new Date(dateString);
    const hoy = new Date();
    
    // Formatear la hora en formato AM/PM
    const options: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    };
    const timeString = date.toLocaleTimeString('es-MX', options);
    
    if (date.getDate() === hoy.getDate() && 
        date.getMonth() === hoy.getMonth() && 
        date.getFullYear() === hoy.getFullYear()) {
      return `Hoy ${timeString}`;
    } else {
      // Formatear fecha completa (día/mes/año)
      const dateOptions: Intl.DateTimeFormatOptions = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      };
      const dateString = date.toLocaleDateString('es-MX', dateOptions);
      return `${dateString} ${timeString}`;
    }
  }

  private handleLightUpdate(data: any) {
    if (!data) return;
    
    const nuevoEstado = data.status === 'on';
    
    if (nuevoEstado !== this.luzEncendida) {
      this.luzEncendida = nuevoEstado;
      this.ultimoCambioEstado = this.formatLastChangeTime(data.event_date);
      this.showLightChangeIndicator = true;
      
      this.agregarEventoAuditoria(
        'Cambio estado luz', 
        this.formatLastChangeTime(data.event_date), 
        this.luzEncendida ? 'Encendida' : 'Apagada'
      );
      
      this.cdr.markForCheck();
    }
  }
  
  private handlePirUpdate(data: PirSensorData) {
    if (!data) return;
    
    const nuevoEstado = data.motion_detected ? '¡Detección!' : 'Inactivo';
    
    if (nuevoEstado !== this.pirStatus) {
      this.pirStatus = nuevoEstado;
      this.showPirChangeIndicator = true;
      
      if (data.motion_detected) {
        this.lastDetection = this.formatLastChangeTime(data.event_date);
        const alertMsg = data.alert_triggered ? ` (${data.alert_message})` : '';
        const areaName = data.area_name || 'Zona desconocida';
        
        this.agregarEventoAuditoria(
          'Detección PIR', 
          this.formatLastChangeTime(data.event_date), 
          `${areaName}${alertMsg}`
        );
      }
      
      this.cdr.markForCheck();
    }
  }
  
  private handleThUpdate(data: ThSensorData) {
    if (!data) return;
    
    const fechaEvento = data.event_date;
    let changed = false;
    
    const nuevaTemp = Number(data.temperature_c);
    const nuevaHum = Number(data.humidity_percent);
    
    if (Math.abs(nuevaTemp - this.temperatura) > 0.5) {
      this.temperatura = nuevaTemp;
      changed = true;
      this.agregarEventoAuditoria(
        'Cambio temperatura', 
        this.formatLastChangeTime(fechaEvento), 
        `Nueva temperatura: ${nuevaTemp}°C`
      );
    }
    
    if (Math.abs(nuevaHum - this.humedad) > 1) {
      this.humedad = nuevaHum;
      changed = true;
      this.agregarEventoAuditoria(
        'Cambio humedad', 
        this.formatLastChangeTime(fechaEvento), 
        `Nueva humedad: ${nuevaHum}%`
      );
    }
    
    if (changed) {
      this.showEnvChangeIndicator = true;
      this.cdr.markForCheck();
    }
  }

  private agregarEventoAuditoria(accion: string, hora: string, detalle: string) {
    this.eventosAuditoria.unshift({ accion, hora, detalle });
    if (this.eventosAuditoria.length > 5) {
      this.eventosAuditoria.pop();
    }
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
}