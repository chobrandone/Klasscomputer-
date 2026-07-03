import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { AuthInit } from '@/components/layout/auth-init';
import './globals.css';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  title: {
    default: 'Klass Computer — Computers & Electronics in Cameroon',
    template: '%s | Klass Computer',
  },
  description:
    'Klass Computer — your trusted shop for laptops, desktops, accessories and peripherals in Cameroon. Genuine products, 12-month warranty, fast nationwide delivery.',
  keywords: ['computers', 'laptops', 'electronics', 'Cameroon', 'Douala', 'Klass Computer'],
  openGraph: {
    siteName: 'Klass Computer',
    type: 'website',
  },
};

const themeScript = `
try {
  const theme = localStorage.getItem('theme') ?? 'light';
  document.documentElement.classList.toggle('dark', theme === 'dark');
} catch (e) {}
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={inter.className}>
        <AuthInit />
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: { borderRadius: '8px', fontSize: '14px' },
          }}
        />
      </body>
    </html>
  );
}
