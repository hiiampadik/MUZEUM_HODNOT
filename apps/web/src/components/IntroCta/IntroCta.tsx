'use client';

import { useEffect, useState } from 'react';
import { Pill } from '../Pill/Pill';
import { home } from '@/lib/strings';
import styles from './IntroCta.module.css';

const SCROLL_HIDE_THRESHOLD = 20;
const SHOW_DELAY_MS = 600;

type IntroCtaProps = {
  /** Id of the section to scroll to when the pill is clicked. */
  targetId: string;
};

/**
 * Fixed pill that slides up from the bottom shortly after load and scrolls to
 * the intro bubble on click. Slides back down for good once the page is
 * scrolled past the threshold.
 */
export function IntroCta({ targetId }: IntroCtaProps) {
  const [visible, setVisible] = useState(false);
  const [scrolledPast, setScrolledPast] = useState(false);

  useEffect(() => {
    // The delay itself guarantees a paint of the hidden state happens first,
    // so the transition always runs — even on a fast client-side remount
    // (e.g. navigating back to the page).
    const timer = setTimeout(() => setVisible(true), SHOW_DELAY_MS);

    const onScroll = () => {
      if (window.scrollY >= SCROLL_HIDE_THRESHOLD) setScrolledPast(true);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <div className={`${styles.cta} ${visible && !scrolledPast ? styles.visible : ''}`}>
      <Pill
        variant="solid"
        color="#3657ff"
        emoji="👀"
        onClick={() => {
          document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }}
      >
        {home.introCta}
      </Pill>
    </div>
  );
}
