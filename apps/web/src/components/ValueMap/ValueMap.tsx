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
    let cancelled = false;

    (async () => {
      const maplibre = await import('maplibre-gl');
      if (cancelled || !container) return;

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
        bounds,
        fitBoundsOptions: { padding: 64, maxZoom: 12 },
      });

      map.addControl(new maplibre.NavigationControl({ showCompass: false }), 'top-right');

      map.on('load', () => {
        if (!map) return;
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
            'circle-stroke-width': 3,
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
            'circle-stroke-width': 3,
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
