import { EventEmitter } from 'events';
import WebSocket from 'ws';

import { ClientState, ClientError, ClientEvent } from '../enums';

export class PolygonWebsocket extends EventEmitter {
  private _apiKey: string;

  reconnectDisabled = true;
  authenticating = false;
  connectCalled = false;
  channels: string[] = [];
  conn!: WebSocket;

  constructor(apiKey: string, public session: any) {
    super();

    this._apiKey = apiKey;
  }
  connect(initialChannels: string[]) {
    this.channels = initialChannels;
    this.reconnectDisabled = false;
    this.connectCalled = true;
    this.emit(ClientState.Connecting);
    this.conn = new WebSocket('wss://alpaca.socket.polygon.io/stocks');
    this.on(ClientState.Connected, () => {
      this.subscribe(initialChannels);
    });
    this.conn.once('open', () => {
      this.authenticate();
    });
    this.conn.on('message', data => this.handleMessage(data));
    this.conn.once('error', err => {
      this.emit(ClientError.ConnectionRefused);
    });
    this.conn.once('close', () => {
      this.emit(ClientState.Disconnected);
      if (this.session.reconnect && !this.reconnectDisabled) {
        this.reconnect();
      }
    });
  }

  handleMessage(data) {
    // Heartbeat
    const bytes = new Uint8Array(data);
    if (bytes.length === 1 && bytes[0] === 1) {
      return;
    }
    const messageArray = JSON.parse(data);
    messageArray.forEach(message => {
      const subject = message.ev;
      switch (subject) {
        case 'status':
          switch (message.status) {
            case 'auth_success':
              this.emit(ClientState.Connected);
              this.authenticating = false;
              break;
            case 'auth_failed':
              this.emit(ClientError.BadKeyOrSecret);
              this.authenticating = false;
              this.close();
              break;
          }
          break;
        case 'Q':
          this.emit(ClientEvent.StockQuotes, subject, data);
          break;
        case 'T':
          this.emit(ClientEvent.StockTrades, subject, data);
          break;
        case 'A':
          this.emit(ClientEvent.StockAggSec, subject, data);
          break;
        case 'AM':
          this.emit(ClientEvent.StockAggMin, subject, data);
          break;
        default:
          /**
           * @todo
           */
          this.emit(ClientError.Protobuf);
      }
    });
  }
  send(data) {
    this.conn.send(data);
  }
  authenticate() {
    this.authenticating = true;
    this.emit(ClientState.Authenticating);

    const authMsg = {
      action: 'auth',
      params: this._apiKey,
    };
    this.send(JSON.stringify(authMsg));
  }
  subscribe(topics: string[]) {
    const subMsg = {
      action: 'subscribe',
      params: topics.join(','),
    };
    this.send(JSON.stringify(subMsg));
    this.channels = this.channels.concat(topics);
  }
  unsubscribe(topics: string[]) {
    const subMsg = {
      action: 'unsubscribe',
      params: topics.join(','),
    };
    console.log(JSON.stringify(subMsg));
    this.send(JSON.stringify(subMsg));
    this.channels = this.channels.filter(e => topics.indexOf(e) === -1);
  }
  close() {
    this.connectCalled = false;
    this.reconnectDisabled = true;
    if (this.conn) {
      this.conn.close();
    }
  }
  reconnect() {
    console.log('Attempting Polygon websocket reconnection...');
    setTimeout(() => {
      if (this.session.backoff) {
        this.session.reconnectTimeout += this.session.backoffIncrement;
        if (this.session.reconnectTimeout > this.session.maxReconnectTimeout) {
          this.session.reconnectTimeout = this.session.maxReconnectTimeout;
        }
      }
      this.connect(this.channels);
    }, this.session.reconnectTimeout * 1000);
    this.emit(ClientState.WaitingToReconnect, this.session.reconnectTimeout);
  }
}
