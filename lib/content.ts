import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { marked } from 'marked';
import { formatTime } from './format';
import { imageSize } from './image-size';

const ROOT = path.join(process.cwd(), 'content');

export type Audio = { fil: string; langdSek: number; berattare: string; transkript: string };
export type Video = { youtubeId: string; titel: string; langdSek: number; textning: boolean };
export type Link = { titel: string; url: string };
/** "plats" needs the visitor to look at the item in the room; "berattelse" is about the story. */
export type QuizQuestion = { typ: 'plats' | 'berattelse'; fraga: string; alternativ: string[]; svar: string };

export type ObjectItem = {
  nummer: number;
  slug: string;
  titel: string;
  ingress: string;
  heroBild: { src?: string; alt: string; width?: number; height?: number };
  ljud?: Audio;
  video?: Video;
  fakta: [string, string][];
  vissteDu?: string;
  quiz: QuizQuestion[];
  rum: string;
  relaterade: number[];
  lankar: Link[];
  uppdaterad: string;
  bodyHtml: string;
  bodyMoreHtml?: string;
};

export type Room = { slug: string; namn: string; ordning: number; beskrivning: string };
export type Tour = { slug: string; namn: string; langdMin: number; objekt: number[]; beskrivning: string };
export type Clue = { ledtrad: string; hjalp?: string; nummer: number };
export type Detective = { slug: string; namn: string; marke: string; ledtradar: Clue[]; beskrivning: string };

const READ_MORE_AFTER_WORDS = 150;

function readDir(dir: string) {
  const full = path.join(ROOT, dir);
  return fs
    .readdirSync(full)
    .filter((f) => f.endsWith('.md'))
    .map((f) => matter(fs.readFileSync(path.join(full, f), 'utf8')));
}

function isoDate(v: unknown) {
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return String(v ?? '');
}

/** Splits the body at the first paragraph boundary past the word limit ("Läs mer"). */
function renderBody(md: string) {
  const paragraphs = md.trim().split(/\n\s*\n/);
  let words = 0;
  let cut = paragraphs.length;
  for (let i = 0; i < paragraphs.length; i++) {
    words += paragraphs[i].split(/\s+/).length;
    if (words > READ_MORE_AFTER_WORDS && i < paragraphs.length - 1) {
      cut = i + 1;
      break;
    }
  }
  const html = (parts: string[]) => marked.parse(parts.join('\n\n'), { async: false });
  return {
    bodyHtml: html(paragraphs.slice(0, cut)),
    bodyMoreHtml: cut < paragraphs.length ? html(paragraphs.slice(cut)) : undefined,
  };
}

const withSize = (b: ObjectItem['heroBild']) => (b.src ? { ...b, ...imageSize(b.src) } : b);

let cache: { objects: ObjectItem[]; rooms: Room[]; tours: Tour[]; detective?: Detective } | null = null;

function load() {
  if (cache) return cache;

  const objects = readDir('objekt')
    .filter((m) => (m.data.sprak ?? 'sv') === 'sv')
    .map((m): ObjectItem => {
      const d = m.data;
      return {
        nummer: d.nummer,
        slug: d.slug,
        titel: d.titel,
        ingress: d.ingress,
        heroBild: withSize(d.heroBild ?? { alt: d.titel }),
        ljud: d.ljud,
        video: d.video,
        fakta: (d.fakta ?? []).map((row: Record<string, unknown>) => {
          const [k, v] = Object.entries(row)[0];
          return [k, String(v)] as [string, string];
        }),
        vissteDu: d.vissteDu,
        quiz: (d.quiz ?? []).map((q: QuizQuestion) => ({ ...q, alternativ: q.alternativ.map(String), svar: String(q.svar) })),
        rum: d.rum,
        relaterade: d.relaterade ?? [],
        lankar: d.lankar ?? [],
        uppdaterad: isoDate(d.uppdaterad),
        ...renderBody(m.content),
      };
    })
    .sort((a, b) => a.nummer - b.nummer);

  const rooms = readDir('rum')
    .map((m): Room => ({ ...(m.data as Omit<Room, 'beskrivning'>), beskrivning: m.content.trim() }))
    .sort((a, b) => a.ordning - b.ordning);

  const tours = readDir('turer').map(
    (m): Tour => ({ ...(m.data as Omit<Tour, 'beskrivning'>), beskrivning: m.content.trim() }),
  );

  const [detective] = fs.existsSync(path.join(ROOT, 'uppdrag'))
    ? readDir('uppdrag').map((m): Detective => ({ ...(m.data as Omit<Detective, 'beskrivning'>), beskrivning: m.content.trim() }))
    : [];

  validate(objects, rooms, tours, detective);
  cache = { objects, rooms, tours, detective };
  return cache;
}

