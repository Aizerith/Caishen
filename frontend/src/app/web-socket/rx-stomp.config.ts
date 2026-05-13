import { RxStompConfig } from '@stomp/rx-stomp';
import SockJS from 'sockjs-client/dist/sockjs.min.js';
import { environment } from '../../environments/environment';

export function rxStompConfigFactory(): RxStompConfig {
  return {
    webSocketFactory: () => new SockJS(environment.SOCKJS_BROKER_URL),
    beforeConnect: (client) => {
      client.configure({
        connectHeaders: {
          access_token: localStorage.getItem('access_token') || '',
        },
      });
    },
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    reconnectDelay: 2000,
    connectionTimeout: 8000,
  };
}
