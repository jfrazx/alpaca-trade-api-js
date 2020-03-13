import { EventEmitter } from 'events';
import WebSocket from 'ws';

import { ClientError, ClientEvent, ClientState } from '../enums';
import { PolygonWebsocket } from './polygonWebsocket';

// Listeners
// A client can listen on any of the following events, states, or errors
// Connection states. Each of these will also emit ClientEvent.StateChange

// Connection errors Each of these will also emit ClientEvent.ERROR

interface IAlpacaStreamClient {
  subscriptions: string[];
  reconnect: boolean;
  backoff: boolean;
  reconnectTimeout: number;
  maxReconnectTimeout: number;
  backoffIncrement: number;
  verbose: boolean;
}

interface AlpacaStreamClientOptions {
  subscriptions?: string[];
  reconnect?: boolean;
  backoff?: boolean;
  reconnectTimeout?: number;
  maxReconnectTimeout?: number;
  backoffIncrement?: number;
  verbose?: boolean;
  url: string;
  apiKey: string;
  secretKey: string;
  oauth?: string;
}

type WebsocketSession = AlpacaStreamClientOptions & IAlpacaStreamClient;

/**
 * AlpacaStreamClient manages a connection to Alpaca's websocket api
 */
export class AlpacaStreamClient extends EventEmitter {
  private defaultOptions: IAlpacaStreamClient;
  private session: WebsocketSession;
  currentState: string;
  subscriptionState: { [key: string]: boolean } = {};
  reconnectDisabled: boolean = true;
  polygon: PolygonWebsocket;
  conn: WebSocket;

  constructor(opts: AlpacaStreamClientOptions) {
    super();
    this.defaultOptions = {
      // A list of subscriptions to subscribe to on connection
      subscriptions: [],
      // Whether the library should reconnect automatically
      reconnect: true,
      // Reconnection backoff: if true, then the reconnection time will be initially
      // reconnectTimeout, then will double with each unsuccessful connection attempt.
      // It will not exceed maxReconnectTimeout
      backoff: true,
      // Initial reconnect timeout (seconds) a minimum of 1 will be used if backoff=false
      reconnectTimeout: 0,
      // The maximum amount of time between reconnect tries (applies to backoff)
      maxReconnectTimeout: 30,
      // The amount of time to increment the delay between each reconnect attempt
      backoffIncrement: 0.5,
      // If true, client outputs detailed log messages
      verbose: false,
    };
    // Set minimum reconnectTimeout of 1s if backoff=false
    if (!opts.backoff && (opts.reconnectTimeout || 0) < 1) {
      opts.reconnectTimeout = 1;
    }
    // Merge supplied options with defaults
    this.session = { ...this.defaultOptions, ...opts };

    this.session.url = this.session.url.replace(/^http/, 'ws') + '/stream';
    if (this.session.apiKey.length === 0 && this.session.oauth.length === 0) {
      throw new Error(ClientError.MissingApiKey);
    }
    if (
      this.session.secretKey.length === 0 &&
      this.session.oauth.length === 0
    ) {
      throw new Error(ClientError.MissingSecretKey);
    }
    // Keep track of subscriptions in case we need to reconnect after the client
    // has called subscribe()

    this.session.subscriptions.forEach(x => (this.subscriptionState[x] = true));
    this.currentState = ClientState.WaitingToConnect;
    // Register internal event handlers
    // Log and emit every state change
    Object.values(ClientState).forEach(value => {
      this.on(value, () => {
        this.currentState = value;
        this.log('info', `state change: ${value}`);
        this.emit(ClientEvent.StateChange, value);
      });
    });
    // Log and emit every error
    Object.values(ClientError).forEach(value => {
      this.on(value, () => {
        this.log('error', value);
        this.emit(ClientEvent.ClientError, value);
      });
    });
    // Create Polygon event emitter for callback registration
    this.polygon = new PolygonWebsocket(this.session.apiKey, this.session);
  }

  connect() {
    // Reset reconnectDisabled since the user called connect() again
    this.reconnectDisabled = false;
    this.emit(ClientState.Connecting);
    this.conn = new WebSocket(this.session.url);
    this.conn.once('open', () => this.authenticate());
    this.conn.on('message', data => this.handleMessage(data));
    this.conn.once('error', err =>
      this.emit(ClientError.ConnectionRefused, err),
    );
    this.conn.once('close', () => {
      this.emit(ClientState.Disconnected);
      if (this.session.reconnect && !this.reconnectDisabled) {
        this.reconnect();
      }
    });
  }

  private _ensure_polygon(channels) {
    if (this.polygon.connectCalled) {
      if (channels) {
        this.polygon.subscribe(channels);
      }
      return;
    }
    this.polygon.connect(channels);
  }

  private _unsubscribe_polygon(channels) {
    if (this.polygon.connectCalled) {
      if (channels) {
        this.polygon.unsubscribe(channels);
      }
    }
  }

