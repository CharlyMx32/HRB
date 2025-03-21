import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://127.0.0.1:8000/api'; 

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
    return this.http.post<any>(`${this.apiUrl}/register-worker`, employeeData);
  }

  getEmployees(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/workers`);
  }
}
