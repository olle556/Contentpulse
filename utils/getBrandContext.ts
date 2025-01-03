import { prisma } from '@/lib/prisma'

interface BrandQueryResult {
  id: number
  brandName: string
  brandType: string
  industry: string
  language: string | null
  website: string | null
  brandVoice: string
  description: string | null
  missionStatement: string | null
  slogans: string | null
  demographics: string | null
  psychographics: string | null
  contentThemes: string | null
  primaryObjectives: string | null
  brandStory: string | null
}

export async function getRelevantBrandContext(userId: string) {
  try {
    const brand = await prisma.brand.findFirst({
      where: {
        userId: userId
      },
      select: {
        id: true,
        brandName: true,
        brandType: true,
        industry: true,
        language: true,
        website: true,
        brandVoice: true,
        description: true,
        missionStatement: true,
        slogans: true,
        demographics: true,
        psychographics: true,
        contentThemes: true,
        primaryObjectives: true,
        brandStory: true
      }
    });

    if (!brand) {
      return null;
    }

    // Format the context in a more structured way for the AI prompt
    return `Brand Profile:
• Name: ${brand.brandName}
• Type: ${brand.brandType}
• Industry: ${brand.industry}
• Language: ${brand.language || 'English'}
• Voice: ${brand.brandVoice}

Brand Details:
${brand.description ? `• Description: ${brand.description}` : ''}
${brand.missionStatement ? `• Mission: ${brand.missionStatement}` : ''}
${brand.slogans ? `• Key Slogans: ${brand.slogans}` : ''}

Target Audience:
${brand.demographics ? `• Demographics: ${brand.demographics}` : ''}
${brand.psychographics ? `• Psychographics: ${brand.psychographics}` : ''}

Content Strategy:
${brand.contentThemes ? `• Content Themes: ${brand.contentThemes}` : ''}
${brand.primaryObjectives ? `• Primary Objectives: ${brand.primaryObjectives}` : ''}
${brand.brandStory ? `• Brand Story: ${brand.brandStory}` : ''}`.trim();
  } catch (error) {
    console.error('Error getting brand context:', error);
    return null;
  }
}