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

}