  subscribe(keys: string[]) {
    const wsChannels: string[] = [];
    const polygonChannels: string[] = [];
    keys.forEach(key => {
      const poly = ['Q.', 'T.', 'A.', 'AM.'];
      const found = poly.filter(channel => key.startsWith(channel));
      if (found.length > 0) {
        polygonChannels.push(key);
      } else {
        wsChannels.push(key);
      }
    });
    if (wsChannels.length > 0) {
      const subMsg = {
        action: 'listen',
        data: {
          streams: wsChannels,
        },
      };
      this.send(JSON.stringify(subMsg));
    }
    if (polygonChannels.length > 0) {
      this._ensure_polygon(polygonChannels);
    }
    keys.forEach(x => {
      this.subscriptionState[x] = true;
    });
  }

  unsubscribe(keys: string[]) {
    // Currently, only Polygon channels can be unsubscribed from
    const polygonChannels: string[] = [];
    keys.forEach(key => {
      const poly = ['Q.', 'T.', 'A.', 'AM.'];
      const found = poly.filter(channel => key.startsWith(channel));

      if (found.length > 0) {
        polygonChannels.push(key);
      }
    });
    if (polygonChannels.length > 0) {
      this._unsubscribe_polygon(polygonChannels);
    }
    keys.forEach(x => {
      this.subscriptionState[x] = false;
    });
  }

  subscriptions(): string[] {
    return Object.keys(this.subscriptionState);
  }

  onConnect(fn) {
    this.on(ClientState.Connected, fn);
  }

  onDisconnect(fn) {
    this.on(ClientState.Disconnected, fn);
  }

  onStateChange(fn) {
    this.on(ClientEvent.StateChange, fn);
  }

  onError(fn) {
    this.on(ClientEvent.ClientError, fn);
  }

  onOrderUpdate(fn) {
    this.on(ClientEvent.OrderUpdate, fn);
  }

  onAccountUpdate(fn) {
    this.on(ClientEvent.AccountUpdate, fn);
  }

  onPolygonConnect(fn) {
    this.polygon.on(ClientState.Connected, fn);
  }

  onPolygonDisconnect(fn) {
    this.polygon.on(ClientState.Disconnected, fn);
  }

  onStockTrades(fn) {
    this.polygon.on(ClientEvent.StockTrades, fn);
  }

  onStockQuotes(fn) {
    this.polygon.on(ClientEvent.StockQuotes, fn);
  }

  onStockAggSec(fn) {
    this.polygon.on(ClientEvent.StockAggSec, fn);
  }

  onStockAggMin(fn) {
    this.polygon.on(ClientEvent.StockAggMin, fn);
  }

  send(data) {
    this.conn.send(data);
  }

  disconnect() {
    this.reconnectDisabled = true;
    this.conn.close();
    if (this.polygon) {
      this.polygon.close();
    }
  }

  state() {
    return this.currentState;
  }

  get(key: string) {
    return this.session[key];
  }

  reconnect() {
    setTimeout(() => {
      if (this.session.backoff) {
        this.session.reconnectTimeout += this.session.backoffIncrement;
        if (this.session.reconnectTimeout > this.session.maxReconnectTimeout) {
          this.session.reconnectTimeout = this.session.maxReconnectTimeout;
        }
      }
      this.connect();
    }, this.session.reconnectTimeout * 1000);
    this.emit(ClientState.WaitingToReconnect, this.session.reconnectTimeout);
  }

  authenticate() {
    this.emit(ClientState.Authenticating);

    const authMsg = {
      action: 'authenticate',
      data: {
        key_id: this.session.apiKey,
        secret_key: this.session.secretKey,
      },
    };
    this.send(JSON.stringify(authMsg));
  }
  /**
   * @todo Protobuf
   *
   * @param {*} data
   * @returns
   * @memberof AlpacaStreamClient
   */
  handleMessage(data) {
    // Heartbeat
    const bytes = new Uint8Array(data);
    if (bytes.length === 1 && bytes[0] === 1) {
      return;
    }
    const message = JSON.parse(data);
    switch (message.stream) {
      case 'authorization':
        this.authResultHandler(message.data.status);
        break;
      case 'listening':
        this.log(`listening to the streams: ${message.data.streams}`);
        break;
      case 'trade_updates':
        this.emit(ClientEvent.OrderUpdate, message.data);
        break;
      case 'account_updates':
        this.emit(ClientEvent.AccountUpdate, message.data);
        break;
      default:
        this.emit(ClientError.Protobuf);
    }
  }

  authResultHandler(authResult: string) {
    switch (authResult) {
      case 'authorized':
        this.emit(ClientState.Connected);
        break;
      case 'unauthorized':
        this.emit(ClientError.BadKeyOrSecret);
        this.disconnect();
        break;
      default:
        break;
    }
  }

  log(level: string, ...msg: any[]) {
    if (this.session.verbose) {
      console[level](...msg);
    }
  }
}
