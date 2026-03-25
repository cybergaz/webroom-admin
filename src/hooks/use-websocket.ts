"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { API_BASE_URL } from "@/lib/constants";

export interface WsEvent {
  event: string;
  data?: Record<string, unknown>;
}

interface UseWebSocketOptions {
  token: string | null;
  onEvent?: (event: WsEvent) => void;
}

export function useWebSocket({ token, onEvent }: UseWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  const connect = useCallback(() => {
    if (!token) return;

    const wsUrl = `${API_BASE_URL.replace(/^http/, "ws")}/v1/ws?token=${token}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      setIsConnected(true);
      // Start ping interval
      const pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ event: "ws.ping" }));
        }
      }, 30000);

      ws.addEventListener("close", () => clearInterval(pingInterval));
    };

    ws.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data) as WsEvent;
        onEventRef.current?.(parsed);
      } catch {
        // ignore unparseable messages
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      // Auto-reconnect after 3 seconds
      reconnectTimeoutRef.current = setTimeout(connect, 3000);
    };

    ws.onerror = () => {
      ws.close();
    };

    wsRef.current = ws;
  }, [token]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      wsRef.current?.close();
    };
  }, [connect]);

  const send = useCallback((event: string, data?: Record<string, unknown>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ event, data }));
    }
  }, []);

  return { isConnected, send };
}
