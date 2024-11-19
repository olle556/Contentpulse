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
    case 'x':
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
    console.error('Missing Mailgun configuration');
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  try {
    const { email, userId, generatedPosts, scheduleId, sourceUrl } = await req.json();

    if (!userId || !email || !generatedPosts || generatedPosts.length === 0) {
      console.error('Missing required fields:', { userId, email, postsLength: generatedPosts?.length });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const currentDate = new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric'
    });

    const postsHtml = generatedPosts
      .map((post: GeneratedPost, index: number) => `
        <div class="post-card">
          <div class="platform-label">Platform: ${post.platform}</div>
          <div class="content-box">
            ${post.content}
          </div>
          <div class="button-group">
            <button onclick="copyContent(${index})" class="button">
              📋 Copy Content
            </button>
            <a href="${getShareUrl(post.platform, post.content)}" 
               target="_blank" 
               class="button">
              🔗 Share on ${post.platform}
            </a>
          </div>
        </div>
      `)
      .join('');

    const emailHtml = `<!DOCTYPE html>
<html>
<head>
  <style>
    :root {
      --background: #ffffff;
      --foreground: #0A0A0A;
      --muted: #f5f5f5;
      --muted-foreground: #737373;
      --border: #e5e5e5;
      --primary: #0A0A0A;
      --primary-foreground: #fafafa;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      padding: 24px;
      color: var(--foreground);
      background: var(--background);
      line-height: 1.5;
      margin: 0;
    }

    .container {
      max-width: 600px;
      margin: 0 auto;
    }

    h2 {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 16px;
      color: #2563eb;
    }

    .post-card {
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 24px;
      margin-bottom: 24px;
      background: var(--background);
    }

    .platform-label {
      font-size: 16px;
      font-weight: 500;
      color: var(--foreground);
      margin-bottom: 12px;
    }

    .content-box {
      background: var(--muted);
      padding: 16px;
      border-radius: 6px;
      margin-bottom: 16px;
      white-space: pre-wrap;
      font-family: inherit;
      line-height: 1.6;
    }

    .button-group {
      display: flex;
      gap: 8px;
    }

    .button {
      display: inline-flex;
      align-items: center;
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      text-decoration: none;
      cursor: pointer;
      background: var(--muted);
      color: var(--foreground);
      border: 1px solid var(--border);
    }

    .footer {
      margin-top: 32px;
      padding-top: 16px;
      border-top: 1px solid var(--border);
      color: var(--muted-foreground);
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2>Your Generated ${generatedPosts.length > 1 ? 'posts are' : 'post is'} Ready!</h2>
    <p>Here ${generatedPosts.length > 1 ? 'are your generated posts' : 'is your generated post'} for ${currentDate} based on <a href="${sourceUrl}" style="color: #2563eb;">${sourceUrl}</a></p>
    <p style="color: var(--muted-foreground);">Schedule ID: ${scheduleId}</p>
    
    ${postsHtml}
    
    <div class="footer">
      <p>You can view and edit your ${generatedPosts.length > 1 ? 'posts' : 'post'} in your <a href="${process.env.NEXTAUTH_URL}/dashboard/posts" style="color: #2563eb;">Content Pulse dashboard</a>.</p>
    </div>
  </div>
  <script>
    function copyContent(index) {
      const posts = ${JSON.stringify(generatedPosts.map((p: GeneratedPost) => p.content))};
      navigator.clipboard.writeText(posts[index])
        .then(() => alert('Content copied to clipboard!'))
        .catch(err => alert('Failed to copy content'));
    }
  </script>
</body>
</html>`;

    const userResult = await mailgunClient.messages.create(process.env.MAILGUN_DOMAIN, {
      from: `Content Pulse <noreply@${process.env.MAILGUN_DOMAIN}>`,
      to: email,
      subject: `Your Content Pulse ${generatedPosts.length > 1 ? 'posts are' : 'post is'} ready!`,
      html: emailHtml
    });
    
    if (!userResult.id) {
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
