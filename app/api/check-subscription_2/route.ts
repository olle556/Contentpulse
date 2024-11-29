// Create new file: app/api/check-auth/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { checkSubscription } from '@/lib/subscription';

// Check if the user is authorized to access the protected generation paths BY USING the checksuSubscription 
// skapa en till route för säkerhetsskull. Vill inte ändra i din orginal route. 

export async function GET() {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return NextResponse.json({ authorized: false });
  }
  
  const hasSubscription = await checkSubscription(session.user.id);
  return NextResponse.json({ authorized: hasSubscription });
}