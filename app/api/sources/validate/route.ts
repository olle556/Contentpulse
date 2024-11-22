import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { url } = await req.json();
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; YourBot/1.0)',
          'Accept': 'text/html',
          'Connection': 'close'
        },
        redirect: 'follow',
        cache: 'no-store'
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return NextResponse.json({ error: 'URL is not accessible' }, { status: 400 });
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || (!contentType.includes('html') && !contentType.includes('text'))) {
        return NextResponse.json({ error: 'URL must point to an HTML page' }, { status: 400 });
      }

      return NextResponse.json({ success: true });
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return NextResponse.json({ error: 'URL request timed out' }, { status: 400 });
        }
      }
      return NextResponse.json({ error: 'Unable to access URL' }, { status: 400 });
    }
  } catch (error: unknown) {
    console.error('URL validation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}