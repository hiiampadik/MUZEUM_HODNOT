'use client';

import { useEffect, useRef, useState } from 'react';
import 'maplibre-gl/dist/maplibre-gl.css';
import { common } from '@/lib/strings';
import { Title } from '@/components/Typography/Typography';
import { RichText } from '@/components/RichText/RichText';
import { Pill } from '@/components/Pill/Pill';
import styles from './ValueMap.module.css';

export type MapPointData = {
  _key: string;
  title: string | null;
  location?: { lat?: number | null; lng?: number | null } | null;
  text?: readonly unknown[] | null;
  link?: { label?: string | null; href?: string | null } | null;
};

/**
 * Interactive map for the value generator. MapLibre with built-in clustering:
 * clicking a cluster zooms in, clicking a point selects it (highlighted purple)
 * and opens a fixed-size popover panel pinned to the left of the map. An
 * accessible list is kept in the DOM as a no-JS / screen-reader fallback.
 */
export function ValueMap({ points }: { points: readonly MapPointData[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import('maplibre-gl').Map | undefined>(undefined);
  // Generated id of the currently highlighted feature (for feature-state).
  const selectedIdRef = useRef<number | string | undefined>(undefined);
  const [selected, setSelected] = useState<MapPointData | null>(null);

  // Clear the highlight on whichever point is currently selected.
  const clearHighlight = () => {
    const map = mapRef.current;
    if (map && selectedIdRef.current !== undefined) {
      map.setFeatureState({ source: 'points', id: selectedIdRef.current }, { selected: false });
    }
    selectedIdRef.current = undefined;
  };

  const closePanel = () => {
    clearHighlight();
    setSelected(null);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const valid = points.filter(
      (p) => typeof p.location?.lat === 'number' && typeof p.location?.lng === 'number',
    );
    if (valid.length === 0) return;

    let map: import('maplibre-gl').Map | undefined;
    let resizeObserver: ResizeObserver | undefined;
    let cancelled = false;

    (async () => {
      const maplibre = await import('maplibre-gl');
      if (cancelled || !container) return;

      // Self-hosted worker: webpack can't emit maplibre's worker chunk (it builds
      // the worker URL as a variable, not the literal `new Worker(new URL(...))`
      // pattern), so the default URL 404s and vector tiles never parse. The worker
      // + its shared chunk are copied to public/maplibre/ by copy-maplibre-worker.
      maplibre.setWorkerUrl('/maplibre/maplibre-gl-worker.mjs');

      const features = valid.map((p) => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [p.location!.lng as number, p.location!.lat as number],
        },
        properties: { key: p._key },
      }));

      const bounds = new maplibre.LngLatBounds();
      features.forEach((f) => bounds.extend(f.geometry.coordinates as [number, number]));

      map = new maplibre.Map({
        container,
        // OpenFreeMap "positron" — free vector basemap (incl. commercial use),
        // no API key. Light, minimal style that suits the page palette.
        // OSM data © OpenStreetMap; attribution is carried by the style.
        style: 'https://tiles.openfreemap.org/styles/positron',
        bounds,
        fitBoundsOptions: { padding: 64, maxZoom: 12 },
      });
      mapRef.current = map;

      map.addControl(new maplibre.NavigationControl({ showCompass: false }), 'top-right');
      map.on('error', (e) => console.error('[ValueMap]', e.error?.message ?? e));

      // The map is created inside an async IIFE (after `await import`), so the
      // container's layout can settle after construction. With a vector style a
      // stale size leaves the map blank (no tiles requested) until a resize.
      // A ResizeObserver keeps the map's size in sync and nudges the first paint.
      resizeObserver = new ResizeObserver(() => map?.resize());
      resizeObserver.observe(container);

      map.on('load', () => {
        if (!map) return;

        // Recolour the positron basemap to a light monochrome scheme that sits
        // under the page: land areas graded up from white, water darker than the
        // page background so the accent points stay the heroes. `--color-*` here
        // mirror the page palette (page bg #ececf0).
        const basemap: Record<string, string> = {
          background: '#f4f5f7', // slightly lighter than the page
          park: '#ffffff', // fields / parks — lightest, pure white
          landuse_residential: '#f8f9fb', // cities
          building: '#f4f5f8',
          landcover_wood: '#eef1f4', // forests — darkest of the land fills, still near-white
          water: '#b6bfca', // clearly darker than the page background
        };
        for (const [id, color] of Object.entries(basemap)) {
          if (!map.getLayer(id)) continue;
          const prop = id === 'background' ? 'background-color' : 'fill-color';
          map.setPaintProperty(id, prop, color);
        }

        // `generateId` gives every feature a stable numeric id so feature-state
        // can drive the selected-point highlight.
        map.addSource('points', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features },
          cluster: true,
          clusterRadius: 50,
          generateId: true,
        });

        const cs = getComputedStyle(container);
        const green = cs.getPropertyValue('--accent-green').trim() || '#66a755';

        map.addLayer({
          id: 'clusters',
          type: 'circle',
          source: 'points',
          filter: ['has', 'point_count'],
          paint: {
            'circle-color': green,
            'circle-radius': ['step', ['get', 'point_count'], 18, 10, 24, 30, 30],
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff',
          },
        });
        map.addLayer({
          id: 'cluster-count',
          type: 'symbol',
          source: 'points',
          filter: ['has', 'point_count'],
          layout: { 'text-field': ['get', 'point_count_abbreviated'], 'text-size': 14 },
          paint: { 'text-color': '#ffffff' },
        });
        map.addLayer({
          id: 'unclustered',
          type: 'circle',
          source: 'points',
          filter: ['!', ['has', 'point_count']],
          paint: {
            // Default: green fill / white stroke. Selected: white fill / green
            // stroke (feature-state driven).
            'circle-color': [
              'case',
              ['boolean', ['feature-state', 'selected'], false],
              '#ffffff',
              green,
            ],
            'circle-radius': 9,
            'circle-stroke-width': 2,
            'circle-stroke-color': [
              'case',
              ['boolean', ['feature-state', 'selected'], false],
              green,
              '#ffffff',
            ],
          },
        });

        map.on('click', 'clusters', async (e) => {
          if (!map) return;
          const feat = map.queryRenderedFeatures(e.point, { layers: ['clusters'] })[0];
          const clusterId = feat.properties?.cluster_id;
          const source = map.getSource('points') as import('maplibre-gl').GeoJSONSource;
          const zoom = await source.getClusterExpansionZoom(clusterId);
          const center = (feat.geometry as { coordinates: [number, number] }).coordinates;
          map.easeTo({ center, zoom });
        });

        map.on('click', 'unclustered', (e) => {
          if (!map || !e.features?.[0]) return;
          const f = e.features[0];
          const key = (f.properties as Record<string, string>).key;
          const point = points.find((p) => p._key === key) ?? null;

          clearHighlight();
          if (f.id !== undefined) {
            map.setFeatureState({ source: 'points', id: f.id }, { selected: true });
            selectedIdRef.current = f.id;
          }
          setSelected(point);
        });

        // Clicking the empty basemap (no point / cluster under the cursor) closes
        // the panel and clears the highlight.
        map.on('click', (e) => {
          if (!map) return;
          const hits = map.queryRenderedFeatures(e.point, {
            layers: ['unclustered', 'clusters'],
          });
          if (hits.length === 0) closePanel();
        });

        const setPointer = (v: boolean) => {
          if (map) map.getCanvas().style.cursor = v ? 'pointer' : '';
        };
        map.on('mouseenter', 'clusters', () => setPointer(true));
        map.on('mouseleave', 'clusters', () => setPointer(false));
        map.on('mouseenter', 'unclustered', () => setPointer(true));
        map.on('mouseleave', 'unclustered', () => setPointer(false));
      });
    })();

    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
      map?.remove();
      mapRef.current = undefined;
      selectedIdRef.current = undefined;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points]);

  if (!points || points.length === 0) return null;

  return (
    <div className={styles.wrap}>
      <div className={styles.mapArea}>
        <div
          ref={containerRef}
          className={styles.map}
          role="application"
          aria-label={common.mapAriaLabel}
        />
        {selected && (
          <div className={styles.panel} role="dialog" aria-label={selected.title ?? ''}>
            <button
              type="button"
              className={styles.close}
              onClick={closePanel}
              aria-label={common.mapClose}
            >
              <span aria-hidden="true">×</span>
            </button>
            {selected.title && (
              <Title as="h3" className={styles.panelTitle}>
                {selected.title}
              </Title>
            )}
            {selected.text && <RichText value={selected.text} className={styles.panelText} />}
            {selected.link?.href && (
              <Pill
                href={selected.link.href}
                className={styles.panelPill}
                target="_blank"
                rel="noopener noreferrer"
              >
                {selected.link.label || common.moreLink}
              </Pill>
            )}
          </div>
        )}
      </div>
      {/* Accessible / no-JS fallback list */}
      <ul className="sr-only">
        {points.map((p) => (
          <li key={p._key}>
            {p.title}
            {p.link?.href ? ` – ${p.link.label || p.link.href}` : ''}
          </li>
        ))}
      </ul>
    </div>
  );
}
