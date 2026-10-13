'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Icon from './Icon';
import { useStamps } from '@/lib/visitor';

export default function SiteHeader({ stampTotal }: { stampTotal: number }) {
  const stamps = useStamps();
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={compact ? 'site-header is-compact' : 'site-header'}>
      <Link href="/" className="brand" aria-label="Örkeneds Hembygdsförening, till startsidan">
        <span className="brand-mark" aria-hidden="true">
          Ö
        </span>
        <span className="brand-name" aria-hidden="true">
          Örkeneds
          <br />
          Hembygdsförening
        </span>
      </Link>
      <div className="header-actions">
        {stampTotal > 0 && (
          <Link
            href="/stamplar/"
            className="stamp-pill"
            aria-label={`Stämpelkort, ${stamps?.length ?? 0} av ${stampTotal} stämplar`}
          >
            <Icon name="stamp" />
            {stamps?.length ?? 0}/{stampTotal}
          </Link>
        )}
        {/* English is phase 2 (spec §1); the switch is shown so the layout is final. */}
        <div className="lang-switch" role="group" aria-label="Språk">
          <span aria-current="true" lang="sv">
            SV
          </span>
          <span aria-disabled="true" lang="en" title="English coming soon">
            EN
          </span>
        </div>
      </div>
    </header>
  );
}
