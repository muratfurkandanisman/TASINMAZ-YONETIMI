import { Component, OnInit } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { NotificationService } from '../../services/notification.service';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-kullanici-listesi',
  templateUrl: './kullanici-listesi.component.html',
  styleUrls: ['./kullanici-listesi.component.css']
})

export class KullaniciListesiComponent implements OnInit {
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
  kullanicilar: User[] = [];
  filteredKullanicilar: User[] = [];
  paginatedKullanicilar: User[] = [];
  selectedKullanici: User | null = null;
  selectedKullaniciIds: number[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 0;
  // Çoklu seçim için
  get selectedCount(): number {
    return this.paginatedKullanicilar.filter(k => this.selectedKullaniciIds.includes(k.userId)).length;
  }
  isAllSelected(): boolean {
    if (this.filteredKullanicilar.length === 0) return false;
    return this.filteredKullanicilar.every(k => this.selectedKullaniciIds.includes(k.userId));
  }
  toggleSelectAll(event: any): void {
    if (event.target.checked) {
      const ids = this.filteredKullanicilar.map(k => k.userId);
      this.selectedKullaniciIds = Array.from(new Set([...this.selectedKullaniciIds, ...ids]));
    } else {
      const ids = this.filteredKullanicilar.map(k => k.userId);
      this.selectedKullaniciIds = this.selectedKullaniciIds.filter(id => !ids.includes(id));
    }
  }
  onSelectKullanici(kullaniciId: number, event: any) {
    if (event.target.checked) {
      if (!this.selectedKullaniciIds.includes(kullaniciId)) {
        this.selectedKullaniciIds.push(kullaniciId);
      }
      this.selectedKullanici = this.kullanicilar.find(k => k.userId === kullaniciId) || null;
    } else {
      this.selectedKullaniciIds = this.selectedKullaniciIds.filter(id => id !== kullaniciId);
      if (this.selectedKullanici?.userId === kullaniciId) {
        this.selectedKullanici = this.selectedKullaniciIds.length > 0 ? this.kullanicilar.find(k => k.userId === this.selectedKullaniciIds[this.selectedKullaniciIds.length - 1]) || null : null;
      }
    }
  }
  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredKullanicilar.length / this.itemsPerPage);
    this.currentPage = 1;
    this.updateCurrentPage();
  }
  updateCurrentPage(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedKullanicilar = this.filteredKullanicilar.slice(startIndex, endIndex);
  }
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateCurrentPage();
    }
  }
  goToPreviousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateCurrentPage();
    }
  }
  goToNextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updateCurrentPage();
    }
  }
  getPageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  constructor(private userService: UserService, private router: Router, private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.loadKullanicilar();
  }

  exportToPdf(): void {
    const doc = new jsPDF();
    const head = [[
      this.turkishToAscii('ID'),
      this.turkishToAscii('AD SOYAD'),
      this.turkishToAscii('E-MAIL'),
      this.turkishToAscii('ROL')
    ]];
    let usersToExport = this.paginatedKullanicilar;
    if (this.selectedKullaniciIds.length > 0) {
      usersToExport = this.paginatedKullanicilar.filter(k => this.selectedKullaniciIds.includes(k.userId));
    }
    const data = usersToExport.map(k => [
      k.userId,
      this.turkishToAscii(k.fullName),
      this.turkishToAscii(k.email),
      this.turkishToAscii(k.role)
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
        doc.text(this.turkishToAscii('Kullanıcı Listesi'), 14, 15);
      }
    });
    doc.save(`kullanici_listesi_${new Date().toISOString().split('T')[0]}.pdf`);
  }

  exportToExcel(): void {
    let usersToExport = this.paginatedKullanicilar;
    if (this.selectedKullaniciIds.length > 0) {
      usersToExport = this.paginatedKullanicilar.filter(k => this.selectedKullaniciIds.includes(k.userId));
    }
    const excelData = usersToExport.map(k => ({
      'ID': k.userId,
      'AD SOYAD': k.fullName,
      'E-MAIL': k.email,
      'ROL': k.role
    }));
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(excelData);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Kullanicilar');
    XLSX.writeFile(wb, `kullanici_listesi_${new Date().toISOString().split('T')[0]}.xlsx`);
  }

  loadKullanicilar(): void {
    this.userService.getUsers().subscribe({
      next: (data) => {
        this.kullanicilar = data;
        this.filteredKullanicilar = [...this.kullanicilar];
        this.updatePagination();
      },
      error: (err) => {
        console.error('Kullanıcılar yüklenirken hata:', err);
      }
    });
  }

  selectKullanici(kullanici: User) {
    this.selectedKullanici = kullanici;
  }

  onAddKullanici(): void {
    this.router.navigate(['/kullanici-ekle']);
  }

  onUpdateKullanici(): void {
    if (this.selectedKullaniciIds.length === 0) {
      this.notificationService.warning('Lütfen güncellenecek kullanıcıyı seçin!');
      return;
    }
    if (this.selectedKullaniciIds.length > 1) {
      this.notificationService.warning('Güncelleme için sadece bir kullanıcı seçili olmalıdır!');
      return;
    }
    this.router.navigate(['/kullanici-guncelle', this.selectedKullaniciIds[0]]);
  }

  onDeleteKullanici(): void {
    if (this.selectedKullaniciIds.length === 0) {
      this.notificationService.warning('Lütfen silinecek kullanıcıyı seçin!');
      return;
    }
    this.notificationService.confirm(
      'Seçili kullanıcı(lar)ı silmek istediğinize emin misiniz?',
      () => {
        this.selectedKullaniciIds.forEach(id => {
          this.userService.deleteUser(id).subscribe({
            next: () => {
              this.kullanicilar = this.kullanicilar.filter(k => k.userId !== id);
              this.filteredKullanicilar = this.filteredKullanicilar.filter(k => k.userId !== id);
              this.selectedKullaniciIds = this.selectedKullaniciIds.filter(selId => selId !== id);
              this.updatePagination();
            },
            error: () => {
              this.notificationService.error('Kullanıcı silinirken bir hata oluştu.');
            }
          });
        });
      },
      () => {
        // İptal edildiğinde hiçbir şey yapma
      }
    );
  }
}
