import { common } from '@/lib/strings';
import styles from './Materials.module.css';

export type MaterialItem = {
  _key: string;
  title: string | null;
  url: string | null;
  extension?: string | null;
  size?: number | null;
};

function formatSize(bytes?: number | null): string | null {
  if (!bytes) return null;
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} kB`;
}

/** A list of downloadable materials (exhibitions + page-builder materialsBlock). */
export function Materials({ items }: { items: readonly MaterialItem[] }) {
  if (!items || items.length === 0) return null;

  return (
    <ul className={styles.list}>
      {items.map((item) => {
        if (!item.url) return null;
        const meta = [item.extension?.toUpperCase(), formatSize(item.size)]
          .filter(Boolean)
          .join(' · ');
        return (
          <li key={item._key} className={styles.item}>
            <a href={item.url} download>
              <span>{item.title || common.fileFallback}</span>
              {meta && <span className={styles.meta}>{meta}</span>}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
