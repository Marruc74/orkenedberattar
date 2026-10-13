import Icon from './Icon';
import type { ObjectItem } from '@/lib/content';

export default function ObjectHero({ object }: { object: ObjectItem }) {
  const { src, alt, width = 1600, height = 1200 } = object.heroBild;
  return (
    // With a photo the box takes the photo's own shape, so nothing is cropped.
    <div className={src ? 'hero hero-photo' : 'hero'} style={src ? { aspectRatio: `${width} / ${height}` } : undefined}>
      {src ? (
        <img src={src} alt={alt} fetchPriority="high" decoding="async" width={width} height={height} />
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
