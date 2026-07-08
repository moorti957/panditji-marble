// admin/src/app/layout.tsx

import type { Metadata } from 'next';
import './globals.css';
import { ReactQueryProvider } from '@/providers/ReactQueryProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'Admin Panel | Pandit Ji Marble Murti Arts',
  description: 'Admin dashboard for Pandit Ji Marble Murti Arts',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ReactQueryProvider>
          <ThemeProvider>
            <AdminLayout>{children}</AdminLayout>
            <Toaster position="bottom-right" />
          </ThemeProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}