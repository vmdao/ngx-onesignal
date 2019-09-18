import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgxOneSignalModule } from '../../dist/ngx-onesignal';
import { AppComponent } from './app.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';

@NgModule({
  declarations: [AppComponent],
  imports: [
    NgxOneSignalModule.forRoot({
      appId: '31c6b7b7-e2ad-4039-953e-e8f73f0f7e1c',
      allowLocalhostAsSecureOrigin: true,
      autoResubscribe: true,
    }),
    BrowserModule,
    ServiceWorkerModule.register('OneSignalSDKWorker.js', {
      enabled: environment.production,
    }),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
