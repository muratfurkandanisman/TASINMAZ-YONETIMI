



import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'https://localhost:7022/api/User'; // Backend adresin

  constructor(private http: HttpClient) { }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  deleteUser(userId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${userId}`);
  }

  createUser(user: any): Observable<any> {
    return this.http.post(this.apiUrl, user);
  }
  updateUser(user: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${user.userId}`, user);
  }
}
