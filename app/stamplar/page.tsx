import type { Metadata } from 'next';
import Link from 'next/link';
import Icon from '@/components/Icon';
import SiteFooter from '@/components/SiteFooter';
import StampCard from '@/components/StampCard';
import { getDetective, getQuizObjects } from '@/lib/content';

export const metadata: Metadata = { title: 'Stämpelkortet' };

export default function StampCardPage() {
  const detective = getDetective();
  return (
    <>
      <main>
        <div className="page-intro" style={{ paddingTop: 16, gap: 16 }}>
          <Link href="/" className="text-link back-link">
            <Icon name="arrowBack" />
            Startsidan
          </Link>
          <h1>Stämpelkortet</h1>
          <p>Svara rätt på frågorna under Testa dig själv på varje föremål så får du dess stämpel.</p>
          <StampCard
            objects={getQuizObjects().map(({ nummer, slug, titel, heroBild }) => ({
              nummer,
              slug,
              titel,
              src: heroBild.src,
            }))}
            detective={detective && { namn: detective.namn, marke: detective.marke, antal: detective.ledtradar.length }}
          />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
