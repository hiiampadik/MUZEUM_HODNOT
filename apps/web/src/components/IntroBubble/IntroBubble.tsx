'use client';

import { useState, useId } from 'react';
import { RichText } from '../RichText/RichText';
import { Button } from '../Button/Button';

type IntroBubbleProps = {
  excerpt?: readonly unknown[] | null;
  rest?: readonly unknown[] | null;
};

/** Project description: excerpt is always shown, the rest expands behind a button. */
export function IntroBubble({ excerpt, rest }: IntroBubbleProps) {
  const [open, setOpen] = useState(false);
  const regionId = useId();
  const hasRest = Array.isArray(rest) && rest.length > 0;

  return (
    <div>
      <RichText value={excerpt} />
      {hasRest && (
        <>
          <div id={regionId} hidden={!open}>
            <RichText value={rest} />
          </div>
          <Button
            variant="primary"
            aria-expanded={open}
            aria-controls={regionId}
            onClick={() => setOpen((v) => !v)}
          >
            <span aria-hidden="true">{open ? '⬆️' : '⬇️'}</span>
            {open ? 'Zbaliť' : 'Čítať viac'}
          </Button>
        </>
      )}
    </div>
  );
}
