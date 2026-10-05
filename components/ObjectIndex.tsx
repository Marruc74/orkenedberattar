import Link from 'next/link';
import Icon from './Icon';
import ObjectCard from './ObjectCard';
import { getRooms, mediaLabel, type ObjectItem } from '@/lib/content';

/** Shared by "Alla föremål" and room pages: back link, heading, room chips, object list. */
export default function ObjectIndex({
  title,
  description,
  objects,
  currentRoom,
}: {
  title: string;
  description: string;
  objects: ObjectItem[];
  currentRoom?: string;
}) {
  return (
    <main>
      <div className="page-intro" style={{ paddingTop: 16, gap: 16 }}>
        <Link href="/" className="text-link back-link">
          <Icon name="arrowBack" />
          Startsidan
        </Link>
        <h1>{title}</h1>
        <p>{description}</p>
        <nav className="chips" aria-label="Rum">
          <Link href="/foremal/" className="chip" aria-current={currentRoom ? undefined : 'page'}>
            Alla
          </Link>
          {getRooms().map((r) => (
            <Link key={r.slug} href={`/r/${r.slug}/`} className="chip" aria-current={currentRoom === r.slug ? 'page' : undefined}>
              {r.namn}
            </Link>
          ))}
        </nav>
        <ul className="object-list">
          {objects.map((o) => (
            <ObjectCard key={o.nummer} object={o} meta={`Nr ${o.nummer} · ${mediaLabel(o)}`} />
          ))}
        </ul>
      </div>
    </main>
  );
}
