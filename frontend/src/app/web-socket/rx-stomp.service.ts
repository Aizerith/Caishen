import { Injectable } from '@angular/core';
import { RxStomp } from '@stomp/rx-stomp';
import { rxStompConfigFactory } from './rx-stomp.config';

@Injectable({ providedIn: 'root' })
export class RxStompService extends RxStomp {
  constructor() {
    super();
    this.configure(rxStompConfigFactory());
    this.activate();
  }
}
