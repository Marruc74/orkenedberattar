import Link from 'next/link';
import { lastUpdated } from '@/lib/content';

export default function SiteFooter({ updated }: { updated?: string }) {
  return (
    <footer className="site-footer">
      <nav aria-label="Sidfot">
        <Link href="/foremal/">Alla föremål</Link>
        <Link href="/om/">Om föreningen</Link>
        <Link href="/om/#kontakt">Kontakt</Link>
      </nav>
      <span className="small muted">Örkeneds Hembygdsförening · <span style={{ whiteSpace: 'nowrap' }}>Uppdaterad {updated ?? lastUpdated()}</span></span>
    </footer>
  );
}
