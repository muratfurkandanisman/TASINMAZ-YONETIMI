import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { LoginComponent } from './components/login/login.component';
import { AnasayfaComponent } from './components/anasayfa/anasayfa.component';
import { LayoutComponent } from './components/layout/layout.component';
import { TasinmazlarComponent } from './components/tasinmazlar/tasinmazlar.component';
import { TasinmazEkleComponent } from './components/tasinmaz-ekle/tasinmaz-ekle.component';
import { TasinmazGuncelleComponent } from './components/tasinmaz-guncelle/tasinmaz-guncelle.component';
import { KullaniciListesiComponent } from './components/kullanici-listesi/kullanici-listesi.component';
import { LogIslemleriComponent } from './components/log-islemleri/log-islemleri.component';
import { KullaniciEkleComponent } from './components/kullanici-ekle/kullanici-ekle.component';
import { KullaniciGuncelleComponent } from './components/kullanici-guncelle/kullanici-guncelle.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: 'anasayfa', component: AnasayfaComponent, canActivate: [AuthGuard] },
      { path: 'tasinmazlar', component: TasinmazlarComponent, canActivate: [AuthGuard] },
      { path: 'tasinmaz-ekle', component: TasinmazEkleComponent, canActivate: [AuthGuard] },
      { path: 'tasinmaz-guncelle/:id', component: TasinmazGuncelleComponent, canActivate: [AuthGuard] },
      { path: 'kullanici-listesi', component: KullaniciListesiComponent, canActivate: [AuthGuard] },
      { path: 'log-islemleri', component: LogIslemleriComponent, canActivate: [AuthGuard] },
      { path: 'kullanici-ekle', component: KullaniciEkleComponent, canActivate: [AuthGuard] },
      { path: 'kullanici-guncelle/:id', component: KullaniciGuncelleComponent, canActivate: [AuthGuard] }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }