import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TasinmazService {
  private apiUrl = 'https://localhost:7022/api/Tasinmaz'; // Backend adresin

  constructor(private http: HttpClient) {}

  getTasinmazlar(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getMyTasinmazlar(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl + '/my');
  }
  
  createTasinmaz(tasinmaz: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, tasinmaz);
  }

  deleteTasinmaz(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  updateTasinmaz(id: number, tasinmaz: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, tasinmaz);
  }

  // PDF Export
  exportToPdf(filter: any = {}): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/export-pdf`, filter, { 
      responseType: 'blob' 
    });
  }

  // Excel Export
  exportToExcel(filter: any = {}): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/export-excel`, filter, { 
      responseType: 'blob' 
    });
  }
}