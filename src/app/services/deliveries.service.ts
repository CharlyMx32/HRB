import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DeliveriesService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getDeliveries(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/deliveries`);
  }

  makeDelivery(deliveryData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/delivery`, deliveryData);
  }
}
