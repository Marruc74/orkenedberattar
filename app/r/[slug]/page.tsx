import type { Metadata } from 'next';
import ObjectIndex from '@/components/ObjectIndex';
import SiteFooter from '@/components/SiteFooter';
import { getObjects, getRoom, getRooms } from '@/lib/content';

type Params = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return getRooms().map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  return { title: getRoom((await params).slug).namn };
}

export default async function RoomPage({ params }: Params) {
  const room = getRoom((await params).slug);
  return (
    <>
      <ObjectIndex
        title={room.namn}
        description={room.beskrivning}
        objects={getObjects().filter((o) => o.rum === room.slug)}
        currentRoom={room.slug}
      />
      <SiteFooter />
    </>
  );
}
