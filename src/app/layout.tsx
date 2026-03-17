import type { Metadata } from 'next';
import './globals.css';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: '24 Game',
  description: 'Make 24 from four numbers using +, −, ×, ÷.',
  openGraph: {
    title: '24 Game',
    description: 'Make 24 from four numbers using +, −, ×, ÷.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#dc2626" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