/** Fails the build on broken references so volunteers get an error instead of a broken page. */
function validate(objects: ObjectItem[], rooms: Room[], tours: Tour[], detective?: Detective) {
  const nums = new Set<number>();
  const slugs = new Set<string>();
  const roomSlugs = new Set(rooms.map((r) => r.slug));
  for (const o of objects) {
    if (nums.has(o.nummer)) throw new Error(`Objektnummer ${o.nummer} används två gånger`);
    if (slugs.has(o.slug)) throw new Error(`Slug "${o.slug}" används två gånger`);
    if (!/^[a-z0-9-]+$/.test(o.slug)) throw new Error(`Ogiltig slug "${o.slug}" (a–z, 0–9, bindestreck)`);
    if (!roomSlugs.has(o.rum)) throw new Error(`Objekt ${o.nummer}: okänt rum "${o.rum}"`);
    if (!o.heroBild.alt) throw new Error(`Objekt ${o.nummer}: heroBild saknar alt-text`);
    if (o.ljud && !o.ljud.transkript) throw new Error(`Objekt ${o.nummer}: ljud kräver transkript`);
    for (const q of o.quiz) {
      if (q.typ !== 'plats' && q.typ !== 'berattelse')
        throw new Error(`Objekt ${o.nummer}: quiz-typ måste vara "plats" eller "berattelse", inte "${q.typ}"`);
      if (q.alternativ.length < 2) throw new Error(`Objekt ${o.nummer}: frågan "${q.fraga}" behöver minst två alternativ`);
      if (!q.alternativ.includes(q.svar))
        throw new Error(`Objekt ${o.nummer}: svaret "${q.svar}" finns inte bland alternativen till "${q.fraga}"`);
    }
    nums.add(o.nummer);
    slugs.add(o.slug);
  }
  for (const o of objects)
    for (const r of o.relaterade)
      if (!nums.has(r)) throw new Error(`Objekt ${o.nummer}: relaterat objekt ${r} finns inte`);
  for (const t of tours)
    for (const n of t.objekt) if (!nums.has(n)) throw new Error(`Rundtur ${t.slug}: objekt ${n} finns inte`);
  for (const c of detective?.ledtradar ?? [])
    if (!nums.has(c.nummer)) throw new Error(`Detektivuppdraget: ledtråden "${c.ledtrad}" pekar på objekt ${c.nummer} som inte finns`);
}

export const getObjects = () => load().objects;
export const getRooms = () => load().rooms;
export const getTours = () => load().tours;
export const getDetective = () => load().detective;
/** Items that award a stamp: the stamp card total. */
export const getQuizObjects = () => getObjects().filter((o) => o.quiz.length > 0);

export const getObject = (slug: string) => getObjects().find((o) => o.slug === slug);
export const getObjectByNumber = (n: number) => getObjects().find((o) => o.nummer === n);
export const getRoom = (slug: string) => getRooms().find((r) => r.slug === slug)!;
export const getTour = (slug: string) => getTours().find((t) => t.slug === slug);

/** Relations are entered once but shown in both directions (spec §3). */
export function getRelated(o: ObjectItem) {
  const set = new Set(o.relaterade);
  for (const other of getObjects()) if (other.relaterade.includes(o.nummer)) set.add(other.nummer);
  set.delete(o.nummer);
  return [...set]
    .sort((a, b) => a - b)
    .slice(0, 4)
    .map((n) => getObjectByNumber(n)!);
}

export const getToursFor = (o: ObjectItem) => getTours().filter((t) => t.objekt.includes(o.nummer));

export function mediaLabel(o: ObjectItem) {
  const parts: string[] = [];
  if (o.ljud) parts.push(`Ljud ${formatTime(o.ljud.langdSek)}`);
  if (o.video) parts.push(`Film ${formatTime(o.video.langdSek)}`);
  return parts.length ? parts.join(' · ') : 'Bild och text';
}

/** Small summary passed to client components (number lookup, tour nav). */
export type ObjectSummary = { nummer: number; slug: string; titel: string };
export const getSummaries = (): ObjectSummary[] =>
  getObjects().map(({ nummer, slug, titel }) => ({ nummer, slug, titel }));

export const toTourInfo = (t: Tour) => ({
  slug: t.slug,
  namn: t.namn,
  objekt: t.objekt.map((n) => {
    const { nummer, slug, titel } = getObjectByNumber(n)!;
    return { nummer, slug, titel };
  }),
});

export const lastUpdated = () =>
  getObjects()
    .map((o) => o.uppdaterad)
    .sort()
    .at(-1) ?? '';
