import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, throwError, map } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WorkersService {
  successMessage: string = '';
  errorMessage: string = '';

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }


  getEmployees(): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/workers`);
  }

  getEmployee(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/worker/${id}`);
  }

  updateEmployee(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/worker/${id}`, data).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Error en la solicitud PUT:', error);
        return throwError(() => error);
      })
    );
  }

  // En tu WorkersService
  getWorkerOrders(): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/my-deliveries`).pipe(
      map(response => response.data || []), // Extraemos el array 'data' o devolvemos array vacío
      catchError((error: HttpErrorResponse) => {
        console.error('Error al obtener órdenes del trabajador:', error);
        return throwError(() => error);
      })
    );
  }

  markOrderAsCompleted(orderId: number, carrier: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/delivery/${orderId}/complete`, { carrier }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Error al marcar orden como completada:', error);
        return throwError(() => error);
      })
    );
  }
}
