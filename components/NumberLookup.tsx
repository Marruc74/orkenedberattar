'use client';

import { useRouter } from 'next/navigation';
import { useId, useState } from 'react';
import Icon from './Icon';
import type { ObjectSummary } from '@/lib/content';

export default function NumberLookup({ objects, label = 'Skriv numret på skylten' }: { objects: ObjectSummary[]; label?: string }) {
  const router = useRouter();
  const id = useId();
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  function go(e: React.FormEvent) {
    e.preventDefault();
    const typed = value.trim();
    if (!typed) return setError('Skriv numret som står på skylten.');
    const hit = objects.find((o) => o.nummer === Number(typed));
    if (!hit) return setError(`Vi hittar inget föremål med nummer ${typed}. Kontrollera skylten och försök igen.`);
    router.push(`/o/${hit.slug}/`);
  }

  return (
    <form className="card lookup" onSubmit={go} noValidate>
      <label htmlFor={id}>{label}</label>
      <div className="lookup-row">
        <input
          id={id}
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="off"
          maxLength={3}
          placeholder="t.ex. 12"
          value={value}
          onChange={(e) => {
            setValue(e.target.value.replace(/\D/g, ''));
            setError('');
          }}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-err` : undefined}
        />
        <button type="submit" className="btn btn-accent">
          Gå
        </button>
      </div>
      {error && (
        <div className="lookup-error" id={`${id}-err`} role="alert">
          <Icon name="error" />
          <span>{error}</span>
        </div>
      )}
    </form>
  );
}
