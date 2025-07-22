import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { LoginRequest } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { Router } from '@angular/router';
import { LogService } from '../../services/log.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginData: LoginRequest = {
    Email: '',
    Password: ''
  };

  isLoading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService, 
    private notificationService: NotificationService,
    private router: Router,
    private logService: LogService
  ) {}

  onLogin(form: NgForm) {
    if (form.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.authService.login(this.loginData.Email, this.loginData.Password).subscribe({
        next: (response) => {
          this.isLoading = false;
          // Token bilgisini kaydet
          localStorage.setItem('token', response.token);
          // Rol bilgisini kaydet
          localStorage.setItem('role', response.role);
          // Başarılı giriş sonrası yönlendirme
          this.router.navigate(['/tasinmazlar']);
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = 'E-posta veya şifre yanlış!';
          // Başarısız login logu gönder
          this.logService.addLog({
            id: 0, // Backend id'yi kendisi oluşturuyorsa 0 veya undefined gönderebilirsiniz
            durum: 'Başarısız',
            islemTipi: 'Login',
            aciklama: `Başarısız login denemesi: ${this.loginData.Email}`,
            tarihSaat: new Date().toISOString()
          }).subscribe();
        }
      });
    }
  }

  forgotPassword(event: Event) {
    event.preventDefault();
    if (this.loginData.Email) {
      this.notificationService.info('Şifre sıfırlama bağlantısı ' + this.loginData.Email + ' adresine gönderildi.');
    } else {
      this.notificationService.warning('Lütfen e-posta adresinizi girin.');
    }
  }
}
