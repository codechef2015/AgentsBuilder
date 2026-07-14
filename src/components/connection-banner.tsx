/**
 * Connection Status Banner — Shows WebSocket/backend connection state
 */

import { Wifi, WifiOff, Loader2 } from 'lucide-react';
import { type ConnectionStatus } from '../lib/websocket-reconnect';

interface ConnectionBannerProps {
  status: ConnectionStatus;
  className?: string;
}

export function ConnectionBanner({ status, className = '' }: ConnectionBannerProps) {
  if (status === 'connected') return null;

  return (
    <div className={`flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-medium ${
      status === 'connecting'
        ? 'bg-amber-50 text-amber-700 border-b border-amber-200'
        : 'bg-red-50 text-red-700 border-b border-red-200'
    } ${className}`}>
      {status === 'connecting' ? (
        <>
          <Loader2 className="w-3 h-3 animate-spin" />
          Reconnecting to backend...
        </>
      ) : (
        <>
          <WifiOff className="w-3 h-3" />
          Connection lost — retrying automatically
        </>
      )}
    </div>
  );
}
