import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Component, OnInit } from '@angular/core';
import { LogService, LogIslem } from '../../services/log.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-log-islemleri',
  templateUrl: './log-islemleri.component.html',
  styleUrls: ['./log-islemleri.component.css']
})
export class LogIslemleriComponent implements OnInit {
  // Sayfa bazlı toplu seçim
  isAllSelected(): boolean {
    if (this.paginatedLoglar.length === 0) return false;
    return this.paginatedLoglar.every((log: LogIslem) => this.selectedLogIds.includes(log.id));
  }
  toggleSelectAll(event: any): void {
    if (event.target.checked) {
      const ids = this.paginatedLoglar.map((log: LogIslem) => log.id);
      this.selectedLogIds = Array.from(new Set([...this.selectedLogIds, ...ids]));
      this.paginatedLoglar.forEach((log: LogIslem) => log.selected = true);
    } else {
      const ids = this.paginatedLoglar.map((log: LogIslem) => log.id);
      this.selectedLogIds = this.selectedLogIds.filter(id => !ids.includes(id));
      this.paginatedLoglar.forEach((log: LogIslem) => log.selected = false);
    }
  }
  // Türkçe karakterleri ASCII'ye çeviren fonksiyon
  private turkishToAscii(text: string): string {
    if (!text) return text;
    const turkishChars: { [key: string]: string } = {
      'ç': 'c', 'Ç': 'C',
      'ğ': 'g', 'Ğ': 'G',
      'ı': 'i', 'I': 'I',
      'İ': 'I', 'i': 'i',
      'ö': 'o', 'Ö': 'O',
      'ş': 's', 'Ş': 'S',
      'ü': 'u', 'Ü': 'U'
    };
    return text.replace(/[çÇğĞıIİiöÖşŞüÜ]/g, (match) => turkishChars[match] || match);
  }
  // Logları PDF olarak dışa aktar
  exportToPdf(): void {
    const doc = new jsPDF();
    const head = [[
      this.turkishToAscii('LOG ID'),
      this.turkishToAscii('KULLANICI ID'),
      this.turkishToAscii('DURUM'),
      this.turkishToAscii('İŞLEM TİPİ'),
      this.turkishToAscii('AÇIKLAMA'),
      this.turkishToAscii('TARİH'),
      this.turkishToAscii('SAAT')
    ]];
    // Sadece seçili loglar varsa onları aktar, yoksa tüm filtrelenmiş logları aktar
    const logsToExport = this.paginatedLoglar.filter((log: LogIslem) => log.selected);
    const data = (logsToExport.length > 0 ? logsToExport : this.paginatedLoglar).map((log: LogIslem) => [
      log.id,
      this.turkishToAscii((log.kullaniciId || log.userId || 'Bilinmiyor').toString()),
      this.turkishToAscii(log.durum),
      this.turkishToAscii(log.islemTipi),
      this.turkishToAscii(log.aciklama || log.description || 'Açıklama yok'),
      this.turkishToAscii(this.formatDate(log, 'date')),
      this.turkishToAscii(this.formatDate(log, 'time'))
    ]);
    autoTable(doc, {
      head,
      body: data,
      styles: { font: 'helvetica', fontStyle: 'normal' },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      bodyStyles: { textColor: 20 },
      margin: { top: 20 },
      didDrawPage: (dataArg) => {
        doc.setFontSize(16);
        doc.text(this.turkishToAscii('Log İşlemleri'), 14, 15);
      }
    });
    doc.save(`log_islemleri_${new Date().toISOString().split('T')[0]}.pdf`);
  }

  // Logları Excel olarak dışa aktar
  exportToExcel(): void {
    // Sadece seçili loglar varsa onları aktar, yoksa tüm filtrelenmiş logları aktar
    const logsToExport = this.paginatedLoglar.filter((log: LogIslem) => log.selected);
    const excelData = (logsToExport.length > 0 ? logsToExport : this.paginatedLoglar).map((log: LogIslem) => ({
      'LOG ID': log.id,
      'KULLANICI ID': log.kullaniciId || log.userId || 'Bilinmiyor',
      'DURUM': log.durum,
      'İŞLEM TİPİ': log.islemTipi,
      'AÇIKLAMA': log.aciklama || log.description || 'Açıklama yok',
      'TARİH': this.formatDate(log, 'date'),
      'SAAT': this.formatDate(log, 'time')
    }));
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(excelData);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Loglar');
    XLSX.writeFile(wb, `log_islemleri_${new Date().toISOString().split('T')[0]}.xlsx`);
  }
  // Her türlü tarih stringini Date objesine çevirir
  parseLogDate(log: any): Date | null {
    const raw = log.tarihSaat || log.createdAt || log.dateTime || log.tarih || log.TarihSaat;
    if (!raw) return null;
    // ISO formatı ise direkt parse et
    const iso = Date.parse(raw);
    if (!isNaN(iso)) return new Date(raw);
    // Türkçe format: 17.07.2024 13:45:00
    const match = /^([0-9]{2})\.([0-9]{2})\.([0-9]{4}) ([0-9]{2}):([0-9]{2}):([0-9]{2})$/.exec(raw);
    if (match) {
      const [_, day, month, year, hour, min, sec] = match;
      return new Date(+year, +month - 1, +day, +hour, +min, +sec);
    }
    return null;
  }

