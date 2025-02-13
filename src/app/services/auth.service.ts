import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'https://1deb-177-244-54-50.ngrok-free.app/api'; 


  constructor(private http: HttpClient) {}

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
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
  
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token'); 
  }
  
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  }

}
