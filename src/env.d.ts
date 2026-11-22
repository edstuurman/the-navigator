/// <reference types="astro/client" />

interface Window {
  umami?: {
    track: (eventName: string, eventData?: Record<string, string | number | boolean>) => void;
  };
  __umamiQueue?: Array<[string, Record<string, string | number | boolean> | undefined]>;
  __trackUmami?: (eventName: string, eventData?: Record<string, string | number | boolean>) => void;
}
