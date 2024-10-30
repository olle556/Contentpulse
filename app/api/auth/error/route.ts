import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const error = request.nextUrl.searchParams.get('error');

  let errorMessage = 'An authentication error occurred';

  switch (error) {
    case 'Configuration':
      errorMessage = 'There is a problem with the server configuration.';
      break;
    case 'AccessDenied':
      errorMessage = 'Access was denied to this resource.';
      break;
    case 'Verification':
      errorMessage = 'The verification token has expired or has already been used.';
      break;
    case 'OAuthSignin':
      errorMessage = 'Error in constructing an authorization URL.';
      break;
    case 'OAuthCallback':
      errorMessage = 'Error in handling the response from an OAuth provider.';
      break;
    case 'OAuthCreateAccount':
      errorMessage = 'Could not create OAuth provider user in the database.';
      break;
    case 'EmailCreateAccount':
      errorMessage = 'Could not create email provider user in the database.';
      break;
    case 'Callback':
      errorMessage = 'Error in the OAuth callback handler.';
      break;
    case 'OAuthAccountNotLinked':
      errorMessage = 'The email on the account is already linked to another account.';
      break;
    case 'SessionRequired':
      errorMessage = 'The content of this page requires you to be signed in.';
      break;
    default:
      errorMessage = 'An unexpected authentication error occurred.';
  }

  return NextResponse.json(
    { error: errorMessage },
    { status: 401 }
  );
}
