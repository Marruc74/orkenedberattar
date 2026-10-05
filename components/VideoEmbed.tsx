'use client';

import { useEffect, useState } from 'react';
import Icon from './Icon';
import { formatTime } from '@/lib/format';

type Status = 'facade' | 'loading' | 'playing' | 'error';

type Props = {
  youtubeId: string;
  title: string;
  durationSec: number;
  captions: boolean;
  /** Self-hosted poster. Never YouTube's thumbnail: nothing may reach Google before the tap. */
  poster?: string;
};

const LOAD_TIMEOUT_MS = 15000;

export default function VideoEmbed({ youtubeId, title, durationSec, captions, poster }: Props) {
  const [status, setStatus] = useState<Status>('facade');
  const [error, setError] = useState('');

  function start() {
    if (!youtubeId) {
      setError('Filmen är inte uppladdad än.');
      setStatus('error');
    } else if (!navigator.onLine) {
      setError('Du verkar sakna internet just nu. Försök igen när du har täckning.');
      setStatus('error');
    } else {
      setStatus('loading');
    }
  }

  useEffect(() => {
    if (status !== 'loading') return;
    const t = setTimeout(() => {
      setError('Filmen laddar inte. Täckningen kan vara svag här.');
      setStatus('error');
    }, LOAD_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, [status]);

  const params = new URLSearchParams({ autoplay: '1', rel: '0', playsinline: '1', hl: 'sv' });
  if (captions) {
    params.set('cc_load_policy', '1');
    params.set('cc_lang_pref', 'sv');
  }

  return (
    <section className="video" aria-label="Film">
      {status === 'facade' ? (
        <button type="button" className="video-frame video-facade" onClick={start} aria-label={`Spela filmen ${title}, ${formatTime(durationSec)}`}>
          {poster && <img src={poster} alt="" loading="lazy" />}
          <span className="video-play" aria-hidden="true">
            <Icon name="play" />
          </span>
          <span className="video-caption" aria-hidden="true">
            <span>Film: {title}</span>
            <span className="video-len">{formatTime(durationSec)}</span>
          </span>
        </button>
      ) : status === 'error' ? (
        <div className="video-frame" role="alert">
          <div className="video-status">
            <p>{error}</p>
            <button type="button" className="btn btn-light" style={{ marginTop: 12 }} onClick={() => setStatus('facade')}>
              Tillbaka
            </button>
          </div>
        </div>
      ) : (
        <div className="video-frame">
          {status === 'loading' && (
            <span className="video-status" aria-live="polite">
              Laddar filmen…
            </span>
          )}
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(youtubeId)}?${params}`}
            title={title}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            onLoad={() => setStatus('playing')}
            style={{ opacity: status === 'playing' ? 1 : 0 }}
          />
        </div>
      )}
      <p className="small muted">
        Filmen spelas från YouTube{captions ? ' och har textning' : ''}. Inget laddas förrän du trycker.
      </p>
    </section>
  );
}
