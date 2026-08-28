import { useCallback, useEffect, useRef, useState } from 'react';
import { set, setIfMissing, type ObjectInputProps } from 'sanity';
// Type-only import (fully erased at build time) — the runtime module is loaded
// dynamically inside the effect below. A static `import ... from 'maplibre-gl'`
// breaks `sanity schema extract` (typegen), because Node can't resolve the
// package's non-exported entry during config evaluation.
import type * as MapLibreGL from 'maplibre-gl';

type Geopoint = { _type?: string; lat?: number; lng?: number; alt?: number };

type GeocodeResult = { label: string; lat: number; lng: number };

// Slovakia — sensible default view when no coordinate is set yet.
const DEFAULT_CENTER: [number, number] = [19.5, 48.7];
const DEFAULT_ZOOM = 6;
const ACCENT = '#5594b4';

// Free OpenStreetMap geocoder (no API key). Fine for an internal, low-volume
// editor tool; results are worldwide, Slovak labels preferred.
async function geocode(query: string): Promise<GeocodeResult[]> {
  const url =
    'https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&accept-language=sk&q=' +
    encodeURIComponent(query);
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`Geocoder ${res.status}`);
  const data = (await res.json()) as Array<{ display_name: string; lat: string; lon: string }>;
  return data.map((d) => ({ label: d.display_name, lat: Number(d.lat), lng: Number(d.lon) }));
}

/**
 * Custom input for the `location` geopoint: an OSM raster map where the editor
 * can click (or drag the marker) to set the coordinate, on top of the default
 * Lat/Lng/Alt fields (kept for manual entry). Raster tiles need no web worker,
 * so this works in the Vite-built Studio without extra bundler setup.
 */
