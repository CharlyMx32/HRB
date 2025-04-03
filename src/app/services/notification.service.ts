import { Injectable } from '@angular/core';
import { BehaviorSubject, interval } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private newInvoicesCount = new BehaviorSubject<number>(0);
  private hasNewOrders = new BehaviorSubject<boolean>(false);
  
  currentInvoicesCount = this.newInvoicesCount.asObservable();
  hasNewOrders$ = this.hasNewOrders.asObservable();

  constructor() {}

  updateInvoicesCount(count: number): void {
    const currentCount = this.newInvoicesCount.value;
    this.newInvoicesCount.next(count);
    
    // Activar el indicador visual si hay nuevas órdenes
    if (count > currentCount) {
      this.hasNewOrders.next(true);
    }
  }

  resetInvoicesCount(): void {
    this.newInvoicesCount.next(0);
    this.hasNewOrders.next(false);
  }

  getCurrentCount(): number {
    return this.newInvoicesCount.value;
  }
}