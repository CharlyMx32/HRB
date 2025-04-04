import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials); 
  }

  sendPasswordRecoveryEmail(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/send-reset-password-link`, { email });
  }

  checkEmailVerification(email: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/verify-email/${email}`);
  }

  setToken(token: string) {
    localStorage.setItem('token', token);
  }
  
  setRole(role: string) {
    localStorage.setItem('role', role);
  }
  
  getRole(): string | null {
    return localStorage.getItem('role');
  }
  
  getToken(): string | null {
    return localStorage.getItem('token');
  }
  
  logout() {
    console.log('Eliminando token y rol...');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    sessionStorage.removeItem('token');
    console.log('Token después de logout:', localStorage.getItem('token'));
  }
  

  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true; 

    try {
      const payload = JSON.parse(atob(token.split('.')[1])); // Decodifica el JWT
      const exp = payload.exp * 1000; // Convierte la expiración a milisegundos
      return Date.now() > exp; // Si la fecha actual es mayor, el token expiró
    } catch (error) {
      return true; 
    }
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired();
  }

  getUser(): any {
    const token = this.getToken();
    if (!token) return null;
    
    try {
      const decodedToken = jwtDecode(token);
      return decodedToken;
    } catch (error) {
      return null;
    }
  }

  registerWorker(employeeData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, employeeData).pipe(
      catchError(this.handleError)
    );
  }

  updatePassword(passwordData: any): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.put<any>(`${this.apiUrl}/update-password`, passwordData, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  resetPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, { email });
  }

  desactivateAccount(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/user/desactivate`, { id });
  }

  activateAccount(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/user/activate`, { id });
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Unknown error!';
    if (error.error instanceof ErrorEvent) {
      // Client-side errors
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side errors
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(errorMessage);
  }
}
