// Create new file: app/api/check-auth/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { checkSubscription } from '@/lib/subscription';

// Check if the user is authorized to access the protected generation paths BY USING the checksuSubscription 
// skapa en till route för säkerhetsskull. Vill inte ändra i din orginal route. 

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    console.log('Session:', session);
    
    if (!session?.user?.id) {
      console.log('No user ID in session');
      return NextResponse.json({ authorized: false });
    }
    
    const hasSubscription = await checkSubscription(session.user.id);
    console.log('Subscription status:', hasSubscription);
    return NextResponse.json({ authorized: hasSubscription });
  } catch (error) {
    console.error('Error checking subscription:', error);
    return NextResponse.json({ authorized: false });
  }
}