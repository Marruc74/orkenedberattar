import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import AudioPlayer from '@/components/AudioPlayer';
import Icon from '@/components/Icon';
import ObjectCard from '@/components/ObjectCard';
import ObjectHero from '@/components/ObjectHero';
import Quiz from '@/components/Quiz';
import { MarkSeen } from '@/components/Seen';
import SiteFooter from '@/components/SiteFooter';
import { TourJoin, TourNav } from '@/components/Tour';
import VideoEmbed from '@/components/VideoEmbed';
import {
  getObject,
  getObjectByNumber,
  getObjects,
  getQuizObjects,
  getRelated,
  getRoom,
  getToursFor,
  toTourInfo,
  type ObjectItem,
} from '@/lib/content';

type Params = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return getObjects().map((o) => ({ slug: o.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const o = getObject((await params).slug);
  if (!o) return {};
  return { title: `${o.nummer}. ${o.titel}`, description: o.ingress };
}

/** Where "Nästa föremål" after the audio leads: next tour stop, otherwise next number. */
function nextAfter(o: ObjectItem) {
  for (const t of getToursFor(o)) {
    const n = t.objekt[t.objekt.indexOf(o.nummer) + 1];
    if (n !== undefined) return getObjectByNumber(n)!;
  }
  return getObjects().find((x) => x.nummer > o.nummer);
}

function domainOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export default async function ObjectPage({ params }: Params) {
  const o = getObject((await params).slug);
  if (!o) notFound();

  const room = getRoom(o.rum);
  const related = getRelated(o);
  const tours = getToursFor(o).map(toTourInfo);
  const next = nextAfter(o);

  return (
    <>
      <main>
        <MarkSeen nummer={o.nummer} />
        <ObjectHero object={o} />

        <div className="object-title">
          <Link href={`/r/${room.slug}/`} className="room-link">
            <Icon name="location" />
            {room.namn}
          </Link>
          <h1>{o.titel}</h1>
          <p className="lead">{o.ingress}</p>
        </div>

        {o.ljud && (
          <AudioPlayer
            src={o.ljud.fil}
            durationSec={o.ljud.langdSek}
            narrator={o.ljud.berattare}
            transcript={o.ljud.transkript}
            title={`${o.nummer}. ${o.titel}`}
            next={next && { nummer: next.nummer, titel: next.titel, href: `/o/${next.slug}/` }}
          />
        )}

        {o.video && (
          <VideoEmbed
            youtubeId={o.video.youtubeId}
            title={o.video.titel}
            durationSec={o.video.langdSek}
            captions={o.video.textning}
          />
        )}

        {o.bodyHtml && (
          <div className="body-text">
            <div className="prose" dangerouslySetInnerHTML={{ __html: o.bodyHtml }} />
            {o.bodyMoreHtml && (
              <details>
                <summary>Läs mer</summary>
                <div className="prose" dangerouslySetInnerHTML={{ __html: o.bodyMoreHtml }} />
              </details>
            )}
          </div>
        )}

        {o.vissteDu && (
          <aside className="dyk" aria-label="Visste du att">
            <span className="dyk-icon" aria-hidden="true">
              <Icon name="lightbulb" />
            </span>
            <div className="dyk-bubble">
              <span className="dyk-kicker">Visste du att…</span>
              <span className="dyk-text">{o.vissteDu}</span>
            </div>
          </aside>
        )}

        {o.fakta.length > 0 && (
          <div className="card facts">
            <dl>
              {o.fakta.map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        {o.quiz.length > 0 && (
          <Quiz nummer={o.nummer} titel={o.titel} questions={o.quiz} total={getQuizObjects().length} />
        )}

        {related.length > 0 && (
          <section className="section">
            <h2>Hör ihop med</h2>
            <ul className="object-list">
              {related.map((r) => (
                <ObjectCard key={r.nummer} object={r} meta={`Nr ${r.nummer} · ${getRoom(r.rum).namn}`} />
              ))}
            </ul>
          </section>
        )}

        {o.lankar.length > 0 && (
          <section className="section">
            <h2>Läs mer på andra sajter</h2>
            <ul className="ext-links">
              {o.lankar.map((l) => (
                <li key={l.url}>
                  <a href={l.url} target="_blank" rel="noopener">
                    <span style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <span className="ext-title">{l.titel}</span>
                      <span className="small muted">{domainOf(l.url)} · öppnas i ny flik</span>
                    </span>
                    <Icon name="openInNew" />
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {tours[0] && <TourJoin tour={tours[0]} />}
      </main>
      <SiteFooter updated={o.uppdaterad} />
      <TourNav tours={tours} current={o.nummer} />
    </>
  );
}
