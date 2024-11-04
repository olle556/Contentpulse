import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Redirect to the client-side error page with the error parameter
  const error = request.nextUrl.searchParams.get('error');
  return NextResponse.redirect(
    new URL(`/authentication/error?error=${error || 'unknown'}`, request.url)
  );
}
