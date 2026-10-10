import { useEffect, useState } from 'react';
import { set, setIfMissing, unset, useClient, type ObjectInputProps } from 'sanity';

type School = { _key: string; title: string | null };
type FeedValue = { schoolKey?: string; schoolTitle?: string };

const SCHOOLS_QUERY = `*[_id == "valueGenerator"][0].mapPoints[]{ _key, title }`;

/**
 * Input for one Darujme feed entry: picks the school from the value-generator
 * map points (stores its `_key` + title for the preview), then renders the
 * default fields (feed ID) below.
 */
export function DarujmeFeedInput(props: ObjectInputProps) {
  const { value, onChange, renderDefault } = props;
  const current = value as FeedValue | undefined;
  const client = useClient({ apiVersion: '2025-02-19' });
  const [schools, setSchools] = useState<School[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    client
      .fetch<School[] | null>(SCHOOLS_QUERY)
      .then((res) => !cancelled && setSchools(res ?? []))
      .catch(() => !cancelled && setSchools([]));
    return () => {
      cancelled = true;
    };
  }, [client]);

  const select = (key: string) => {
    const school = schools?.find((s) => s._key === key);
    onChange(
      school
        ? [
            setIfMissing({}),
            set(school._key, ['schoolKey']),
            set(school.title ?? school._key, ['schoolTitle']),
          ]
        : [unset(['schoolKey']), unset(['schoolTitle'])],
    );
  };

  const missing =
    current?.schoolKey && schools && !schools.some((s) => s._key === current.schoolKey);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
        <span style={{ fontWeight: 600 }}>Škola</span>
        <select
          value={current?.schoolKey ?? ''}
          disabled={schools === null}
          onChange={(e) => select(e.target.value)}
          style={{
            padding: '8px 12px',
            fontSize: 14,
            borderRadius: 4,
            border: '1px solid var(--card-border-color, #d0d2d8)',
            background: 'var(--card-bg-color, #fff)',
            color: 'var(--card-fg-color, #101112)',
          }}
        >
          <option value="">{schools === null ? 'Načítavam…' : '— Vyber školu —'}</option>
          {missing && <option value={current!.schoolKey}>{current?.schoolTitle} (už nie je na mape)</option>}
          {schools?.map((s) => (
            <option key={s._key} value={s._key}>
              {s.title || s._key}
            </option>
          ))}
        </select>
      </label>
      {missing && (
        <div style={{ fontSize: 13, color: 'var(--card-critical-fg-color, #b8482e)' }}>
          Táto škola už nie je medzi bodmi na mape Generátora hodnôt.
        </div>
      )}
      {renderDefault(props)}
    </div>
  );
}
