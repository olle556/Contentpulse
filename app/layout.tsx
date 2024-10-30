import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import { Toaster } from "@/components/ui/toaster";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';


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
      <body className={inter.className}>
          <Providers session={session}>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
