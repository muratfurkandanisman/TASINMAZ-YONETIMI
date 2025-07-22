import { Component, OnInit, NgZone } from '@angular/core';
import * as L from 'leaflet';
import { IlService } from '../../services/il.service';
import { IlceService } from '../../services/ilce.service';
import { MahalleService } from '../../services/mahalle.service';
import { TasinmazService } from '../../services/tasinmaz.service';
import { NotificationService } from '../../services/notification.service';
import { Router, ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-tasinmaz-guncelle',
  templateUrl: './tasinmaz-guncelle.component.html',
  styleUrls: ['./tasinmaz-guncelle.component.css']
})
export class TasinmazGuncelleComponent implements OnInit {
  iller: any[] = [];
  ilceler: any[] = [];
  mahalleler: any[] = [];
  
  // Filtered lists for cascade dropdowns
  filteredIlceler: any[] = [];
  filteredMahalleler: any[] = [];
  
  // Form data
  tasinmazId: number = 0;
  selectedIlId: number | null = null;
  selectedIlceId: number | null = null;
  selectedMahalleId: number | null = null;
  ada: number | null = null;
  parsel: number | null = null;
  nitelik: string = '';
  koordinatBilgileri?: string;
  koordinat: string = '';
  private leafletMap: any = null;
  private marker: any = null;

  constructor(
    private ilService: IlService,
    private ilceService: IlceService,
    private mahalleService: MahalleService,
    private tasinmazService: TasinmazService,
    private notificationService: NotificationService,
    private router: Router,
    private route: ActivatedRoute,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.tasinmazId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadData();
    setTimeout(() => this.initMap(), 500);
  }

  initMap(): void {
    const mapElement = document.getElementById('map');
    if (!mapElement) return;
    let center: [number, number] = [39.9334, 32.8597];
    if (this.koordinat) {
      const coords = this.koordinat.split(',');
      if (coords.length === 2) {
        center = [parseFloat(coords[0]), parseFloat(coords[1])];
      }
    }
    // Harita nesnesi oluşturuluyor
    this.leafletMap = L.map(mapElement).setView(center, 10);
    // Katmanlar
    const normalLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      opacity: 1
    });
    // Sağ alt köşeye ölçek kontrolü ekle
    L.control.scale({ position: 'bottomright', imperial: false }).addTo(this.leafletMap);
    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles © Esri',
      opacity: 1
    });
    const baseLayers = {
      'Normal': normalLayer,
      'Uydu': satelliteLayer
    };
    normalLayer.addTo(this.leafletMap);
    L.control.layers(baseLayers).addTo(this.leafletMap);

    // Marker ekleme ve sürükleme
    if (this.koordinat && center) {
      this.addMarker(center);
    }
    this.leafletMap.on('click', (e: any) => {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      this.ngZone.run(() => {
        this.koordinat = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      });
      this.addMarker([lat, lng]);
    });

    // Opaklık sidebarı
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
      // Sidebar'da haritaya tıklama ve sürükleme olaylarını engelle
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

  addMarker(coords: [number, number]) {
    if (this.marker) {
      this.leafletMap.removeLayer(this.marker);
    }
    this.marker = L.marker(coords, { draggable: true }).addTo(this.leafletMap);
    this.marker.on('dragend', (event: any) => {
      const latlng = event.target.getLatLng();
      this.ngZone.run(() => {
        this.koordinat = `${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}`;
      });
    });
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
      
      // Taşınmazı bulmak için önce tüm taşınmazları al
      this.findAndPopulateTasinmaz();
    });
  }

  findAndPopulateTasinmaz(): void {
    // Admin ise tüm taşınmazları, User ise kendi taşınmazlarını al
    const role = localStorage.getItem('role');
    const getTasinmazlar$ = role === 'Admin' 
      ? this.tasinmazService.getTasinmazlar()
      : this.tasinmazService.getMyTasinmazlar();

    getTasinmazlar$.subscribe(tasinmazlar => {
      const tasinmaz = tasinmazlar.find(t => t.tasinmazId === this.tasinmazId);
      if (tasinmaz) {
        this.populateForm(tasinmaz);
      } else {
        this.notificationService.error('Taşınmaz bulunamadı!');
        this.router.navigate(['/tasinmazlar']);
      }
    });
  }

  populateForm(tasinmaz: any): void {
    this.ada = tasinmaz.ada;
    this.parsel = tasinmaz.parsel;
    this.nitelik = tasinmaz.nitelik;
    this.selectedMahalleId = tasinmaz.mahalleId;
    this.koordinatBilgileri = tasinmaz.koordinatBilgileri;
    if (tasinmaz.koordinatBilgileri) {
      this.koordinat = tasinmaz.koordinatBilgileri;
    }
    const mahalle = this.mahalleler.find(m => m.mahalleId === tasinmaz.mahalleId);
    if (mahalle) {
      this.selectedIlceId = mahalle.ilceId;
      this.filteredMahalleler = this.mahalleler.filter(m => m.ilceId === mahalle.ilceId);
      const ilce = this.ilceler.find(i => i.ilceId === mahalle.ilceId);
      if (ilce) {
        this.selectedIlId = ilce.ilId;
        this.filteredIlceler = this.ilceler.filter(i => i.ilId === ilce.ilId);
      }
    }
    setTimeout(() => this.initMap(), 500);
  }

  onIlChange(): void {
    this.selectedIlceId = null;
    this.selectedMahalleId = null;
    this.filteredMahalleler = [];
    
    if (this.selectedIlId) {
      this.filteredIlceler = this.ilceler.filter(ilce => ilce.ilId.toString() === this.selectedIlId!.toString());
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
    if (!this.selectedMahalleId || !this.ada || !this.parsel || !this.nitelik) {
      this.notificationService.warning('Lütfen tüm zorunlu alanları doldurun!');
      return;
    }

    this.koordinatBilgileri = this.koordinat;

    const tasinmaz = {
      mahalleId: Number(this.selectedMahalleId),
      ada: Number(this.ada),
      parsel: Number(this.parsel),
      nitelik: this.nitelik,
      koordinatBilgileri: this.koordinatBilgileri
    };

    this.tasinmazService.updateTasinmaz(this.tasinmazId, tasinmaz).subscribe({
      next: (response: any) => {
        this.notificationService.success('Taşınmaz başarıyla güncellendi!');
        this.router.navigate(['/tasinmazlar']);
      },
      error: (error: any) => {
        if (error.status === 401) {
          this.notificationService.error('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          this.router.navigate(['/login']);
        } else {
          this.notificationService.error('Taşınmaz güncellenirken hata oluştu: ' + (error.error?.message || error.message));
        }
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/tasinmazlar']);
  }
}