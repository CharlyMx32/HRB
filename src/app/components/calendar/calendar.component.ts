import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { FacturasService } from '../../services/facturas.service';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatCardModule],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit {
  weeks: Date[][] = [];
  currentDate: Date = new Date();
  events: any[] = [];

  constructor(private facturasService: FacturasService) {}

  ngOnInit() {
    this.generateCalendar();
    this.loadInvoices();
  }

  // Modifica el método loadInvoices
// Modifica el método loadInvoices
private loadInvoices() {
  this.facturasService.facturas$.subscribe(facturas => {
    this.events = facturas.map(factura => ({
      date: this.parseDate(factura.date),
      title: `Factura ${factura.id}`,  // Usar ID real de la factura
      color: this.getStatusColor(factura.status),
      ...factura
    }));
    this.generateCalendar();
  });
}

// Añade validación UTC
private parseDate(dateString: string): Date {
  const utcDate = new Date(dateString);
  return new Date(Date.UTC(
    utcDate.getUTCFullYear(),
    utcDate.getUTCMonth(),
    utcDate.getUTCDate()
  ));
}

// Actualiza los métodos de verificación con UTC
hasEvents(day: Date): boolean {
  const utcDay = Date.UTC(day.getFullYear(), day.getMonth(), day.getDate());
  return this.events.some(event => {
    const eventUtc = Date.UTC(
      event.date.getFullYear(),
      event.date.getMonth(),
      event.date.getDate()
    );
    return eventUtc === utcDay;
  });
}

getEventsForDay(day: Date): any[] {
  const utcDay = Date.UTC(day.getFullYear(), day.getMonth(), day.getDate());
  return this.events.filter(event => {
    const eventUtc = Date.UTC(
      event.date.getFullYear(),
      event.date.getMonth(),
      event.date.getDate()
    );
    return eventUtc === utcDay;
  });
}

  private getStatusColor(status: string): string {
    switch(status) {
      case 'Pending': return '#FFC107';
      case 'Paid': return '#4CAF50';
      default: return '#2196F3';
    }
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
  addEvent(day: Date) {
    const events = this.getEventsForDay(day);
    if(events.length > 0) {
      const eventDetails = events.map(e => 
        `${e.title}\nEstado: ${e.status}\nURL: ${e.URL}`
      ).join('\n\n');
      alert(eventDetails);
    }
  }
}