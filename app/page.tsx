import Link from 'next/link';
import Icon from '@/components/Icon';
import NumberLookup from '@/components/NumberLookup';
import SiteFooter from '@/components/SiteFooter';
import { TourStartButton } from '@/components/Tour';
import { getObjects, getRooms, getSummaries, getTours, toTourInfo } from '@/lib/content';

export default function HomePage() {
  const objects = getObjects();
  const tours = getTours();

  return (
    <>
      <main className="stack" style={{ paddingTop: 28, gap: 32 }}>
        <div className="stack" style={{ padding: 0, gap: 12 }}>
          <h1>Välkommen in i bygdegården</h1>
          <p>
            Här har socknen dansat, spelat teater och druckit kaffe sedan 1922. Skanna koden vid ett föremål, eller skriv in
            numret här.
          </p>
        </div>

        <NumberLookup objects={getSummaries()} />

        {tours.map((t) => (
          <section key={t.slug} className="tour-card" aria-labelledby={`tur-${t.slug}`}>
            <span className="tour-kicker">
              Rundtur · {t.objekt.length} föremål · ca {t.langdMin} minuter
            </span>
            <h2 id={`tur-${t.slug}`}>{t.namn}</h2>
            <p>{t.beskrivning}</p>
            <TourStartButton tour={toTourInfo(t)} />
            <Link href={`/tur/${t.slug}/`} className="text-link" style={{ color: 'inherit', textDecoration: 'underline' }}>
              Se alla stopp
            </Link>
          </section>
        ))}

        <section className="stack" style={{ padding: 0, gap: 8 }}>
          <h2 style={{ marginBottom: 4 }}>Rummen</h2>
          {getRooms().map((r) => {
            const count = objects.filter((o) => o.rum === r.slug).length;
            return (
              <Link key={r.slug} href={`/r/${r.slug}/`} className="card room-row">
                <span>
                  <span className="room-row-name">{r.namn}</span>
                  <span className="small muted">{count} föremål</span>
                </span>
                <Icon name="chevronRight" />
              </Link>
            );
          })}
        </section>

        <section className="stack" style={{ padding: 0, gap: 8 }}>
          <h2>Öppettider</h2>
          <p>Lördag och söndag 11–16, maj–september. Övrig tid går det bra att ringa och boka.</p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
