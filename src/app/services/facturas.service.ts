import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FacturasService {
  private apiUrl = environment.apiUrl + '/invoices';

  constructor(private http: HttpClient) {}

  getFacturas(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }
}
