import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import Pusher from 'pusher-js';
import { environment } from '../../environments/environment';

interface LightSensorData {
  status: 'on' | 'off';
  event_date: string;
  alert_message?: string;
  alert_triggered?: boolean;
  area_id?: string;
  _id?: string;
}

interface PirSensorData {
  motion_detected: boolean;
  event_date: string;
  alert_message?: string;
  _id?: string;
}

interface ThSensorData {
  temperature_c: number;
  humidity_percent: number;
  event_date: string;
  _id?: string;
}

interface WeightSensorData {
    exit_code: string;
    weight_kg: number;
    status: number
    area_id?: string;
    event_date: string;
    processed: boolean;
    action: string;
    _id?: string;
}  

@Injectable({
    providedIn: 'root'
})
export class SensoresService {
    private apiUrl = environment.apiUrl;
    private pusherKey = environment.pusherKey;
    private pusherCluster = environment.pusherCluster;

    private lightSensorSubject = new BehaviorSubject<LightSensorData | null>(null);
    private pirSensorSubject = new BehaviorSubject<PirSensorData | null>(null);
    private thSensorSubject = new BehaviorSubject<ThSensorData | null>(null);
    private weightSensorSubject = new BehaviorSubject<WeightSensorData | null>(null);
    private rfidCodesSubject = new BehaviorSubject<string[]>([]);

    // Observables públicos
    rfidCodes$ = this.rfidCodesSubject.asObservable();
    
    public lightSensorUpdates$ = this.lightSensorSubject.asObservable();
    public pirSensorUpdates$ = this.pirSensorSubject.asObservable();
    public thSensorUpdates$ = this.thSensorSubject.asObservable();
    public weightSensorUpdates$ = this.weightSensorSubject.asObservable();


    constructor(private http: HttpClient) {
        this.initializeWebSockets();
        this.loadInitialSensorData();
        this.loadRfidCodes();
    }

    private initializeWebSockets(): void {
        const pusher = new Pusher(this.pusherKey, {
        cluster: this.pusherCluster,
        });

        pusher.subscribe('light-sensor-updates')
    .bind('LightSensorUpdated', (data: { lightData: LightSensorData }) => {
        console.log('WebSocket data received:', data); // Para depuración
        this.lightSensorSubject.next(data.lightData);
    });

        pusher.subscribe('pir-sensor-updates')
        .bind('PirSensorUpdated', (data: PirSensorData) => {
        console.log('PIR Sensor data received:', data); // Para depuración
        this.pirSensorSubject.next(data);
        });

        // Canal para sensor TH
    // En el método initializeWebSockets():
        pusher.subscribe('th-sensor-updates')
        .bind('ThSensorUpdated', (data: ThSensorData) => {
            console.log('TH Sensor data received:', data); // Para depuración
            this.thSensorSubject.next(data);
        });

                // Canal para sensor de peso
        pusher.subscribe('weight-sensor-updates')
        .bind('WeightSensorUpdated', (data: { weightData: WeightSensorData }) => {
        console.log('Weight Sensor data received:', data); // Para depuración
        this.weightSensorSubject.next(data.weightData);
        });
    }

    private loadInitialSensorData() {
        // Cargar datos iniciales
        this.getLastLightStatus().subscribe(data => this.lightSensorSubject.next(data));
        this.getLastTHSensorData().subscribe(data => this.thSensorSubject.next(data));
        this.getLastPirSensorData().subscribe(data => this.pirSensorSubject.next(data));
    }

    getLastLightStatus(): Observable<LightSensorData> {
        return this.http.get<LightSensorData>(`${this.apiUrl}/light-sensor`);
    }

    getLastPirSensorData(): Observable<PirSensorData> {
        return this.http.get<PirSensorData>(`${this.apiUrl}/pir-sensor`);
    }

    getRfidCodes(): Observable<string[]> {
        return this.http.get<string[]>(`${this.apiUrl}/rfid-codes`);
    }

    private loadRfidCodes() {
        this.getRfidCodes().subscribe({
            next: (codes) => this.rfidCodesSubject.next(codes),
            error: (err) => console.error('Error loading RFID codes', err)
        });
    }

    getAssignedRfidCodes(): Observable<string[]> {
        return this.http.get<string[]>(`${this.apiUrl}/assigned-rfid-codes`);
    }

    getLastTHSensorData(): Observable<ThSensorData> {
        return this.http.get<ThSensorData>(`${this.apiUrl}/temperature-humidity-sensor`);
    }

    getAriaReferenceIds(): Observable<any> {
        return this.http.get(`${this.apiUrl}/areas`);
    }

    getWeightSensorData(): Observable<any> {
        return this.http.get(`${this.apiUrl}/weight-sensor`);
    }

    getLockSensorData(): Observable<any> {
        return this.http.get(`${this.apiUrl}/lock-sensor/ultimos-accesos`);
    }

    getDevices(): Observable<any> {
        return this.http.get(`${this.apiUrl}/device`);
    }

    updateDevice(id: string, data: any) {
        return this.http.post(`${this.apiUrl}/device/${id}`, data);
    }

    deleteDevice(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/devices/${id}`);
    }


}