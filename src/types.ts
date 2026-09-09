export interface DisasterEvent {
  id: string;
  title: string;
  category: string;
  lat: number;
  lon: number;
  date: string;
  link: string | null;
  detail: string | null;
  source?: 'NASA EONET' | 'USGS Earthquakes' | 'NDMA/System Alert';
  magnitude?: number;
  countryOrRegion?: string;
  severityLevel?: 'critical' | 'high' | 'moderate' | 'low';
}

export interface EventsApiResponse {
  ok: boolean;
  count: number;
  updatedAt: number;
  cached: boolean;
  events: DisasterEvent[];
  sources?: {
    nasaEonet: { count: number; status: 'ok' | 'degraded' | 'cached' };
    usgs: { count: number; status: 'ok' | 'degraded' | 'cached' };
  };
  error?: string;
}

export interface SystemHealth {
  status: 'operational' | 'degraded';
  sources: {
    nasaEonet: { status: 'healthy' | 'unreachable'; responseTimeMs: number };
    usgs: { status: 'healthy' | 'unreachable'; responseTimeMs: number };
  };
  cachedEventsCount: number;
  cacheExpiresInSeconds: number;
  serverUptimeSeconds: number;
}

export interface AISituationReport {
  summary: string;
  highestRiskHotspots: {
    region: string;
    threatType: string;
    severity: 'critical' | 'high' | 'moderate';
    recommendedAction: string;
  }[];
  evacuationOrPreparednessTips: string[];
  generatedAt: string;
}
