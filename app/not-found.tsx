import type { Metadata } from 'next';
import NumberLookup from '@/components/NumberLookup';
import ObjectCard from '@/components/ObjectCard';
import SiteFooter from '@/components/SiteFooter';
import { getObjects, getRoom, getSummaries } from '@/lib/content';

export const metadata: Metadata = { title: 'Vi hittar inte det föremålet' };

export default function NotFound() {
  return (
    <>
      <main className="page-intro" style={{ gap: 24 }}>
        <div className="prose" style={{ gap: 12 }}>
          <h1>Vi hittar inte det föremålet</h1>
          <p>Koden kan vara gammal eller felskriven. Skriv numret från skylten, eller välj i listan nedan.</p>
        </div>
        <NumberLookup objects={getSummaries()} />
        <section className="prose" style={{ gap: 8 }}>
          <h2 style={{ marginBottom: 4 }}>Alla föremål</h2>
          <ul className="object-list">
            {getObjects().map((o) => (
              <ObjectCard key={o.nummer} object={o} meta={`Nr ${o.nummer} · ${getRoom(o.rum).namn}`} />
            ))}
          </ul>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
