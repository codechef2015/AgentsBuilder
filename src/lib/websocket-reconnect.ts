/**
 * WebSocket Reconnect Manager
 * 
 * Auto-reconnects with exponential backoff when connection drops.
 * Provides connection status for UI banner display.
 */

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected';

interface ReconnectOptions {
  url: string;
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  onMessage?: (data: any) => void;
  onStatusChange?: (status: ConnectionStatus) => void;
}

export class WebSocketReconnect {
  private ws: WebSocket | null = null;
  private url: string;
  private maxRetries: number;
  private initialDelay: number;
  private maxDelay: number;
  private retryCount = 0;
  private status: ConnectionStatus = 'disconnected';
  private onMessage?: (data: any) => void;
  private onStatusChange?: (status: ConnectionStatus) => void;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private destroyed = false;

  constructor(options: ReconnectOptions) {
    this.url = options.url;
    this.maxRetries = options.maxRetries ?? 10;
    this.initialDelay = options.initialDelay ?? 1000;
    this.maxDelay = options.maxDelay ?? 30000;
    this.onMessage = options.onMessage;
    this.onStatusChange = options.onStatusChange;
  }

  connect() {
    if (this.destroyed) return;
    this.setStatus('connecting');

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this.retryCount = 0;
        this.setStatus('connected');
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.onMessage?.(data);
        } catch {
          this.onMessage?.(event.data);
        }
      };

      this.ws.onclose = () => {
        if (!this.destroyed) {
          this.setStatus('disconnected');
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = () => {
        this.ws?.close();
      };
    } catch {
      this.setStatus('disconnected');
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.destroyed || this.retryCount >= this.maxRetries) return;

    const delay = Math.min(
      this.initialDelay * Math.pow(2, this.retryCount),
      this.maxDelay
    );

    this.reconnectTimer = setTimeout(() => {
      this.retryCount++;
      this.connect();
    }, delay);
  }

  private setStatus(status: ConnectionStatus) {
    this.status = status;
    this.onStatusChange?.(status);
  }

  getStatus(): ConnectionStatus {
    return this.status;
  }

  send(data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(typeof data === 'string' ? data : JSON.stringify(data));
      return true;
    }
    return false;
  }

  destroy() {
    this.destroyed = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.ws?.close();
    this.ws = null;
  }
}
