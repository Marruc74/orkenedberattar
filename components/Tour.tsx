'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Icon from './Icon';
import { endTour, startTour, useActiveTour, useSeen } from '@/lib/visitor';
import type { ObjectSummary } from '@/lib/content';

export type TourInfo = { slug: string; namn: string; objekt: ObjectSummary[] };

const href = (o: ObjectSummary) => `/o/${o.slug}/`;

/** "Gå rundturen" prompt on object pages when no tour is running. */
export function TourJoin({ tour }: { tour: TourInfo }) {
  const active = useActiveTour();
  if (active !== null) return null;
  return (
    <div className="tour-join">
      <p>
        Föremålet ingår i rundturen <b>{tour.namn}</b>.
      </p>
      <button type="button" className="btn btn-green" onClick={() => startTour(tour.slug)}>
        Gå rundturen
      </button>
    </div>
  );
}

/** TourNav (spec §4): fixed bottom bar, only while the visitor is on a tour that includes this object. */
export function TourNav({ tours, current }: { tours: TourInfo[]; current: number }) {
  const active = useActiveTour();
  const tour = tours.find((t) => t.slug === active);
  if (!tour) return null;

  const idx = tour.objekt.findIndex((o) => o.nummer === current);
  const prev = tour.objekt[idx - 1];
  const next = tour.objekt[idx + 1];

  return (
    <>
      <div className="tour-nav-spacer" />
      <nav className="tour-nav" aria-label={`Rundtur: ${tour.namn}`}>
        <div className="tour-nav-inner">
          <NavButton target={prev} className="btn btn-prev" label="Föregående" direction="back" />
          <span className="tour-nav-count">
            {idx + 1} av {tour.objekt.length}
          </span>
          <NavButton target={next} className="btn btn-accent" label="Nästa" direction="forward" />
        </div>
      </nav>
    </>
  );
}

function NavButton({ target, className, label, direction }: { target?: ObjectSummary; className: string; label: string; direction: 'back' | 'forward' }) {
  const content =
    direction === 'back' ? (
      <>
        <Icon name="arrowBack" />
        <span className="btn-label">{label}</span>
      </>
    ) : (
      <>
        <span className="btn-label">{label}</span>
        <Icon name="arrowForward" />
      </>
    );
  // First/last stop: inactive button (spec §4).
  if (!target)
    return (
      <span className={className} aria-disabled="true">
        {content}
      </span>
    );
  return (
    <Link href={href(target)} className={className} aria-label={`${label}: ${target.nummer} ${target.titel}`}>
      {content}
    </Link>
  );
}

/** Start or continue a tour; continuing jumps to the first stop not yet seen. */
export function TourStartButton({ tour, className = 'btn btn-light' }: { tour: TourInfo; className?: string }) {
  const router = useRouter();
  const active = useActiveTour();
  const seen = useSeen() ?? [];
  const running = active === tour.slug;

  function go() {
    startTour(tour.slug);
    const target = running ? (tour.objekt.find((o) => !seen.includes(o.nummer)) ?? tour.objekt[0]) : tour.objekt[0];
    router.push(href(target));
  }

  return (
    <button type="button" className={className} onClick={go}>
      {running ? 'Fortsätt rundturen' : 'Starta rundturen'}
      <Icon name="arrowForward" />
    </button>
  );
}

export function TourEndButton({ slug }: { slug: string }) {
  const active = useActiveTour();
  if (active !== slug) return null;
  return (
    <button type="button" className="text-link" onClick={endTour}>
      Avsluta rundturen
    </button>
  );
}
