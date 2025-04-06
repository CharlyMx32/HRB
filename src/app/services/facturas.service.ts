import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import Pusher from 'pusher-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FacturasService {
  private apiUrl = environment.apiUrl;

  private pusherKey = '06e2ac4b518dea780c81'; 
  private pusherCluster = 'us2';

  private facturasSubject = new BehaviorSubject<any[]>([]);
  facturas$ = this.facturasSubject.asObservable();

  constructor(private http: HttpClient) {
    this.initializeWebSocket();
    this.loadInitialFacturas();
  }

  loadInitialFacturas(): void {
    this.http.get<any[]>(`${this.apiUrl}/invoices`).subscribe(data => {
      this.facturasSubject.next([]); 
      this.facturasSubject.next(data);
        });
  }

  actualizarFacturas(): void {
    this.http.get<any[]>(`${this.apiUrl}/invoices`).subscribe({
      next: (data) => {
        this.facturasSubject.next(data);
      },
      error: (error) => {
        console.error('Error al actualizar facturas:', error);
      }
    });
  }

  private initializeWebSocket() {
    const pusher = new Pusher(this.pusherKey, {
      cluster: this.pusherCluster
    });

    const channel = pusher.subscribe('invoices');

    channel.bind('invoice.created', (data: any) => {
      const currentFacturas = this.facturasSubject.getValue();

      // Evita duplicados
      if (!currentFacturas.some(factura => factura.URL === data.invoice.URL)) {
        this.facturasSubject.next([...currentFacturas, data.invoice]);
      }
    });
  }

}