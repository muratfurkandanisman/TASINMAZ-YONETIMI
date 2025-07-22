import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'https://localhost:7022/api/auth/login';
  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(this.apiUrl, { Email: email, Password: password });
  }

  isLoggedIn(): boolean {
    // Örneğin token varsa giriş yapılmış kabul edilir
    return !!localStorage.getItem('token');
  }
}
