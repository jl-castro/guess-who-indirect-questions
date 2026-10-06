import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Guess Who? — Indirect Questions',
  description: 'A classroom game for practicing indirect questions.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
