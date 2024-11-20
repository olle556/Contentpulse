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
    console.error('Missing Mailgun configuration');
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  try {
    const { email, name, message, swicthValue } = await req.json();

    if (!email || !name || !message || !swicthValue) {
      console.error('Missing required fields:', { email, name, message, swicthValue});
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const formMailResult = await mailgunClient.messages.create(process.env.MAILGUN_DOMAIN, {
      from: `Content Pulse Form <noreply@${process.env.MAILGUN_DOMAIN}>`,
      to: "jesperviktormollb@gmail.com",
      subject: `Content Pulse ${swicthValue} from ${name}`,
      html: `
        <h2>${swicthValue} from ${name}</h2>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `
    });
    
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
