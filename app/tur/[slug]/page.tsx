import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Icon from '@/components/Icon';
import ObjectCard from '@/components/ObjectCard';
import SiteFooter from '@/components/SiteFooter';
import { TourEndButton, TourStartButton } from '@/components/Tour';
import { getObjectByNumber, getRoom, getTour, getTours, toTourInfo } from '@/lib/content';

type Params = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return getTours().map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const t = getTour((await params).slug);
  return t ? { title: `Rundtur: ${t.namn}` } : {};
}

export default async function TourPage({ params }: Params) {
  const tour = getTour((await params).slug);
  if (!tour) notFound();

  return (
    <>
      <main className="page-intro" style={{ paddingTop: 16, gap: 16 }}>
        <Link href="/" className="text-link back-link">
          <Icon name="arrowBack" />
          Startsidan
        </Link>
        <span className="small muted" style={{ fontWeight: 700 }}>
          Rundtur · {tour.objekt.length} föremål · ca {tour.langdMin} minuter
        </span>
        <h1>{tour.namn}</h1>
        <p>{tour.beskrivning}</p>
        <TourStartButton tour={toTourInfo(tour)} className="btn btn-accent" />
        <TourEndButton slug={tour.slug} />
        <ol className="object-list" aria-label="Stopp i rundturen">
          {tour.objekt.map((n, i) => {
            const o = getObjectByNumber(n)!;
            return <ObjectCard key={n} object={o} meta={`Stopp ${i + 1} · Nr ${o.nummer} · ${getRoom(o.rum).namn}`} />;
          })}
        </ol>
      </main>
      <SiteFooter />
    </>
  );
}
