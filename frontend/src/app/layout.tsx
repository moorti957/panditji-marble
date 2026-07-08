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
    'Handcrafted marble, brass, and wood murtis by master artisans in Jaipur. Bring divine energy into your home with our luxury sculptures.',
  keywords:
    'murti, marble murti, brass murti, Ganesh murti, Radha Krishna, Shiva statue, Hanuman idol, religious sculptures, Jaipur handicrafts',
  authors: [{ name: 'Pandit Ji Marble Murti Arts' }],
  creator: 'Pandit Ji Marble Murti Arts',
  publisher: 'Pandit Ji Marble Murti Arts',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://panditjimurti.com',
  },
  openGraph: {
    title: 'Pandit Ji Marble Murti Arts – Handcrafted Divine Sculptures',
    description:
      'Handcrafted marble, brass, and wood murtis by master artisans in Jaipur.',
    url: 'https://panditjimurti.com',
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
    title: 'Pandit Ji Marble Murti Arts – Handcrafted Divine Sculptures',
    description:
      'Handcrafted marble, brass, and wood murtis by master artisans in Jaipur.',
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
          <ThemeProvider>
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
                duration: 4000,
                style: {
                  background: '#FFFCF7',
                  color: '#2D2A24',
                  border: '1px solid rgba(201, 168, 76, 0.2)',
                  borderRadius: '12px',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.06)',
                },
                success: { icon: '✨' },
                error: { icon: '⚠️' },
              }}
            />
          </ThemeProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}