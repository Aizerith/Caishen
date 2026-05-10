import { RxStompConfig } from '@stomp/rx-stomp';
import SockJS from 'sockjs-client/dist/sockjs.min.js';
import { environment } from '../../environments/environment';

export function rxStompConfigFactory(): RxStompConfig {
  return {
    webSocketFactory: () => new SockJS(environment.SOCKJS_BROKER_URL),
    connectHeaders: {
      access_token: localStorage.getItem('access_token') || '',
    },
    heartbeatIncoming: 0,
    heartbeatOutgoing: 20000,
    reconnectDelay: 5000,
  };
}
