import { Link } from '../Link/Link';
import { SanityImage } from '../SanityImage/SanityImage';
import { Label, Text, Title, Underline } from '../Typography/Typography';
import type { ExhibitionSummary } from '@/lib/exhibitions';
import { formatDateRange } from '@/lib/format';
import { routes } from '@/lib/routes';
import styles from './Exhibitions.module.css';

/**
 * Exhibition card: dates, place, title, roles and summary next to the cover.
 * The whole card links to the detail page when the exhibition has one.
 */
export function ExhibitionCard({ exhibition }: { exhibition: ExhibitionSummary }) {
  const { title, slug, startDate, endDate, canOpenDetail, cover, summary, roles, place } = exhibition;
  const roleList = roles ?? [];
  const body = (
    <>
      <div className={styles.body}>
        <div className={styles.band}>
          <div>
            <Label as="p">{formatDateRange(startDate, endDate)}</Label>
            {place && <Label as="p">{place}</Label>}
          </div>
          <Title as="h3">
            <Underline>{title}</Underline>
          </Title>
        </div>
        {roleList.length > 0 && (
          <>
            <hr className={styles.divider} />
            <dl className={styles.roles}>
              {roleList.map((r) => (
                <div key={r._key} className={styles.role}>
                  <dt className={styles.roleLabel}>{r.role}</dt>
                  <dd className={styles.rolePeople}>{r.people}</dd>
                </div>
              ))}
            </dl>
          </>
        )}
        {summary && (
          <>
            <hr className={styles.divider} />
            <div className={styles.band}>
              <Text className={styles.excerpt}>{summary}</Text>
            </div>
          </>
        )}
      </div>
      {cover?.asset?._id && (
        <div className={`${styles.media} reveal-media`}>
          <SanityImage value={cover} width={800} sizes="(max-width: 640px) 100vw, 50vw" />
        </div>
      )}
    </>
  );

  if (canOpenDetail && slug) {
    return (
      <Link href={routes.exhibition(slug)} className={`${styles.card} reveal`}>
        {body}
      </Link>
    );
  }
  return <div className={`${styles.card} reveal`}>{body}</div>;
}
