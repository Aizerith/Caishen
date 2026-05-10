import { Injectable } from '@angular/core';
import { RxStompService } from './rx-stomp.service';
import { map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class WebSocketService {
  constructor(private rxStomp: RxStompService) {}

  watchNotifications() {
    return this.rxStomp.watch('/user/queue/notifications').pipe(map((message) => message.body));
  }
}
