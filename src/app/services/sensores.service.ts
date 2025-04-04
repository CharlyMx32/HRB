import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class SensoresService {
    private apiUrl = environment.apiUrl;
    constructor(private http: HttpClient) {}

    getLastLightStatus(): Observable<any> {
        return this.http.get(`${this.apiUrl}/light-sensor`);
    }

    getLastTHSensorData(): Observable<any> {
        return this.http.get(`${this.apiUrl}/temperature-humidity-sensor`);
    }

    getLastPirSensorData(): Observable<any> {
        return this.http.get(`${this.apiUrl}/pir-sensor`);
    }

    getAriaReferenceIds(): Observable<any> {
        return this.http.get(`${this.apiUrl}/areas`);
    }

    getDevices(): Observable<any> {
        return this.http.get(`${this.apiUrl}/devices`);
    }

    updateDevice(id: string, data: any) {
        console.log(`Haciendo POST a /device/${id} con:`, data);

        return this.http.post(`${this.apiUrl}/device/${id}`, data);
      }
      

    deleteDevice(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/devices/${id}`);
    }


}