import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CalendarioService } from '../../services/calendario.service';

@Component({
  selector: 'app-full-calendar-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule
  ],
  templateUrl: './full-calendar-modal.component.html',
  styleUrls: ['./full-calendar-modal.component.css']
})
export class FullCalendarModalComponent {
  daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  

  constructor(
    public calendarioService: CalendarioService,
    public dialogRef: MatDialogRef<FullCalendarModalComponent>
  ) {}

  closeModal() {
    this.dialogRef.close();
  }

  
}