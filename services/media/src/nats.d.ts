declare module 'nats' {
  export interface ConnectionOptions {
    servers?: string | string[];
    timeout?: number;
    maxReconnectAttempts?: number;
    reconnectTimeWait?: number;
    user?: string;
    pass?: string;
    token?: string;
    name?: string;
    verbose?: boolean;
    waitOnFirstConnect?: boolean;
    reconnect?: boolean;
    pedantic?: boolean;
    tls?: any;
    encoding?: BufferEncoding;
  }

  export interface Msg {
    subject: string;
    sid: number;
    reply?: string;
    data: Uint8Array;
    headers?: any;
    respond(data?: Uint8Array | string, opts?: any): void;
  }

  export interface Subscription {
    unsubscribe(): void;
    drain(): Promise<void>;
    isDraining(): boolean;
    isClosed(): boolean;
  }

  export interface Connection {
    publish(subject: string, data?: Uint8Array | string, options?: any): void;
    subscribe(subject: string, opts?: any): Subscription;
    request(subject: string, data?: Uint8Array | string, opts?: any): Promise<Msg>;
    close(): Promise<void>;
    drain(): Promise<void>;
    isClosed(): boolean;
    isDraining(): boolean;
    getServer(): string;
    status(): any;
    jetstream(): any;
  }

  export interface StringCodec {
    encode(data: string): Uint8Array;
    decode(data: Uint8Array): string;
  }

  export function connect(options?: ConnectionOptions): Promise<Connection>;
  export const StringCodec: {
    (): StringCodec;
  };
}