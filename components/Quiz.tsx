'use client';

import Link from 'next/link';
import { useState } from 'react';
import Icon from './Icon';
import { addStamp, useStamps } from '@/lib/visitor';
import type { QuizQuestion } from '@/lib/content';

const LETTERS = 'ABCDEFGH';

/** "Testa dig själv" (design 2a): all questions right gives the object's stamp. */
export default function Quiz({
  nummer,
  titel,
  questions,
  total,
}: {
  nummer: number;
  titel: string;
  questions: QuizQuestion[];
  total: number;
}) {
  const stamps = useStamps();
  const hasStamp = stamps?.includes(nummer) ?? false;
  const [solved, setSolved] = useState<boolean[]>(() => questions.map(() => false));

  function onSolved(i: number) {
    const next = solved.map((s, j) => s || j === i);
    setSolved(next);
    if (next.every(Boolean)) addStamp(nummer);
  }

  return (
    <section className="section quiz" aria-labelledby="quiz-heading">
      <h2 id="quiz-heading">Testa dig själv</h2>
      <p>
        {questions.length > 1
          ? 'Svara rätt på frågorna så får du föremålets stämpel.'
          : 'Svara rätt på frågan så får du föremålets stämpel.'}
      </p>

      {questions.map((q, i) => (
        <QuestionCard key={q.fraga} q={q} done={hasStamp || solved[i]} onSolved={() => onSolved(i)} />
      ))}

      {hasStamp && (
        <div className="stamp-earned" role="status">
          <span className="stamp-earned-mark" aria-hidden="true">
            <Icon name="stamp" />
          </span>
          <span className="stamp-earned-text">
            <strong>Du har stämpeln för {titel}!</strong>
            <span>
              {stamps!.length} av {total} stämplar.{' '}
              <Link href="/stamplar/">Se ditt stämpelkort</Link>
            </span>
          </span>
        </div>
      )}
    </section>
  );
}

function QuestionCard({ q, done, onSolved }: { q: QuizQuestion; done: boolean; onSolved: () => void }) {
  const [wrong, setWrong] = useState<string[]>([]);
  const [feedback, setFeedback] = useState('');

  function pick(alt: string) {
    if (done) return;
    if (alt === q.svar) {
      setFeedback('Rätt!');
      onSolved();
    } else {
      setWrong((w) => [...w, alt]);
      setFeedback('Inte riktigt. Försök igen!');
    }
  }

  const plats = q.typ === 'plats';
  return (
    <div className="card quiz-card">
      <span className={plats ? 'quiz-kicker is-plats' : 'quiz-kicker'}>
        <Icon name={plats ? 'visibility' : 'help'} />
        {plats ? 'På plats · Titta noga' : 'Fråga om berättelsen'}
      </span>
      <h3 className="quiz-question">{q.fraga}</h3>
      <ul className="quiz-options">
        {q.alternativ.map((alt, i) => {
          const state = done && alt === q.svar ? 'right' : wrong.includes(alt) ? 'wrong' : undefined;
          return (
            <li key={alt}>
              <button
                type="button"
                className="quiz-option"
                data-state={state}
                aria-disabled={done || state === 'wrong' ? true : undefined}
                onClick={() => state !== 'wrong' && pick(alt)}
              >
                <span className="quiz-letter" aria-hidden="true">
                  {state === 'right' ? <Icon name="check" /> : state === 'wrong' ? <Icon name="close" /> : LETTERS[i]}
                </span>
                <span>{alt}</span>
                {state && <span className="visually-hidden">{state === 'right' ? ' – rätt svar' : ' – fel svar'}</span>}
              </button>
            </li>
          );
        })}
      </ul>
      <p className={done ? 'quiz-feedback is-right' : 'quiz-feedback'} role="status">
        {done ? 'Rätt!' : feedback}
      </p>
    </div>
  );
}