  formatDate(log: any, type: 'date' | 'time' = 'date'): string {
    const dateObj = this.parseLogDate(log);
    if (!dateObj) return 'Bilinmiyor';
    if (type === 'date') {
      return dateObj.toLocaleDateString('tr-TR');
    } else {
      return dateObj.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    }
  }
  loglar: LogIslem[] = [];
  paginatedLoglar: LogIslem[] = [];
  totalCount: number = 0;
  filterKullaniciId: string = '';
  filterDurum: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 0;
  selectedLog: LogIslem | null = null;
  allSelected: boolean = false;
  selectedLogIds: number[] = [];

  constructor(
    private logService: LogService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.loadLogIslemleriPaged();
  }

  loadLogIslemleri(): void {
    // Eski metot, artık kullanılmıyor
  }

  loadLogIslemleriPaged(): void {
    const filter: any = {
      pageNumber: this.currentPage,
      pageSize: this.itemsPerPage,
    };
    if (this.filterKullaniciId) {
      filter.kullaniciId = this.filterKullaniciId;
    }
    if (this.filterDurum) {
      filter.durum = this.filterDurum;
    }
    this.logService.getLogsPaged(filter).subscribe({
      next: (result) => {
        // Backend 'logs' array ile dönüyor
        this.loglar = Array.isArray(result) ? result : result.logs || result.data || [];
        this.paginatedLoglar = this.loglar;
        this.totalCount = result.totalCount || (Array.isArray(result) ? result.length : 0);
        this.totalPages = Math.ceil(this.totalCount / this.itemsPerPage);
      },
      error: (error) => {
        this.notificationService.show(`Log işlemleri yüklenirken hata oluştu: ${error.message}`, 'error');
      }
    });
  }

  applyFilter(): void {
    this.currentPage = 1;
    this.loadLogIslemleriPaged();
  }

  clearFilters(): void {
    this.filterKullaniciId = '';
    this.filterDurum = '';
    this.currentPage = 1;
    this.loadLogIslemleriPaged();
  }


  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadLogIslemleriPaged();
    }
  }

  goToPreviousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadLogIslemleriPaged();
    }
  }

  goToNextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadLogIslemleriPaged();
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    const startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  goToFirstPage(): void {
    if (this.currentPage !== 1) {
      this.currentPage = 1;
      this.loadLogIslemleriPaged();
    }
  }

  goToLastPage(): void {
    if (this.currentPage !== this.totalPages) {
      this.currentPage = this.totalPages;
      this.loadLogIslemleriPaged();
    }
  }

  viewLogDetail(log: LogIslem): void {
    this.selectedLog = log;
    // Here you can implement a modal or navigation to detail view
    console.log('Log detayı:', log);
  }

  // Satır seçimi değiştiğinde çağrılır
  onRowSelectChange(): void {
    this.selectedLogIds = this.paginatedLoglar
      .filter(log => log.selected)
      .map(log => log.id);
    // İsterseniz burada console.log ile görebilirsiniz:
    console.log('Seçili log idleri:', this.selectedLogIds);
  }

  // Tümünü seç/kaldır
  toggleAllSelection(): void {
    this.paginatedLoglar.forEach(log => log.selected = this.allSelected);
  }
  // Checkbox değiştiğinde çağrılır, seçimi global olarak günceller
  onCheckboxChange(log: LogIslem, event: any): void {
    const checked = event.target.checked;
    // paginatedLoglar'da ilgili log'u bul ve selected'ı güncelle
    const idx = this.paginatedLoglar.findIndex((l: LogIslem) => l.id === log.id);
    if (idx !== -1) {
      this.paginatedLoglar[idx].selected = checked;
    }
    this.onRowSelectChange();
  }
}
