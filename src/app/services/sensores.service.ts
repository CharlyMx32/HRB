import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import Pusher from 'pusher-js';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class SensoresService {
    private apiUrl = environment.apiUrl;
    private pusherKey = environment.pusherKey; // Asegúrate de añadir esto a environment.ts
    private pusherCluster = environment.pusherCluster;

    // Subjects para cada tipo de sensor
    private lightSensorSubject = new BehaviorSubject<any>(null);
    private thSensorSubject = new BehaviorSubject<any>(null);
    private pirSensorSubject = new BehaviorSubject<any>(null);

    // Observables públicos
    lightSensorUpdates$ = this.lightSensorSubject.asObservable();
    thSensorUpdates$ = this.thSensorSubject.asObservable();
    pirSensorUpdates$ = this.pirSensorSubject.asObservable();

    constructor(private http: HttpClient) {
        this.initializeWebSocket();
        this.loadInitialSensorData();
    }

    private initializeWebSocket() {
        const pusher = new Pusher(this.pusherKey, {
            cluster: this.pusherCluster
        });
    
        const channel = pusher.subscribe('sensor-updates');
    
        channel.bind('App\\Events\\PirSensorUpdated', (data: any) => {
            this.pirSensorSubject.next(data.data);
        });
    
        channel.bind('App\\Events\\LightSensorUpdated', (data: any) => {
            this.lightSensorSubject.next(data.data);
        });
    
        channel.bind('App\\Events\\ThSensorUpdated', (data: any) => {
            this.thSensorSubject.next(data.data);
        });
    }

    private loadInitialSensorData() {
        // Cargar datos iniciales
        this.getLastLightStatus().subscribe(data => this.lightSensorSubject.next(data));
        this.getLastTHSensorData().subscribe(data => this.thSensorSubject.next(data));
        this.getLastPirSensorData().subscribe(data => this.pirSensorSubject.next(data));
    }

    // Métodos existentes (los mantienes igual)
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
        return this.http.post(`${this.apiUrl}/device/${id}`, data);
    }

    deleteDevice(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/devices/${id}`);
    }
}