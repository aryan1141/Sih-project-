import { useEffect, useRef, useState, type FormEvent, type PointerEvent } from 'react';
import L from 'leaflet';
import { DisasterEvent } from '../types';
import { colorFor } from '../utils/colors';
import { timeAgo } from '../utils/time';
import { Layers, Compass, Globe, MapPin, Maximize2, Search, ShieldAlert, X as XIcon } from 'lucide-react';

interface DisasterMapProps {
  events: DisasterEvent[];
  selectedEvent: DisasterEvent | null;
  onSelectEvent: (event: DisasterEvent) => void;
  activeCategory: string;
}

const TILE_SERVERS = {
  dark: {
    name: 'Black Operations Map',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap &copy; CARTO',
  },
  voyager: {
    name: 'Clean Light',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri',
  },
  satellite: {
    name: 'Satellite Imagery',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri',
  },
};

export default function DisasterMap({
  events,
  selectedEvent,
  onSelectEvent,
}: DisasterMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapSurfaceRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const satelliteLabelsLayerRef = useRef<L.TileLayer | null>(null);
  const markersMapRef = useRef<Map<string, L.Marker>>(new Map());
  const searchMarkerRef = useRef<L.CircleMarker | null>(null);
  const [activeTileKey, setActiveTileKey] = useState<keyof typeof TILE_SERVERS>('dark');
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const searchControlRef = useRef<HTMLDivElement | null>(null);
  const searchDragRef = useRef({ active: false, moved: false, offsetX: 0, offsetY: 0 });
  const [searchPosition, setSearchPosition] = useState<{ left: number; top: number } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchMessage, setSearchMessage] = useState('');

  useEffect(() => {
    if (isSearchOpen) searchInputRef.current?.focus();
  }, [isSearchOpen]);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      if (!searchDragRef.current.active || !mapSurfaceRef.current || !searchControlRef.current) return;
      const surfaceRect = mapSurfaceRef.current.getBoundingClientRect();
      const controlRect = searchControlRef.current.getBoundingClientRect();
      const nextLeft = event.clientX - surfaceRect.left - searchDragRef.current.offsetX;
      const nextTop = event.clientY - surfaceRect.top - searchDragRef.current.offsetY;

      if (Math.abs(event.movementX) > 1 || Math.abs(event.movementY) > 1) {
        searchDragRef.current.moved = true;
      }

      setSearchPosition({
        left: Math.max(8, Math.min(nextLeft, surfaceRect.width - controlRect.width - 8)),
        top: Math.max(8, Math.min(nextTop, surfaceRect.height - controlRect.height - 8)),
      });
    };

    const handlePointerUp = () => {
      searchDragRef.current.active = false;
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, []);

  const handleSearchDragStart = (event: PointerEvent<HTMLDivElement>) => {
    if (!mapSurfaceRef.current || !searchControlRef.current) return;
    const surfaceRect = mapSurfaceRef.current.getBoundingClientRect();
    const controlRect = searchControlRef.current.getBoundingClientRect();
    searchDragRef.current = {
      active: true,
      moved: false,
      offsetX: event.clientX - controlRect.left,
      offsetY: event.clientY - controlRect.top,
    };
    setSearchPosition({
      left: controlRect.left - surfaceRect.left,
      top: controlRect.top - surfaceRect.top,
    });
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      worldCopyJump: true,
      minZoom: 2,
      maxZoom: 18,
    }).setView([20, 78], 3);

    L.control.zoom({ position: 'topright' }).addTo(map);

    const initialTile = TILE_SERVERS[activeTileKey];
    const tileLayer = L.tileLayer(initialTile.url, {
      attribution: initialTile.attribution,
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    tileLayerRef.current = tileLayer;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Layer
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    const tileConfig = TILE_SERVERS[activeTileKey];
    tileLayerRef.current.setUrl(tileConfig.url);

    const map = mapInstanceRef.current;
    satelliteLabelsLayerRef.current?.remove();
    satelliteLabelsLayerRef.current = null;

    if (activeTileKey === 'satellite') {
      satelliteLabelsLayerRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Labels &copy; Esri',
          maxZoom: 19,
          opacity: 0.95,
        }
      ).addTo(map);
    }
  }, [activeTileKey]);

  // Update Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    markersMapRef.current.forEach((marker) => marker.remove());
    markersMapRef.current.clear();

    events.forEach((ev) => {
      const color = colorFor(ev.category);
      const icon = L.divIcon({
        className: 'custom-event-marker-wrapper',
        html: `
          <div class="event-marker" style="--dot-color: ${color}">
            <div class="ring"></div>
            <div class="core"></div>
          </div>
        `,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
        popupAnchor: [0, -10],
      });

      const marker = L.marker([ev.lat, ev.lon], { icon }).addTo(map);

      const popupHtml = `
        <div class="p-1 min-w-[210px]">
          <div class="flex items-center gap-2 mb-1.5">
            <span class="inline-block w-2.5 h-2.5 rounded-full" style="background-color: ${color}"></span>
            <span class="text-xs font-mono font-bold tracking-wide uppercase" style="color: ${color}">${escapeHtml(ev.category)}</span>
            ${ev.severityLevel === 'critical' ? '<span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-900/80 text-red-300 font-bold ml-auto">CRITICAL</span>' : ''}
          </div>
          <h4 class="text-sm font-semibold text-white leading-tight mb-1.5">${escapeHtml(ev.title)}</h4>
          <div class="text-xs text-slate-300 flex justify-between items-center py-1 border-t border-slate-700/60 my-1 font-mono">
            <span>${ev.detail ? escapeHtml(ev.detail) : 'Coordinates: ' + ev.lat.toFixed(2) + ', ' + ev.lon.toFixed(2)}</span>
            <span class="text-slate-400 text-[11px]">${timeAgo(ev.date)}</span>
          </div>
          <div class="flex items-center gap-2 mt-2 pt-1 border-t border-slate-700/60">
            <button id="inspect-btn-${ev.id.replace(/[^a-zA-Z0-9_-]/g, '')}" class="flex-1 bg-cyan-600/30 hover:bg-cyan-600/60 text-cyan-200 text-xs font-medium py-1 px-2 rounded transition cursor-pointer text-center">
              Inspect Incident
            </button>
            ${ev.link ? `<a href="${ev.link}" target="_blank" rel="noopener noreferrer" class="text-xs text-slate-400 hover:text-cyan-300 font-mono py-1 px-1.5">Source &rarr;</a>` : ''}
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, { maxWidth: 280, closeButton: true });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`inspect-btn-${ev.id.replace(/[^a-zA-Z0-9_-]/g, '')}`);
        if (btn) {
          btn.onclick = () => onSelectEvent(ev);
        }
      });

      marker.on('click', () => {
        onSelectEvent(ev);
      });

      markersMapRef.current.set(ev.id, marker);
    });
  }, [events, onSelectEvent]);

  // Handle selectedEvent flying and popup opening
  useEffect(() => {
    if (!selectedEvent || !mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    map.flyTo([selectedEvent.lat, selectedEvent.lon], 6, {
      duration: 1.2,
      easeLinearity: 0.25,
    });

    const marker = markersMapRef.current.get(selectedEvent.id);
    if (marker) {
      setTimeout(() => {
        marker.openPopup();
      }, 400);
    }
  }, [selectedEvent]);

  // Jump helpers
  const handleFocusIndia = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([21.7679, 78.8718], 5, { duration: 1.2 });
  };

  const handleFocusGlobal = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([20, 10], 2.5, { duration: 1.2 });
  };

  const handleFocusRingOfFire = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([10, 142], 3.2, { duration: 1.2 });
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation || !mapInstanceRef.current) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation([latitude, longitude]);
        mapInstanceRef.current?.flyTo([latitude, longitude], 7, { duration: 1.2 });
      },
      (err) => {
        console.warn('Geolocation denied/unavailable', err);
      }
    );
  };

  const handlePlaceSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchQuery.trim();
    if (!query || !mapInstanceRef.current) return;

    setIsSearching(true);
    setSearchMessage('');

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(query)}`
      );
      if (!response.ok) throw new Error('Place search failed');

      const results = (await response.json()) as Array<{
        lat: string;
        lon: string;
        display_name: string;
      }>;
      const result = results[0];
      if (!result) {
        setSearchMessage('Place not found');
        return;
      }

      const location: [number, number] = [Number(result.lat), Number(result.lon)];
      const map = mapInstanceRef.current;
      searchMarkerRef.current?.remove();
      searchMarkerRef.current = L.circleMarker(location, {
        radius: 9,
        color: '#38BDF8',
        weight: 2,
        fillColor: '#0EA5E9',
        fillOpacity: 0.85,
      }).addTo(map);
      searchMarkerRef.current.bindTooltip(result.display_name, { direction: 'top', offset: [0, -8] }).openTooltip();
      map.flyTo(location, 10, { duration: 1.2 });
      setSearchMessage(result.display_name);
    } catch (error) {
      console.warn('Place search failed:', error);
      setSearchMessage('Search unavailable');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div ref={mapSurfaceRef} className="relative w-full h-full min-h-[400px] flex-1 bg-[#0B1420] overflow-hidden">
      {/* Map DOM Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Cybernetic radar scan bar */}
      <div className="map-scan" aria-hidden="true" />

      {/* Place search */}
      {!isSearchOpen ? (
        <div
          ref={searchControlRef}
          className="absolute z-[400]"
          style={searchPosition ? { left: searchPosition.left, top: searchPosition.top } : { left: 16, top: '50%', transform: 'translateY(-50%)' }}
        >
          <button
            type="button"
            onPointerDown={handleSearchDragStart}
            onClick={() => {
              if (!searchDragRef.current.moved) setIsSearchOpen(true);
              searchDragRef.current.moved = false;
            }}
            aria-label="Open place search"
            title="Search a place. Drag to reposition."
            className="rounded-md border border-cyan-500/40 bg-[#0F1B29]/95 p-2.5 text-cyan-400 shadow-lg backdrop-blur-sm transition hover:bg-[#16283A] touch-none"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          ref={searchControlRef}
          className="absolute z-[400]"
          style={searchPosition ? { left: searchPosition.left, top: searchPosition.top } : { left: 16, top: '50%', transform: 'translateY(-50%)' }}
        >
          <form
            onSubmit={handlePlaceSearch}
            className="flex w-[min(300px,calc(100vw-2rem))] items-center gap-2 rounded-md border border-cyan-500/40 bg-[#0F1B29]/95 p-1.5 shadow-lg backdrop-blur-sm"
          >
            <div
              onPointerDown={handleSearchDragStart}
              title="Drag to reposition search"
              className="flex shrink-0 cursor-move touch-none"
            >
              <Search className="ml-1 w-4 h-4 text-cyan-400" />
            </div>
            <input
              ref={searchInputRef}
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search a place..."
              aria-label="Search for a place"
              className="min-w-0 flex-1 bg-transparent px-1 py-1 text-xs text-white outline-none placeholder:text-slate-500"
            />
            <button
              type="submit"
              disabled={isSearching || !searchQuery.trim()}
              className="rounded bg-cyan-600/80 px-2.5 py-1 text-xs font-medium text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSearching ? '...' : 'Find'}
            </button>
            <button
              type="button"
              onClick={() => setIsSearchOpen(false)}
              aria-label="Close place search"
              title="Close search"
              className="rounded p-1 text-slate-400 transition hover:bg-[#16283A] hover:text-white"
            >
              <XIcon className="w-4 h-4" />
            </button>
            {searchMessage && (
              <span className="absolute left-0 top-full mt-1 max-w-full truncate rounded bg-[#0F1B29]/95 px-2 py-1 text-[10px] text-slate-300 shadow">
                {searchMessage}
              </span>
            )}
          </form>
        </div>
      )}

      {/* Quick Viewport Navigation Toolbar */}
      <div className="absolute top-4 left-4 z-[400] flex flex-wrap gap-2">
        <button
          onClick={handleFocusIndia}
          title="Smart India Hackathon Region Focus"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#0F1B29]/90 hover:bg-[#16283A] text-cyan-300 border border-cyan-500/40 backdrop-blur-sm text-xs font-mono font-medium shadow-lg transition"
        >
          <span className="w-2 h-2 rounded-full bg-orange-400"></span>
          <span>India (SIH)</span>
        </button>

        <button
          onClick={handleFocusGlobal}
          title="Reset to Global Disaster Overview"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#0F1B29]/90 hover:bg-[#16283A] text-slate-300 border border-slate-700/60 backdrop-blur-sm text-xs font-mono transition"
        >
          <Globe className="w-3.5 h-3.5 text-slate-400" />
          <span>Global</span>
        </button>

        <button
          onClick={handleFocusRingOfFire}
          title="Pacific Ring of Fire Seismic Belt"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#0F1B29]/90 hover:bg-[#16283A] text-amber-300 border border-amber-500/40 backdrop-blur-sm text-xs font-mono transition"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          <span>Ring of Fire</span>
        </button>

        <button
          onClick={handleLocateMe}
          title="Center on my location"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#0F1B29]/90 hover:bg-[#16283A] text-slate-300 border border-slate-700/60 backdrop-blur-sm text-xs font-mono transition"
        >
          <MapPin className="w-3.5 h-3.5 text-emerald-400" />
          <span>Near Me</span>
        </button>
      </div>

      {/* Layer selector toggle button */}
      <div className="absolute top-4 right-14 z-[400]">
        <button
          onClick={() => setShowLayerMenu(!showLayerMenu)}
          title="Switch Map Layers"
          className="p-2 rounded-md bg-[#0F1B29]/90 hover:bg-[#16283A] text-slate-200 border border-slate-700/60 backdrop-blur-sm shadow-md transition"
        >
          <Layers className="w-4 h-4 text-cyan-400" />
        </button>

        {showLayerMenu && (
          <div className="absolute right-0 mt-2 w-44 rounded-lg bg-[#0F1B29] border border-[#22374A] shadow-xl p-2 z-[401] space-y-1 font-mono text-xs">
            <div className="px-2 py-1 text-[11px] text-slate-400 font-bold border-b border-slate-800">
              MAP STYLE
            </div>
            {Object.entries(TILE_SERVERS).map(([key, config]) => (
              <button
                key={key}
                onClick={() => {
                  setActiveTileKey(key as keyof typeof TILE_SERVERS);
                  setShowLayerMenu(false);
                }}
                className={`w-full text-left px-2 py-1.5 rounded transition flex items-center justify-between ${
                  activeTileKey === key
                    ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <span>{config.name}</span>
                {activeTileKey === key && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Map Legend Overlay (Bottom Left) */}
      <div className="absolute bottom-4 left-4 z-[400] hidden md:block">
        <div className="bg-[#0F1B29]/90 backdrop-blur-md border border-[#22374A] rounded-lg p-2.5 text-xs shadow-lg max-w-[280px]">
          <div className="flex items-center justify-between font-mono font-semibold text-slate-300 pb-1.5 border-b border-slate-800 text-[11px]">
            <span>INCIDENT CATEGORIES</span>
            <span className="text-cyan-400">{events.length} ACTIVE</span>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-2 font-mono text-[11px]">
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FFD166]"></span>
              <span>Earthquakes</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF7A45]"></span>
              <span>Wildfires</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-[#3FC7C0]"></span>
              <span>Floods</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C9A8FF]"></span>
              <span>Severe Storms</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]"></span>
              <span>Volcanoes</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-[#8CA0B3]"></span>
              <span>Other Alerts</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function escapeHtml(str?: string | null): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
