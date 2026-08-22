import type { Metadata, Viewport } from 'next';
import './globals.css';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://happybody.fit';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Happy Body — Your next step',
  description: 'Understand your body, discover your next step, and build natural strength and mobility.',
  applicationName: 'Happy Body',
  manifest: './manifest.webmanifest',
  icons: {
    icon: [{ url: './icon-192.png', sizes: '192x192', type: 'image/png' }],
    apple: [{ url: './icon-192.png', sizes: '192x192', type: 'image/png' }],
  },
  openGraph: {
    title: 'Happy Body',
    description: 'Understand your body. Discover your next step.',
    type: 'website',
    images: [{ url: './og.png', width: 1731, height: 909, alt: 'Happy Body — Understand your body. Discover your next step.' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Happy Body',
    description: 'Understand your body. Discover your next step.',
    images: ['./og.png'],
  },
  appleWebApp: { capable: true, title: 'Happy Body', statusBarStyle: 'default' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#f7f4ed',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
