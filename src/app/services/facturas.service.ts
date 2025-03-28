import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import Pusher from 'pusher-js';

@Injectable({
  providedIn: 'root'
})
export class FacturasService {
  private apiUrl = 'http://127.0.0.1:8000/api/invoices';
  private pusherKey = '06e2ac4b518dea780c81'; 
  private pusherCluster = 'us2';

  private facturasSubject = new BehaviorSubject<any[]>([]);
  facturas$ = this.facturasSubject.asObservable();

  constructor(private http: HttpClient) {
    this.initializeWebSocket();
    this.loadInitialFacturas();
  }

   loadInitialFacturas(): void {
    this.http.get<any[]>(this.apiUrl).subscribe(data => {
      this.facturasSubject.next([]); 
      this.facturasSubject.next(data);
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
