import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-kullanici-guncelle',
  templateUrl: './kullanici-guncelle.component.html',
  styleUrls: ['./kullanici-guncelle.component.css']
})
export class KullaniciGuncelleComponent implements OnInit {
  passwordError = '';
  guncellenecekKullanici = {
    userId: 0,
    fullName: '',
    email: '',
    password: '',
    role: 'User'
  };
  submitting = false;
  successMessage = '';
  errorMessage = '';
  showPasswordInput = false;
  eskiParola = '';
  mevcutParola = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.userService.getUsers().subscribe(users => {
        const user = users.find(u => u.userId == +id);
        if (user) {
          this.guncellenecekKullanici = { ...user, password: '' };
          this.eskiParola = '';
          this.mevcutParola = this.eskiParola || '';
        }
      });
    }
  }

  enablePasswordInput() {
    this.showPasswordInput = true;
    this.guncellenecekKullanici.password = '';
  }

  onSubmit(form: any) {
    this.passwordError = '';
    // Şifre inputu açıksa ve yeni şifre girildiyse validasyon yap
    if (this.showPasswordInput) {
      const password = this.guncellenecekKullanici.password;
      if (password) {
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
        if (!passwordRegex.test(password)) {
          this.passwordError = 'Şifre en az 8 karakterli, en az 1 harf, 1 sayı ve 1 özel karakter içermelidir.';
          return;
        }
      } else {
        // Şifre boşsa eski şifreyi ata
        this.guncellenecekKullanici.password = this.mevcutParola;
      }
    }
    if (form.valid && !this.passwordError) {
      this.submitting = true;
      this.successMessage = '';
      this.errorMessage = '';
      if (!this.showPasswordInput) {
        this.guncellenecekKullanici.password = this.mevcutParola;
      }
      this.userService.updateUser(this.guncellenecekKullanici).subscribe({
        next: () => {
          this.successMessage = 'Kullanıcı başarıyla güncellendi!';
          this.submitting = false;
          this.notificationService.show('Kullanıcı başarıyla güncellendi!', 'success');
          this.router.navigate(['/kullanici-listesi']);
        },
        error: () => {
          this.errorMessage = 'Kullanıcı güncellenirken hata oluştu!';
          this.submitting = false;
        }
      });
    }
  }
}
