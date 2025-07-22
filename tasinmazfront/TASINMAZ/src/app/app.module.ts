import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { GoogleMapsModule } from '@angular/google-maps';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { AnasayfaComponent } from './components/anasayfa/anasayfa.component';
import { TasinmazlarComponent } from './components/tasinmazlar/tasinmazlar.component';
import { LayoutComponent } from './components/layout/layout.component';
import { TasinmazEkleComponent } from './components/tasinmaz-ekle/tasinmaz-ekle.component';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { TasinmazGuncelleComponent } from './components/tasinmaz-guncelle/tasinmaz-guncelle.component';
import { NotificationComponent } from './components/notification/notification.component';
import { KullaniciListesiComponent } from './components/kullanici-listesi/kullanici-listesi.component';
import { LogIslemleriComponent } from './components/log-islemleri/log-islemleri.component';
import { KullaniciEkleComponent } from './components/kullanici-ekle/kullanici-ekle.component';
import { KullaniciGuncelleComponent } from './components/kullanici-guncelle/kullanici-guncelle.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    AnasayfaComponent,
    TasinmazlarComponent,
    LayoutComponent,
    TasinmazEkleComponent,
    TasinmazGuncelleComponent,
    NotificationComponent,
    KullaniciListesiComponent,
    LogIslemleriComponent,
    KullaniciEkleComponent,
    KullaniciGuncelleComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    GoogleMapsModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
