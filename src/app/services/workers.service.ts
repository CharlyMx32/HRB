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


  getEmployees(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/workers`).pipe(
      catchError(this.handleError)
    );
  }
  
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Error desconocido';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Código: ${error.status}, Mensaje: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(errorMessage);
  }

  getEmployee(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/worker/${id}`).pipe(
      map(response => response.data || response)
    );
  }

  getWorkerData(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/worker-data`).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Error al obtener datos del trabajador:', error);
        return throwError(() => error);
      })
    );
  }

  updateWorkerData(data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/worker-data`, data).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Error al actualizar datos del trabajador:', error);
        return throwError(() => error);
      })
    );
  }

  getWorkerOrders(): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/my-deliveries`).pipe(
      map(response => response.data || []), 
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

  updateEmployee(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/worker/${id}`, data).pipe(
      map(response => ({
        success: true,
        data: response.data || response
      })),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 422 && error.error?.errors) {
          const formattedErrors: any = {};
          Object.keys(error.error.errors).forEach(key => {
            formattedErrors[key] = error.error.errors[key][0];
          });
          return throwError(() => ({
            success: false,
            validationErrors: formattedErrors
          }));
        }
        return throwError(() => ({
          success: false
        }));
      })
    );
  }
}
