import { DisasterEvent } from '../../src/types.js';

const USGS_URL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson';

export async function fetchUsgsQuakes(): Promise<DisasterEvent[]> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 7500);

  try {
    const res = await fetch(USGS_URL, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) {
      throw new Error(`USGS request failed: ${res.status} ${res.statusText}`);
    }

    const json = (await res.json()) as { features?: any[] };

    return (json.features || []).map((f: any): DisasterEvent => {
      const mag = f.properties.mag ?? 4.5;
      const magNum = typeof mag === 'number' ? mag : parseFloat(mag);

      let severityLevel: DisasterEvent['severityLevel'] = 'moderate';
      if (magNum >= 6.5) {
        severityLevel = 'critical';
      } else if (magNum >= 5.3) {
        severityLevel = 'high';
      }

      return {
        id: `usgs-${f.id}`,
        title: f.properties.place || 'Earthquake Event',
        category: 'Earthquakes',
        lat: f.geometry.coordinates[1],
        lon: f.geometry.coordinates[0],
        date: new Date(f.properties.time).toISOString(),
        link: f.properties.url || null,
        detail: `M ${typeof mag === 'number' ? mag.toFixed(1) : mag}`,
        source: 'USGS Earthquakes',
        magnitude: magNum,
        severityLevel,
      };
    });
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.error('USGS fetch failed:', err?.message || err);
    throw err;
  }
}
