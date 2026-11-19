/**
 * Progressive-enhancement CloudFront edge POP detector.
 * Maps 3-letter IATA airport codes from the `x-amz-cf-pop` response header
 * to human-readable city names for the `#edge-telemetry` indicator.
 */
export const EDGE_POP_CITIES: Record<string, string> = {
  // APAC
  NRT: 'Tokyo',
  HND: 'Tokyo',
  KIX: 'Osaka',
  OKA: 'Okinawa',
  ICN: 'Seoul',
  HKG: 'Hong Kong',
  TPE: 'Taipei',
  SIN: 'Singapore',
  KUL: 'Kuala Lumpur',
  BKK: 'Bangkok',
  CGK: 'Jakarta',
  MNL: 'Manila',
  DEL: 'New Delhi',
  BOM: 'Mumbai',
  MAA: 'Chennai',
  HYD: 'Hyderabad',
  CCU: 'Kolkata',
  BLR: 'Bengaluru',
  SYD: 'Sydney',
  MEL: 'Melbourne',
  BNE: 'Brisbane',
  PER: 'Perth',
  AKL: 'Auckland',

  // Americas
  IAD: 'Virginia',
  EWR: 'Newark',
  JFK: 'New York',
  BOS: 'Boston',
  ATL: 'Atlanta',
  MIA: 'Miami',
  ORD: 'Chicago',
  DFW: 'Dallas',
  IAH: 'Houston',
  DEN: 'Denver',
  SLC: 'Salt Lake City',
  SEA: 'Seattle',
  PDX: 'Portland',
  SFO: 'San Francisco',
  SJC: 'San Jose',
  LAX: 'Los Angeles',
  PHX: 'Phoenix',
  MSP: 'Minneapolis',
  DTW: 'Detroit',
  PHL: 'Philadelphia',
  YYZ: 'Toronto',
  YUL: 'Montreal',
  YVR: 'Vancouver',
  GRU: 'São Paulo',
  GIG: 'Rio de Janeiro',
  EZE: 'Buenos Aires',
  SCL: 'Santiago',
  BOG: 'Bogotá',

  // Europe / EMEA
  LHR: 'London',
  MAN: 'Manchester',
  DUB: 'Dublin',
  FRA: 'Frankfurt',
  MUC: 'Munich',
  BER: 'Berlin',
  DUS: 'Düsseldorf',
  HAM: 'Hamburg',
  AMS: 'Amsterdam',
  CDG: 'Paris',
  MRS: 'Marseille',
  BRU: 'Brussels',
  ZRH: 'Zurich',
  VIE: 'Vienna',
  MXP: 'Milan',
  FCO: 'Rome',
  MAD: 'Madrid',
  BCN: 'Barcelona',
  LIS: 'Lisbon',
  CPH: 'Copenhagen',
  OSL: 'Oslo',
  ARN: 'Stockholm',
  HEL: 'Helsinki',
  WAW: 'Warsaw',
  PRG: 'Prague',
  BUD: 'Budapest',
  ATH: 'Athens',
  OTP: 'Bucharest',
  SOF: 'Sofia',
  DXB: 'Dubai',
  AUH: 'Abu Dhabi',
  DOH: 'Doha',
  BAH: 'Bahrain',
  RUH: 'Riyadh',
  JED: 'Jeddah',
  TLV: 'Tel Aviv',
  CPT: 'Cape Town',
  JNB: 'Johannesburg',
  NBO: 'Nairobi',
};

/**
 * Extracts the 3-letter uppercase IATA code from a CloudFront `x-amz-cf-pop` header value.
 */
export function parseCfPopIata(headerValue: string | null): string | null {
  const trimmed = headerValue?.trim();
  if (!trimmed) return null;
  const match = trimmed.match(/^([A-Z]{3})\d/i);
  return match ? match[1].toUpperCase() : null;
}

/**
 * Formats the edge telemetry display label for a given 3-letter IATA code
 * and optional mesh suffix label.
 */
export function formatEdgeTelemetryLabel(iata: string, meshLabel?: string): string {
  const city = EDGE_POP_CITIES[iata] ?? iata;
  const trimmedMesh = meshLabel?.trim();
  return trimmedMesh
    ? `Connected via ${city} Edge (${iata}) • ${trimmedMesh}`
    : `Connected via ${city} Edge (${iata})`;
}

/**
 * Queries the current origin via a same-origin HEAD request to detect the serving
 * CloudFront edge POP and progressively enhances `#edge-telemetry`.
 */
export async function initEdgeTelemetry(): Promise<void> {
  if (typeof document === 'undefined' || typeof fetch === 'undefined') return;

  const container = document.querySelector<HTMLElement>('#edge-telemetry');
  const textEl = document.querySelector<HTMLElement>('#edge-telemetry [data-edge-text]');
  if (!container || !textEl || container.dataset.edgeTelemetryInitialized === 'true') {
    return;
  }

  container.dataset.edgeTelemetryInitialized = 'true';

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2500);

  try {
    const res = await fetch('/', {
      method: 'HEAD',
      credentials: 'same-origin',
      signal: controller.signal,
    });
    if (!res.ok) return;

    const popHeader = res.headers.get('x-amz-cf-pop');
    const iata = parseCfPopIata(popHeader);
    if (!popHeader || !iata) return;

    const trimmedPop = popHeader.trim();
    const meshLabel = container.dataset.edgeMeshLabel;
    textEl.textContent = formatEdgeTelemetryLabel(iata, meshLabel);
    container.dataset.cfPop = trimmedPop;
    container.title = `CloudFront POP: ${trimmedPop}`;

    const dot = container.querySelector<HTMLElement>('[data-edge-dot]');
    if (dot) {
      dot.classList.remove('bg-amber-500', 'dark:bg-amber-400');
      dot.classList.add('bg-emerald-500', 'dark:bg-emerald-400');
    }

    const ping = container.querySelector<HTMLElement>('[data-edge-ping]');
    if (ping) {
      ping.classList.remove('hidden');
    }
  } catch {
    /* silent fallback */
  } finally {
    clearTimeout(timeoutId);
  }
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => void initEdgeTelemetry(), { once: true });
  } else {
    void initEdgeTelemetry();
  }
}
