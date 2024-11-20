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

    const emailHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Generated ${generatedPosts.length > 1 ? 'posts are' : 'post is'} Ready!</title>
  <style>
    body {
      margin: 0;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.5;
      color: #0A0A0A;
      background-color: #ffffff;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
    }
    h1 {
      margin: 0 0 16px 0;
      font-size: 32px;
      font-weight: 700;
      color: #0A0A0A;
    }
    .subtitle {
      margin: 0 0 8px 0;
      color: #666666;
    }
    .schedule-id {
      margin: 0 0 24px 0;
      font-size: 14px;
      color: #666666;
    }
    .post-card {
      margin-bottom: 24px;
      border: 1px solid #e5e5e5;
      border-radius: 8px;
      overflow: hidden;
    }
    .post-content {
      padding: 20px;
    }
    .post-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .platform-label {
      font-weight: 600;
      color: #0A0A0A;
    }
    .date {
      color: #666666;
    }
    .content-box {
      padding: 16px;
      background-color: #f5f5f5;
      border-radius: 6px;
      margin-bottom: 16px;
      font-size: 14px;
      line-height: 1.6;
    }
    .button-group {
      padding: 16px;
      border-top: 1px solid #e5e5e5;
      background-color: #ffffff;
    }
    .button-primary {
      display: inline-block;
      padding: 8px 16px;
      margin-right: 8px;
      background-color: #0A0A0A;
      color: #ffffff;
      text-decoration: none;
      border-radius: 6px;
      font-size: 14px;
    }
    .button-secondary {
      display: inline-block;
      padding: 8px 16px;
      background-color: #f5f5f5;
      color: #0A0A0A;
      text-decoration: none;
      border-radius: 6px;
      border: 1px solid #e5e5e5;
      font-size: 14px;
    }
    .footer {
      margin: 24px 0 0 0;
      text-align: center;
      font-size: 14px;
      color: #666666;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Your Generated ${generatedPosts.length > 1 ? 'posts are' : 'post is'} Ready!</h1>
    
    <p class="subtitle">
      Here ${generatedPosts.length > 1 ? 'are your generated posts' : 'is your generated post'} for ${currentDate} based on 
      <a href="${sourceUrl}" style="color: #0A0A0A; text-decoration: underline;">${sourceUrl}</a>
    </p>
    
    <p class="schedule-id">Schedule ID: ${scheduleId}</p>

    ${generatedPosts.map((post: GeneratedPost, index: number) => `
      <div class="post-card">
        <div class="post-content">
          <div class="post-header">
            <span class="platform-label">Platform: ${post.platform}</span>
            <span class="date">${currentDate}</span>
          </div>
          
          <div class="content-box">
            <p style="margin: 0;">${post.content}</p>
          </div>
        </div>
        
        <div class="button-group">
          <a href="#" onclick="copyContent(${index}); return false;" class="button-primary">📋 Copy Content</a>
          <a href="${getShareUrl(post.platform, post.content)}" target="_blank" class="button-secondary">🔗 Share on ${post.platform}</a>
        </div>
      </div>
    `).join('')}

    <p class="footer">
      You can view and edit your ${generatedPosts.length > 1 ? 'posts' : 'post'} in your 
      <a href="${process.env.NEXTAUTH_URL}/dashboard/posts" style="color: #0A0A0A; text-decoration: underline;">Content Pulse dashboard</a>
    </p>
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
