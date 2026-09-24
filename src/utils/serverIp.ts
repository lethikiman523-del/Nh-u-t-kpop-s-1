import { useState, useEffect } from 'react';

export interface ServerInfo {
  status: string;
  port: number;
  ips: string[];
  primaryIp: string;
  timestamp: number;
}

const CUSTOM_BASE_URL_KEY = 'kpop_game_custom_base_url';

export function getCustomBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(CUSTOM_BASE_URL_KEY) || '';
  }
  return '';
}

export function setCustomBaseUrl(url: string) {
  if (typeof window !== 'undefined') {
    if (url.trim()) {
      localStorage.setItem(CUSTOM_BASE_URL_KEY, url.trim().replace(/\/+$/, ''));
    } else {
      localStorage.removeItem(CUSTOM_BASE_URL_KEY);
    }
  }
}

/**
 * Returns the best accessible base URL for external devices (phones/tablets/other PCs).
 * 1. Custom URL override if set (e.g. ngrok, localtunnel, Cloudflare tunnel)
 * 2. Primary LAN IP detected from server if current location is localhost/127.0.0.1 or Google AI Studio preview domain (.run.app)
 * 3. Fall back to current window.location.origin
 */
export function getAppBaseUrl(serverInfo?: ServerInfo | null): string {
  if (typeof window === 'undefined') return '';

  const custom = getCustomBaseUrl();
  if (custom) {
    return custom;
  }

  const hostname = window.location.hostname;
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0';
  const isAiStudioProxy =
    hostname.includes('.run.app') ||
    hostname.includes('google.com') ||
    hostname.includes('googleusercontent.com') ||
    hostname.includes('cloudworkstations.dev');

  if ((isLocalhost || isAiStudioProxy) && serverInfo && serverInfo.primaryIp) {
    const port = serverInfo.port || 3000;
    return `http://${serverInfo.primaryIp}:${port}`;
  }

  return window.location.origin;
}

export function useServerInfo() {
  const [serverInfo, setServerInfo] = useState<ServerInfo | null>(null);

  useEffect(() => {
    fetch('/api/server-info')
      .then((res) => res.json())
      .then((data: ServerInfo) => {
        if (data && data.ips) {
          setServerInfo(data);
        }
      })
      .catch((err) => {
        console.warn('Could not fetch server-info:', err);
      });
  }, []);

  return serverInfo;
}
