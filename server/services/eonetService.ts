import { DisasterEvent } from '../../src/types.js';

const EONET_URL = 'https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=150';

export async function fetchEonetEvents(): Promise<DisasterEvent[]> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 7500);

  try {
    const res = await fetch(EONET_URL, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) {
      throw new Error(`NASA EONET request failed: ${res.status} ${res.statusText}`);
    }

    const json = (await res.json()) as { events?: any[] };

    return (json.events || [])
      .map((ev: any): DisasterEvent | null => {
        const geoList = ev.geometry;
        if (!geoList || !geoList.length) return null;
        const lastGeo = geoList[geoList.length - 1];
        if (!lastGeo || !lastGeo.coordinates) return null;

        let lon = 0;
        let lat = 0;

        if (Array.isArray(lastGeo.coordinates[0])) {
          // Polygon or MultiLine
          const firstPoint = Array.isArray(lastGeo.coordinates[0][0])
            ? lastGeo.coordinates[0][0]
            : lastGeo.coordinates[0];
          lon = Number(firstPoint[0]);
          lat = Number(firstPoint[1]);
        } else {
          // Point [lon, lat]
          lon = Number(lastGeo.coordinates[0]);
          lat = Number(lastGeo.coordinates[1]);
        }

        if (isNaN(lat) || isNaN(lon)) return null;

        const category = (ev.categories && ev.categories[0] && ev.categories[0].title) || 'Other';
        const link = (ev.sources && ev.sources[0] && ev.sources[0].url) || null;

        let severityLevel: DisasterEvent['severityLevel'] = 'moderate';
        const lowerCat = category.toLowerCase();
        if (lowerCat.includes('volcano') || lowerCat.includes('severe') || lowerCat.includes('storm')) {
          severityLevel = 'critical';
        } else if (lowerCat.includes('wildfire') || lowerCat.includes('flood')) {
          severityLevel = 'high';
        }

        return {
          id: `eonet-${ev.id}`,
          title: ev.title || 'Natural Event',
          category,
          lat,
          lon,
          date: lastGeo.date || new Date().toISOString(),
          link,
          detail: ev.description || (ev.sources && ev.sources[0] ? `Source: ${ev.sources[0].id}` : null),
          source: 'NASA EONET',
          severityLevel,
        };
      })
      .filter((ev): ev is DisasterEvent => ev !== null);
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.error('NASA EONET fetch failed:', err?.message || err);
    throw err;
  }
}
