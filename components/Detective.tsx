'use client';

import Link from 'next/link';
import { useState } from 'react';
import Icon from './Icon';
import { setDetectiveProgress, useDetectiveProgress } from '@/lib/visitor';
import type { Clue, ObjectSummary } from '@/lib/content';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

/** Detektivuppdraget (design 2b): read a clue, find the item, type the number on its sign. */
export default function Detective({ clues, badge, objects }: { clues: Clue[]; badge: string; objects: ObjectSummary[] }) {
  const progress = useDetectiveProgress();
  const [value, setValue] = useState('');
  const [message, setMessage] = useState<{ kind: 'right' | 'wrong'; text: string; href?: string } | null>(null);
  const [showHint, setShowHint] = useState(false);

  // Avoid flashing clue 1 to someone who is halfway through.
  if (progress === null) return <div className="detective" aria-busy="true" />;

  const solved = Math.min(progress, clues.length);
  const clue = clues[solved];
  const justSolved = message?.kind === 'right';

  function press(k: string) {
    setMessage(null);
    setValue((v) => (v + k).slice(0, 3));
  }

  function answer(e: React.FormEvent) {
    e.preventDefault();
    if (!value || !clue) return;
    const n = Number(value);
    if (n === clue.nummer) {
      const hit = objects.find((o) => o.nummer === n)!;
      setMessage({ kind: 'right', text: `Rätt! Det var nr ${n}, ${hit.titel}.`, href: `/o/${hit.slug}/` });
      setDetectiveProgress(solved + 1);
    } else {
      const other = objects.find((o) => o.nummer === n);
      setMessage({
        kind: 'wrong',
        text: other ? `Nr ${n} är ${other.titel}. Det är inte det vi letar efter, leta vidare!` : `Det finns inget föremål med nummer ${n}. Titta på skylten igen.`,
      });
    }
    setValue('');
  }

  function nextClue() {
    setMessage(null);
    setShowHint(false);
  }

  const done = solved >= clues.length && !justSolved;

  return (
    <div className="detective">
      <ol className="stamp-slots" aria-label={`${solved} av ${clues.length} ledtrådar lösta`}>
        {clues.map((_, i) => (
          <li key={i} className={i < solved ? 'is-done' : i === solved && !done ? 'is-current' : undefined}>
            {i < solved ? <Icon name="stamp" /> : i + 1}
          </li>
        ))}
      </ol>

      {done ? (
        <div className="badge-card" role="status">
          <span className="badge-mark" aria-hidden="true">
            <Icon name="stamp" />
          </span>
          <h2>Du har löst uppdraget!</h2>
          <p>
            Du har märket <strong>{badge}</strong>. Visa det för någon i föreningen.
          </p>
          <button type="button" className="btn btn-light" onClick={() => setDetectiveProgress(0)}>
            <Icon name="replay" />
            Börja om
          </button>
        </div>
      ) : justSolved ? (
        <div className="detective-right" role="status">
          <p className="detective-result is-right">
            <Icon name="checkCircle" />
            {message.text}
          </p>
          <Link href={message.href!} className="text-link">
            Läs om föremålet
          </Link>
          <button type="button" className="btn btn-accent" onClick={nextClue}>
            {solved >= clues.length ? 'Se ditt märke' : 'Nästa ledtråd'}
            <Icon name="arrowForward" />
          </button>
        </div>
      ) : (
        <>
          <p className="small muted" style={{ fontWeight: 700 }}>
            Ledtråd {solved + 1} av {clues.length}
          </p>
          <blockquote className="clue">{clue.ledtrad}</blockquote>

          {clue.hjalp &&
            (showHint ? (
              <p className="clue-hint">
                <Icon name="lightbulb" />
                {clue.hjalp}
              </p>
            ) : (
              <button type="button" className="chip hint-btn" onClick={() => setShowHint(true)}>
                <Icon name="lightbulb" />
                Behöver du hjälp?
              </button>
            ))}

          <form className="keypad-form" onSubmit={answer} noValidate>
            <label htmlFor="detective-answer">Numret på skylten:</label>
            <input
              id="detective-answer"
              className="answer-display"
              inputMode="none"
              autoComplete="off"
              maxLength={3}
              placeholder="–"
              value={value}
              onChange={(e) => {
                setMessage(null);
                setValue(e.target.value.replace(/\D/g, '').slice(0, 3));
              }}
              aria-invalid={message?.kind === 'wrong' ? true : undefined}
              aria-describedby={message ? 'detective-msg' : undefined}
            />
            <div className="keypad">
              {KEYS.map((k) => (
                <button key={k} type="button" onClick={() => press(k)}>
                  {k}
                </button>
              ))}
              <button type="button" aria-label="Sudda" onClick={() => setValue((v) => v.slice(0, -1))}>
                <Icon name="backspace" />
              </button>
              <button type="button" onClick={() => press('0')}>
                0
              </button>
              <button type="submit" className="keypad-submit" disabled={!value}>
                Svara
              </button>
            </div>
            {message?.kind === 'wrong' && (
              <p className="detective-result" id="detective-msg" role="alert">
                <Icon name="error" />
                {message.text}
              </p>
            )}
          </form>
        </>
      )}
    </div>
  );
}

/** Start page entry: the button label follows the visitor's progress. */
export function DetectiveStartButton({ antal }: { antal: number }) {
  const progress = useDetectiveProgress() ?? 0;
  const label = progress >= antal ? 'Se ditt märke' : progress > 0 ? `Fortsätt (${progress} av ${antal})` : 'Starta uppdraget';
  return (
    <Link href="/detektiv/" className="btn btn-accent">
      <Icon name="search" />
      {label}
    </Link>
  );
}
