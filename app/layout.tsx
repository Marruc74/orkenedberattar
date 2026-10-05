import type { Metadata, Viewport } from 'next';
import { Atkinson_Hyperlegible, Fraunces } from 'next/font/google';
import SiteHeader from '@/components/SiteHeader';
import './globals.css';

// next/font downloads the fonts at build time and serves them from our own domain,
// so no visitor request goes to Google (spec §7, GDPR).
const fraunces = Fraunces({ subsets: ['latin'], weight: '600', variable: '--font-fraunces', display: 'swap' });
const atkinson = Atkinson_Hyperlegible({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-atkinson',
  display: 'swap',
});

export const metadata: Metadata = {
  title: { default: 'Örkeneds Hembygdsförening – bygdegården', template: '%s – Örkeneds Hembygdsförening' },
  description: 'Ljud, film och berättelser om föremålen i bygdegården. Skanna koden vid ett föremål.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAF6EF' },
    { media: '(prefers-color-scheme: dark)', color: '#1C1915' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv" className={`${fraunces.variable} ${atkinson.variable}`}>
      <body>
        <div className="page">
          <SiteHeader />
          {children}
        </div>
      </body>
    </html>
  );
}
