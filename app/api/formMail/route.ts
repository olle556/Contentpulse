import { NextRequest, NextResponse } from 'next/server';
import FormData from 'form-data';
import Mailgun from 'mailgun.js';

const mailgun = new Mailgun(FormData);
const mailgunClient = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY!,
  url: "https://api.eu.mailgun.net"
});

export async function POST(req: NextRequest) {
 
  
  if (!process.env.MAILGUN_DOMAIN || !process.env.MAILGUN_API_KEY) {
    console.error('Missing Mailgun configuration:', {
      hasDomain: !!process.env.MAILGUN_DOMAIN,
      hasApiKey: !!process.env.MAILGUN_API_KEY
    });
    return NextResponse.json(
      { error: 'Server configuration error' }, 
      { status: 500 }
    );
  }

  try {
    const body = await req.json();
    console.log('Received request body:', body);
    const { email, name, message, switchValue } = body;

    if (!message || !switchValue) {
      console.error('Missing required fields:', { message, switchValue });
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      );
    }

    const messageData = {
      from: `Content Pulse Form <mailgun@${process.env.MAILGUN_DOMAIN}>`,
      to: "jesperviktormollbrant@gmail.com",
      subject: `Content Pulse ${switchValue} from ${name || 'Anonymous'}`,
      html: `
        <h2>${switchValue} from ${name || 'Anonymous'}</h2>
        ${email ? `<p><strong>Email:</strong> ${email}</p>` : ''}
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `
    };

    

    const formMailResult = await mailgunClient.messages.create(
      process.env.MAILGUN_DOMAIN,
      messageData
    );
    
    if (!formMailResult.id) {
      throw new Error('Failed to send user email');
    }

    return NextResponse.json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('General error in postMail:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ 
      error: `Failed to send email: ${errorMessage}`,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
