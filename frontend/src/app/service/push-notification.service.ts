import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SwPush } from '@angular/service-worker';
import { environment } from '../../environments/environment';
import { catchError, firstValueFrom, Observable, of } from 'rxjs';

interface PushPublicKeyResponse {
  enabled: boolean;
  publicKey: string;
}

interface PushSubscriptionPayload {
  endpoint: string;
  p256dh: string;
  auth: string;
}

@Injectable({ providedIn: 'root' })
export class PushNotificationService {
  private readonly http = inject(HttpClient);
  private readonly swPush = inject(SwPush);
  private readonly baseUrl = environment.API_URL;
  private readonly storageKey = 'push_notifications_enabled';
  private readonly publicKeyStorageKey = 'push_notifications_public_key';

  readonly isEnabled = signal(localStorage.getItem(this.storageKey) === 'true');
  readonly isSupported = signal(this.swPush.isEnabled && 'Notification' in window);
  readonly isConfigured = signal(false);

  async init(): Promise<void> {
    const config = await this.getPublicKey();
    this.isConfigured.set(config.enabled);

    if (!this.isSupported() || !config.enabled) {
      this.isEnabled.set(false);
      return;
    }

    const subscription = await firstValueFrom(this.swPush.subscription.pipe(catchError(() => of(null))));
    if (subscription && localStorage.getItem(this.publicKeyStorageKey) !== config.publicKey) {
      await subscription.unsubscribe();
      localStorage.setItem(this.storageKey, 'false');
      this.isEnabled.set(false);
      return;
    }

    if (subscription && localStorage.getItem(this.storageKey) === 'true') {
      await this.registerSubscription(subscription);
    }

    this.isEnabled.set(!!subscription && localStorage.getItem(this.storageKey) === 'true');
  }

  async enable(): Promise<void> {
    const config = await this.getPublicKey();
    this.isConfigured.set(config.enabled);

    if (!this.isSupported() || !config.enabled) {
      this.isEnabled.set(false);
      return;
    }

    const existingSubscription = await firstValueFrom(this.swPush.subscription.pipe(catchError(() => of(null))));
    if (existingSubscription) {
      await existingSubscription.unsubscribe();
    }

    const subscription = await this.swPush.requestSubscription({ serverPublicKey: config.publicKey });
    await this.registerSubscription(subscription);
    localStorage.setItem(this.storageKey, 'true');
    localStorage.setItem(this.publicKeyStorageKey, config.publicKey);
    this.isEnabled.set(true);
  }

  async disable(): Promise<void> {
    const subscription = await firstValueFrom(this.swPush.subscription.pipe(catchError(() => of(null))));

    if (subscription) {
      await firstValueFrom(
        this.http.delete<void>(`${this.baseUrl}/push/subscriptions`, {
          body: { endpoint: subscription.endpoint },
        }),
      );
      await subscription.unsubscribe();
    }

    localStorage.setItem(this.storageKey, 'false');
    this.isEnabled.set(false);
  }

  messages(): Observable<object> {
    return this.swPush.messages;
  }

  private async getPublicKey(): Promise<PushPublicKeyResponse> {
    return firstValueFrom(
      this.http
        .get<PushPublicKeyResponse>(`${this.baseUrl}/push/public-key`)
        .pipe(catchError(() => of({ enabled: false, publicKey: '' }))),
    );
  }

  private async registerSubscription(subscription: PushSubscription): Promise<void> {
    await firstValueFrom(this.http.post<void>(`${this.baseUrl}/push/subscriptions`, this.toPayload(subscription)));
  }

  private toPayload(subscription: PushSubscription): PushSubscriptionPayload {
    const json = subscription.toJSON();
    return {
      endpoint: subscription.endpoint,
      p256dh: json.keys?.['p256dh'] ?? '',
      auth: json.keys?.['auth'] ?? '',
    };
  }
}
