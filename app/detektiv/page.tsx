import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Detective from '@/components/Detective';
import Icon from '@/components/Icon';
import SiteFooter from '@/components/SiteFooter';
import { getDetective, getSummaries } from '@/lib/content';

export const metadata: Metadata = { title: 'Detektivuppdraget' };

export default function DetectivePage() {
  const d = getDetective();
  if (!d) notFound();
  return (
    <>
      <main>
        <div className="page-intro" style={{ paddingTop: 16, gap: 16 }}>
          <Link href="/" className="text-link back-link">
            <Icon name="arrowBack" />
            Startsidan
          </Link>
          <h1>{d.namn}</h1>
          <p>{d.beskrivning}</p>
          <Detective clues={d.ledtradar} badge={d.marke} objects={getSummaries()} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
