import { Component, OnInit } from '@angular/core';
import { OneSignalService } from '../../dist/ngx-onesignal';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  constructor(private onesignal: OneSignalService) {
    // tslint:disable-next-line:no-angle-bracket-type-assertion
    (<any>window).ngxOnesignal = onesignal;
  }
  ngOnInit() {
    this.onesignal.isSupported$.subscribe(value => {
      if (value) {
        const now = Date.now() + '';
        console.log('now', now);
        this.onesignal.sendTag('id', now);
        this.onesignal.on('notificationDisplay', d => {
          console.log('notificationDisplay ', d);
        });
        this.onesignal.on('notificationDismiss', d => {
          console.log('notificationDismiss ', d);
        });
        this.onesignal.on('addListenerForNotificationOpened', d => {
          console.log('addListenerForNotificationOpened ', d);
        });
      }
    });
  }
  onSubscribe() {
    this.onesignal.subscribe();
  }

  onUnSubscribe() {
    this.onesignal.unsubscribe();
  }
}
