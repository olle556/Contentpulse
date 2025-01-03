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

    return `
      Brand: ${brand.brandName}
      Type: ${brand.brandType}
      Industry: ${brand.industry}
      Language: ${brand.language ?? 'N/A'}
      Website: ${brand.website ?? 'N/A'}
      Voice: ${brand.brandVoice}
      Description: ${brand.description ?? 'N/A'}
      Mission: ${brand.missionStatement ?? 'N/A'}
      Slogans: ${brand.slogans ?? 'N/A'}
      Demographics: ${brand.demographics ?? 'N/A'}
      Psychographics: ${brand.psychographics ?? 'N/A'}
      Content Themes: ${brand.contentThemes ?? 'N/A'}
      Primary Objectives: ${brand.primaryObjectives ?? 'N/A'}
      Brand Story: ${brand.brandStory ?? 'N/A'}
    `.trim();
  } catch (error) {
    console.error('Error getting brand context:', error);
    return null;
  }
}