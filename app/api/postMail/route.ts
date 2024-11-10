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

const getShareUrl = (platform: string, content: string) => {
  switch (platform.toLowerCase()) {
    case 'twitter':
      return `https://twitter.com/intent/tweet?text=${encodeURIComponent(content)}`;
    case 'threads':
      return `https://threads.net/intent/post?text=${encodeURIComponent(content)}`;
    case 'linkedin':
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(content)}`;
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(content)}`;
    default:
      return '#';
  }
};

export async function POST(req: NextRequest) {
  if (!process.env.MAILGUN_DOMAIN || !process.env.MAILGUN_API_KEY) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  try {
    const { email, userId, generatedPosts, scheduleId, sourceUrl } = await req.json();

    if (!userId || !email || !generatedPosts || generatedPosts.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const currentDate = new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric'
    });

    const postsHtml = generatedPosts
      .map((post: GeneratedPost) => `
        <div style="margin-bottom: 30px; border: 1px solid #eee; padding: 20px; border-radius: 8px;">
          <h3 style="color: #444; margin-bottom: 15px;">Platform: ${post.platform}</h3>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin-bottom: 15px;">
            ${post.content}
          </div>
          <div style="display: flex; gap: 10px;">
            <a href="${process.env.NEXTAUTH_URL}/dashboard/posts" 
               target="_blank" 
               style="background-color: #f3f4f6; color: #374151; padding: 8px 16px; border-radius: 4px; text-decoration: none; display: inline-flex; align-items: center; gap: 8px;">
              📋 View in Dashboard
            </a>
            <a href="${getShareUrl(post.platform, post.content)}" 
               target="_blank" 
               style="background-color: #f3f4f6; color: #374151; padding: 8px 16px; border-radius: 4px; text-decoration: none; display: inline-flex; align-items: center; gap: 8px;">
              🔗 Share on ${post.platform}
            </a>
          </div>
        </div>
      `)
      .join('');

    const userResult = await mailgunClient.messages.create(process.env.MAILGUN_DOMAIN, {
      from: `Content Pulse <no-reply@${process.env.MAILGUN_DOMAIN}>`,
      to: email,
      subject: `Your Content Pulse ${generatedPosts.length > 1 ? 'posts are' : 'post is'} ready!`,
      html: `<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
    <h2 style="color: #2563eb;">Your Generated ${generatedPosts.length > 1 ? 'posts are' : 'post is'} Ready!</h2>
    <p>Here ${generatedPosts.length > 1 ? 'are your generated posts' : 'is your generated post'} for ${currentDate} based on <a href="${sourceUrl}" style="color: #2563eb;">${sourceUrl}</a></p>
    <p style="color: #666;">Schedule ID: ${scheduleId}</p>
    ${postsHtml}
    <p style="margin-top: 30px; color: #666;">You can view and edit your ${generatedPosts.length > 1 ? 'posts' : 'post'} in your <a href="${process.env.NEXTAUTH_URL}/dashboard/posts" style="color: #2563eb;">Content Pulse dashboard</a>.</p>
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
