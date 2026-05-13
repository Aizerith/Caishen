import { effect, Injectable, inject } from '@angular/core';
import { RxStomp } from '@stomp/rx-stomp';
import { rxStompConfigFactory } from './rx-stomp.config';
import { AuthStateService } from '../service/stateService/auth.state.service';

@Injectable({ providedIn: 'root' })
export class RxStompService extends RxStomp {
  private readonly authStateService = inject(AuthStateService);
  private connectedAccessToken: string | null = null;
  private connectionVersion = 0;

  constructor() {
    super();
    this.configure(rxStompConfigFactory());

    effect(() => {
      const { accessToken, loginStatus } = this.authStateService.authState();
      const shouldConnect = loginStatus === 'LOGGED' && !!accessToken;

      if (shouldConnect) {
        this.connectWithToken(accessToken);
      } else {
        this.disconnect();
      }
    });
  }

  private connectWithToken(accessToken: string): void {
    if (this.active && this.connectedAccessToken === accessToken) {
      return;
    }

    this.connectedAccessToken = accessToken;
    const currentConnectionVersion = ++this.connectionVersion;

    if (this.active) {
      this.deactivate().then(() => {
        if (this.connectedAccessToken === accessToken && this.connectionVersion === currentConnectionVersion) {
          this.activate();
        }
      });
      return;
    }

    this.activate();
  }

  private disconnect(): void {
    this.connectedAccessToken = null;
    this.connectionVersion++;

    if (this.active) {
      this.deactivate();
    }
  }
}
