import type { Metadata } from 'next';
import ObjectIndex from '@/components/ObjectIndex';
import SiteFooter from '@/components/SiteFooter';
import { getObjects } from '@/lib/content';

export const metadata: Metadata = { title: 'Alla föremål' };

export default function AllObjectsPage() {
  return (
    <>
      <ObjectIndex title="Alla föremål" description="Alla föremål i bygdegården, i nummerordning." objects={getObjects()} />
      <SiteFooter />
    </>
  );
}
