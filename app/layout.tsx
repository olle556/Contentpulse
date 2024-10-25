import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import { Toaster } from "@/components/ui/toaster";
import RouteGuard from '@/components/RouteGuard';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Content Pulse - Social Media Content Generator',
  description: 'AI-powered social media content generation and management',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <RouteGuard>
          <Providers>{children}</Providers>
          <Toaster />
        </RouteGuard>
      </body>
    </html>
  );
}
