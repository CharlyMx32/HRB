import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DeliveriesService {

  private apiUrl = `${environment.apiUrl}/deliveries`;

  constructor(private http: HttpClient) { }

  // Método para obtener los detalles de las entregas
  getDeliveries(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }
}
