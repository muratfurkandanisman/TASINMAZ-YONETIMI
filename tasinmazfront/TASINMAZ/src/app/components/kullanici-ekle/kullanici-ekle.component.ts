import { Component } from '@angular/core';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-kullanici-ekle',
  templateUrl: './kullanici-ekle.component.html',
  styleUrls: ['./kullanici-ekle.component.css']
})
export class KullaniciEkleComponent {
  yeniKullanici = {
    fullName: '',
    email: '',
    password: '',
    role: 'User'
  };
  submitting = false;
  successMessage = '';
  errorMessage = '';

  constructor(private userService: UserService) {}

  onSubmit(form: NgForm) {
    if (form.invalid) return;
    this.submitting = true;
    this.successMessage = '';
    this.errorMessage = '';
    this.userService.createUser(this.yeniKullanici).subscribe({
      next: () => {
        this.submitting = false;
        this.successMessage = 'Kullanıcı başarıyla eklendi!';
        form.resetForm({ role: 'User' });
      },
      error: (err) => {
        this.submitting = false;
        this.errorMessage = 'Kullanıcı eklenirken hata oluştu!';
      }
    });
  }
}
