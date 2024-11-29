// Create new file: app/api/check-auth/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { checkSubscription } from '@/lib/subscription';


// Check if the user is authorized to access the protected generation paths BY USING the checksuSubscription 
// skapa en till route för säkerhetsskull. Vill inte ändra i din orginal route. 

export const dynamic = 'force-dynamic'; // Add this line
export const runtime = 'edge'; // Optional: Add this if you want to use edge runtime

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    console.log('Full session details:', JSON.stringify(session, null, 2));
    
    if (!session?.user?.id) {
      console.log('Session user ID missing. Session user:', session?.user);
      return NextResponse.json({ authorized: false, reason: 'no_user_id' });
    }
    
    const hasSubscription = await checkSubscription(session.user.id);
    console.log('Subscription check result:', {
      userId: session.user.id,
      hasSubscription
    });
    
    return NextResponse.json({ 
      authorized: hasSubscription,
      debug: { 
        userId: session.user.id,
        checked: true 
      }
    });
  } catch (error) {
    console.error('Detailed error in check-subscription:', error);
    return NextResponse.json({ 
      authorized: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      reason: 'error_checking'
    });
  }
}