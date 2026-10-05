'use client';

import { useEffect } from 'react';
import Icon from './Icon';
import { markSeen, useSeen } from '@/lib/visitor';

/** Marks the current object as seen on this device. Renders nothing. */
export function MarkSeen({ nummer }: { nummer: number }) {
  useEffect(() => markSeen(nummer), [nummer]);
  return null;
}

export function SeenBadge({ nummer }: { nummer: number }) {
  const seen = useSeen();
  if (!seen?.includes(nummer)) return null;
  return (
    <span className="seen">
      <Icon name="checkCircle" />
      Sett
    </span>
  );
}
