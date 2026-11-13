import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
const sans = localFont({ src: '../public/fonts/geist-latin.woff2', variable: '--font-sans', display: 'swap' });
export const metadata: Metadata = { title: 'PulseDeck — Find your rhythm', description: 'Your everyday listening space. Explore music, save favorites, and find your next mix.' };
export default function RootLayout({children}: {children: React.ReactNode}) { return <html lang="en" className={sans.variable}><body>{children}</body></html>; }
