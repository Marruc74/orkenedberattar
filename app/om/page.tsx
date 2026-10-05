import type { Metadata } from 'next';
import SiteFooter from '@/components/SiteFooter';

export const metadata: Metadata = { title: 'Om föreningen' };

// Placeholder copy – replace with the association's own text (spec §2, P3).
export default function AboutPage() {
  return (
    <>
      <main className="page-intro" style={{ gap: 32 }}>
        <section className="prose">
          <h1>Om föreningen</h1>
          <p>
            Örkeneds Hembygdsförening tar hand om bygdegården och berättelserna om socknen. Guiden är gjord av föreningens
            medlemmar.
          </p>
        </section>

        <section className="prose" id="kontakt">
          <h2>Kontakt</h2>
          <p>Kontaktuppgifter läggs in här.</p>
        </section>

        <section className="prose">
          <h2>Integritet</h2>
          <p>
            Guiden använder inga kakor och ingen inloggning. Vilka föremål du har sett sparas bara i din egen telefon. Filmer
            spelas från YouTube via youtube-nocookie.com och laddas först när du trycker på dem.
          </p>
        </section>

        <section className="prose">
          <h2>Tillgänglighet</h2>
          <p>
            Guiden är byggd för att följa WCAG 2.2 nivå AA. All ljudguide har transkript och filmerna har textning. Hittar du
            något som inte fungerar, hör gärna av dig.
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
