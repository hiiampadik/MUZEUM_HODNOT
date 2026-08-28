'use client';

import { useEffect, useRef } from 'react';
import 'maplibre-gl/dist/maplibre-gl.css';
import { urlFor } from '@/sanity/lib/image';
import type { SanityImageValue } from '../SanityImage/SanityImage';
import styles from './ValueMap.module.css';

export type MapPointData = {
  _key: string;
  title: string | null;
  location?: { lat?: number | null; lng?: number | null } | null;
  image?: SanityImageValue;
  text?: readonly unknown[] | null;
  link?: { label?: string | null; href?: string | null } | null;
};

function plainText(blocks?: readonly unknown[] | null): string {
  if (!Array.isArray(blocks)) return '';
  return blocks
    .map((b) => {
      const block = b as { children?: { text?: string }[] };
      return (block.children ?? []).map((c) => c.text ?? '').join('');
    })
    .join(' ')
    .trim();
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"]/g, (c) =>
    c === '&' ? '&amp;' : c === '<' ? '&lt;' : c === '>' ? '&gt;' : '&quot;',
  );
}

/**
 * Interactive map for the value generator. MapLibre with built-in clustering:
 * clicking a cluster zooms in, clicking a point opens a popover. An accessible
 * list is kept in the DOM as a no-JS / screen-reader fallback.
 */
export function ValueMap({ points }: { points: readonly MapPointData[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

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
        properties: {
          key: p._key,
          title: p.title ?? '',
          text: plainText(p.text),
          image: p.image?.asset?._id
            ? urlFor({ asset: { _ref: p.image.asset._id } }).width(320).height(180).fit('crop').url()
            : '',
          linkHref: p.link?.href ?? '',
          linkLabel: p.link?.label ?? 'Viac',
        },
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

        map.addSource('points', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features },
          cluster: true,
          clusterRadius: 50,
        });

        const accent =
          getComputedStyle(container).getPropertyValue('--accent').trim() || '#5594b4';

        map.addLayer({
          id: 'clusters',
          type: 'circle',
          source: 'points',
          filter: ['has', 'point_count'],
          paint: {
            'circle-color': accent,
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
            'circle-color': accent,
            'circle-radius': 9,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff',
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
          const p = f.properties as Record<string, string>;
          const coords = (
            f.geometry as { coordinates: [number, number] }
          ).coordinates.slice() as [number, number];
          const html = `
            <div>
              ${p.image ? `<img src="${p.image}" alt="" class="${styles.popupImage}" />` : ''}
              <div class="${styles.popupTitle}">${escapeHtml(p.title)}</div>
              ${p.text ? `<div>${escapeHtml(p.text)}</div>` : ''}
              ${p.linkHref ? `<a href="${escapeHtml(p.linkHref)}" class="${styles.popupLink}" target="_blank" rel="noopener noreferrer">${escapeHtml(p.linkLabel)}</a>` : ''}
            </div>`;
          new maplibre.Popup({ className: styles.popup, maxWidth: '280px' })
            .setLngLat(coords)
            .setHTML(html)
            .addTo(map);
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
    };
  }, [points]);

  if (!points || points.length === 0) return null;

  return (
    <div className={styles.wrap}>
      <div ref={containerRef} className={styles.map} role="application" aria-label="Mapa bodov" />
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
