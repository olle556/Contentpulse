import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import { Toaster } from "@/components/ui/toaster";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { Footer } from "@/components/layout/footer";
import { Analytics } from "@vercel/analytics/react"


const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Content Pulse - Social Media Content Generator',
  description: 'AI-powered social media content generation and management',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className={inter.className}>
          <Providers session={session}>{children}</Providers>
        <Toaster />
        <Footer />
        <Analytics/>
      </body>
    </html>
  );
}
