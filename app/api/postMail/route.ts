import { NextRequest, NextResponse } from 'next/server';
import FormData from 'form-data';
import Mailgun from 'mailgun.js';

const mailgun = new Mailgun(FormData);
const mailgunClient = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY!,
  url: "https://api.eu.mailgun.net"
});

interface GeneratedPost {
  platform: string;
  content: string;
}

export async function POST(req: NextRequest) {
  if (!process.env.MAILGUN_DOMAIN || !process.env.MAILGUN_API_KEY) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  try {
    const { email, userId, generatedPosts, scheduleId } = await req.json();

    if (!userId || !email || !generatedPosts || generatedPosts.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const postsHtml = generatedPosts
      .map((post: GeneratedPost) => `
        <div style="margin-bottom: 30px;">
          <h3 style="color: #444;">Platform: ${post.platform}</h3>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px;">
            ${post.content}
          </div>
        </div>
      `)
      .join('');

    const userResult = await mailgunClient.messages.create(process.env.MAILGUN_DOMAIN, {
      from: `Content Pulse <hello@${process.env.MAILGUN_DOMAIN}>`,
      to: email,
      subject: "Your Content Pulse posts are ready!",
      html: `<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; padding: 20px;">
    <h2>Your Generated Posts are Ready!</h2>
    <p>Schedule ID: ${scheduleId}</p>
    ${postsHtml}
    <p>You can view and edit these posts in your Content Pulse dashboard.</p>
</body>
</html>`
    });

    if (!userResult.id) {
      throw new Error('Failed to send user email');
    }

    return NextResponse.json({ message: 'Email sent successfully' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: `Failed to send email: ${errorMessage}` }, { status: 500 });
  }
}
