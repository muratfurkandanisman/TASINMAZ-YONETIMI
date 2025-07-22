import { Component, OnInit, AfterViewInit, NgZone } from '@angular/core';
import * as L from 'leaflet';
import { TasinmazService } from '../../services/tasinmaz.service';
import { MahalleService } from '../../services/mahalle.service';
import { IlceService } from '../../services/ilce.service';
import { IlService } from '../../services/il.service';
import { NotificationService } from '../../services/notification.service';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-tasinmazlar',
  templateUrl: './tasinmazlar.component.html',
  styleUrls: ['./tasinmazlar.component.css']
})
export class TasinmazlarComponent implements OnInit, AfterViewInit {
  // ...existing code...

  isAllSelected(): boolean {
    if (this.filteredTasinmazlar.length === 0) return false;
    return this.filteredTasinmazlar.every(t => this.selectedTasinmazlar.includes(t.tasinmazId));
  }

  toggleSelectAll(event: any): void {
    if (event.target.checked) {
      // Tüm sayfalardaki taşınmazları seç
      const ids = this.filteredTasinmazlar.map(t => t.tasinmazId);
      this.selectedTasinmazlar = Array.from(new Set([...this.selectedTasinmazlar, ...ids]));
    } else {
      // Tüm sayfalardaki taşınmazların seçimini kaldır
      const ids = this.filteredTasinmazlar.map(t => t.tasinmazId);
      this.selectedTasinmazlar = this.selectedTasinmazlar.filter(id => !ids.includes(id));
    }
  }
  tasinmazlar: any[] = [];
  mahalleler: any[] = [];
  ilceler: any[] = [];
  iller: any[] = [];
  
  // Filtrelenmiş dropdown listeleri
  filteredIlceler: any[] = [];
  filteredMahalleler: any[] = [];
  
  selectedTasinmazId: number | null = null; // Tekli seçim için (kullanılabilir)
  selectedTasinmazlar: number[] = []; // Çoklu seçim için seçili taşınmaz ID'leri
  userRole: string = ''; // Kullanıcının rolü

  // Filtreleme özellikleri
  filters = {
    ilId: '',
    ilceId: '',
    mahalleId: '',
    ada: '',
    parsel: '',
    nitelik: ''
  };
  
  filteredTasinmazlar: any[] = [];

  // Sayfalama özellikleri
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 0;
  paginatedTasinmazlar: any[] = [];

  // Harita özellikleri
  mapCenter: google.maps.LatLngLiteral = { lat: 39.9334, lng: 32.8597 }; // Ankara merkez
  mapZoom = 10;
  mapOptions: google.maps.MapOptions = {
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    disableDefaultUI: false,
    zoomControl: true,
    scrollwheel: true
  };
  markerOptions: google.maps.MarkerOptions = {
    icon: {
      url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
      scaledSize: new google.maps.Size(32, 32)
    }
  };

  leafletMap: any = null;
  markers: any[] = [];

