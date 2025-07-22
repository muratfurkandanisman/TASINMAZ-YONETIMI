import { Component, OnInit, NgZone } from '@angular/core';
import { AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import { IlService } from '../../services/il.service';
import { IlceService } from '../../services/ilce.service';
import { MahalleService } from '../../services/mahalle.service';
import { TasinmazService } from '../../services/tasinmaz.service';
import { NotificationService } from '../../services/notification.service';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';

// Google Maps kaldırıldı

@Component({
  selector: 'app-tasinmaz-ekle',
  templateUrl: './tasinmaz-ekle.component.html',
  styleUrls: ['./tasinmaz-ekle.component.css']
})
export class TasinmazEkleComponent implements OnInit, AfterViewInit {
  leafletMap: any = null;
  marker: any = null;
  iller: any[] = [];
  ilceler: any[] = [];
  mahalleler: any[] = [];
  
  // Filtered lists for cascade dropdowns
  filteredIlceler: any[] = [];
  filteredMahalleler: any[] = [];
  
  // Form data
  selectedIlId: number | null = null;
  selectedIlceId: number | null = null;
  selectedMahalleId: number | null = null;
  ada: number | null = null;
  parsel: number | null = null;
  nitelik: string = '';
  koordinat: string = '';

  constructor(
    private ilService: IlService,
    private ilceService: IlceService,
    private mahalleService: MahalleService,
    private tasinmazService: TasinmazService,
    private notificationService: NotificationService,
    private router: Router,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.initMap(), 500);
  }

  loadData(): void {
    forkJoin({
      iller: this.ilService.getIller(),
      ilceler: this.ilceService.getIlceler(),
      mahalleler: this.mahalleService.getMahalleler()
    }).subscribe(result => {
      this.iller = result.iller;
      this.ilceler = result.ilceler;
      this.mahalleler = result.mahalleler;
      
      console.log('İller:', this.iller);
      console.log('İlçeler:', this.ilceler);
      console.log('Mahalleler:', this.mahalleler);
    });
  }

  onIlChange(): void {
    console.log('İl değişti:', this.selectedIlId, typeof this.selectedIlId);
    console.log('Mevcut ilçeler:', this.ilceler);
    
    this.selectedIlceId = null;
    this.selectedMahalleId = null;
    this.filteredMahalleler = [];
    
    if (this.selectedIlId) {
      // String'e çevirerek karşılaştır
      this.filteredIlceler = this.ilceler.filter(ilce => ilce.ilId.toString() === this.selectedIlId!.toString());
      console.log('Filtrelenmiş ilçeler:', this.filteredIlceler);
    } else {
      this.filteredIlceler = [];
    }
  }

  onIlceChange(): void {
    this.selectedMahalleId = null;
    
    if (this.selectedIlceId) {
      this.filteredMahalleler = this.mahalleler.filter(mahalle => mahalle.ilceId.toString() === this.selectedIlceId!.toString());
    } else {
      this.filteredMahalleler = [];
    }
  }

  onSubmit(): void {
    // Form validasyonu
    if (!this.selectedMahalleId || !this.ada || !this.parsel || !this.nitelik) {
      this.notificationService.warning('Lütfen tüm zorunlu alanları doldurun!');
      return;
    }

    // Backend'e gönderilecek veri
    const tasinmaz = {
      mahalleId: Number(this.selectedMahalleId),
      ada: Number(this.ada),
      parsel: Number(this.parsel),
      nitelik: this.nitelik,
      koordinatBilgileri: this.koordinat || ''
    };

    console.log('Gönderilen taşınmaz verisi:', tasinmaz);

    // API çağrısı yap
    this.tasinmazService.createTasinmaz(tasinmaz).subscribe({
      next: (response: any) => {
        console.log('Taşınmaz başarıyla eklendi:', response);
        this.notificationService.success('Taşınmaz başarıyla eklendi!');
        this.router.navigate(['/tasinmazlar']);
      },
      error: (error: any) => {
        console.error('Taşınmaz eklenirken hata oluştu:', error);
        if (error.status === 401) {
          this.notificationService.error('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          this.router.navigate(['/login']);
        } else {
          this.notificationService.error('Taşınmaz eklenirken hata oluştu: ' + (error.error?.message || error.message));
        }
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/tasinmazlar']);
  }

  onMapClick(event: MouseEvent): void {
    // Bu fonksiyon artık kullanılmıyor - Google Maps event'i kullanıyoruz
  }

  initMap(): void {
    const mapElement = document.getElementById('map');
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

    // Marker ekleme ve sürükleme
    this.leafletMap.on('click', (e: any) => {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      this.koordinat = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      if (this.marker) {
        this.leafletMap.removeLayer(this.marker);
      }
      this.marker = L.marker([lat, lng], { draggable: true }).addTo(this.leafletMap);
      this.marker.bindPopup('Seçilen Konum').openPopup();
      this.marker.on('dragend', (event: any) => {
        const pos = event.target.getLatLng();
        this.koordinat = `${pos.lat.toFixed(6)}, ${pos.lng.toFixed(6)}`;
      });
    });

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
  }
}
