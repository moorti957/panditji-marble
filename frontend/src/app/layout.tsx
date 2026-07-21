// frontend/src/app/layout.tsx

import type { Metadata, Viewport } from 'next';
import { Inter, Cinzel } from 'next/font/google';
import './globals.css';

// Providers
import { ReactQueryProvider } from '../providers/ReactQueryProvider';
import { ThemeProvider } from '../providers/ThemeProvider';

// Layout components
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import CartDrawer from '../components/modals/CartDrawer';
import ScrollReset from '../components/layout/ScrollReset';

// Toast notifications
import { Toaster } from 'react-hot-toast';
import { Sparkles } from 'lucide-react';

// ------------------------------------------------------------------
// Font configuration
// ------------------------------------------------------------------
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const cinzel = Cinzel({
  subsets: ['latin'],
  variable: '--font-cinzel',
  display: 'swap',
});

// ------------------------------------------------------------------
// Metadata & Viewport (SEO + PWA ready)
// ------------------------------------------------------------------
export const metadata: Metadata = {
  title: {
    default: 'Pandit Ji Marble Murti Arts – Handcrafted Divine Sculptures',
    template: '%s | Pandit Ji Marble Murti Arts',
  },
  description:
    'Handcrafted marble, brass, and wood murtis by master artisans in govindgarh. Bring divine energy into your home with our luxury sculptures.',
  keywords:
    'murti, marble murti, brass murti, Ganesh murti, Radha Krishna, Shiva statue, Hanuman idol, religious sculptures, govindgarh handicrafts',
  authors: [{ name: 'Pandit Ji Marble Murti Arts' }],
  creator: 'Pandit Ji Marble Murti Arts',
  publisher: 'Pandit Ji Marble Murti Arts',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://panditjimarblemurtiarts.in',
  },
  openGraph: {
    title: 'Pandit Ji Marble Murti Arts – Handcrafted Divine Sculptures',
    description:
      'Handcrafted marble, brass, and wood murtis by master artisans in govindgarh.',
    url: 'https://panditjimarblemurtiarts.in',
    siteName: 'Pandit Ji Marble Murti Arts',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1584925906119-eaf7bbd206c3?w=1200&q=80',
        width: 1200,
        height: 630,
        alt: 'Pandit Ji Marble Murti Arts',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pandit Ji Marble Murti Arts - Handcrafted Divine Sculptures',
    description:
      'Handcrafted marble, brass, and wood murtis by master artisans in govindgarh.',
    images: ['https://images.unsplash.com/photo-1584925906119-eaf7bbd206c3?w=1200&q=80'],
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#D4AF37',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

// ------------------------------------------------------------------
// Root Layout
// ------------------------------------------------------------------
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${cinzel.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-ivory text-brown antialiased">
        <ReactQueryProvider>
          <>
            <ScrollReset />

            {/* Fixed header */}
            <Navbar />

            {/* Main content */}
            <main className="min-h-screen">{children}</main>

            {/* Footer */}
            <Footer />

            {/* Global drawer */}
            <CartDrawer />

            {/* Toast notifications */}
            <Toaster
              position="bottom-right"
              toastOptions={{
                duration: 4500,
                style: {
                  background: 'transparent',
                  boxShadow: 'none',
                  padding: 0,
                },
                success: { icon: <Sparkles className="h-5 w-5" /> },
                error: { icon: <Sparkles className="h-5 w-5" /> },
              }}
            />
          </>
        </ReactQueryProvider>
      </body>
    </html>
  );
}