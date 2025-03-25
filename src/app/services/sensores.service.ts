import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    private apiUrl = 'http://192.168.252.116/api'; 

    constructor(private http: HttpClient) {}

}