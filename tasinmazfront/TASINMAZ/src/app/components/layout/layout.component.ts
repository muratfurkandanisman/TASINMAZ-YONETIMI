import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent {
  constructor(private router: Router, private notificationService: NotificationService) {}

  get role(): string {
    // Örnek: localStorage'dan role bilgisini al
    return localStorage.getItem('role') || '';
  }

  logout() {
    fetch('https://localhost:7022/api/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    .then(async res => {
      if (res.ok) {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        this.notificationService.success('Çıkış başarılı!');
        this.router.navigate(['/login']);
      } else {
        const data = await res.json();
        this.notificationService.error(data.message || 'Çıkış başarısız!');
      }
    })
    .catch(() => {
      this.notificationService.error('Çıkış işlemi sırasında hata oluştu!');
    });
  }
}