  constructor(
    private tasinmazService: TasinmazService,
    private mahalleService: MahalleService,
    private ilceService: IlceService,
    private ilService: IlService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Kullanıcı rolünü localStorage'dan al
    this.userRole = localStorage.getItem('role') || '';
    this.loadAllData();
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.initMap(), 500);
  }

  initMap(): void {
    const mapElement = document.getElementById('tasinmazlar-map');
    if (!mapElement) return;
    let center: [number, number] = [39, 35]; // Türkiye merkezi
    this.leafletMap = L.map(mapElement).setView(center, 6); // Zoom: 6 ile tüm Türkiye görünür
    // Normal katman
    const normalLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      opacity: 1
    });
    // Sağ alt köşeye ölçek kontrolü ekle
    L.control.scale({ position: 'bottomright', imperial: false }).addTo(this.leafletMap);
    // Uydu katmanı (Esri World Imagery)
    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles © Esri',
      opacity: 1
    });
    // Katman kontrolü
    const baseLayers = {
      'Normal': normalLayer,
      'Uydu': satelliteLayer
    };
    normalLayer.addTo(this.leafletMap);
    L.control.layers(baseLayers).addTo(this.leafletMap);

    // Sol alt köşede sidebar ile opaklık kontrolü
    setTimeout(() => {
      const sidebar = document.createElement('div');
      sidebar.className = 'opacity-sidebar';
      sidebar.style.position = 'absolute';
      sidebar.style.left = '20px';
      sidebar.style.bottom = '20px';
      sidebar.style.zIndex = '1001';
      sidebar.style.background = 'rgba(255,255,255,0.97)';
      sidebar.style.borderRadius = '12px';
      sidebar.style.boxShadow = '0 2px 12px rgba(0,0,0,0.12)';
      sidebar.style.padding = '8px 12px';
      sidebar.style.display = 'flex';
      sidebar.style.flexDirection = 'column';
      sidebar.style.alignItems = 'flex-start';
      sidebar.style.pointerEvents = 'auto';
      sidebar.innerHTML = `
        <div style="font-weight:600;font-size:11px;margin-bottom:4px;">Harita Opaklığı</div>
        <input type="range" min="0" max="1" step="0.01" value="1" id="opacitySidebarRange" style="width:90px;pointer-events:auto;">
        <div style="font-size:9px;margin-top:3px;">Değer: <span id="opacityValue">1.00</span></div>
      `;
      // Harita container'a ekle
      const mapContainer = document.querySelector('.leaflet-container');
      if (mapContainer) mapContainer.appendChild(sidebar);
      const opacityRange = sidebar.querySelector('#opacitySidebarRange') as HTMLInputElement;
      const opacityValue = sidebar.querySelector('#opacityValue') as HTMLSpanElement;
      opacityRange.addEventListener('input', () => {
        const val = Number(opacityRange.value);
        normalLayer.setOpacity(val);
        satelliteLayer.setOpacity(val);
        opacityValue.textContent = val.toFixed(2);
      });
      // Haritaya tıklama ve sürükleme olaylarını tamamen engelle
      const stopEvents = [
        'pointerdown', 'pointerup', 'pointermove',
        'mousedown', 'mouseup', 'mousemove',
        'click', 'dblclick', 'touchstart', 'touchend', 'touchmove'
      ];
      stopEvents.forEach(evt => {
        sidebar.addEventListener(evt, (e) => { e.stopPropagation(); }, true);
        opacityRange.addEventListener(evt, (e) => { e.stopPropagation(); }, true);
      });
    }, 600);

    this.updateMarkers();
  }

  loadAllData(): void {
    // Tüm veriyi paralel olarak al
    forkJoin({
      iller: this.ilService.getIller(),
      ilceler: this.ilceService.getIlceler(),
      mahalleler: this.mahalleService.getMahalleler()
    }).subscribe(result => {
      this.iller = result.iller;
      this.ilceler = result.ilceler;
      this.mahalleler = result.mahalleler;
      
      // Başlangıçta tüm ilçe ve mahalleleri göster
      this.filteredIlceler = [...this.ilceler];
      this.filteredMahalleler = [...this.mahalleler];
      
      // Kullanıcı rolüne göre taşınmazları otomatik yükle
      if (this.userRole === 'User') {
        this.loadUserTasinmazlar();
      } else {
        this.getTasinmazlar();
      }
    });
  }

  loadUserTasinmazlar(): void {
    this.tasinmazService.getMyTasinmazlar().subscribe(data => {
      this.tasinmazlar = this.mapTasinmazData(data);
      this.filteredTasinmazlar = [...this.tasinmazlar];
      this.updatePagination();
    });
  }

  getTasinmazlar(): void {
    this.tasinmazService.getTasinmazlar().subscribe(data => {
      this.tasinmazlar = this.mapTasinmazData(data);
      this.filteredTasinmazlar = [...this.tasinmazlar];
      this.updatePagination();
    });
  }

  mapTasinmazData(tasinmazlar: any[]): any[] {
    return tasinmazlar.map(t => {
      const mahalle = this.mahalleler.find(m => m.mahalleId === t.mahalleId);
      const ilce = mahalle ? this.ilceler.find(i => i.ilceId === mahalle.ilceId) : null;
      const il = ilce ? this.iller.find(i => i.ilId === ilce.ilId) : null;
      
      return {
        ...t,
        mahalleAdi: mahalle?.name || 'N/A',
        ilceAdi: ilce?.name || 'N/A',
        ilAdi: il?.name || 'N/A'
      };
    });
  }

  // Sayfalama metodları
  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredTasinmazlar.length / this.itemsPerPage);
    this.currentPage = 1;
    this.updateCurrentPageForFiltered();
    this.updateMapCenter(); // Harita merkezini güncelle
  }

  setupPagination(): void {
    this.updatePagination();
  }

  updateCurrentPage(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedTasinmazlar = this.filteredTasinmazlar.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateCurrentPageForFiltered();
    }
  }

  goToPreviousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateCurrentPageForFiltered();
    }
  }

  goToNextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updateCurrentPageForFiltered();
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  // Filtreleme metodları
  onIlChange(): void {
    if (this.filters.ilId) {
      // Seçilen ile ait ilçeleri filtrele
      this.filteredIlceler = this.ilceler.filter(ilce => 
        ilce.ilId === parseInt(this.filters.ilId)
      );
      // İl seçildiğinde mahalleleri ildeki tüm ilçelerden topla
      const ilceIds = this.filteredIlceler.map(ilce => ilce.ilceId);
      this.filteredMahalleler = this.mahalleler.filter(mahalle => ilceIds.includes(mahalle.ilceId));
    } else {
      // İl seçilmediyse tüm ilçeleri ve mahalleleri göster
      this.filteredIlceler = [...this.ilceler];
      this.filteredMahalleler = [...this.mahalleler];
    }
    // İlçe ve mahalle seçimlerini sıfırla
    this.filters.ilceId = '';
    this.filters.mahalleId = '';
  }

  onIlceChange(): void {
    if (this.filters.ilceId) {
      // Seçilen ilçeye ait mahalleleri filtrele
      this.filteredMahalleler = this.mahalleler.filter(mahalle => 
        mahalle.ilceId === parseInt(this.filters.ilceId)
      );
    } else {
      // İlçe seçilmediyse tüm mahalleleri göster
      this.filteredMahalleler = [...this.mahalleler];
    }
    // Mahalle seçimini sıfırla
    this.filters.mahalleId = '';
  }

  applyFilter(): void {
    this.filteredTasinmazlar = this.tasinmazlar.filter(tasinmaz => {
      // İl filtresi
      if (this.filters.ilId && tasinmaz.ilAdi !== this.getIlName(parseInt(this.filters.ilId))) {
        return false;
      }

      // İlçe filtresi
      if (this.filters.ilceId && tasinmaz.ilceAdi !== this.getIlceName(parseInt(this.filters.ilceId))) {
        return false;
      }

      // Mahalle filtresi
      if (this.filters.mahalleId && tasinmaz.mahalleAdi !== this.getMahalleName(parseInt(this.filters.mahalleId))) {
        return false;
      }

      // Ada filtresi - string karşılaştırması
      if (this.filters.ada && tasinmaz.ada.toString() !== this.filters.ada.toString()) {
        return false;
      }

      // Parsel filtresi - string karşılaştırması  
      if (this.filters.parsel && tasinmaz.parsel.toString() !== this.filters.parsel.toString()) {
        return false;
      }

      // Nitelik filtresi - tam eşleşme
      if (this.filters.nitelik && tasinmaz.nitelik !== this.filters.nitelik) {
        return false;
      }

      return true;
    });
    
    this.updatePaginationForFiltered();
    this.updateMapCenter(); // Harita merkezini güncelle
  }

  clearFilters(): void {
    this.filters = {
      ilId: '',
      ilceId: '',
      mahalleId: '',
      ada: '',
      parsel: '',
      nitelik: ''
    };
    // Çoklu seçim kutularını da temizle
    this.selectedTasinmazlar = [];
    // Dropdown listelerini sıfırla
    this.filteredIlceler = [...this.ilceler];
    this.filteredMahalleler = [...this.mahalleler];
    this.filteredTasinmazlar = [...this.tasinmazlar];
    this.updatePaginationForFiltered();
  }

  updatePaginationForFiltered(): void {
    this.totalPages = Math.ceil(this.filteredTasinmazlar.length / this.itemsPerPage);
    this.currentPage = 1;
    this.updateCurrentPageForFiltered();
  }

  updateCurrentPageForFiltered(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedTasinmazlar = this.filteredTasinmazlar.slice(startIndex, endIndex);
  }

  getIlName(ilId: number): string {
    const il = this.iller.find(i => i.ilId === ilId);
    return il ? il.name : '';
  }

  getIlceName(ilceId: number): string {
    const ilce = this.ilceler.find(i => i.ilceId === ilceId);
    return ilce ? ilce.name : '';
  }

  getMahalleName(mahalleId: number): string {
    const mahalle = this.mahalleler.find(m => m.mahalleId === mahalleId);
    return mahalle ? mahalle.name : '';
  }

  // Harita metodları
  getMarkerPosition(tasinmaz: any): google.maps.LatLngLiteral {
    const coords = this.parseCoordinates(tasinmaz.koordinatBilgileri);
    return { lat: coords.lat, lng: coords.lng };
  }

  parseCoordinates(koordinatStr: string): {lat: number, lng: number} {
    try {
      // "41.0082,28.9784" formatından lat,lng çıkarma
      const parts = koordinatStr.split(',');
      return {
        lat: parseFloat(parts[0].trim()),
        lng: parseFloat(parts[1].trim())
      };
    } catch (error) {
      // Hatalı koordinat durumunda varsayılan konum (Ankara)
      return { lat: 39.9334, lng: 32.8597 };
    }
  }

  getMarkerTitle(tasinmaz: any): string {
    return `${tasinmaz.ilAdi} - ${tasinmaz.ilceAdi} - ${tasinmaz.mahalleAdi}\nAda: ${tasinmaz.ada} Parsel: ${tasinmaz.parsel}\nNitelik: ${tasinmaz.nitelik}`;
  }

  // Harita merkezini güncelle
  updateMapCenter(): void {
    if (this.filteredTasinmazlar.length > 0) {
      const firstTasinmaz = this.filteredTasinmazlar[0];
      this.mapCenter = this.getMarkerPosition(firstTasinmaz);
    }
  }

  updateMarkers(): void {
    if (!this.leafletMap) return;
    // Önce eski markerları kaldır
    this.markers.forEach(m => this.leafletMap.removeLayer(m));
    this.markers = [];
    this.filteredTasinmazlar.forEach(tasinmaz => {
      if (tasinmaz.koordinatBilgileri) {
        const coords = tasinmaz.koordinatBilgileri.split(',');
        if (coords.length === 2) {
          const lat = parseFloat(coords[0]);
          const lng = parseFloat(coords[1]);
          const marker = L.marker([lat, lng]).addTo(this.leafletMap);
          marker.bindPopup(`<b>${this.getMarkerTitle(tasinmaz)}</b>`);
          this.markers.push(marker);
        }
      }
    });
  }

  onAddTasinmaz() {
    // Sadece User'ların taşınmaz eklemesine izin ver
    if (this.userRole !== 'User') {
      this.notificationService.warning('Bu işlem için yetkiniz yok!');
      return;
    }
    
    // Yeni sayfaya yönlendir
    this.router.navigate(['/tasinmaz-ekle']);
  }

  onListTasinmazlar() {
    const role = localStorage.getItem('role');
    if (role === 'Admin') {
      this.tasinmazService.getTasinmazlar().subscribe(data => {
        this.tasinmazlar = this.mapTasinmazData(data);
        this.filteredTasinmazlar = [...this.tasinmazlar];
        this.updatePagination();
      });
    } else {
      this.tasinmazService.getMyTasinmazlar().subscribe(data => {
        this.tasinmazlar = this.mapTasinmazData(data);
        this.filteredTasinmazlar = [...this.tasinmazlar];
        this.updatePagination();
      });
    }
  }

  onUpdateTasinmaz() {
    // Seçili taşınmaz var mı kontrol et
    if (this.selectedTasinmazlar.length === 0) {
      this.notificationService.warning('Lütfen bir taşınmaz seçiniz!');
      return;
    }
    // Sadece bir kutucuk seçiliyse güncelleme yapılabilir
    if (!this.isSingleSelected || !this.selectedTasinmazId) {
      this.notificationService.warning('Güncelleme için sadece bir taşınmaz seçili olmalıdır!');
      return;
    }

    // Güncelleme sayfasına yönlendir
    this.router.navigate(['/tasinmaz-guncelle', this.selectedTasinmazId]);
  }

  onDeleteTasinmaz() {
    // Çoklu seçim kontrolü
    if (this.selectedTasinmazlar.length === 0) {
      this.notificationService.warning('Lütfen silmek istediğiniz taşınmazları seçin!');
      return;
    }

    this.notificationService.confirm(
      `${this.selectedTasinmazlar.length} taşınmazı silmek istediğinizden emin misiniz?`,
      () => {
        this.performDelete();
      },
      () => {
        console.log('Silme işlemi iptal edildi');
      }
    );
  }

  private performDelete(): void {
    if (this.selectedTasinmazlar.length === 0) return;

    let silinen = 0;
    this.selectedTasinmazlar.forEach((id: number) => {
      this.tasinmazService.deleteTasinmaz(id).subscribe({
        next: (response: any) => {
          silinen++;
          if (silinen === this.selectedTasinmazlar.length) {
            this.notificationService.success('Seçili taşınmazlar başarıyla silindi!');
            this.selectedTasinmazlar = [];
            if (this.userRole === 'User') {
              this.loadUserTasinmazlar();
            } else {
              this.getTasinmazlar();
            }
          }
        },
        error: (error: any) => {
          this.notificationService.error('Taşınmaz silinirken hata oluştu!');
          console.error('Taşınmaz silinirken hata oluştu:', error);
        }
      });
    });
  }

  // Checkbox ile çoklu taşınmaz seçme fonksiyonu
  onSelectTasinmaz(tasinmazId: number, event: any) {
    if (event.target.checked) {
      if (!this.selectedTasinmazlar.includes(tasinmazId)) {
        this.selectedTasinmazlar.push(tasinmazId);
      }
      this.selectedTasinmazId = tasinmazId; // Son seçilen kutucuk
    } else {
      this.selectedTasinmazlar = this.selectedTasinmazlar.filter(id => id !== tasinmazId);
      // Eğer kaldırılan id, tekli seçim id'siyse veya hiç kutucuk kalmadıysa
      if (this.selectedTasinmazId === tasinmazId) {
        this.selectedTasinmazId = this.selectedTasinmazlar.length > 0 ? this.selectedTasinmazlar[this.selectedTasinmazlar.length - 1] : null;
      }
    }
    // console.log('Seçili taşınmazlar:', this.selectedTasinmazlar);
  }

  get isSingleSelected(): boolean {
    return this.selectedTasinmazlar.length === 1;
  }

  // PDF Export fonksiyonu - Frontend verisiyle
  exportToPdf(): void {
    try {
      const doc = new jsPDF();
      doc.addFont('https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxK.woff2', 'Roboto', 'normal');
      doc.setFont('helvetica');
      doc.setFontSize(16);
      doc.text('Tasinmaz Listesi', 14, 22);
      doc.setFontSize(12);
      doc.text(`Tarih: ${new Date().toLocaleDateString('tr-TR')}`, 14, 32);

      // Sadece seçili taşınmazlar export edilecek
      let dataToExport = this.paginatedTasinmazlar;
      if (this.selectedTasinmazlar.length > 0) {
        dataToExport = this.paginatedTasinmazlar.filter(t => this.selectedTasinmazlar.includes(t.tasinmazId));
      }

      const headers = this.userRole === 'Admin'
        ? [['ID', 'IL', 'ILCE', 'MAHALLE', 'ADA', 'PARSEL', 'NITELIK', 'KOORDINAT']]
        : [['IL', 'ILCE', 'MAHALLE', 'ADA', 'PARSEL', 'NITELIK', 'KOORDINAT']];

      const tableData = dataToExport.map(t => {
        const row = this.userRole === 'Admin'
          ? [
              t.tasinmazId,
              this.turkishToAscii(t.ilAdi),
              this.turkishToAscii(t.ilceAdi),
              this.turkishToAscii(t.mahalleAdi),
              t.ada,
              t.parsel,
              this.turkishToAscii(t.nitelik),
              t.koordinatBilgileri
            ]
          : [
              this.turkishToAscii(t.ilAdi),
              this.turkishToAscii(t.ilceAdi),
              this.turkishToAscii(t.mahalleAdi),
              t.ada,
              t.parsel,
              this.turkishToAscii(t.nitelik),
              t.koordinatBilgileri
            ];
        return row;
      });

      autoTable(doc, {
        head: headers,
        body: tableData,
        startY: 40,
        styles: {
          fontSize: 8,
          font: 'helvetica'
        },
        headStyles: {
          fillColor: [33, 165, 132],
          font: 'helvetica'
        },
      });

      doc.save(`tasinmazlar_sayfa_${this.currentPage}_${new Date().toISOString().split('T')[0]}.pdf`);
      this.notificationService.success('PDF başarıyla indirildi!');

    } catch (error) {
      console.error('PDF export hatası:', error);
      this.notificationService.error('PDF export işlemi başarısız!');
    }
  }

  // Türkçe karakter dönüştürme fonksiyonu
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

  // Excel Export fonksiyonu - Frontend verisiyle
  exportToExcel(): void {
    try {
      // Sadece seçili taşınmazlar export edilecek
      let dataToExport = this.paginatedTasinmazlar;
      if (this.selectedTasinmazlar.length > 0) {
        dataToExport = this.paginatedTasinmazlar.filter(t => this.selectedTasinmazlar.includes(t.tasinmazId));
      }

      const excelData = dataToExport.map(t => {
        const row: any = {
          'İL': t.ilAdi,
          'İLÇE': t.ilceAdi,
          'MAHALLE': t.mahalleAdi,
          'ADA': t.ada,
          'PARSEL': t.parsel,
          'NİTELİK': t.nitelik,
          'KOORDİNAT': t.koordinatBilgileri
        };
        if (this.userRole === 'Admin') {
          row['ID'] = t.tasinmazId;
        }
        return row;
      });

      const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(excelData);
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Taşınmazlar');
      XLSX.writeFile(wb, `tasinmazlar_sayfa_${this.currentPage}_${new Date().toISOString().split('T')[0]}.xlsx`);
      this.notificationService.success('Excel başarıyla indirildi!');

    } catch (error) {
      console.error('Excel export hatası:', error);
      this.notificationService.error('Excel export işlemi başarısız!');
    }
  }
}
