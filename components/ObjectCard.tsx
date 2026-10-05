import Link from 'next/link';
import Icon from './Icon';
import { SeenBadge } from './Seen';
import type { ObjectItem } from '@/lib/content';

/** RelatedCard (spec §4): the whole card is the link, min 88 px tall. */
export default function ObjectCard({ object, meta }: { object: ObjectItem; meta: string }) {
  return (
    <li>
      <Link href={`/o/${object.slug}/`} className="card object-card">
        <span className="thumb">{object.heroBild.src && <img src={object.heroBild.src} alt="" loading="lazy" />}</span>
        <span className="object-card-text">
          <span className="small muted">{meta}</span>
          <span className="object-card-title">{object.titel}</span>
          <SeenBadge nummer={object.nummer} />
        </span>
        <Icon name="chevronRight" />
      </Link>
    </li>
  );
}
