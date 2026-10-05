'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import Icon from './Icon';
import { formatTime } from '@/lib/format';

type Status = 'idle' | 'playing' | 'paused' | 'buffering' | 'error' | 'ended';

const SPEEDS = [1, 1.25, 1.5];
const SPEED_LABELS = ['1×', '1,25×', '1,5×'];

type Props = {
  src: string;
  durationSec: number;
  narrator: string;
  transcript: string;
  title: string;
  next?: { nummer: number; titel: string; href: string };
};

export default function AudioPlayer({ src, durationSec, narrator, transcript, title, next }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const transcriptRef = useRef<HTMLDetailsElement>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(durationSec);
  const [speedIdx, setSpeedIdx] = useState(0);

  const audio = () => audioRef.current!;

  async function play() {
    const a = audio();
    if (status === 'ended') a.currentTime = 0;
    try {
      setStatus('buffering');
      await a.play();
    } catch (e) {
      // AbortError happens when pause() interrupts a pending play(); that's not a failure.
      if ((e as DOMException).name !== 'AbortError') setStatus('error');
    }
  }

  function toggle() {
    if (status === 'playing' || status === 'buffering') audio().pause();
    else void play();
  }

  function cycleSpeed() {
    const i = (speedIdx + 1) % SPEEDS.length;
    setSpeedIdx(i);
    audio().playbackRate = SPEEDS[i];
  }

  function openTranscript() {
    const d = transcriptRef.current;
    if (!d) return;
    d.open = true;
    d.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // Media Session: title and controls on the lock screen (spec §4).
  useEffect(() => {
    if (!('mediaSession' in navigator) || (status !== 'playing' && status !== 'paused')) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title,
      artist: narrator,
      album: 'Örkeneds Hembygdsförening',
    });
    navigator.mediaSession.setActionHandler('play', () => void audioRef.current?.play());
    navigator.mediaSession.setActionHandler('pause', () => audioRef.current?.pause());
    navigator.mediaSession.setActionHandler('seekbackward', () => {
      if (audioRef.current) audioRef.current.currentTime -= 10;
    });
    navigator.mediaSession.setActionHandler('seekforward', () => {
      if (audioRef.current) audioRef.current.currentTime += 10;
    });
  }, [status, title, narrator]);

  const isActive = status === 'playing' || status === 'buffering';
  const pct = duration ? Math.min(100, (time / duration) * 100) : 0;

  const statusText: Record<Status, string> = {
    idle: `Berättat av ${narrator}`,
    playing: `Berättat av ${narrator}`,
    paused: 'Pausad',
    buffering: 'Laddar ljudet…',
    error: 'Ljudet gick inte att spela',
    ended: 'Slut. Lyssna igen eller gå vidare.',
  };

  return (
    <section className="card audio" aria-label="Ljudguide">
      <audio
        ref={audioRef}
        src={src}
        preload="none"
        onPlaying={() => setStatus('playing')}
        onPause={() => setStatus((s) => (s === 'ended' || s === 'error' ? s : 'paused'))}
        onWaiting={() => setStatus('buffering')}
        onEnded={() => setStatus('ended')}
        onError={() => setStatus('error')}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => Number.isFinite(e.currentTarget.duration) && setDuration(e.currentTarget.duration)}
      />

      <div className="audio-top">
        <button
          type="button"
          className={status === 'buffering' ? 'play-btn is-buffering' : 'play-btn'}
          onClick={toggle}
          disabled={status === 'error'}
          aria-label={isActive ? 'Pausa ljudguiden' : status === 'ended' ? 'Spela igen' : 'Spela ljudguiden'}
        >
          <Icon name={isActive ? 'pause' : status === 'ended' ? 'replay' : 'play'} />
        </button>
        <div className="audio-meta">
          <span className="audio-title">Lyssna · {formatTime(durationSec)}</span>
          <span className="small muted" aria-live="polite">
            {statusText[status]}
          </span>
        </div>
      </div>

      <input
        type="range"
        className="seek"
        min={0}
        max={duration || 1}
        step={1}
        value={time}
        style={{ '--pct': `${pct}%` } as React.CSSProperties}
        onChange={(e) => {
          audio().currentTime = Number(e.target.value);
          setTime(Number(e.target.value));
        }}
        disabled={status === 'error'}
        aria-label="Tidslinje"
        aria-valuetext={`${formatTime(time)} av ${formatTime(duration)}`}
      />

      <div className="audio-times small muted">
        <span>{formatTime(time)}</span>
        <button type="button" className="speed-btn" onClick={cycleSpeed} aria-label={`Uppspelningshastighet ${SPEED_LABELS[speedIdx]}`}>
          {SPEED_LABELS[speedIdx]}
        </button>
        <span aria-label="Tid kvar">−{formatTime(duration - time)}</span>
      </div>

      {status === 'error' && (
        <div className="notice-error" role="alert">
          <b>Kunde inte spela ljudet.</b>
          <span>
            Täckningen kan vara svag här.{' '}
            <button type="button" className="text-link" style={{ minHeight: 0, fontSize: 'inherit' }} onClick={openTranscript}>
              Läs samma berättelse i transkriptet
            </button>
            .
          </span>
        </div>
      )}

      {status === 'ended' && next && (
        <Link href={next.href} className="btn btn-green next-btn">
          <span>
            Nästa föremål: {next.nummer} {next.titel}
          </span>
          <Icon name="arrowForward" />
        </Link>
      )}

      <details className="transcript" ref={transcriptRef}>
        <summary>
          <Icon name="expandMore" />
          Visa transkript
        </summary>
        <p>{transcript}</p>
      </details>
    </section>
  );
}
