import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect('/dashboard/settings?error=auth_failed');
  }

  try {
    // Exchange the code for an access token
    const tokenResponse = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?`
      + `client_id=${process.env.FACEBOOK_APP_ID}`
      + `&redirect_uri=${encodeURIComponent(process.env.APP_URL + '/api/auth/threads/callback')}`
      + `&client_secret=${process.env.FACEBOOK_APP_SECRET}`
      + `&code=${code}`
    );

    const { access_token, expires_in } = await tokenResponse.json();

    // Store the access token securely (e.g., in your database)
    // Update the user's integration status

    return NextResponse.redirect('/dashboard/settings?integration=threads&status=success');
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    return NextResponse.redirect('/dashboard/settings?error=token_exchange_failed');
  }
} 