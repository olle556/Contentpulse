import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const code = req.query.code as string;
    
    if (code) {
      const supabase = createRouteHandlerClient({ cookies });
      await supabase.auth.exchangeCodeForSession(code);
    }

    res.redirect(302, '/dashboard');
  } catch (error) {
    console.error('Auth error:', error);
    res.redirect(302, '/auth/login');
  }
}