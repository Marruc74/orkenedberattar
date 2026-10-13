'use client';

import Link from 'next/link';
import { useState } from 'react';
import Icon from './Icon';
import { clearStamps, useDetectiveProgress, useStamps } from '@/lib/visitor';

type StampObject = { nummer: number; slug: string; titel: string; src?: string };

export default function StampCard({
  objects,
  detective,
}: {
  objects: StampObject[];
  detective?: { namn: string; marke: string; antal: number };
}) {
  const stamps = useStamps() ?? [];
  const progress = useDetectiveProgress() ?? 0;
  const [confirming, setConfirming] = useState(false);
  const earned = objects.filter((o) => stamps.includes(o.nummer)).length;

  return (
    <>
      <p className="stamp-total">
        <Icon name="stamp" />
        {earned} av {objects.length} stämplar
      </p>

      <ul className="stamp-grid">
        {objects.map((o) => {
          const has = stamps.includes(o.nummer);
          return (
            <li key={o.nummer}>
              <Link href={`/o/${o.slug}/`} className={has ? 'stamp-tile has-stamp' : 'stamp-tile'}>
                <span className="stamp-tile-img">
                  {o.src && <img src={o.src} alt="" loading="lazy" />}
                  {has && (
                    <span className="stamp-tile-mark" aria-hidden="true">
                      <Icon name="stamp" />
                    </span>
                  )}
                </span>
                <span className="small muted">Nr {o.nummer}</span>
                <span className="stamp-tile-title">{o.titel}</span>
                <span className="visually-hidden">{has ? ', stämpel klar' : ', ingen stämpel än'}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      {detective && (
        <Link href="/detektiv/" className="card room-row">
          <span>
            <span className="room-row-name">{detective.namn}</span>
            <span className="small muted">
              {progress >= detective.antal
                ? `Klart! Du har märket ${detective.marke}.`
                : `${progress} av ${detective.antal} ledtrådar lösta`}
            </span>
          </span>
          <Icon name="chevronRight" />
        </Link>
      )}

      {earned > 0 && (
        <button
          type="button"
          className="text-link"
          style={{ alignSelf: 'flex-start' }}
          onClick={() => {
            if (!confirming) return setConfirming(true);
            clearStamps();
            setConfirming(false);
          }}
          onBlur={() => setConfirming(false)}
        >
          {confirming ? 'Tryck igen för att tömma stämpelkortet' : 'Töm stämpelkortet'}
        </button>
      )}
    </>
  );
}
