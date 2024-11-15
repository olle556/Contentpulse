import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { Anthropic } from '@anthropic-ai/sdk';
import { getRelevantBrandContext } from '@/utils/getBrandContext';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email || !session?.user?.id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    const { scrapedContent, platform, tone, useEmojis, aiInstructions, sourceUrl, threadCount = 1 } = await request.json();
    
    // Validate required fields
    if (!scrapedContent || !platform || !tone) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: scrapedContent, platform, and tone are required' 
      }, { status: 400 });
    }

    // Get brand context
    const brandContext = await getRelevantBrandContext(session.user.id);
    const brandInfo = brandContext || "";

    // Reuse the platform limits and prompt construction
    const platformLimits = {
      twitter: '280 characters',
      twitter_premium: '25000 characters, but aim for concise content',
      linkedin: '3000 characters',
      facebook: 'no strict limit, but aim for concise content',
      threads: '500 characters',
    };

    // Add thread instructions for supported platforms
    const threadInstructions = ['twitter', 'twitter_premium', 'threads'].includes(platform) 
      ? `\nCreate ${threadCount} thread${threadCount > 1 ? 's' : ''} for this post. Separate each thread with "#Thread X#" where X is the thread number.`
      : '';

    const prompt = `You are a social media content creator. Your task is to create an engaging ${platform} post using a ${tone} tone based on the following brand context and source material.

Brand Context:
${brandInfo}

Source URL: ${sourceUrl || 'Not provided'}
Scraped Content:
${scrapedContent}

${aiInstructions ? `Special Instructions:
${aiInstructions}
` : ''}

Instructions:
1. Create a single, engaging post for ${platform} (limit: ${platformLimits[platform as keyof typeof platformLimits]})
2. Maintain the brand voice and ${tone} tone throughout
3. Include key information that aligns with the brand's mission and USP
4. Make it conversational and engaging while staying true to brand identity
5. For Twitter/X, include relevant hashtags that match brand preferences
6. For LinkedIn, focus on professional insights that reinforce brand positioning
7. For Facebook, aim for engaging, shareable content that builds brand awareness
8. For Threads, create concise, discussion-worthy content that reflects brand values
${useEmojis ? '9. Include relevant emojis throughout the post to enhance engagement and readability' : '9. Do not use any emojis in the post'}
${threadInstructions}

Additional tone guidance for "${tone}":
${tone === 'professional' ? '- Use industry-appropriate terminology\n- Maintain business etiquette\n- Focus on value and insights' :
  tone === 'casual' ? '- Use conversational language\n- Be friendly and approachable\n- Use common expressions' :
  tone === 'funny' ? '- Include appropriate humor\n- Use wordplay or puns if relevant\n- Keep it light but informative' :
  tone === 'creative' ? '- Use unique perspectives\n- Include metaphors or analogies\n- Be imaginative in presentation' :
  tone === 'formal' ? '- Use formal language\n- Maintain strict professionalism\n- Focus on facts and accuracy' :
  tone === 'inspirational' ? '- Motivate and encourage the audience\n- Use positive, uplifting language\n- Focus on potential and growth' :
  tone === 'educational' ? '- Provide clear, informative content\n- Use straightforward language\n- Focus on delivering value' :
  tone === 'empathetic' ? '- Show understanding and compassion\n- Use supportive language\n- Focus on connecting with the audience' :
  tone === 'playful' ? '- Use lighthearted language\n- Incorporate fun expressions\n- Keep it cheerful and relaxed' :
  tone === 'persuasive' ? '- Use compelling language\n- Emphasize benefits and value\n- Aim to convince and inspire action' :
  tone === 'technical' ? '- Use precise, industry-specific language\n- Provide detailed explanations\n- Keep it informative and accurate' :
  tone === 'neutral' ? '- Maintain an objective perspective\n- Use balanced language\n- Avoid bias or strong opinions' :
  '- Keep the language warm and approachable\n- Foster a sense of community\n- Use friendly expressions'}
${useEmojis ? '\nEmoji usage:\n- Use emojis naturally and strategically\n- Don\'t overuse emojis\n- Ensure emojis complement the message' : ''}

In your answer, exclude the following:
Any explanation of the content, just the post.
Any answer that is not the post.
Any reference to the source URL.
Any reference to the brand context.

Please generate the post now:`;

    // Generate new content using Claude
    const message = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const generatedContent = message.content[0].type === 'text'
      ? message.content[0].text
      : '';

    return NextResponse.json({ 
      success: true, 
      content: generatedContent,
      post: {
        content: generatedContent,
        platform,
        status: 'draft'
      }
    });

  } catch (error) {
    console.error('Error in POST /api/generate-post/regenerate:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to regenerate post' 
    }, { status: 500 });
  }
}
