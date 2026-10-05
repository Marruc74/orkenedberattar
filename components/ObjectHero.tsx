import Icon from './Icon';
import type { ObjectItem } from '@/lib/content';

export default function ObjectHero({ object }: { object: ObjectItem }) {
  const { src, alt } = object.heroBild;
  return (
    <div className="hero">
      {src ? (
        <img src={src} alt={alt} fetchPriority="high" decoding="async" width={1600} height={1200} />
      ) : (
        // "Ingen bild" state: colour plate + icon, alt text kept for screen readers.
        <div className="hero-placeholder" role="img" aria-label={alt}>
          <Icon name="image" />
          <span aria-hidden="true">{alt}</span>
        </div>
      )}
      <span className="number-badge" aria-label={`Föremål nummer ${object.nummer}`}>
        {object.nummer}
      </span>
    </div>
  );
}
