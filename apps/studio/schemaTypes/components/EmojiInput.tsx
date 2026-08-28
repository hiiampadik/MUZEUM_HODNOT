import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import { set, unset, type StringInputProps } from 'sanity';

// emoji-picker-react is a large bundle; load it only when the picker opens.
const EmojiPicker = lazy(() => import('emoji-picker-react'));

/**
 * Custom input for the `emoji` string field: a button showing the current
 * emoji (or a placeholder) that opens a searchable emoji picker. The plain
 * text input is kept below so an editor can still clear the value or paste
 * manually. Writes the raw emoji character as the string value.
 */
export function EmojiInput(props: StringInputProps) {
  const { value, onChange, renderDefault } = props;
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const pick = useCallback(
    (emoji: string) => {
      onChange(emoji ? set(emoji) : unset());
      setOpen(false);
    },
    [onChange],
  );

  // Close the popover on outside click or Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={wrapRef} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ position: 'relative', display: 'flex', gap: 8, alignItems: 'center' }}>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label="Vybrať emoji"
          style={{
            width: 44,
            height: 44,
            fontSize: 22,
            lineHeight: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 4,
            border: '1px solid var(--card-border-color, #d0d2d8)',
            background: 'var(--card-bg-color, #fff)',
            cursor: 'pointer',
          }}
        >
          {value || '🙂'}
        </button>
        <span style={{ fontSize: 13, color: 'var(--card-muted-fg-color, #6e7683)' }}>
          {value ? 'Klikni pre zmenu emoji' : 'Klikni a vyber emoji'}
        </span>
        {open && (
          <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 20 }}>
            <Suspense
              fallback={
                <div
                  style={{
                    padding: 16,
                    fontSize: 13,
                    borderRadius: 8,
                    border: '1px solid var(--card-border-color, #d0d2d8)',
                    background: 'var(--card-bg-color, #fff)',
                    color: 'var(--card-muted-fg-color, #6e7683)',
                  }}
                >
                  Načítavam…
                </div>
              }
            >
              <EmojiPicker
                onEmojiClick={(data) => pick(data.emoji)}
                searchPlaceholder="Hľadať…"
                width={320}
                height={400}
                lazyLoadEmojis
                skinTonesDisabled
              />
            </Suspense>
          </div>
        )}
      </div>
      {renderDefault(props)}
    </div>
  );
}
