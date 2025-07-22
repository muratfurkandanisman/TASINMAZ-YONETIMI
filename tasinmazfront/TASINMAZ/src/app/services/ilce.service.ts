import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class IlceService {
  private apiUrl = 'https://localhost:7022/api/Ilce';

  constructor(private http: HttpClient) {}

  getIlceler(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}
