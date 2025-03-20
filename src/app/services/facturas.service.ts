import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FacturasService {
  private apiUrl = 'http://192.168.253.13:8000/api/invoices'; // Cambia a la URL correcta

  constructor(private http: HttpClient) {}

  getFacturas(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }
}
