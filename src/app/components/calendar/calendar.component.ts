import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { FullCalendarModalComponent } from '../full-calendar-modal/full-calendar-modal.component';
import { CalendarioService } from '../../services/calendario.service';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    CommonModule, 
    MatButtonModule, 
    MatIconModule, 
    MatCardModule, 
    MatTooltipModule
  ],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit {
  daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  constructor(
    private dialog: MatDialog,
    public calendarioService: CalendarioService
  ) {}

  ngOnInit() {
    // Inicialización si es necesaria
  }

  openFullCalendar() {
    this.dialog.open(FullCalendarModalComponent, {
      width: '90vw',
      maxWidth: '1200px',
      height: '90vh',
      panelClass: 'full-calendar-modal'
    });
  }
}