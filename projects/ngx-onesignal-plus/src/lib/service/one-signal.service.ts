import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import {
  OneSignalStub,
  OneSignalOptions,
  OneSignalStubFuncionList,
} from '../interface';

import { BehaviorSubject } from 'rxjs';

declare var OneSignal: OneSignalStub;

// @dynamic
@Injectable({
  providedIn: 'root',
})
export class OneSignalService {
  private scriptinitalize = false;
  private readonly scriptURL = 'https://cdn.onesignal.com/sdks/OneSignalSDK.js';

  private readonly isSubscribe$ = new BehaviorSubject<boolean>(false);
  private readonly isOptedOut$ = new BehaviorSubject<boolean>(false);
  private readonly isPushNotificationsEnabled$ = new BehaviorSubject<boolean>(
    false,
  );

  public readonly isSupported$ = new BehaviorSubject<boolean>(false);
  public get isSupported(): boolean {
    return this.isSupported$.value;
  }

  public get isSubscribe(): boolean {
    return this.isSubscribe$.value;
  }

  public get isInitialized(): boolean {
    return this.scriptinitalize;
  }

  public get isOptedOut(): boolean {
    return this.isOptedOut$.value;
  }

  public subscribe() {
    if (this.isSupported) {
      if (this.isOptedOut$.value) {
        OneSignal.setSubscription(true);
      } else {
        OneSignal.registerForPushNotifications();
      }
    }
  }

  /**
   * call OneSignal.setSubscription(false)
   * @see {@link https://documentation.onesignal.com/docs/web-push-sdk#section--setsubscription-}
   */
  public unsubscribe() {
    if (this.isSubscribe) {
      OneSignal.setSubscription(false);
    }
  }

  public push(method: OneSignalStubFuncionList | any, value?: any) {
    if (this.isSupported) {
      if (typeof method === 'function') {
        return OneSignal.push(method);
      }
      return OneSignal.push([method, value]);
    }
  }

  public pushFn(method: any) {
    if (this.isSupported) {
      return OneSignal.push(method);
    }
  }

  public getTags(callback?: (tags) => void): Promise<any> {
    if (this.isSupported) {
      return OneSignal.getTags(callback);
    }
  }

  public sendTag(key: string, value: string): Promise<any> {
    if (this.isSupported) {
      return OneSignal.sendTag(key, value);
    }
  }

  public sendTags(keyValues: object): Promise<any> {
    if (this.isSupported) {
      return OneSignal.sendTags(keyValues);
    }
  }

  public deleteTag(key: string): Promise<any> {
    if (this.isSupported) {
      return OneSignal.deleteTag(key);
    }
  }

  public deleteTags(keys: Array<string>): Promise<any> {
    if (this.isSupported) {
      return OneSignal.deleteTags(keys);
    }
  }

  public on(fun: string, callback?: (result: any) => void): Promise<any> {
    if (this.isSupported) {
      if (typeof callback === 'function') {
        OneSignal.on(fun, callback);
      } else {
        return new Promise((resolve, reject) => {
          try {
            OneSignal.on(fun, message => {
              return resolve(message);
            });
          } catch (error) {
            reject(error);
          }
        });
      }
    }
  }

  public setExternalUserId(id: string) {
    if (this.isSupported) {
      return OneSignal.setExternalUserId(id);
    }
  }

  public removeExternalUserId() {
    if (this.isSupported) {
      return OneSignal.removeExternalUserId();
    }
  }

  public getExternalUserId() {
    if (this.isSupported) {
      return OneSignal.getExternalUserId();
    }
  }

  constructor(
    @Inject(DOCUMENT) private readonly doc: Document,
    private readonly options: OneSignalOptions,
  ) {
    this.init();
  }

  private async init() {
    try {
      if (!this.scriptinitalize) {
        await this.addScript();
        await this.initOneSignal();
        this.scriptinitalize = true;
      }
    } catch {
      this.scriptinitalize = false;
    }
  }

  private addScript() {
    return new Promise<Event>((resolve, reject) => {
      const head = this.doc.getElementsByTagName('head')[0];
      const script = this.doc.createElement('script');
      script.type = 'text/javascript';
      script.onload = resolve;
      script.onerror = reject;
      script.src = this.scriptURL;
      head.appendChild(script);
    });
  }

  private async initOneSignal() {
    await OneSignal.init({
      ...this.options,
    });

    OneSignal.on('subscriptionChange', isSubscribed => {
      this.isSubscribe$.next(isSubscribed);
    });

    // https://documentation.onesignal.com/docs/web-push-sdk#section-subscription-change
    this.isSupported$.next(await OneSignal.isPushNotificationsSupported());
    this.isPushNotificationsEnabled$.next(
      await OneSignal.isPushNotificationsEnabled(),
    );
    this.isOptedOut$.next(await OneSignal.isOptedOut());

    this.isSubscribe$.next(
      await Promise.all([
        OneSignal.isPushNotificationsEnabled(),
        OneSignal.isOptedOut(),
      ]).then(([hasSubscribe, hasOptedOut]) => hasSubscribe && !hasOptedOut),
    );
  }
}