export function GeopointMapInput(props: ObjectInputProps) {
  const { value, onChange, renderDefault } = props;
  const geo = value as Geopoint | undefined;

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreGL.Map | null>(null);
  const markerRef = useRef<MapLibreGL.Marker | null>(null);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const setLatLng = useCallback(
    (lat: number, lng: number) => {
      onChange([
        setIfMissing({ _type: 'geopoint' }),
        set(Number(lat.toFixed(6)), ['lat']),
        set(Number(lng.toFixed(6)), ['lng']),
      ]);
    },
    [onChange],
  );

  // Move the marker + camera to a coordinate and write it to the field.
  const goTo = useCallback(
    (lat: number, lng: number) => {
      setLatLng(lat, lng);
      const map = mapRef.current;
      const marker = markerRef.current;
      if (marker && map) marker.setLngLat([lng, lat]).addTo(map);
      map?.flyTo({ center: [lng, lat], zoom: Math.max(map.getZoom(), 13) });
    },
    [setLatLng],
  );

  const runSearch = useCallback(async () => {
    const q = query.trim();
    if (!q) return;
    setSearching(true);
    setSearchError(null);
    try {
      const found = await geocode(q);
      setResults(found);
      if (found.length === 0) setSearchError('Nič sa nenašlo.');
    } catch {
      setSearchError('Vyhľadávanie zlyhalo, skús znova.');
    } finally {
      setSearching(false);
    }
  }, [query]);

  // Create the map once. maplibre-gl is imported dynamically (runtime-only) so
  // that static schema extraction never has to resolve the package.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let disposed = false;
    let cleanup = () => {};

    void (async () => {
      const maplibregl = await import('maplibre-gl');
      await import('maplibre-gl/dist/maplibre-gl.css');
      if (disposed || !containerRef.current) return;

      const hasPoint = typeof geo?.lat === 'number' && typeof geo?.lng === 'number';
      const map = new maplibregl.Map({
        container,
        style: {
          version: 8,
          sources: {
            osm: {
              type: 'raster',
              tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
              tileSize: 256,
              attribution: '© OpenStreetMap',
            },
          },
          layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
        },
        center: hasPoint ? [geo!.lng as number, geo!.lat as number] : DEFAULT_CENTER,
        zoom: hasPoint ? 12 : DEFAULT_ZOOM,
      });
      mapRef.current = map;
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

      const marker = new maplibregl.Marker({ draggable: true, color: ACCENT });
      if (hasPoint) marker.setLngLat([geo!.lng as number, geo!.lat as number]).addTo(map);
      markerRef.current = marker;

      map.on('click', (e: MapLibreGL.MapMouseEvent) => {
        marker.setLngLat(e.lngLat).addTo(map);
        setLatLng(e.lngLat.lat, e.lngLat.lng);
      });
      marker.on('dragend', () => {
        const p = marker.getLngLat();
        setLatLng(p.lat, p.lng);
      });

      // Studio panels can settle after mount; keep the map sized to its container.
      const ro = new ResizeObserver(() => map.resize());
      ro.observe(container);

      cleanup = () => {
        ro.disconnect();
        map.remove();
        mapRef.current = null;
        markerRef.current = null;
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
    // Create once; external value changes are handled by the sync effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reflect manual edits (or resets) of the number fields back onto the marker.
  useEffect(() => {
    const map = mapRef.current;
    const marker = markerRef.current;
    if (!map || !marker) return;
    if (typeof geo?.lat === 'number' && typeof geo?.lng === 'number') {
      marker.setLngLat([geo.lng, geo.lat]).addTo(map);
    } else {
      marker.remove();
    }
  }, [geo?.lat, geo?.lng]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ position: 'relative', display: 'flex', gap: 8 }}>
        <input
          type="text"
          value={query}
          placeholder="Vyhľadaj adresu alebo miesto…"
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              void runSearch();
            }
          }}
          style={{
            flex: 1,
            padding: '8px 12px',
            fontSize: 14,
            borderRadius: 4,
            border: '1px solid var(--card-border-color, #d0d2d8)',
            background: 'var(--card-bg-color, #fff)',
            color: 'var(--card-fg-color, #101112)',
          }}
        />
        <button
          type="button"
          onClick={() => void runSearch()}
          disabled={searching || query.trim() === ''}
          style={{
            padding: '8px 16px',
            fontSize: 14,
            borderRadius: 4,
            border: 'none',
            background: ACCENT,
            color: '#fff',
            cursor: searching ? 'default' : 'pointer',
            opacity: searching || query.trim() === '' ? 0.6 : 1,
          }}
        >
          {searching ? 'Hľadám…' : 'Hľadať'}
        </button>
        {results.length > 0 && (
          <ul
            style={{
              position: 'absolute',
              top: 'calc(100% + 4px)',
              left: 0,
              right: 0,
              zIndex: 10,
              margin: 0,
              padding: 4,
              listStyle: 'none',
              maxHeight: 220,
              overflowY: 'auto',
              borderRadius: 4,
              border: '1px solid var(--card-border-color, #d0d2d8)',
              background: 'var(--card-bg-color, #fff)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
            }}
          >
            {results.map((r, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => {
                    goTo(r.lat, r.lng);
                    setResults([]);
                    setQuery(r.label);
                  }}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '8px 10px',
                    fontSize: 13,
                    border: 'none',
                    borderRadius: 3,
                    background: 'transparent',
                    color: 'var(--card-fg-color, #101112)',
                    cursor: 'pointer',
                  }}
                >
                  {r.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {searchError && (
        <div style={{ fontSize: 13, color: 'var(--card-critical-fg-color, #b8482e)' }}>
          {searchError}
        </div>
      )}
      <div
        style={{
          height: 320,
          borderRadius: 4,
          overflow: 'hidden',
          border: '1px solid var(--card-border-color, #e3e4e8)',
        }}
      >
        <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      </div>
      <div style={{ fontSize: 13, color: 'var(--card-muted-fg-color, #6e7683)' }}>
        Vyhľadaj adresu vyššie, klikni do mapy alebo potiahni značku — súradnice sa vyplnia nižšie.
        Zadať ich môžeš aj ručne.
      </div>
      {renderDefault(props)}
    </div>
  );
}
