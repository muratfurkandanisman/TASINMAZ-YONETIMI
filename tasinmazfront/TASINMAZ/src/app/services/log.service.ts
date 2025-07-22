import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LogIslem {
  id: number;
  kullaniciId?: number;
  userId?: number; // Backend'de farklı isim olabilir
  durum: string;
  islemTipi: string;
  aciklama?: string;
  description?: string; // Backend'de farklı isim olabilir
  tarihSaat?: Date | string;
  createdAt?: Date | string; // Backend'de farklı isim olabilir
  dateTime?: Date | string; // Backend'de farklı isim olabilir
  selected?: boolean; // Checkbox için
}

@Injectable({
  providedIn: 'root'
})
export class LogService {
  private apiUrl = 'https://localhost:7022/api/log';

  constructor(private http: HttpClient) { }

  getLogIslemleri(): Observable<LogIslem[]> {
    return this.http.get<LogIslem[]>(this.apiUrl);
  }

  getLogById(id: number): Observable<LogIslem> {
    return this.http.get<LogIslem>(`${this.apiUrl}/${id}`);
  }

  addLog(log: LogIslem): Observable<LogIslem> {
    return this.http.post<LogIslem>(this.apiUrl, log);
  }

  deleteLog(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Paginated log fetch
  getLogsPaged(filter: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/filter-paged`, filter);
  }
}
