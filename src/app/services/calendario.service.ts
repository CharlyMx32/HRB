import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CalendarioService {
  // Estado del calendario
  private currentDate = new BehaviorSubject<Date>(new Date());
  private events = new BehaviorSubject<any[]>([]);
  
  // Observables públicos
  currentDate$ = this.currentDate.asObservable();
  events$ = this.events.asObservable();
  weeks$ = new BehaviorSubject<Date[][]>([]);

  constructor() {
    // Generar calendario inicial
    this.generateCalendar();
  }

  // Actualizar fecha
  updateDate(newDate: Date) {
    this.currentDate.next(newDate);
    this.generateCalendar();
  }

  // Mover al mes anterior
  prevMonth() {
    const current = this.currentDate.value;
    const newDate = new Date(current.getFullYear(), current.getMonth() - 1, 1);
    this.updateDate(newDate);
  }

  // Mover al mes siguiente
  nextMonth() {
    const current = this.currentDate.value;
    const newDate = new Date(current.getFullYear(), current.getMonth() + 1, 1);
    this.updateDate(newDate);
  }

  // Generar estructura del calendario
  private generateCalendar() {
    const current = this.currentDate.value;
    const year = current.getFullYear();
    const month = current.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const startDay = firstDay.getDay();
    const endDay = lastDay.getDate();
    
    const weeks: Date[][] = [];
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
        weeks.push(week);
        week = [];
      }
    }
    
    // Días del siguiente mes
    if(week.length > 0) {
      const nextMonthDays = 7 - week.length;
      for(let i = 1; i <= nextMonthDays; i++) {
        week.push(new Date(year, month + 1, i));
      }
      weeks.push(week);
    }
    
    this.weeks$.next(weeks);
  }

  // Manejo de eventos
  setEvents(events: any[]) {
    this.events.next(events);
  }

  // Métodos de ayuda (opcionales)
  isToday(day: Date): boolean {
    const today = new Date();
    return day.getDate() === today.getDate() && 
           day.getMonth() === today.getMonth() && 
           day.getFullYear() === today.getFullYear();
  }

  getCurrentWeeks(): Date[][] {
    return this.weeks$.value;
  }

  hasEvents(day: Date): boolean {
    const events = this.events.value;
    if (!events || events.length === 0) return false;
    
    const utcDay = Date.UTC(day.getFullYear(), day.getMonth(), day.getDate());
    return events.some(event => {
      const eventUtc = Date.UTC(
        event.date.getFullYear(),
        event.date.getMonth(),
        event.date.getDate()
      );
      return eventUtc === utcDay;
    });
  }
}